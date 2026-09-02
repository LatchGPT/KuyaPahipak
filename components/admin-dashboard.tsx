"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Menu, X } from "lucide-react";
import { auth } from "@/lib/firebase";
import {
  createBrand,
  createCustomer,
  createFlavor,
  deleteBrand,
  deleteCustomer,
  deleteFlavor,
  deleteSale,
  getSettings,
  isAdmin,
  recordPurchase,
  redeemFreePod,
  saveSettings,
  subscribeBrands,
  subscribeClaims,
  subscribeCustomers,
  subscribeFlavors,
  subscribeSales,
  updateBrand,
  updateCustomer,
  updateCustomerPurchaseItems,
  updateFlavor,
  uploadImage,
} from "@/lib/firestore";
import { computeRewardState } from "@/lib/reward";
import { PRODUCT_STATUS_LABELS, productStatusRank, type Brand, type Claim, type Customer, type Flavor, type PodCategory, type ProductStatus, type PurchaseItem, type Sale, type Settings } from "@/lib/types";
import { toCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const sections = ["Dashboard", "Products", "Inventory", "Customers", "Sales", "Analytics", "Reports", "Settings"] as const;
type Section = (typeof sections)[number];
const CHART_COLORS = ["#8b5cf6", "#22d3ee", "#f59e0b", "#f43f5e", "#34d399", "#60a5fa", "#e879f9"];
const BRAND_PLACEHOLDER = "/placeholder-brand-1.svg";
const FLAVOR_PLACEHOLDER = "/placeholder-flavor-1.svg";

function ProductImage({ src, alt, fallback = BRAND_PLACEHOLDER, className }: { src: string; alt: string; fallback?: string; className: string }) {
  // Cloudinary URLs are user-provided at runtime; a native image keeps the error fallback reliable.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src || fallback} alt={alt} className={className} onError={(event) => {
    if (!event.currentTarget.src.endsWith(fallback)) event.currentTarget.src = fallback;
  }} />;
}

function exportWorkbook(name: string, rows: string[][]) {
  const xmlRows = rows
    .map((row) => `<Row>${row.map((cell) => `<Cell><Data ss:Type=\"String\">${cell}</Data></Cell>`).join("")}</Row>`)
    .join("");
  const content = `<?xml version="1.0"?>
  <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
    <Worksheet ss:Name="Report"><Table>${xmlRows}</Table></Worksheet>
  </Workbook>`;
  const blob = new Blob([content], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminDashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState<Section>("Dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [settings, setSettings] = useState<Settings>({ id: "default", lowStockDefault: 10, podPrice: 350 });
  const [globalSearch, setGlobalSearch] = useState("");
  const [brandForm, setBrandForm] = useState({ name: "", category: "non-transparent" as PodCategory, status: "available" as ProductStatus, price: "", imageUrl: "" });
  const [flavorForm, setFlavorForm] = useState({ brandId: "", name: "", stock: "", imageUrl: "", lowStockAlert: "" });
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editingFlavor, setEditingFlavor] = useState<Flavor | null>(null);
  const [brandUploading, setBrandUploading] = useState(false);
  const [flavorUploading, setFlavorUploading] = useState(false);
  const [editingBrandUploading, setEditingBrandUploading] = useState(false);
  const [editingFlavorUploading, setEditingFlavorUploading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editingCustomerName, setEditingCustomerName] = useState("");
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [editedCustomerItems, setEditedCustomerItems] = useState<PurchaseItem[]>([]);
  const [customerItemFlavorId, setCustomerItemFlavorId] = useState("");
  const [customerItemQuantity, setCustomerItemQuantity] = useState(1);
  const [purchase, setPurchase] = useState({ customerId: "", brandId: "", flavorId: "", quantity: 1 });
  const [redeem, setRedeem] = useState({ customerId: "", brandId: "", flavorId: "" });

  useEffect(() => {
    const unsubAuth = auth
      ? onAuthStateChanged(auth, async (user) => {
          if (!user || !(await isAdmin(user.email))) {
            router.replace("/admin/login");
            return;
          }
          setReady(true);
        })
      : (() => {
          setReady(true);
          return () => undefined;
        })();
    const unsubscribers = [
      subscribeBrands(setBrands),
      subscribeFlavors(setFlavors),
      subscribeCustomers(setCustomers),
      subscribeSales(setSales),
      subscribeClaims(setClaims),
    ];

    getSettings().then(setSettings).catch(() => undefined);

    return () => {
      unsubAuth();
      unsubscribers.forEach((u) => u());
    };
  }, [router]);

  const catalogFlavors = useMemo(
    () => flavors.filter((flavor) => brands.some((brand) => brand.id === flavor.brandId)),
    [flavors, brands],
  );

  const availableBrands = useMemo(
    () => brands.filter((brand) => catalogFlavors.some((flavor) => flavor.brandId === brand.id && flavor.stock > 0)),
    [brands, catalogFlavors],
  );

  const flavorOptions = useMemo(
    () => catalogFlavors.filter((flavor) => flavor.brandId === purchase.brandId && flavor.stock > 0),
    [catalogFlavors, purchase.brandId],
  );

  const redeemFlavorOptions = useMemo(
    () => catalogFlavors.filter((flavor) => flavor.brandId === redeem.brandId && flavor.stock > 0),
    [catalogFlavors, redeem.brandId],
  );

  const customerItemFlavors = useMemo(() => {
    const brandMap = new Map(brands.map((b) => [b.id, b.name]));
    return catalogFlavors
      .map((flavor) => ({
        ...flavor,
        brandName: brandMap.get(flavor.brandId) || "Unknown Brand",
      }))
      .sort((a, b) => {
        const brandDiff = a.brandName.localeCompare(b.brandName);
        if (brandDiff !== 0) return brandDiff;
        return a.name.localeCompare(b.name);
      });
  }, [catalogFlavors, brands]);

  const dashboardCards = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const todaySales = sales.filter((sale) => sale.createdAt >= todayStart);
    const monthSales = sales.filter((sale) => sale.createdAt >= monthStart);
    return {
      todaySales: todaySales.reduce((sum, sale) => sum + sale.amount, 0),
      monthlySales: monthSales.reduce((sum, sale) => sum + sale.amount, 0),
      totalRevenue: sales.reduce((sum, sale) => sum + sale.amount, 0),
      productsSold: sales.reduce((sum, sale) => sum + sale.quantity, 0),
      redeemed: claims.length,
      lowStock: catalogFlavors.filter((flavor) => flavor.stock <= (flavor.lowStockAlert || settings.lowStockDefault)).length,
    };
  }, [sales, claims.length, catalogFlavors, settings.lowStockDefault]);

  const chartData = useMemo(() => {
    const byDay = new Map<string, number>();
    const byBrand = new Map<string, number>();
    const byFlavor = new Map<string, number>();

    for (const sale of sales) {
      const day = new Date(sale.createdAt).toLocaleDateString();
      byDay.set(day, (byDay.get(day) ?? 0) + sale.amount);
      byBrand.set(sale.brandName, (byBrand.get(sale.brandName) ?? 0) + sale.quantity);
      byFlavor.set(sale.flavorName, (byFlavor.get(sale.flavorName) ?? 0) + sale.quantity);
    }

    return {
      byDay: Array.from(byDay.entries()).slice(-7).map(([name, value]) => ({ name, value })),
      byBrand: Array.from(byBrand.entries()).map(([name, value]) => ({ name, value })),
      byFlavor: Array.from(byFlavor.entries()).map(([name, value]) => ({ name, value })),
      loyalty: customers
        .map((customer) => ({ name: customer.name, value: customer.totalPurchased }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    };
  }, [sales, customers]);

  const searchResults = useMemo(() => {
    const q = globalSearch.toLowerCase().trim();
    if (!q) return { customers: [], brands: [], flavors: [] };
    return {
      customers: customers.filter((c) => c.name.toLowerCase().includes(q)),
      brands: brands.filter((b) => b.name.toLowerCase().includes(q)),
      flavors: flavors.filter((f) => f.name.toLowerCase().includes(q)),
    };
  }, [globalSearch, customers, brands, flavors]);

  if (!ready) return <div className="grid min-h-screen place-items-center text-white">Checking admin access...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-indigo-950 text-white">
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 h-full w-full bg-black/70" aria-label="Close navigation menu" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative h-full w-72 border-r border-white/10 bg-black p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <Logo />
              <Button variant="outline" aria-label="Close navigation menu" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="mt-6 space-y-2">
              {sections.map((item) => (
                <button
                  key={item}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm ${active === item ? "bg-white/15" : "hover:bg-white/10"}`}
                  onClick={() => {
                    setActive(item);
                    setMobileMenuOpen(false);
                  }}
                >
                  {item}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 border-r border-white/10 bg-black/50 p-4 backdrop-blur lg:block">
          <Logo />
          <nav className="mt-6 space-y-2">
            {sections.map((item) => (
              <button
                key={item}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm ${active === item ? "bg-white/15" : "hover:bg-white/10"}`}
                onClick={() => setActive(item)}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <main className="w-full p-4 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 lg:hidden">
              <Button variant="outline" aria-label="Open navigation menu" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(true)}>
                <Menu className="h-4 w-4" />
              </Button>
              <Logo />
            </div>
            <div className="flex gap-2">
              <Input value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} placeholder="Global search" />
              <ThemeToggle />
              <Button variant="outline" onClick={() => (auth ? signOut(auth) : router.push("/"))}>
                Logout
              </Button>
            </div>
          </div>

          {globalSearch && (
            <Card className="mb-6">
              <p className="mb-2 text-sm font-semibold">Global search results</p>
              <p className="text-sm">Customers: {searchResults.customers.map((c) => c.name).join(", ") || "None"}</p>
              <p className="text-sm">Brands: {searchResults.brands.map((b) => b.name).join(", ") || "None"}</p>
              <p className="text-sm">Flavors: {searchResults.flavors.map((f) => f.name).join(", ") || "None"}</p>
            </Card>
          )}

          {active === "Dashboard" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                  ["Today's Sales", toCurrency(dashboardCards.todaySales)],
                  ["Monthly Sales", toCurrency(dashboardCards.monthlySales)],
                  ["Total Revenue", toCurrency(dashboardCards.totalRevenue)],
                  ["Products Sold", `${dashboardCards.productsSold}`],
                  ["Free Pods Redeemed", `${dashboardCards.redeemed}`],
                  ["Low Stock Products", `${dashboardCards.lowStock}`],
                ].map(([title, value]) => (
                  <Card key={title}>
                    <p className="text-sm text-white/70">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                  </Card>
                ))}
              </div>
              <Card>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold">Live Reward Tracker</h2>
                  <p className="text-sm text-white/70">Updates as purchases and redemptions are recorded</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {customers.map((customer) => {
                    const reward = computeRewardState(customer.totalPurchased, customer.totalRedeemed);
                    return (
                      <div key={customer.id} className="rounded-xl border border-white/10 p-3">
                        <p className="font-semibold">{customer.name}</p>
                        <p className="mt-1 text-sm">{reward.progress}/10 pods toward the next reward</p>
                        <Progress value={(reward.progress / 10) * 100} />
                        <p className="mt-2 text-sm">Claimable free pods: {reward.claimable}</p>
                      </div>
                    );
                  })}
                  {!customers.length && <p className="text-sm text-white/70">No customers yet.</p>}
                </div>
              </Card>
            </div>
          )}

          {active === "Products" && (
            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="space-y-3">
                <h3 className="text-lg font-bold">Create Brand</h3>
                <Input placeholder="Brand name" value={brandForm.name} onChange={(e) => setBrandForm((s) => ({ ...s, name: e.target.value }))} />
                <Input type="number" min={0} step="0.01" placeholder="Brand price" value={brandForm.price} onChange={(e) => setBrandForm((s) => ({ ...s, price: e.target.value }))} />
                <select className="h-10 rounded-xl bg-white/5 px-3" value={brandForm.category} onChange={(e) => setBrandForm((s) => ({ ...s, category: e.target.value as PodCategory }))}>
                  <option value="non-transparent">Non-Transparent</option>
                  <option value="transparent">Transparent</option>
                </select>
                <select className="h-10 rounded-xl bg-white/5 px-3" aria-label="Brand availability" value={brandForm.status} onChange={(e) => setBrandForm((s) => ({ ...s, status: e.target.value as ProductStatus }))}>
                  {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="brand-image">Brand image</label>
                  <Input id="brand-image" type="file" accept="image/*" disabled={brandUploading} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setBrandUploading(true);
                    try {
                      const imageUrl = await uploadImage(file, "brands");
                      setBrandForm((s) => ({ ...s, imageUrl }));
                      toast.success("Brand image uploaded");
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "Could not upload brand image.");
                    } finally { setBrandUploading(false); e.target.value = ""; }
                  }} />
                  {brandUploading && <p className="text-sm text-white/70">Uploading image…</p>}
                  {brandForm.imageUrl && <ProductImage src={brandForm.imageUrl} alt="Brand preview" className="h-32 w-full rounded-xl bg-black/20 object-contain" />}
                </div>
                <Button disabled={brandUploading || !brandForm.name.trim()} onClick={async () => {
                  try {
                    await createBrand({ ...brandForm, name: brandForm.name.trim(), price: Number(brandForm.price || settings.podPrice), imageUrl: brandForm.imageUrl || BRAND_PLACEHOLDER });
                    setBrandForm({ name: "", category: "non-transparent", status: "available", price: "", imageUrl: "" });
                    toast.success("Brand created");
                  } catch (error) { toast.error(error instanceof Error ? error.message : "Could not create brand."); }
                }}>Save Brand</Button>
              </Card>

              <Card className="space-y-3">
                <h3 className="text-lg font-bold">Add Flavor</h3>
                <select className="h-10 rounded-xl bg-white/5 px-3" value={flavorForm.brandId} onChange={(e) => setFlavorForm((s) => ({ ...s, brandId: e.target.value }))}>
                  <option value="">Select brand</option>
                  {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
                <Input placeholder="Flavor name" value={flavorForm.name} onChange={(e) => setFlavorForm((s) => ({ ...s, name: e.target.value }))} />
                <Input type="number" min={0} placeholder="Starting stock" value={flavorForm.stock} onChange={(e) => setFlavorForm((s) => ({ ...s, stock: e.target.value }))} />
                <Input type="number" min={1} placeholder="Low-stock alert threshold" value={flavorForm.lowStockAlert} onChange={(e) => setFlavorForm((s) => ({ ...s, lowStockAlert: e.target.value }))} />
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="flavor-image">Flavor image</label>
                  <Input id="flavor-image" type="file" accept="image/*" disabled={flavorUploading} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setFlavorUploading(true);
                    try {
                      const imageUrl = await uploadImage(file, "flavors");
                      setFlavorForm((s) => ({ ...s, imageUrl }));
                      toast.success("Flavor image uploaded");
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "Could not upload flavor image.");
                    } finally { setFlavorUploading(false); e.target.value = ""; }
                  }} />
                  {flavorUploading && <p className="text-sm text-white/70">Uploading image…</p>}
                  {flavorForm.imageUrl && <ProductImage src={flavorForm.imageUrl} alt="Flavor preview" fallback={FLAVOR_PLACEHOLDER} className="h-32 w-full rounded-xl bg-black/20 object-contain" />}
                </div>
                <Button disabled={flavorUploading || !flavorForm.brandId || !flavorForm.name.trim()} onClick={async () => {
                  try {
                    await createFlavor({ ...flavorForm, name: flavorForm.name.trim(), stock: Number(flavorForm.stock || 0), lowStockAlert: Number(flavorForm.lowStockAlert || settings.lowStockDefault), imageUrl: flavorForm.imageUrl || FLAVOR_PLACEHOLDER });
                    setFlavorForm({ brandId: "", name: "", stock: "", imageUrl: "", lowStockAlert: "" });
                    toast.success("Flavor added");
                  } catch (error) { toast.error(error instanceof Error ? error.message : "Could not add flavor."); }
                }}>Save Flavor</Button>
              </Card>

              <Card className="xl:col-span-2">
                <h3 className="mb-3 text-lg font-bold">Manage Products</h3>
                <div className="grid gap-3">
                  {brands.slice().sort((a, b) => productStatusRank(a.status) - productStatusRank(b.status) || a.name.localeCompare(b.name)).map((brand) => (
                    <div key={brand.id} className="rounded-xl border border-white/10 p-3">
                      {editingBrand?.id === brand.id ? (
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input value={editingBrand.name} aria-label="Brand name" onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })} />
                          <Input type="number" min={0} step="0.01" value={editingBrand.price ?? ""} aria-label="Brand price" onChange={(e) => setEditingBrand({ ...editingBrand, price: Number(e.target.value) })} />
                          <select className="h-10 rounded-xl bg-white/5 px-3" value={editingBrand.category} onChange={(e) => setEditingBrand({ ...editingBrand, category: e.target.value as PodCategory })}><option value="non-transparent">Non-Transparent</option><option value="transparent">Transparent</option></select>
                          <select className="h-10 rounded-xl bg-white/5 px-3" aria-label="Brand availability" value={editingBrand.status ?? "available"} onChange={(e) => setEditingBrand({ ...editingBrand, status: e.target.value as ProductStatus })}>{Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                          <div className="space-y-2">
                            <Input type="file" accept="image/*" disabled={editingBrandUploading} onChange={async (e) => {
                              const file = e.target.files?.[0]; if (!file) return; setEditingBrandUploading(true);
                              try { setEditingBrand({ ...editingBrand, imageUrl: await uploadImage(file, "brands") }); toast.success("Brand image uploaded"); }
                              catch (error) { toast.error(error instanceof Error ? error.message : "Could not upload brand image."); }
                              finally { setEditingBrandUploading(false); e.target.value = ""; }
                            }} />
                            {editingBrandUploading && <p className="text-sm text-white/70">Uploading image…</p>}
                          </div>
                          <ProductImage src={editingBrand.imageUrl} alt="Brand preview" className="h-24 w-full rounded-xl bg-black/20 object-contain" />
                          <div className="flex gap-2"><Button disabled={editingBrandUploading || !editingBrand.name.trim()} onClick={async () => {
                            try { await updateBrand(brand.id, { name: editingBrand.name.trim(), price: editingBrand.price || settings.podPrice, category: editingBrand.category, status: editingBrand.status ?? "available", imageUrl: editingBrand.imageUrl || BRAND_PLACEHOLDER }); setEditingBrand(null); toast.success("Brand updated"); }
                            catch (error) { toast.error(error instanceof Error ? error.message : "Could not update brand."); }
                          }}>Save</Button><Button variant="outline" onClick={() => setEditingBrand(null)}>Cancel</Button></div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-semibold">{brand.name} <span className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs ${(brand.status ?? "available") === "available" ? "bg-emerald-500/20 text-emerald-300" : (brand.status ?? "available") === "coming-soon" ? "bg-amber-500/20 text-amber-300" : "bg-red-500/20 text-red-300"}`}>{PRODUCT_STATUS_LABELS[brand.status ?? "available"]}</span></p><p className="text-sm text-white/70">{brand.category} · {toCurrency(brand.price ?? settings.podPrice)}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setEditingBrand(brand)}>Edit</Button><Button variant="outline" onClick={async () => { try { const category = brand.category === "transparent" ? "non-transparent" : "transparent"; await updateBrand(brand.id, { category }); toast.success(`Moved to ${category}`); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not change category."); } }}>Toggle Category</Button><Button variant="danger" onClick={async () => { try { await deleteBrand(brand.id); toast.success("Brand deleted"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not delete brand."); } }}>Delete</Button></div></div>
                      )}
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {flavors.filter((f) => f.brandId === brand.id).map((flavor) => (
                          <div key={flavor.id} className="rounded-lg border border-white/10 p-2 text-sm">
                            {editingFlavor?.id === flavor.id ? <div className="space-y-2"><Input value={editingFlavor.name} aria-label="Flavor name" onChange={(e) => setEditingFlavor({ ...editingFlavor, name: e.target.value })} /><Input type="number" min={0} value={editingFlavor.stock} aria-label="Flavor stock" onChange={(e) => setEditingFlavor({ ...editingFlavor, stock: Number(e.target.value) })} /><Input type="number" min={1} value={editingFlavor.lowStockAlert} aria-label="Low stock alert" onChange={(e) => setEditingFlavor({ ...editingFlavor, lowStockAlert: Number(e.target.value) })} /><Input type="file" accept="image/*" disabled={editingFlavorUploading} onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; setEditingFlavorUploading(true); try { setEditingFlavor({ ...editingFlavor, imageUrl: await uploadImage(file, "flavors") }); toast.success("Flavor image uploaded"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not upload flavor image."); } finally { setEditingFlavorUploading(false); e.target.value = ""; } }} />{editingFlavorUploading && <p className="text-white/70">Uploading image…</p>}<ProductImage src={editingFlavor.imageUrl} alt="Flavor preview" fallback={FLAVOR_PLACEHOLDER} className="h-20 w-full rounded-lg bg-black/20 object-contain" /><div className="flex gap-2"><Button disabled={editingFlavorUploading || !editingFlavor.name.trim()} onClick={async () => { try { await updateFlavor(flavor.id, { name: editingFlavor.name.trim(), stock: editingFlavor.stock, lowStockAlert: editingFlavor.lowStockAlert, imageUrl: editingFlavor.imageUrl || FLAVOR_PLACEHOLDER }); setEditingFlavor(null); toast.success("Flavor updated"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not update flavor."); } }}>Save</Button><Button variant="outline" onClick={() => setEditingFlavor(null)}>Cancel</Button></div></div> : <><p className="font-semibold">{flavor.name}</p><p>Stock: {flavor.stock}</p><div className="mt-2 flex flex-wrap gap-2"><Button variant="outline" onClick={() => setEditingFlavor(flavor)}>Edit</Button><Button variant="outline" onClick={async () => { try { await updateFlavor(flavor.id, { stock: flavor.stock + 1 }); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not update stock."); } }}>+1</Button><Button variant="outline" onClick={async () => { try { await updateFlavor(flavor.id, { stock: Math.max(0, flavor.stock - 1) }); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not update stock."); } }}>-1</Button><Button variant="danger" onClick={async () => { try { await deleteFlavor(flavor.id); toast.success("Flavor deleted"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not delete flavor."); } }}>Delete</Button></div></>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {active === "Inventory" && (
            <div className="grid gap-4 lg:grid-cols-2">
              {brands.map((brand) => {
                const brandFlavors = catalogFlavors.filter((flavor) => flavor.brandId === brand.id);
                if (!brandFlavors.length) return null;
                return (
                  <Card key={brand.id} className="p-3">
                    <h3 className="mb-3 font-bold">{brand.name}</h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {brandFlavors.map((flavor) => (
                        <div key={flavor.id} className="rounded-xl border border-white/10 p-2 text-sm">
                          <p className="font-semibold">{flavor.name}</p>
                          <p>Stock: {flavor.stock}</p>
                          <p className={`${flavor.stock <= (flavor.lowStockAlert || settings.lowStockDefault) ? "text-amber-300" : "text-white/70"}`}>
                            Alert: {flavor.lowStockAlert || settings.lowStockDefault}
                          </p>
                          <div className="mt-2 flex gap-1">
                            <Button variant="outline" onClick={() => updateFlavor(flavor.id, { stock: flavor.stock + 5 })}>+5</Button>
                            <Button variant="outline" onClick={() => updateFlavor(flavor.id, { lowStockAlert: (flavor.lowStockAlert || settings.lowStockDefault) + 1 })}>Alert +1</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
              {!catalogFlavors.length && <p className="text-sm text-white/70">No inventory products yet.</p>}
            </div>
          )}

          {active === "Customers" && (
            <div className="space-y-4">
              <Card className="flex flex-wrap gap-2">
                <Input placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="max-w-sm" />
                <Button onClick={async () => {
                  await createCustomer({ name: customerName });
                  setCustomerName("");
                  toast.success("Customer created");
                }}>Create Customer</Button>
              </Card>
              <div className="grid gap-3 md:grid-cols-2">
                {customers.map((customer) => {
                  const reward = computeRewardState(customer.totalPurchased, customer.totalRedeemed);
                  return (
                    <Card key={customer.id}>
                      {editingCustomerId === customer.id ? (
                        <div className="flex flex-wrap gap-2">
                          <Input value={editingCustomerName} onChange={(event) => setEditingCustomerName(event.target.value)} aria-label="Customer name" />
                          <Button onClick={async () => {
                            const name = editingCustomerName.trim();
                            if (!name) return toast.error("Customer name is required.");
                            await updateCustomer(customer.id, { name });
                            setEditingCustomerId(null);
                            toast.success("Customer name updated");
                          }}>Save</Button>
                          <Button variant="outline" onClick={() => setEditingCustomerId(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold">{customer.name}</p>
                          <Button variant="outline" onClick={() => {
                            setEditingCustomerId(customer.id);
                            setEditingCustomerName(customer.name);
                          }}>Edit Name</Button>
                        </div>
                      )}
                      <p className="text-sm">Purchases: {customer.totalPurchased} | Redeemed: {customer.totalRedeemed}</p>
                      <p className="text-sm">Progress: {reward.progress}/10 | Claimable: {reward.claimable}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (expandedCustomerId === customer.id) {
                              setExpandedCustomerId(null);
                              return;
                            }
                            setExpandedCustomerId(customer.id);
                            setEditedCustomerItems((customer.items ?? []).map((item) => ({ ...item })));
                            setCustomerItemFlavorId("");
                            setCustomerItemQuantity(1);
                          }}
                        >
                          {expandedCustomerId === customer.id ? "Hide Bought Items" : "Manage Bought Items"}
                        </Button>
                        <Button variant="danger" onClick={() => deleteCustomer(customer.id)}>Delete</Button>
                      </div>

                      {expandedCustomerId === customer.id && (
                        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                          <div>
                            <h4 className="font-semibold">Bought Items</h4>
                            <p className="text-xs text-white/60">Save changes to update this customer&apos;s purchase total and rewards.</p>
                          </div>

                          <div className="space-y-2">
                            {editedCustomerItems.map((item) => {
                              const matchingFlavor = customerItemFlavors.find((f) => f.id === item.flavorId);
                              const displayName = matchingFlavor && !item.flavorName.toLowerCase().startsWith(matchingFlavor.brandName.toLowerCase())
                                ? `${matchingFlavor.brandName} - ${item.flavorName}`
                                : item.flavorName;
                              return (
                                <div key={item.flavorId} className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 p-2">
                                  <p className="min-w-32 flex-1 text-sm">{displayName}</p>
                                  <Input
                                    className="w-20"
                                    type="number"
                                    min={1}
                                    aria-label={`${displayName} quantity`}
                                    value={item.quantity}
                                    onChange={(event) => setEditedCustomerItems((items) => items.map((currentItem) => (
                                      currentItem.flavorId === item.flavorId
                                        ? { ...currentItem, quantity: Math.max(1, Math.floor(Number(event.target.value) || 1)) }
                                        : currentItem
                                    )))}
                                  />
                                  <Button variant="danger" onClick={() => setEditedCustomerItems((items) => items.filter((currentItem) => currentItem.flavorId !== item.flavorId))}>Remove</Button>
                                </div>
                              );
                            })}
                            {!editedCustomerItems.length && <p className="text-sm text-white/70">No bought items recorded.</p>}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <select
                              className="h-10 min-w-44 flex-1 rounded-xl bg-white/5 px-3"
                              value={customerItemFlavorId}
                              onChange={(event) => setCustomerItemFlavorId(event.target.value)}
                            >
                              <option value="">Select item to add</option>
                              {customerItemFlavors.map((flavor) => (
                                <option key={flavor.id} value={flavor.id}>
                                  {flavor.brandName} - {flavor.name}
                                </option>
                              ))}
                            </select>
                            <Input
                              className="w-20"
                              type="number"
                              min={1}
                              aria-label="New item quantity"
                              value={customerItemQuantity}
                              onChange={(event) => setCustomerItemQuantity(Math.max(1, Math.floor(Number(event.target.value) || 1)))}
                            />
                            <Button
                              variant="outline"
                              onClick={() => {
                                const flavor = customerItemFlavors.find((item) => item.id === customerItemFlavorId);
                                if (!flavor) return toast.error("Select an item to add.");
                                const flavorDisplayName = `${flavor.brandName} - ${flavor.name}`;
                                setEditedCustomerItems((items) => {
                                  const existing = items.find((item) => item.flavorId === flavor.id);
                                  return existing
                                    ? items.map((item) => item.flavorId === flavor.id ? { ...item, flavorName: flavorDisplayName, quantity: item.quantity + customerItemQuantity } : item)
                                    : [...items, { flavorId: flavor.id, flavorName: flavorDisplayName, quantity: customerItemQuantity }];
                                });
                                setCustomerItemFlavorId("");
                                setCustomerItemQuantity(1);
                              }}
                            >
                              Add Item
                            </Button>
                          </div>

                          <Button
                            onClick={async () => {
                              try {
                                await updateCustomerPurchaseItems(customer.id, editedCustomerItems);
                                toast.success("Bought items updated");
                              } catch (error) {
                                toast.error(error instanceof Error ? error.message : "Unable to update bought items.");
                              }
                            }}
                          >
                            Save Bought Items
                          </Button>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {active === "Sales" && (
            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="space-y-3">
                <h3 className="text-lg font-bold">Create Purchase</h3>
                <select className="h-10 rounded-xl bg-white/5 px-3" value={purchase.customerId} onChange={(e) => setPurchase((s) => ({ ...s, customerId: e.target.value }))}>
                  <option value="">Select customer</option>
                  {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                </select>
                <select className="h-10 rounded-xl bg-white/5 px-3" value={purchase.brandId} onChange={(e) => setPurchase((s) => ({ ...s, brandId: e.target.value, flavorId: "" }))}>
                  <option value="">Select brand</option>
                  {availableBrands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
                <select className="h-10 rounded-xl bg-white/5 px-3" disabled={!purchase.brandId} value={purchase.flavorId} onChange={(e) => setPurchase((s) => ({ ...s, flavorId: e.target.value }))}>
                  <option value="">{purchase.brandId ? (flavorOptions.length ? "Select available flavor" : "No flavors in stock") : "Select brand first"}</option>
                  {flavorOptions.map((flavor) => (
                    <option key={flavor.id} value={flavor.id}>
                      {flavor.name} ({flavor.stock} in stock)
                    </option>
                  ))}
                </select>
                <Input type="number" min={1} value={purchase.quantity} onChange={(e) => setPurchase((s) => ({ ...s, quantity: Number(e.target.value) }))} />
                <Button onClick={async () => {
                  const customer = customers.find((x) => x.id === purchase.customerId);
                  const brand = brands.find((x) => x.id === purchase.brandId);
                  const flavor = catalogFlavors.find((x) => x.id === purchase.flavorId);
                  if (!customer) return toast.error("Please select a customer.");
                  if (!brand) return toast.error("Please select a brand.");
                  if (!flavor) return toast.error("Please select a flavor.");
                  const qty = Math.max(1, Math.floor(Number(purchase.quantity) || 1));
                  if (flavor.stock < qty) {
                    return toast.error(`Insufficient stock for ${flavor.name} (Available: ${flavor.stock}, Requested: ${qty}). Please increase stock in Products or Inventory.`);
                  }
                  try {
                    await recordPurchase({
                      customerId: customer.id,
                      customerName: customer.name,
                      brandId: brand.id,
                      brandName: brand.name,
                      flavorId: flavor.id,
                      flavorName: flavor.name,
                      quantity: qty,
                      amount: qty * (brand.price ?? settings.podPrice),
                    });
                    setPurchase({ customerId: "", brandId: "", flavorId: "", quantity: 1 });
                    toast.success(`Purchase recorded: ${qty}x ${flavor.name} for ${customer.name}`);
                  } catch (error) {
                    console.error("Purchase error:", error);
                    toast.error(error instanceof Error ? error.message : "Could not record purchase.");
                  }
                }}>Save Purchase</Button>
              </Card>

              <Card className="space-y-3">
                <h3 className="text-lg font-bold">Redeem Free Pod</h3>
                <select className="h-10 rounded-xl bg-white/5 px-3" value={redeem.customerId} onChange={(e) => setRedeem({ customerId: e.target.value, brandId: "", flavorId: "" })}>
                  <option value="">Select customer</option>
                  {customers.map((customer) => {
                    const claimable = computeRewardState(customer.totalPurchased, customer.totalRedeemed).claimable;
                    return <option key={customer.id} value={customer.id}>{customer.name} ({claimable} claimable)</option>;
                  })}
                </select>
                <select className="h-10 rounded-xl bg-white/5 px-3" disabled={!redeem.customerId} value={redeem.brandId} onChange={(e) => setRedeem((s) => ({ ...s, brandId: e.target.value, flavorId: "" }))}>
                  <option value="">{redeem.customerId ? "Select brand" : "Select customer first"}</option>
                  {availableBrands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
                <select className="h-10 rounded-xl bg-white/5 px-3" disabled={!redeem.brandId} value={redeem.flavorId} onChange={(e) => setRedeem((s) => ({ ...s, flavorId: e.target.value }))}>
                  <option value="">{redeem.brandId ? (redeemFlavorOptions.length ? "Select available flavor" : "No flavors in stock") : "Select brand first"}</option>
                  {redeemFlavorOptions.map((flavor) => (
                    <option key={flavor.id} value={flavor.id}>
                      {flavor.name} ({flavor.stock} in stock)
                    </option>
                  ))}
                </select>
                <Button onClick={async () => {
                  const customer = customers.find((x) => x.id === redeem.customerId);
                  const flavor = catalogFlavors.find((x) => x.id === redeem.flavorId);
                  if (!customer) return toast.error("Please select a customer.");
                  if (!redeem.brandId) return toast.error("Please select a brand.");
                  if (!flavor) return toast.error("Please select a flavor.");
                  if (flavor.stock < 1) return toast.error(`${flavor.name} is out of stock (Stock: 0).`);
                  try {
                    await redeemFreePod({ customerId: customer.id, customerName: customer.name, flavorId: flavor.id, flavorName: flavor.name });
                    setRedeem({ customerId: "", brandId: "", flavorId: "" });
                    toast.success("Free pod redeemed");
                  } catch (error) {
                    console.error("Redeem error:", error);
                    toast.error(error instanceof Error ? error.message : "Could not redeem free pod.");
                  }
                }}>Redeem</Button>
              </Card>

              <Card className="xl:col-span-2">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold">Sales History</h3>
                  <p className="text-sm text-white/70">{sales.length} recorded</p>
                </div>
                <div className="space-y-2">
                  {sales.map((sale) => (
                    <div key={sale.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 p-3 text-sm">
                      <div>
                        <p className="font-semibold">{sale.customerName} · {sale.brandName} - {sale.flavorName}</p>
                        <p className="text-white/70">{sale.quantity} pod(s) · {toCurrency(sale.amount)}</p>
                      </div>
                      <Button
                        variant="danger"
                        onClick={async () => {
                          try {
                            await deleteSale(sale.id);
                            toast.success("Sale removed and customer purchase total updated");
                          } catch (error) {
                            toast.error(error instanceof Error ? error.message : "Unable to remove sale record.");
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  {!sales.length && <p className="text-sm text-white/70">No sales recorded.</p>}
                </div>
              </Card>
            </div>
          )}

          {active === "Analytics" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 xl:grid-cols-2">
              <Card>
                <h3 className="mb-3 font-semibold">Daily Sales</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.byDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#cbd5e1" />
                      <YAxis stroke="#cbd5e1" />
                      <Tooltip />
                      <Bar dataKey="value">{chartData.byDay.map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <h3 className="mb-3 font-semibold">Top Selling Brands</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData.byBrand} dataKey="value" nameKey="name">{chartData.byBrand.map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}</Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <h3 className="mb-3 font-semibold">Top Selling Flavors</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.byFlavor}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#cbd5e1" />
                      <YAxis stroke="#cbd5e1" />
                      <Tooltip />
                      <Bar dataKey="value">{chartData.byFlavor.map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <h3 className="mb-3 font-semibold">Most Loyal Customers</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.loyalty} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" stroke="#cbd5e1" />
                      <YAxis type="category" dataKey="name" stroke="#cbd5e1" width={120} />
                      <Tooltip />
                      <Bar dataKey="value">{chartData.loyalty.map((entry, index) => <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          )}

          {active === "Reports" && (
            <Card className="space-y-3">
              <h3 className="text-lg font-bold">Export Reports</h3>
              <p className="text-sm text-white/80">Generate daily, weekly, and monthly reports in Excel format.</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => {
                  const now = Date.now();
                  const rows = [["Type", "Sales", "Revenue", "Redeemed"]];
                  const daily = sales.filter((s) => now - s.createdAt <= 24 * 60 * 60 * 1000);
                  rows.push(["Daily", `${daily.length}`, `${daily.reduce((sum, s) => sum + s.amount, 0)}`, `${claims.filter((c) => now - c.createdAt <= 24 * 60 * 60 * 1000).length}`]);
                  exportWorkbook("daily-report", rows);
                }}>Daily Report</Button>
                <Button onClick={() => {
                  const now = Date.now();
                  const rows = [["Type", "Sales", "Revenue", "Redeemed"]];
                  const weekly = sales.filter((s) => now - s.createdAt <= 7 * 24 * 60 * 60 * 1000);
                  rows.push(["Weekly", `${weekly.length}`, `${weekly.reduce((sum, s) => sum + s.amount, 0)}`, `${claims.filter((c) => now - c.createdAt <= 7 * 24 * 60 * 60 * 1000).length}`]);
                  exportWorkbook("weekly-report", rows);
                }}>Weekly Report</Button>
                <Button onClick={() => {
                  const now = Date.now();
                  const rows = [["Type", "Sales", "Revenue", "Redeemed"]];
                  const monthly = sales.filter((s) => now - s.createdAt <= 30 * 24 * 60 * 60 * 1000);
                  rows.push(["Monthly", `${monthly.length}`, `${monthly.reduce((sum, s) => sum + s.amount, 0)}`, `${claims.filter((c) => now - c.createdAt <= 30 * 24 * 60 * 60 * 1000).length}`]);
                  exportWorkbook("monthly-report", rows);
                }}>Monthly Report</Button>
              </div>
            </Card>
          )}

          {active === "Settings" && (
            <Card className="space-y-3">
              <h3 className="text-lg font-bold">Store Settings</h3>
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="pod-price">Pod price</label>
                <Input id="pod-price" type="number" min={1} placeholder="Price charged for one pod" value={settings.podPrice} onChange={(e) => setSettings((s) => ({ ...s, podPrice: Number(e.target.value) }))} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="low-stock-default">Default low-stock alert</label>
                <Input id="low-stock-default" type="number" min={1} placeholder="Alert when stock reaches this amount" value={settings.lowStockDefault} onChange={(e) => setSettings((s) => ({ ...s, lowStockDefault: Number(e.target.value) }))} />
              </div>
              <Button onClick={async () => {
                await saveSettings(settings);
                toast.success("Settings saved");
              }}>Save Settings</Button>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
