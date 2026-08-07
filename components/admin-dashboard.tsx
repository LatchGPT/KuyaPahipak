"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { auth } from "@/lib/firebase";
import {
  createBrand,
  createCustomer,
  createFlavor,
  deleteBrand,
  deleteCustomer,
  deleteFlavor,
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
  updateFlavor,
  uploadImage,
} from "@/lib/firestore";
import { computeRewardState } from "@/lib/reward";
import type { Brand, Claim, Customer, Flavor, PodCategory, Sale, Settings } from "@/lib/types";
import { toCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

const sections = ["Dashboard", "Products", "Inventory", "Customers", "Sales", "Analytics", "Reports", "Settings"] as const;
type Section = (typeof sections)[number];

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
  const [brands, setBrands] = useState<Brand[]>([]);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [settings, setSettings] = useState<Settings>({ id: "default", lowStockDefault: 10, podPrice: 350 });
  const [globalSearch, setGlobalSearch] = useState("");
  const [brandForm, setBrandForm] = useState({ name: "", category: "non-transparent" as PodCategory, imageUrl: "" });
  const [flavorForm, setFlavorForm] = useState({ brandId: "", name: "", stock: 0, imageUrl: "", lowStockAlert: 10 });
  const [customerName, setCustomerName] = useState("");
  const [purchase, setPurchase] = useState({ customerId: "", brandId: "", flavorId: "", quantity: 1 });
  const [redeem, setRedeem] = useState({ customerId: "", flavorId: "" });

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

  const flavorOptions = useMemo(
    () => flavors.filter((flavor) => !purchase.brandId || flavor.brandId === purchase.brandId),
    [flavors, purchase.brandId],
  );

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
      lowStock: flavors.filter((flavor) => flavor.stock <= (flavor.lowStockAlert || settings.lowStockDefault)).length,
    };
  }, [sales, claims.length, flavors, settings.lowStockDefault]);

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
          )}

          {active === "Products" && (
            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="space-y-3">
                <h3 className="text-lg font-bold">Create Brand</h3>
                <Input placeholder="Brand name" value={brandForm.name} onChange={(e) => setBrandForm((s) => ({ ...s, name: e.target.value }))} />
                <select className="h-10 rounded-xl bg-white/5 px-3" value={brandForm.category} onChange={(e) => setBrandForm((s) => ({ ...s, category: e.target.value as PodCategory }))}>
                  <option value="non-transparent">Non-Transparent</option>
                  <option value="transparent">Transparent</option>
                </select>
                <Input placeholder="Brand image URL" value={brandForm.imageUrl} onChange={(e) => setBrandForm((s) => ({ ...s, imageUrl: e.target.value }))} />
                <Input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const imageUrl = await uploadImage(file, "brands");
                  setBrandForm((s) => ({ ...s, imageUrl }));
                }} />
                <Button onClick={async () => {
                  await createBrand({ ...brandForm, imageUrl: brandForm.imageUrl || "/placeholder-brand-1.svg" });
                  setBrandForm({ name: "", category: "non-transparent", imageUrl: "" });
                  toast.success("Brand created");
                }}>Save Brand</Button>
              </Card>

              <Card className="space-y-3">
                <h3 className="text-lg font-bold">Add Flavor</h3>
                <select className="h-10 rounded-xl bg-white/5 px-3" value={flavorForm.brandId} onChange={(e) => setFlavorForm((s) => ({ ...s, brandId: e.target.value }))}>
                  <option value="">Select brand</option>
                  {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
                <Input placeholder="Flavor name" value={flavorForm.name} onChange={(e) => setFlavorForm((s) => ({ ...s, name: e.target.value }))} />
                <Input type="number" min={0} value={flavorForm.stock} onChange={(e) => setFlavorForm((s) => ({ ...s, stock: Number(e.target.value) }))} />
                <Input type="number" min={1} value={flavorForm.lowStockAlert} onChange={(e) => setFlavorForm((s) => ({ ...s, lowStockAlert: Number(e.target.value) }))} />
                <Input placeholder="Flavor image URL" value={flavorForm.imageUrl} onChange={(e) => setFlavorForm((s) => ({ ...s, imageUrl: e.target.value }))} />
                <Input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const imageUrl = await uploadImage(file, "flavors");
                  setFlavorForm((s) => ({ ...s, imageUrl }));
                }} />
                <Button onClick={async () => {
                  await createFlavor({ ...flavorForm, imageUrl: flavorForm.imageUrl || "/placeholder-flavor-1.svg" });
                  setFlavorForm({ brandId: "", name: "", stock: 0, imageUrl: "", lowStockAlert: settings.lowStockDefault });
                  toast.success("Flavor added");
                }}>Save Flavor</Button>
              </Card>

              <Card className="xl:col-span-2">
                <h3 className="mb-3 text-lg font-bold">Manage Products</h3>
                <div className="grid gap-2">
                  {brands.map((brand) => (
                    <div key={brand.id} className="rounded-xl border border-white/10 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{brand.name}</p>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => updateBrand(brand.id, { category: brand.category === "transparent" ? "non-transparent" : "transparent" })}>Toggle Category</Button>
                          <Button variant="danger" onClick={() => deleteBrand(brand.id)}>Delete</Button>
                        </div>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {flavors.filter((f) => f.brandId === brand.id).map((flavor) => (
                          <div key={flavor.id} className="rounded-lg border border-white/10 p-2 text-sm">
                            <p>{flavor.name}</p>
                            <p>Stock: {flavor.stock}</p>
                            <div className="mt-2 flex gap-2">
                              <Button variant="outline" onClick={() => updateFlavor(flavor.id, { stock: flavor.stock + 1 })}>+1</Button>
                              <Button variant="outline" onClick={() => updateFlavor(flavor.id, { stock: Math.max(0, flavor.stock - 1) })}>-1</Button>
                              <Button variant="danger" onClick={() => deleteFlavor(flavor.id)}>Delete</Button>
                            </div>
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
            <div className="grid gap-3 md:grid-cols-2">
              {flavors.map((flavor) => (
                <Card key={flavor.id}>
                  <p className="font-semibold">{flavor.name}</p>
                  <p>Stock: {flavor.stock}</p>
                  <p className={`text-sm ${flavor.stock <= (flavor.lowStockAlert || settings.lowStockDefault) ? "text-amber-300" : "text-white/70"}`}>
                    Low stock alert: {flavor.lowStockAlert || settings.lowStockDefault}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button variant="outline" onClick={() => updateFlavor(flavor.id, { stock: flavor.stock + 5 })}>Add 5</Button>
                    <Button variant="outline" onClick={() => updateFlavor(flavor.id, { lowStockAlert: (flavor.lowStockAlert || settings.lowStockDefault) + 1 })}>Raise Alert</Button>
                  </div>
                </Card>
              ))}
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
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-sm">Purchases: {customer.totalPurchased} | Redeemed: {customer.totalRedeemed}</p>
                      <p className="text-sm">Progress: {reward.progress}/10 | Claimable: {reward.claimable}</p>
                      <Button className="mt-2" variant="danger" onClick={() => deleteCustomer(customer.id)}>Delete</Button>
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
                  {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
                <select className="h-10 rounded-xl bg-white/5 px-3" value={purchase.flavorId} onChange={(e) => setPurchase((s) => ({ ...s, flavorId: e.target.value }))}>
                  <option value="">Select flavor</option>
                  {flavorOptions.map((flavor) => <option key={flavor.id} value={flavor.id}>{flavor.name}</option>)}
                </select>
                <Input type="number" min={1} value={purchase.quantity} onChange={(e) => setPurchase((s) => ({ ...s, quantity: Number(e.target.value) }))} />
                <Button onClick={async () => {
                  const customer = customers.find((x) => x.id === purchase.customerId);
                  const brand = brands.find((x) => x.id === purchase.brandId);
                  const flavor = flavors.find((x) => x.id === purchase.flavorId);
                  if (!customer || !brand || !flavor) return toast.error("Please complete purchase form.");
                  await recordPurchase({
                    customerId: customer.id,
                    customerName: customer.name,
                    brandId: brand.id,
                    brandName: brand.name,
                    flavorId: flavor.id,
                    flavorName: flavor.name,
                    quantity: purchase.quantity,
                    amount: purchase.quantity * settings.podPrice,
                  });
                  toast.success("Purchase saved");
                }}>Save Purchase</Button>
              </Card>

              <Card className="space-y-3">
                <h3 className="text-lg font-bold">Redeem Free Pod</h3>
                <select className="h-10 rounded-xl bg-white/5 px-3" value={redeem.customerId} onChange={(e) => setRedeem((s) => ({ ...s, customerId: e.target.value }))}>
                  <option value="">Select customer</option>
                  {customers.map((customer) => {
                    const claimable = computeRewardState(customer.totalPurchased, customer.totalRedeemed).claimable;
                    return <option key={customer.id} value={customer.id}>{customer.name} ({claimable} claimable)</option>;
                  })}
                </select>
                <select className="h-10 rounded-xl bg-white/5 px-3" value={redeem.flavorId} onChange={(e) => setRedeem((s) => ({ ...s, flavorId: e.target.value }))}>
                  <option value="">Select flavor</option>
                  {flavors.filter((flavor) => flavor.stock > 0).map((flavor) => <option key={flavor.id} value={flavor.id}>{flavor.name}</option>)}
                </select>
                <Button onClick={async () => {
                  const customer = customers.find((x) => x.id === redeem.customerId);
                  const flavor = flavors.find((x) => x.id === redeem.flavorId);
                  if (!customer || !flavor) return toast.error("Select customer and flavor first.");
                  await redeemFreePod({ customerId: customer.id, customerName: customer.name, flavorId: flavor.id, flavorName: flavor.name });
                  toast.success("Free pod redeemed");
                }}>Redeem</Button>
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
                      <Bar dataKey="value" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <h3 className="mb-3 font-semibold">Top Selling Brands</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData.byBrand} dataKey="value" nameKey="name" fill="#22d3ee" />
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
                      <Bar dataKey="value" fill="#06b6d4" />
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
                      <Bar dataKey="value" fill="#818cf8" />
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
              <Input type="number" min={1} value={settings.podPrice} onChange={(e) => setSettings((s) => ({ ...s, podPrice: Number(e.target.value) }))} />
              <Input type="number" min={1} value={settings.lowStockDefault} onChange={(e) => setSettings((s) => ({ ...s, lowStockDefault: Number(e.target.value) }))} />
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
