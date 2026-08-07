"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { assertStockAvailable, computeRewardState } from "@/lib/reward";
import type { Brand, Claim, Customer, Flavor, PodCategory, Sale, Settings } from "@/lib/types";

const fallbackBrands: Brand[] = [
  { id: "jnr", name: "JNR", imageUrl: "/placeholder-brand-1.svg", category: "non-transparent" },
  { id: "geek-bar", name: "Geek Bar", imageUrl: "/placeholder-brand-2.svg", category: "transparent" },
  { id: "al-fakher", name: "Al Fakher", imageUrl: "/placeholder-brand-3.svg", category: "non-transparent" },
  { id: "oxbar", name: "Oxbar", imageUrl: "/placeholder-brand-4.svg", category: "transparent" },
];

const fallbackFlavors: Flavor[] = [
  { id: "f1", brandId: "jnr", name: "Strawberry Ice", imageUrl: "/placeholder-flavor-1.svg", stock: 25, lowStockAlert: 10 },
  { id: "f2", brandId: "jnr", name: "Blue Razz", imageUrl: "/placeholder-flavor-2.svg", stock: 6, lowStockAlert: 10 },
  { id: "f3", brandId: "geek-bar", name: "Watermelon", imageUrl: "/placeholder-flavor-3.svg", stock: 15, lowStockAlert: 10 },
  { id: "f4", brandId: "oxbar", name: "Grape", imageUrl: "/placeholder-flavor-4.svg", stock: 0, lowStockAlert: 10 },
];

const fallbackCustomers: Customer[] = [
  { id: "c1", name: "Carlo Dela Cruz", totalPurchased: 26, totalRedeemed: 0, items: [{ flavorId: "f2", flavorName: "Blue Razz", quantity: 12 }, { flavorId: "f3", flavorName: "Watermelon", quantity: 8 }, { flavorId: "f4", flavorName: "Grape", quantity: 6 }] },
  { id: "c2", name: "Mia Santos", totalPurchased: 45, totalRedeemed: 1, items: [{ flavorId: "f1", flavorName: "Strawberry Ice", quantity: 25 }, { flavorId: "f3", flavorName: "Watermelon", quantity: 20 }] },
];

const noop = () => undefined;
const ensureDb = () => {
  if (!db) throw new Error("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* env variables.");
};

export function subscribeBrands(callback: (brands: Brand[]) => void) {
  if (!db) {
    callback(fallbackBrands);
    return noop;
  }
  return onSnapshot(query(collection(db, "brands"), orderBy("name")), (snapshot) => {
    const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Brand);
    callback(rows.length ? rows : fallbackBrands);
  });
}

export function subscribeFlavors(callback: (flavors: Flavor[]) => void) {
  if (!db) {
    callback(fallbackFlavors);
    return noop;
  }
  return onSnapshot(query(collection(db, "flavors"), orderBy("name")), (snapshot) => {
    const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Flavor);
    callback(rows.length ? rows : fallbackFlavors);
  });
}

export function subscribeCustomers(callback: (customers: Customer[]) => void) {
  if (!db) {
    callback(fallbackCustomers);
    return noop;
  }
  return onSnapshot(query(collection(db, "customers"), orderBy("name")), (snapshot) => {
    const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Customer);
    callback(rows.length ? rows : fallbackCustomers);
  });
}

export function subscribeSales(callback: (sales: Sale[]) => void) {
  if (!db) {
    callback([]);
    return noop;
  }
  return onSnapshot(query(collection(db, "sales"), orderBy("createdAt", "desc")), (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Sale));
  });
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
  await deleteDoc(doc(db!, "brands", id));
}

export async function createFlavor(payload: Omit<Flavor, "id">) {
  ensureDb();
  await addDoc(collection(db!, "flavors"), { ...payload, createdAt: Date.now() });
}

export async function updateFlavor(id: string, payload: Partial<Flavor>) {
  ensureDb();
  await updateDoc(doc(db!, "flavors", id), payload);
}

export async function deleteFlavor(id: string) {
  ensureDb();
  await deleteDoc(doc(db!, "flavors", id));
}

export async function createCustomer(payload: Omit<Customer, "id" | "items" | "totalPurchased" | "totalRedeemed">) {
  ensureDb();
  await addDoc(collection(db!, "customers"), {
    ...payload,
    items: [],
    totalPurchased: 0,
    totalRedeemed: 0,
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

    const [flavorSnap, customerSnap, inventorySnap] = await Promise.all([
      transaction.get(flavorRef),
      transaction.get(customerRef),
      transaction.get(inventoryRef),
    ]);

    if (!flavorSnap.exists() || !customerSnap.exists()) throw new Error("Flavor or customer not found.");

    const flavor = flavorSnap.data() as Flavor;
    const customer = customerSnap.data() as Customer;
    const currentStock = inventorySnap.exists() ? Number(inventorySnap.data().stock ?? flavor.stock) : flavor.stock;
    assertStockAvailable(currentStock, input.quantity);

    const existingItem = customer.items.find((i) => i.flavorId === input.flavorId);
    const items = existingItem
      ? customer.items.map((item) => (item.flavorId === input.flavorId ? { ...item, quantity: item.quantity + input.quantity } : item))
      : [...customer.items, { flavorId: input.flavorId, flavorName: input.flavorName, quantity: input.quantity }];

    const totalPurchased = customer.totalPurchased + input.quantity;
    const reward = computeRewardState(totalPurchased, customer.totalRedeemed);

    transaction.update(customerRef, { items, totalPurchased, rewardProgress: reward.progress, claimableRewards: reward.claimable });
    transaction.update(flavorRef, { stock: currentStock - input.quantity });
    transaction.set(inventoryRef, { flavorId: input.flavorId, flavorName: input.flavorName, stock: currentStock - input.quantity, updatedAt: serverTimestamp() });
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

    const [customerSnap, flavorSnap, inventorySnap] = await Promise.all([
      transaction.get(customerRef),
      transaction.get(flavorRef),
      transaction.get(inventoryRef),
    ]);

    if (!customerSnap.exists() || !flavorSnap.exists()) throw new Error("Customer or flavor not found.");

    const customer = customerSnap.data() as Customer;
    const flavor = flavorSnap.data() as Flavor;
    const reward = computeRewardState(customer.totalPurchased, customer.totalRedeemed);
    if (reward.claimable < 1) throw new Error("Customer has no claimable free pods.");

    const currentStock = inventorySnap.exists() ? Number(inventorySnap.data().stock ?? flavor.stock) : flavor.stock;
    assertStockAvailable(currentStock, 1);

    const updatedRedeemed = customer.totalRedeemed + 1;
    const updatedReward = computeRewardState(customer.totalPurchased, updatedRedeemed);

    transaction.update(customerRef, {
      totalRedeemed: updatedRedeemed,
      claimableRewards: updatedReward.claimable,
      rewardProgress: updatedReward.progress,
    });
    transaction.update(flavorRef, { stock: currentStock - 1 });
    transaction.set(inventoryRef, { flavorId: input.flavorId, flavorName: input.flavorName, stock: currentStock - 1, updatedAt: serverTimestamp() });
    transaction.set(doc(collection(db!, "claims")), { ...input, quantity: 1, createdAt: Date.now() });
  });
}

export async function uploadImage(file: File, folder: "brands" | "flavors") {
  const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
  const { storage } = await import("@/lib/firebase");
  if (!storage) throw new Error("Firebase storage is not configured.");
  const imageRef = ref(storage, `${folder}/${crypto.randomUUID()}-${file.name}`);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
}

export function categoryLabel(category: PodCategory) {
  return category === "transparent" ? "Transparent Pods" : "Non-Transparent Pods";
}
