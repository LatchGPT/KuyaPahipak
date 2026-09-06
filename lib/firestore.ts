"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { assertStockAvailable, computeRewardState } from "@/lib/reward";
import type { Brand, Claim, Customer, Flavor, PodCategory, PurchaseItem, Sale, Settings, SpinTicket } from "@/lib/types";

const noop = () => undefined;
const ensureDb = () => {
  if (!db) throw new Error("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* env variables.");
};

export function subscribeBrands(callback: (brands: Brand[]) => void) {
  if (!db) {
    callback([]);
    return noop;
  }
  return onSnapshot(query(collection(db, "brands"), orderBy("name")), (snapshot) => {
    const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Brand);
    callback(rows);
  });
}

export function subscribeFlavors(callback: (flavors: Flavor[]) => void) {
  if (!db) {
    callback([]);
    return noop;
  }
  return onSnapshot(query(collection(db, "flavors"), orderBy("name")), (snapshot) => {
    const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Flavor);
    callback(rows);
  });
}

export function subscribeCustomers(callback: (customers: Customer[]) => void) {
  if (!db) {
    callback([]);
    return noop;
  }
  return onSnapshot(query(collection(db, "customers"), orderBy("name")), (snapshot) => {
    const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Customer);
    callback(rows);
  });
}

export function subscribeSales(callback: (sales: Sale[]) => void) {
  if (!db) {
    callback([]);
    return noop;
  }
  return onSnapshot(
    query(collection(db, "sales"), orderBy("createdAt", "desc")),
    (snapshot) => callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Sale)),
    () => callback([]),
  );
}

export function subscribeClaims(callback: (claims: Claim[]) => void) {
  if (!db) {
    callback([]);
    return noop;
  }
  return onSnapshot(query(collection(db, "claims"), orderBy("createdAt", "desc")), (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Claim));
  });
}

export async function createBrand(payload: Omit<Brand, "id">) {
  ensureDb();
  await addDoc(collection(db!, "brands"), { ...payload, createdAt: Date.now() });
}

export async function updateBrand(id: string, payload: Partial<Brand>) {
  ensureDb();
  await updateDoc(doc(db!, "brands", id), payload);
}

export async function deleteBrand(id: string) {
  ensureDb();
  const flavorSnapshots = await getDocs(query(collection(db!, "flavors"), where("brandId", "==", id)));
  const batch = writeBatch(db!);
  batch.delete(doc(db!, "brands", id));
  flavorSnapshots.forEach((flavor) => {
    batch.delete(flavor.ref);
    batch.delete(doc(db!, "inventory", flavor.id));
  });
  await batch.commit();
}

export async function createFlavor(payload: Omit<Flavor, "id">) {
  ensureDb();
  await addDoc(collection(db!, "flavors"), { ...payload, createdAt: Date.now() });
}

export async function updateFlavor(id: string, payload: Partial<Flavor>) {
  ensureDb();
  await updateDoc(doc(db!, "flavors", id), payload);
  if (typeof payload.stock === "number") {
    await setDoc(doc(db!, "inventory", id), {
      flavorId: id,
      flavorName: payload.name ?? "",
      stock: payload.stock,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
}

export async function deleteFlavor(id: string) {
  ensureDb();
  const batch = writeBatch(db!);
  batch.delete(doc(db!, "flavors", id));
  batch.delete(doc(db!, "inventory", id));
  await batch.commit();
}

export async function createCustomer(payload: {
  name: string;
  totalPurchased?: number;
  totalRedeemed?: number;
  items?: PurchaseItem[];
}) {
  ensureDb();
  await addDoc(collection(db!, "customers"), {
    name: payload.name,
    items: payload.items ?? [],
    totalPurchased: payload.totalPurchased ?? 0,
    totalRedeemed: payload.totalRedeemed ?? 0,
    createdAt: Date.now(),
  });
}

export async function updateCustomer(id: string, payload: Partial<Customer>) {
  ensureDb();
  await updateDoc(doc(db!, "customers", id), payload);
}

export async function deleteCustomer(id: string) {
  ensureDb();
  await deleteDoc(doc(db!, "customers", id));
}

export async function deleteSale(id: string) {
  ensureDb();
  await runTransaction(db!, async (transaction) => {
    const saleRef = doc(db!, "sales", id);
    const saleSnap = await transaction.get(saleRef);
    if (!saleSnap.exists()) throw new Error("Sale record not found.");

    const sale = saleSnap.data() as Sale;
    const customerRef = doc(db!, "customers", sale.customerId);
    const flavorRef = doc(db!, "flavors", sale.flavorId);
    const inventoryRef = doc(db!, "inventory", sale.flavorId);
    const [customerSnap, flavorSnap] = await Promise.all([
      transaction.get(customerRef),
      transaction.get(flavorRef),
    ]);

    if (!customerSnap.exists()) throw new Error("The customer for this sale no longer exists.");

    const customer = customerSnap.data() as Customer;
    const purchaseItems = customer.items ?? [];
    const items = purchaseItems
      .map((item) => item.flavorId === sale.flavorId ? { ...item, quantity: item.quantity - sale.quantity } : item)
      .filter((item) => item.quantity > 0);
    const totalPurchased = Math.max(0, Number(customer.totalPurchased ?? 0) - sale.quantity);
    const reward = computeRewardState(totalPurchased, Number(customer.totalRedeemed ?? 0));

    transaction.update(customerRef, {
      items,
      totalPurchased,
      rewardProgress: reward.progress,
      claimableRewards: reward.claimable,
    });

    // A deleted sale is a reversal, so return its pods to stock when the product still exists.
    if (flavorSnap.exists()) {
      const flavor = flavorSnap.data() as Flavor;
      const currentStock = Number(flavor.stock ?? 0);
      const restoredStock = currentStock + sale.quantity;
      transaction.update(flavorRef, { stock: restoredStock });
      transaction.set(inventoryRef, {
        flavorId: sale.flavorId,
        flavorName: sale.flavorName,
        stock: restoredStock,
        updatedAt: serverTimestamp(),
      });
    }

    transaction.delete(saleRef);
  });
}

export async function updateCustomerPurchaseItems(id: string, items: PurchaseItem[]) {
  ensureDb();
  await runTransaction(db!, async (transaction) => {
    const customerRef = doc(db!, "customers", id);
    const customerSnap = await transaction.get(customerRef);
    if (!customerSnap.exists()) throw new Error("Customer not found.");

    const mergedItems = new Map<string, PurchaseItem>();
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!item.flavorId || !item.flavorName || !Number.isFinite(quantity) || quantity <= 0) continue;
      const existing = mergedItems.get(item.flavorId);
      mergedItems.set(item.flavorId, {
        flavorId: item.flavorId,
        flavorName: item.flavorName,
        quantity: (existing?.quantity ?? 0) + Math.floor(quantity),
      });
    }

    const normalizedItems = Array.from(mergedItems.values());
    const totalPurchased = normalizedItems.reduce((total, item) => total + item.quantity, 0);
    const customer = customerSnap.data() as Customer;
    const reward = computeRewardState(totalPurchased, Number(customer.totalRedeemed ?? 0));

    transaction.update(customerRef, {
      items: normalizedItems,
      totalPurchased,
      rewardProgress: reward.progress,
      claimableRewards: reward.claimable,
    });
  });
}

export async function saveSettings(settings: Settings) {
  ensureDb();
  await setDoc(doc(db!, "settings", settings.id), settings);
}

export async function getSettings(settingsId = "default") {
  if (!db) return { id: settingsId, lowStockDefault: 10, podPrice: 350 } satisfies Settings;
  const settingsDoc = await getDoc(doc(db, "settings", settingsId));
  if (!settingsDoc.exists()) return { id: settingsId, lowStockDefault: 10, podPrice: 350 } satisfies Settings;
  return settingsDoc.data() as Settings;
}

export async function isAdmin(email: string | null) {
  if (!email) return false;
  const envAdmin = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (envAdmin && email === envAdmin) return true;
  if (!db) return false;
  const adminSnap = await getDoc(doc(db, "admins", email));
  return adminSnap.exists();
}

export async function recordPurchase(input: {
  customerId: string;
  customerName: string;
  brandId: string;
  brandName: string;
  flavorId: string;
  flavorName: string;
  quantity: number;
  amount: number;
}) {
  ensureDb();
  await runTransaction(db!, async (transaction) => {
    const flavorRef = doc(db!, "flavors", input.flavorId);
    const customerRef = doc(db!, "customers", input.customerId);
    const inventoryRef = doc(db!, "inventory", input.flavorId);

    const [flavorSnap, customerSnap] = await Promise.all([
      transaction.get(flavorRef),
      transaction.get(customerRef),
    ]);

    if (!flavorSnap.exists() || !customerSnap.exists()) throw new Error("Flavor or customer not found.");

    const flavor = flavorSnap.data() as Flavor;
    const customer = customerSnap.data() as Customer;
    const currentStock = Number(flavor.stock ?? 0);
    assertStockAvailable(currentStock, input.quantity);

    const newStock = Math.max(0, currentStock - input.quantity);

    const customerItems = customer.items ?? [];
    const existingItem = customerItems.find((i) => i.flavorId === input.flavorId);
    const items = existingItem
      ? customerItems.map((item) => (item.flavorId === input.flavorId ? { ...item, quantity: item.quantity + input.quantity } : item))
      : [...customerItems, { flavorId: input.flavorId, flavorName: input.flavorName, quantity: input.quantity }];

    const totalPurchased = customer.totalPurchased + input.quantity;
    const reward = computeRewardState(totalPurchased, customer.totalRedeemed);

    transaction.update(customerRef, { items, totalPurchased, rewardProgress: reward.progress, claimableRewards: reward.claimable });
    transaction.update(flavorRef, { stock: newStock });
    transaction.set(inventoryRef, { flavorId: input.flavorId, flavorName: input.flavorName, stock: newStock, updatedAt: serverTimestamp() });
    transaction.set(doc(collection(db!, "sales")), { ...input, createdAt: Date.now() });
  });
}

export async function redeemFreePod(input: {
  customerId: string;
  flavorId: string;
  flavorName: string;
  customerName: string;
}) {
  ensureDb();
  await runTransaction(db!, async (transaction) => {
    const customerRef = doc(db!, "customers", input.customerId);
    const flavorRef = doc(db!, "flavors", input.flavorId);
    const inventoryRef = doc(db!, "inventory", input.flavorId);

    const [customerSnap, flavorSnap] = await Promise.all([
      transaction.get(customerRef),
      transaction.get(flavorRef),
    ]);

    if (!customerSnap.exists() || !flavorSnap.exists()) throw new Error("Customer or flavor not found.");

    const customer = customerSnap.data() as Customer;
    const flavor = flavorSnap.data() as Flavor;
    const reward = computeRewardState(customer.totalPurchased, customer.totalRedeemed);
    if (reward.claimable < 1) throw new Error("Customer has no claimable free pods.");

    const currentStock = Number(flavor.stock ?? 0);
    assertStockAvailable(currentStock, 1);

    const newStock = Math.max(0, currentStock - 1);
    const updatedRedeemed = customer.totalRedeemed + 1;
    const updatedReward = computeRewardState(customer.totalPurchased, updatedRedeemed);

    transaction.update(customerRef, {
      totalRedeemed: updatedRedeemed,
      claimableRewards: updatedReward.claimable,
      rewardProgress: updatedReward.progress,
    });
    transaction.update(flavorRef, { stock: newStock });
    transaction.set(inventoryRef, { flavorId: input.flavorId, flavorName: input.flavorName, stock: newStock, updatedAt: serverTimestamp() });
    transaction.set(doc(collection(db!, "claims")), { ...input, quantity: 1, createdAt: Date.now() });
  });
}

export async function uploadImage(file: File, folder: "brands" | "flavors") {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be 5 MB or smaller.");
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env.local.");
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", `kuya-pahipak/${folder}`);
  formData.append("public_id", `${crypto.randomUUID()}-${safeName.replace(/\.[^/.]+$/, "")}`);

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });
    const result = (await response.json()) as { secure_url?: string; error?: { message?: string } };
    if (!response.ok || !result.secure_url) {
      throw new Error(result.error?.message || "Cloudinary rejected the image upload.");
    }
    return result.secure_url;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Image upload timed out. Check your connection and Cloudinary upload preset.");
    }
    throw error instanceof Error ? error : new Error("Image upload failed.");
  } finally {
    window.clearTimeout(timeout);
  }
}

export function categoryLabel(category: PodCategory) {
  return category === "transparent" ? "Transparent Pods" : "Non-Transparent Pods";
}

export function subscribeSpinTickets(callback: (tickets: SpinTicket[]) => void) {
  if (!db) {
    callback([]);
    return noop;
  }
  return onSnapshot(
    query(collection(db, "spinTickets"), orderBy("createdAt", "desc")),
    (snapshot) => {
      callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as SpinTicket));
    },
    (err) => {
      console.warn("spinTickets subscription error:", err);
      callback([]);
    },
  );
}

export async function createSpinTicket(customerId: string, customerName: string): Promise<SpinTicket> {
  ensureDb();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const code = `KPH-${randomSuffix}`;
  const payload: Omit<SpinTicket, "id"> = {
    code,
    customerId,
    customerName,
    status: "pending",
    createdAt: Date.now(),
  };
  const docRef = await addDoc(collection(db!, "spinTickets"), payload);
  return { id: docRef.id, ...payload };
}

export async function updateSpinTicketProgress(
  ticketId: string,
  progress: {
    categoryWon?: PodCategory;
    brandWonId?: string;
    brandWonName?: string;
  },
) {
  ensureDb();
  const ticketRef = doc(db!, "spinTickets", ticketId);
  await runTransaction(db!, async (transaction) => {
    const snap = await transaction.get(ticketRef);
    if (!snap.exists()) throw new Error("Ticket not found.");
    const ticket = { id: snap.id, ...snap.data() } as SpinTicket;
    if (ticket.status !== "pending") {
      throw new Error("Ticket is already claimed or expired.");
    }
    // Immutable outcome protection: prevent re-spinning or tampering if already set
    if (progress.categoryWon && ticket.categoryWon && ticket.categoryWon !== progress.categoryWon) {
      throw new Error("Category outcome is already locked.");
    }
    if (progress.brandWonId && ticket.brandWonId && ticket.brandWonId !== progress.brandWonId) {
      throw new Error("Brand outcome is already locked.");
    }
    transaction.update(ticketRef, progress);
  });
}

export async function getSpinTicket(codeOrId: string): Promise<SpinTicket | null> {
  if (!db) return null;
  const cleaned = codeOrId.trim().toUpperCase();
  const q = query(collection(db, "spinTickets"), where("code", "==", cleaned));
  const snap = await getDocs(q);
  if (!snap.empty) {
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as SpinTicket;
  }
  const directDoc = await getDoc(doc(db, "spinTickets", codeOrId.trim()));
  if (directDoc.exists()) {
    return { id: directDoc.id, ...directDoc.data() } as SpinTicket;
  }
  return null;
}

export async function claimSpinTicket(params: {
  ticketId: string;
  categoryWon: PodCategory;
  brandId: string;
  flavorId: string;
}): Promise<{ flavorName: string; brandName: string; customerName: string }> {
  ensureDb();
  const ticketRef = doc(db!, "spinTickets", params.ticketId);
  const flavorRef = doc(db!, "flavors", params.flavorId);
  const brandRef = doc(db!, "brands", params.brandId);

  return runTransaction(db!, async (transaction) => {
    const ticketDoc = await transaction.get(ticketRef);
    if (!ticketDoc.exists()) throw new Error("Spin ticket not found.");
    const ticket = { id: ticketDoc.id, ...ticketDoc.data() } as SpinTicket;
    if (ticket.status !== "pending") throw new Error("This spin ticket has already been claimed.");

    const customerRef = doc(db!, "customers", ticket.customerId);
    const customerDoc = await transaction.get(customerRef);
    if (!customerDoc.exists()) throw new Error("Customer not found.");
    const customer = { id: customerDoc.id, ...customerDoc.data() } as Customer;

    const brandDoc = await transaction.get(brandRef);
    if (!brandDoc.exists()) throw new Error("Brand not found.");
    const brand = { id: brandDoc.id, ...brandDoc.data() } as Brand;

    const flavorDoc = await transaction.get(flavorRef);
    if (!flavorDoc.exists()) throw new Error("Flavor not found.");
    const flavor = { id: flavorDoc.id, ...flavorDoc.data() } as Flavor;

    // Security & Integrity Checks
    const isBattery = (name: string) => /\b(battery|batteries|device|devices|mod|mods|kit|kits)\b/i.test(name);
    if (isBattery(brand.name) || isBattery(flavor.name)) {
      throw new Error("Batteries and device hardware are excluded from free pod redemptions.");
    }

    if ((brand.status ?? "available") !== "available") {
      throw new Error("This brand is currently unavailable for rewards.");
    }

    if (flavor.brandId !== brand.id && flavor.brandId !== brandDoc.id && flavor.brandId !== params.brandId) {
      throw new Error("Selected flavor does not belong to the won brand.");
    }

    if (brand.category !== params.categoryWon) {
      throw new Error("Brand category does not match the won category.");
    }

    if (ticket.brandWonId && ticket.brandWonId !== brand.id && ticket.brandWonId !== brandDoc.id && ticket.brandWonId !== params.brandId) {
      throw new Error("Selected brand does not match your spun reward brand.");
    }

    if (flavor.stock < 1) {
      throw new Error(`Sorry! ${flavor.name} just ran out of stock. Please select another flavor.`);
    }

    const newStock = Math.max(0, flavor.stock - 1);
    const inventoryRef = doc(db!, "inventory", params.flavorId);

    // Update stock and inventory mirror atomically
    transaction.update(flavorRef, { stock: newStock });
    transaction.set(inventoryRef, {
      flavorId: params.flavorId,
      flavorName: flavor.name,
      stock: newStock,
      updatedAt: serverTimestamp(),
    });

    // Synchronize customer reward counters & milestone progress
    const updatedRedeemed = (customer.totalRedeemed || 0) + 1;
    const updatedReward = computeRewardState(customer.totalPurchased || 0, updatedRedeemed);
    transaction.update(customerRef, {
      totalRedeemed: updatedRedeemed,
      claimableRewards: updatedReward.claimable,
      rewardProgress: updatedReward.progress,
    });

    // Record official Claim voucher
    const claimRef = doc(collection(db!, "claims"));
    transaction.set(claimRef, {
      customerId: ticket.customerId,
      customerName: customer.name,
      flavorId: flavor.id,
      flavorName: `${brand.name} - ${flavor.name}`,
      quantity: 1,
      createdAt: Date.now(),
    });

    // Finalize ticket status to claimed
    transaction.update(ticketRef, {
      status: "claimed",
      categoryWon: params.categoryWon,
      brandWonId: brand.id,
      brandWonName: brand.name,
      flavorWonId: flavor.id,
      flavorWonName: flavor.name,
      claimedAt: Date.now(),
    });

    return { flavorName: flavor.name, brandName: brand.name, customerName: customer.name };
  });
}

