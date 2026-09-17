"use client";

import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  ChevronRight,
  Copy,
  Dices,
  Edit2,
  ExternalLink,
  Filter,
  Layers,
  Menu,
  Package,
  PackagePlus,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import {
  createBrand,
  createCustomer,
  createFlavor,
  createSpinTicket,
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
  subscribeSpinTickets,
  updateBrand,
  updateCustomer,
  updateCustomerPurchaseItems,
  updateFlavor,
  uploadImage,
} from "@/lib/firestore";
import { computeRewardState } from "@/lib/reward";
import {
  PRODUCT_STATUS_LABELS,
  productStatusRank,
  type Brand,
  type Claim,
  type Customer,
  type Flavor,
  type PodCategory,
  type ProductStatus,
  type PurchaseItem,
  type Sale,
  type Settings,
  type SpinTicket,
} from "@/lib/types";
import { toCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { optimizeCloudinaryUrl } from "@/lib/image-loader";

const sections = ["Dashboard", "Products & Inventory", "Customers", "Sales", "Roulette", "Analytics", "Reports", "Settings"] as const;
type Section = (typeof sections)[number];
const CHART_COLORS = ["#dc2626", "#ef4444", "#ffffff", "#71717a", "#b91c1c", "#fca5a5", "#27272a"];
const BRAND_PLACEHOLDER = "/placeholder-brand-1.svg";
const FLAVOR_PLACEHOLDER = "/placeholder-flavor-1.svg";

function ProductImage({ src, alt, fallback = BRAND_PLACEHOLDER, className }: { src: string; alt: string; fallback?: string; className: string }) {
  const optimizedSrc = optimizeCloudinaryUrl(src, { width: 350 });
  // Cloudinary URLs are user-provided at runtime; a native image keeps the error fallback reliable.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={optimizedSrc || fallback}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={(event) => {
        if (!event.currentTarget.src.endsWith(fallback)) event.currentTarget.src = fallback;
      }}
    />
  );
}

function exportWorkbook(name: string, rows: string[][]) {
  const xmlRows = rows
    .map((row) => `<Row>${row.map((cell) => `<Cell><Data ss:Type="String">${cell}</Data></Cell>`).join("")}</Row>`)
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

  // Products & Inventory Section States
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [isCreateBrandOpen, setIsCreateBrandOpen] = useState(false);
  const [isAddFlavorOpen, setIsAddFlavorOpen] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | PodCategory>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ProductStatus>("all");
  const [stockFilter, setStockFilter] = useState<"all" | "low-stock" | "out-of-stock" | "healthy">("all");
  const [flavorSearch, setFlavorSearch] = useState("");

  // Forms and Modals States
  const [brandForm, setBrandForm] = useState({ name: "", category: "non-transparent" as PodCategory, status: "available" as ProductStatus, price: "", imageUrl: "" });
  const [flavorForm, setFlavorForm] = useState({ brandId: "", name: "", stock: "1", imageUrl: "", lowStockAlert: "" });
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editingFlavor, setEditingFlavor] = useState<Flavor | null>(null);
  const [brandUploading, setBrandUploading] = useState(false);
  const [flavorUploading, setFlavorUploading] = useState(false);
  const [editingBrandUploading, setEditingBrandUploading] = useState(false);
  const [editingFlavorUploading, setEditingFlavorUploading] = useState(false);

  // Customer Management States
  const [customerName, setCustomerName] = useState("");
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editingCustomerName, setEditingCustomerName] = useState("");
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [editedCustomerItems, setEditedCustomerItems] = useState<PurchaseItem[]>([]);
  const [customerItemFlavorId, setCustomerItemFlavorId] = useState("");
  const [customerItemQuantity, setCustomerItemQuantity] = useState(1);

  // Sales and Redemption States
  const [purchase, setPurchase] = useState({ customerId: "", brandId: "", flavorId: "", quantity: 1 });
  const [redeem, setRedeem] = useState({ customerId: "", brandId: "", flavorId: "" });

  // Roulette (Spin Tickets & Odds) States
  const [spinTickets, setSpinTickets] = useState<SpinTicket[]>([]);
  const [selectedSpinCustomerId, setSelectedSpinCustomerId] = useState("");
  const [generatingSpinTicket, setGeneratingSpinTicket] = useState(false);
  const [newlyCreatedTicket, setNewlyCreatedTicket] = useState<SpinTicket | null>(null);
  const [savingOdds, setSavingOdds] = useState(false);

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
      subscribeSpinTickets(setSpinTickets),
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
    () =>
      brands.filter(
        (brand) =>
          (brand.status ?? "available") === "available" &&
          catalogFlavors.some((flavor) => flavor.brandId === brand.id && flavor.stock > 0)
      ),
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

  // Unified Brand Catalog & Inventory Stats
  const brandStats = useMemo(() => {
    return brands.map((brand) => {
      const brandFlavors = flavors.filter((f) => f.brandId === brand.id);
      const totalStock = brandFlavors.reduce((sum, f) => sum + f.stock, 0);
      const outOfStockCount = brandFlavors.filter((f) => f.stock === 0).length;
      const lowStockCount = brandFlavors.filter((f) => f.stock > 0 && f.stock <= (f.lowStockAlert || settings.lowStockDefault)).length;
      const healthyCount = brandFlavors.filter((f) => f.stock > (f.lowStockAlert || settings.lowStockDefault)).length;

      let healthStatus: "out-of-stock" | "low-stock" | "healthy" = "healthy";
      if (outOfStockCount > 0) healthStatus = "out-of-stock";
      else if (lowStockCount > 0) healthStatus = "low-stock";

      return {
        brand,
        flavorsCount: brandFlavors.length,
        totalStock,
        outOfStockCount,
        lowStockCount,
        healthyCount,
        healthStatus,
      };
    });
  }, [brands, flavors, settings.lowStockDefault]);

  const filteredBrands = useMemo(() => {
    return brandStats
      .filter((stat) => {
        const matchesSearch = stat.brand.name.toLowerCase().includes(brandSearch.toLowerCase().trim());
        const matchesCategory = categoryFilter === "all" || stat.brand.category === categoryFilter;
        const matchesStatus = statusFilter === "all" || (stat.brand.status ?? "available") === statusFilter;
        const matchesStock =
          stockFilter === "all" ||
          (stockFilter === "out-of-stock" && stat.outOfStockCount > 0) ||
          (stockFilter === "low-stock" && (stat.lowStockCount > 0 || stat.outOfStockCount > 0)) ||
          (stockFilter === "healthy" && stat.healthStatus === "healthy");
        return matchesSearch && matchesCategory && matchesStatus && matchesStock;
      })
      .sort((a, b) => {
        const statusDiff = productStatusRank(a.brand.status) - productStatusRank(b.brand.status);
        if (statusDiff !== 0) return statusDiff;
        return a.brand.name.localeCompare(b.brand.name);
      });
  }, [brandStats, brandSearch, categoryFilter, statusFilter, stockFilter]);

  const activeBrandStat = useMemo(() => {
    if (!selectedBrandId) return null;
    return brandStats.find((s) => s.brand.id === selectedBrandId) ?? null;
  }, [brandStats, selectedBrandId]);

  const activeBrand = useMemo(() => {
    return activeBrandStat?.brand ?? null;
  }, [activeBrandStat]);

  const activeBrandFlavors = useMemo(() => {
    if (!selectedBrandId) return [];
    return flavors
      .filter((f) => f.brandId === selectedBrandId && f.name.toLowerCase().includes(flavorSearch.toLowerCase().trim()))
      .sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name));
  }, [flavors, selectedBrandId, flavorSearch]);

  const catalogSummary = useMemo(() => {
    const totalUnits = catalogFlavors.reduce((sum, f) => sum + f.stock, 0);
    const lowStockTotal = catalogFlavors.filter((f) => f.stock > 0 && f.stock <= (f.lowStockAlert || settings.lowStockDefault)).length;
    const outOfStockTotal = catalogFlavors.filter((f) => f.stock === 0).length;
    return {
      totalUnits,
      lowStockTotal,
      outOfStockTotal,
      totalFlavors: catalogFlavors.length,
      totalBrands: brands.length,
    };
  }, [catalogFlavors, settings.lowStockDefault, brands.length]);

  if (!ready) return <div className="grid min-h-screen place-items-center text-white">Checking admin access...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-red-950/30 text-white">
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 h-full w-full bg-black/70" aria-label="Close navigation menu" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative h-full w-72 border-r border-white/10 bg-neutral-950 p-4 shadow-2xl">
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
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm ${active === item ? "bg-red-600 text-white shadow-lg shadow-red-950/50 font-bold" : "text-neutral-400 hover:bg-neutral-900 hover:text-white"}`}
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
        <aside className="sticky top-0 hidden h-screen w-64 border-r border-white/10 bg-black/80 p-4 backdrop-blur lg:block">
          <Logo />
          <nav className="mt-6 space-y-2">
            {sections.map((item) => (
              <button
                key={item}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition ${active === item ? "bg-red-600 text-white shadow-lg shadow-red-950/50 font-bold" : "text-neutral-400 hover:bg-neutral-900 hover:text-white"}`}
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
            <div className="flex flex-1 max-w-md items-center gap-2">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                <Input value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} placeholder="Global search..." className="pl-9" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" onClick={() => (auth ? signOut(auth) : router.push("/"))}>
                Logout
              </Button>
            </div>
          </div>

          {globalSearch && (
            <Card className="mb-6 border-red-500/30 bg-neutral-900/80 p-4">
              <p className="mb-2 text-sm font-semibold text-red-400">Global Search Results</p>
              <div className="grid gap-2 text-sm md:grid-cols-3">
                <div className="rounded-lg bg-black/30 p-2">
                  <span className="font-medium text-white/70">Customers:</span>{" "}
                  {searchResults.customers.map((c) => c.name).join(", ") || "None"}
                </div>
                <div className="rounded-lg bg-black/30 p-2">
                  <span className="font-medium text-white/70">Brands:</span>{" "}
                  {searchResults.brands.map((b) => b.name).join(", ") || "None"}
                </div>
                <div className="rounded-lg bg-black/30 p-2">
                  <span className="font-medium text-white/70">Flavors:</span>{" "}
                  {searchResults.flavors.map((f) => f.name).join(", ") || "None"}
                </div>
              </div>
            </Card>
          )}

          {/* ========================================================================= */}
          {/* DASHBOARD SECTION */}
          {/* ========================================================================= */}
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
                  <Card key={title} className="p-4 transition hover:border-white/20">
                    <p className="text-sm text-white/70">{title}</p>
                    <p className="mt-1 text-2xl font-bold">{value}</p>
                  </Card>
                ))}
              </div>
              <Card className="p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">Live Reward Tracker</h2>
                    <p className="text-xs text-white/70">Updates as purchases and redemptions are recorded</p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {customers.map((customer) => {
                    const reward = computeRewardState(customer.totalPurchased, customer.totalRedeemed);
                    return (
                      <div key={customer.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                        <p className="font-semibold">{customer.name}</p>
                        <p className="mt-1 text-xs text-white/70">{reward.progress}/10 pods toward the next reward</p>
                        <Progress className="my-2" value={(reward.progress / 10) * 100} />
                        <p className="text-xs text-red-400">Claimable free pods: {reward.claimable}</p>
                      </div>
                    );
                  })}
                  {!customers.length && <p className="text-sm text-white/70">No customers yet.</p>}
                </div>
              </Card>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PRODUCTS & INVENTORY SECTION (UNIFIED BRAND-FIRST MANAGEMENT HUB) */}
          {/* ========================================================================= */}
          {active === "Products & Inventory" && (
            <div className="space-y-6">
              {/* TOP LEVEL: ALL BRANDS & STOCK OVERVIEW */}
              {!selectedBrandId ? (
                <>
                  {/* Header & Primary Actions */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-2.5">
                        <Layers className="h-6 w-6 text-red-500" />
                        Products &amp; Inventory Hub
                      </h2>
                      <p className="text-sm text-white/70">
                        Manage brand catalog, pricing, availability, and real-time stock levels all in one place.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        onClick={() => {
                          setBrandForm({ name: "", category: "non-transparent", status: "available", price: "", imageUrl: "" });
                          setIsCreateBrandOpen(true);
                        }}
                        className="flex items-center gap-2 shadow-lg shadow-red-950/40"
                      >
                        <Plus className="h-4 w-4" /> Create Brand
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFlavorForm({ brandId: brands[0]?.id || "", name: "", stock: "1", imageUrl: "", lowStockAlert: "" });
                          setIsAddFlavorOpen(true);
                        }}
                        className="flex items-center gap-2 border-white/20 hover:bg-white/10"
                      >
                        <PackagePlus className="h-4 w-4" /> Add Flavor
                      </Button>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-white/60">Total Units in Stock</p>
                        <Boxes className="h-4 w-4 text-emerald-400" />
                      </div>
                      <p className="mt-2 text-2xl font-bold text-white">{catalogSummary.totalUnits}</p>
                      <p className="text-[11px] text-white/40">{brands.length} brands · {flavors.length} flavors</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-white/60">Brands &amp; Flavors</p>
                        <Package className="h-4 w-4 text-red-400" />
                      </div>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {brands.length} <span className="text-sm font-normal text-white/60">/ {flavors.length} flavors</span>
                      </p>
                      <p className="text-[11px] text-white/40">
                        {brands.filter((b) => b.category === "transparent").length} transparent · {brands.filter((b) => b.category === "non-transparent").length} non-trans
                      </p>
                    </div>
                    <div className={`rounded-xl border p-4 backdrop-blur ${
                      catalogSummary.lowStockTotal > 0
                        ? "border-amber-500/30 bg-amber-950/20 text-amber-200"
                        : "border-white/10 bg-slate-900/40 text-white"
                    }`}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-white/60">Low Stock Flavors</p>
                        <AlertTriangle className={`h-4 w-4 ${catalogSummary.lowStockTotal > 0 ? "text-amber-400" : "text-white/40"}`} />
                      </div>
                      <p className="mt-2 text-2xl font-bold text-amber-300">{catalogSummary.lowStockTotal}</p>
                      <p className="text-[11px] text-white/40">Threshold &le; {settings.lowStockDefault} units</p>
                    </div>
                    <div className={`rounded-xl border p-4 backdrop-blur ${
                      catalogSummary.outOfStockTotal > 0
                        ? "border-rose-500/30 bg-rose-950/20 text-rose-200"
                        : "border-white/10 bg-slate-900/40 text-white"
                    }`}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-white/60">Out of Stock</p>
                        <XCircle className={`h-4 w-4 ${catalogSummary.outOfStockTotal > 0 ? "text-rose-400" : "text-white/40"}`} />
                      </div>
                      <p className="mt-2 text-2xl font-bold text-rose-400">{catalogSummary.outOfStockTotal}</p>
                      <p className="text-[11px] text-white/40">Flavors needing restock</p>
                    </div>
                  </div>

                  {/* Filter & Search Controls */}
                  <Card className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-900/60 border-white/10">
                    <div className="relative min-w-[240px] flex-1">
                      <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                      <Input
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        placeholder="Search brands by name..."
                        className="pl-9 bg-black/40 border-white/10"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-white/60">
                        <Filter className="h-3.5 w-3.5" /> Filter:
                      </div>
                      <select
                        className="h-10 rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white focus:outline-none"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as "all" | PodCategory)}
                      >
                        <option value="all">All Categories</option>
                        <option value="non-transparent">Non-Transparent</option>
                        <option value="transparent">Transparent</option>
                      </select>
                      <select
                        className="h-10 rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white focus:outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as "all" | ProductStatus)}
                      >
                        <option value="all">All Statuses</option>
                        {Object.entries(PRODUCT_STATUS_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <select
                        className="h-10 rounded-xl border border-white/10 bg-black/40 px-3 text-sm text-white focus:outline-none"
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value as "all" | "low-stock" | "out-of-stock" | "healthy")}
                      >
                        <option value="all">All Stock Health</option>
                        <option value="healthy">Healthy Only</option>
                        <option value="low-stock">Low Stock Alerts</option>
                        <option value="out-of-stock">Out of Stock Only</option>
                      </select>
                    </div>
                  </Card>

                  {/* Unified Brand Cards Grid */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredBrands.map(({ brand, flavorsCount, totalStock, outOfStockCount, lowStockCount, healthyCount, healthStatus }) => {
                      const status = brand.status ?? "available";
                      const statusBadgeColor =
                        status === "available"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : status === "coming-soon"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-rose-500/20 text-rose-300 border-rose-500/30";

                      const healthBadge =
                        healthStatus === "out-of-stock"
                          ? { label: "Out of Stock", class: "bg-rose-500/20 text-rose-300 border-rose-500/30" }
                          : healthStatus === "low-stock"
                            ? { label: "Low Stock", class: "bg-amber-500/20 text-amber-300 border-amber-500/30" }
                            : { label: "Healthy", class: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };

                      return (
                        <motion.div
                          key={brand.id}
                          whileHover={{ y: -4 }}
                          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 p-4 shadow-lg backdrop-blur transition hover:border-red-500/40 hover:bg-slate-900/80"
                        >
                          <div>
                            {/* Card Top Badges */}
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5">
                                <Badge className={statusBadgeColor}>{PRODUCT_STATUS_LABELS[status]}</Badge>
                                <Badge className={healthBadge.class}>{healthBadge.label}</Badge>
                              </div>
                              <Badge className="border-white/15 bg-white/5 text-[11px] text-white/80">
                                {brand.category === "transparent" ? "Transparent" : "Non-Transparent"}
                              </Badge>
                            </div>

                            {/* Brand Image with hover zoom */}
                            <div className="relative mb-3 flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-black/40 p-2">
                              <ProductImage
                                src={brand.imageUrl}
                                alt={brand.name}
                                className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                              />
                            </div>

                            {/* Brand Info & Pricing */}
                            <div className="space-y-1">
                              <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition">{brand.name}</h3>
                              <p className="text-sm font-semibold text-emerald-400">{toCurrency(brand.price ?? settings.podPrice)} <span className="text-xs font-normal text-white/50">/ pod</span></p>

                              {/* Inventory Metrics Row */}
                              <div className="mt-2.5 rounded-lg border border-white/5 bg-black/30 p-2 text-xs">
                                <div className="flex items-center justify-between text-white/70">
                                  <span className="flex items-center gap-1">
                                    <Boxes className="h-3 w-3 text-red-400" /> {flavorsCount} Flavor{flavorsCount === 1 ? "" : "s"}
                                  </span>
                                  <span className="font-semibold text-white">
                                    {totalStock} <span className="text-white/50 font-normal">units</span>
                                  </span>
                                </div>
                                {(lowStockCount > 0 || outOfStockCount > 0) && (
                                  <div className="mt-1 flex items-center gap-2 border-t border-white/5 pt-1 text-[11px]">
                                    {lowStockCount > 0 && (
                                      <span className="text-amber-400 font-medium">
                                        ⚠ {lowStockCount} Low
                                      </span>
                                    )}
                                    {outOfStockCount > 0 && (
                                      <span className="text-rose-400 font-medium">
                                        ✕ {outOfStockCount} OOS
                                      </span>
                                    )}
                                    <span className="ml-auto text-emerald-400/80">
                                      {healthyCount} OK
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                            <Button
                              onClick={() => {
                                setSelectedBrandId(brand.id);
                                setFlavorSearch("");
                              }}
                              className="w-full flex items-center justify-center gap-1.5 text-xs bg-red-600/90 hover:bg-red-600 shadow-md shadow-red-950/50"
                            >
                              Manage Brand &amp; Stock <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {!filteredBrands.length && (
                    <Card className="p-8 text-center">
                      <Package className="mx-auto mb-3 h-10 w-10 text-white/40" />
                      <p className="text-base font-semibold">No brands found</p>
                      <p className="mt-1 text-sm text-white/60">
                        {brands.length ? "Try clearing your search or filter options." : "Click '+ Create Brand' to add your first brand!"}
                      </p>
                    </Card>
                  )}
                </>
              ) : (
                /* DRILLDOWN LEVEL: SELECTED BRAND DETAILS & FLAVOR STOCK MANAGER */
                activeBrand && activeBrandStat && (
                  <div className="space-y-6">
                    {/* Navigation Breadcrumb */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedBrandId(null);
                          setEditingBrand(null);
                        }}
                        className="flex items-center gap-2 border-white/20 hover:bg-white/10"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back to Products &amp; Inventory
                      </Button>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setFlavorForm({ brandId: activeBrand.id, name: "", stock: "1", imageUrl: "", lowStockAlert: "" });
                            setIsAddFlavorOpen(true);
                          }}
                          className="flex items-center gap-2 border-red-500/30 text-red-200 hover:bg-red-500/10"
                        >
                          <Plus className="h-4 w-4" /> Add Flavor to {activeBrand.name}
                        </Button>
                        <Button
                          onClick={() => {
                            activeBrandFlavors.forEach((f) => updateFlavor(f.id, { stock: f.stock + 5 }));
                            toast.success(`Added +5 stock to all ${activeBrand.name} flavors`);
                          }}
                          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                        >
                          <RefreshCw className="h-4 w-4" /> Restock All Flavors (+5)
                        </Button>
                      </div>
                    </div>

                    {/* Brand Banner & Settings */}
                    <Card className="border-red-500/20 bg-slate-900/70 p-6 backdrop-blur">
                      {editingBrand?.id === activeBrand.id ? (
                        /* Edit Brand Form */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-red-400">Edit Brand Settings</h3>
                            <Button variant="ghost" onClick={() => setEditingBrand(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-white/70">Brand Name</label>
                              <Input
                                value={editingBrand.name}
                                onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                                placeholder="Brand Name"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-white/70">Price (₱)</label>
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={editingBrand.price ?? ""}
                                onChange={(e) => setEditingBrand({ ...editingBrand, price: Number(e.target.value) })}
                                placeholder="Price"
                              />
                            </div>
                            <div>
                              <label htmlFor="edit-brand-category" className="mb-1 block text-xs font-medium text-white/70">Category</label>
                              <select
                                id="edit-brand-category"
                                aria-label="Category"
                                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
                                value={editingBrand.category}
                                onChange={(e) => setEditingBrand({ ...editingBrand, category: e.target.value as PodCategory })}
                              >
                                <option value="non-transparent">Non-Transparent</option>
                                <option value="transparent">Transparent</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="edit-brand-status" className="mb-1 block text-xs font-medium text-white/70">Availability Status</label>
                              <select
                                id="edit-brand-status"
                                aria-label="Availability Status"
                                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
                                value={editingBrand.status ?? "available"}
                                onChange={(e) => setEditingBrand({ ...editingBrand, status: e.target.value as ProductStatus })}
                              >
                                {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <label className="block text-xs font-medium text-white/70">Brand Image</label>
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 p-2">
                                  <ProductImage src={editingBrand.imageUrl} alt="Brand Preview" className="h-full w-full object-contain" />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    disabled={editingBrandUploading}
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      setEditingBrandUploading(true);
                                      try {
                                        const imageUrl = await uploadImage(file, "brands");
                                        setEditingBrand({ ...editingBrand, imageUrl });
                                        toast.success("Brand image uploaded");
                                      } catch (error) {
                                        toast.error(error instanceof Error ? error.message : "Could not upload image");
                                      } finally {
                                        setEditingBrandUploading(false);
                                        e.target.value = "";
                                      }
                                    }}
                                  />
                                  {editingBrandUploading && <p className="text-xs text-red-400">Uploading new image…</p>}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              disabled={editingBrandUploading || !editingBrand.name.trim()}
                              onClick={async () => {
                                try {
                                  await updateBrand(activeBrand.id, {
                                    name: editingBrand.name.trim(),
                                    price: editingBrand.price || settings.podPrice,
                                    category: editingBrand.category,
                                    status: editingBrand.status ?? "available",
                                    imageUrl: editingBrand.imageUrl || BRAND_PLACEHOLDER,
                                  });
                                  setEditingBrand(null);
                                  toast.success("Brand settings updated");
                                } catch (error) {
                                  toast.error(error instanceof Error ? error.message : "Could not update brand");
                                }
                              }}
                            >
                              Save Changes
                            </Button>
                            <Button variant="outline" onClick={() => setEditingBrand(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Read-only Brand Details Banner with Stock Metrics */
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-2">
                              <ProductImage
                                src={activeBrand.imageUrl}
                                alt={activeBrand.name}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-2xl font-bold text-white">{activeBrand.name}</h2>
                                <Badge
                                  className={
                                    (activeBrand.status ?? "available") === "available"
                                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                      : (activeBrand.status ?? "available") === "coming-soon"
                                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                        : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                  }
                                >
                                  {PRODUCT_STATUS_LABELS[activeBrand.status ?? "available"]}
                                </Badge>
                                <Badge className="border-white/15 bg-white/5 text-xs text-white/80">
                                  {activeBrand.category === "transparent" ? "Transparent" : "Non-Transparent"}
                                </Badge>
                              </div>
                              <p className="text-lg font-semibold text-emerald-400">
                                Price: {toCurrency(activeBrand.price ?? settings.podPrice)} <span className="text-xs font-normal text-white/50">per pod</span>
                              </p>

                              {/* Live Stock Breakdown Badges */}
                              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                                <span className="rounded-md border border-white/10 bg-black/40 px-2.5 py-1 text-white/80">
                                  Total Stock: <b className="text-white">{activeBrandStat.totalStock}</b> units
                                </span>
                                <span className="rounded-md border border-emerald-500/20 bg-emerald-950/30 px-2.5 py-1 text-emerald-300">
                                  Healthy: <b>{activeBrandStat.healthyCount}</b>
                                </span>
                                {activeBrandStat.lowStockCount > 0 && (
                                  <span className="rounded-md border border-amber-500/30 bg-amber-950/40 px-2.5 py-1 text-amber-300">
                                    Low Stock: <b>{activeBrandStat.lowStockCount}</b>
                                  </span>
                                )}
                                {activeBrandStat.outOfStockCount > 0 && (
                                  <span className="rounded-md border border-rose-500/30 bg-rose-950/40 px-2.5 py-1 text-rose-300">
                                    Out of Stock: <b>{activeBrandStat.outOfStockCount}</b>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={() => setEditingBrand(activeBrand)} className="flex items-center gap-1.5 border-white/20 hover:bg-white/10">
                              <Edit2 className="h-4 w-4" /> Edit Brand
                            </Button>
                            <Button
                              variant="outline"
                              onClick={async () => {
                                try {
                                  const category = activeBrand.category === "transparent" ? "non-transparent" : "transparent";
                                  await updateBrand(activeBrand.id, { category });
                                  toast.success(`Moved brand to ${category}`);
                                } catch (error) {
                                  toast.error(error instanceof Error ? error.message : "Could not change category");
                                }
                              }}
                              className="border-white/20 hover:bg-white/10"
                            >
                              Toggle Category
                            </Button>
                            <Button
                              variant="danger"
                              onClick={async () => {
                                if (confirm(`Are you sure you want to delete ${activeBrand.name} and all its flavors?`)) {
                                  try {
                                    await deleteBrand(activeBrand.id);
                                    setSelectedBrandId(null);
                                    toast.success("Brand and its flavors deleted");
                                  } catch (error) {
                                    toast.error(error instanceof Error ? error.message : "Could not delete brand");
                                  }
                                }
                              }}
                              className="flex items-center gap-1.5"
                            >
                              <Trash2 className="h-4 w-4" /> Delete Brand
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>

                    {/* Flavors & Stock Section for Selected Brand */}
                    <div className="space-y-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <Boxes className="h-5 w-5 text-red-400" />
                          <h3 className="text-xl font-bold">Flavors &amp; Stock ({activeBrand.name})</h3>
                          <Badge className="ml-1 bg-red-500/20 text-red-200 border-red-500/30">
                            {activeBrandFlavors.length}
                          </Badge>
                        </div>
                        <div className="relative min-w-[220px]">
                          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                          <Input
                            value={flavorSearch}
                            onChange={(e) => setFlavorSearch(e.target.value)}
                            placeholder="Filter flavors..."
                            className="pl-9 text-sm bg-black/40 border-white/10"
                          />
                        </div>
                      </div>

                      {/* Flavors Grid */}
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {activeBrandFlavors.map((flavor) => {
                          const alertThreshold = flavor.lowStockAlert || settings.lowStockDefault;
                          const isOutOfStock = flavor.stock === 0;
                          const isLowStock = flavor.stock > 0 && flavor.stock <= alertThreshold;

                          return (
                            <div
                              key={flavor.id}
                              className={`flex flex-col justify-between rounded-xl border p-3.5 shadow backdrop-blur transition hover:border-white/30 ${
                                isOutOfStock
                                  ? "border-rose-500/40 bg-rose-950/15"
                                  : isLowStock
                                    ? "border-amber-500/40 bg-amber-950/15"
                                    : "border-white/10 bg-slate-900/60"
                              }`}
                            >
                              {editingFlavor?.id === flavor.id ? (
                                /* Flavor Inline Editor */
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-red-400">Edit Flavor</p>
                                    <Button variant="ghost" className="h-6 w-6 p-0" onClick={() => setEditingFlavor(null)}>
                                      <X className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                  <div>
                                    <label className="text-xs text-white/70">Flavor Name</label>
                                    <Input
                                      value={editingFlavor.name}
                                      onChange={(e) => setEditingFlavor({ ...editingFlavor, name: e.target.value })}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-xs text-white/70">Stock</label>
                                      <Input
                                        type="number"
                                        min={0}
                                        value={editingFlavor.stock}
                                        onChange={(e) => setEditingFlavor({ ...editingFlavor, stock: Number(e.target.value) })}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-white/70">Low Alert</label>
                                      <Input
                                        type="number"
                                        min={1}
                                        value={editingFlavor.lowStockAlert}
                                        onChange={(e) => setEditingFlavor({ ...editingFlavor, lowStockAlert: Number(e.target.value) })}
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs text-white/70">Flavor Image</label>
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      disabled={editingFlavorUploading}
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setEditingFlavorUploading(true);
                                        try {
                                          const imageUrl = await uploadImage(file, "flavors");
                                          setEditingFlavor({ ...editingFlavor, imageUrl });
                                          toast.success("Flavor image uploaded");
                                        } catch (error) {
                                          toast.error(error instanceof Error ? error.message : "Could not upload flavor image");
                                        } finally {
                                          setEditingFlavorUploading(false);
                                          e.target.value = "";
                                        }
                                      }}
                                    />
                                    {editingFlavorUploading && <p className="text-xs text-red-400">Uploading...</p>}
                                  </div>
                                  <ProductImage
                                    src={editingFlavor.imageUrl}
                                    alt="Preview"
                                    fallback={FLAVOR_PLACEHOLDER}
                                    className="h-20 w-full rounded-lg bg-black/20 object-contain"
                                  />
                                  <div className="flex gap-2 pt-1">
                                    <Button
                                      disabled={editingFlavorUploading || !editingFlavor.name.trim()}
                                      onClick={async () => {
                                        try {
                                          await updateFlavor(flavor.id, {
                                            name: editingFlavor.name.trim(),
                                            stock: editingFlavor.stock,
                                            lowStockAlert: editingFlavor.lowStockAlert,
                                            imageUrl: editingFlavor.imageUrl || FLAVOR_PLACEHOLDER,
                                          });
                                          setEditingFlavor(null);
                                          toast.success("Flavor updated");
                                        } catch (error) {
                                          toast.error(error instanceof Error ? error.message : "Could not update flavor");
                                        }
                                      }}
                                      className="flex-1 text-xs"
                                    >
                                      Save
                                    </Button>
                                    <Button variant="outline" onClick={() => setEditingFlavor(null)} className="text-xs">
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                /* Flavor Regular Card with Unified Quick Controls */
                                <>
                                  <div>
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                      <h4 className="font-semibold text-white truncate" title={flavor.name}>{flavor.name}</h4>
                                      <span
                                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                          isOutOfStock
                                            ? "bg-rose-500/80 text-white"
                                            : isLowStock
                                              ? "bg-amber-500/80 text-white"
                                              : "bg-emerald-500/80 text-white"
                                        }`}
                                      >
                                        {flavor.stock} in stock
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-white/60">
                                      <span>Alert threshold:</span>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          className="h-5 w-5 p-0 text-xs text-white/50 hover:text-white"
                                          onClick={() => updateFlavor(flavor.id, { lowStockAlert: Math.max(1, alertThreshold - 1) })}
                                        >
                                          -
                                        </Button>
                                        <span className="font-semibold text-white/80">{alertThreshold}</span>
                                        <Button
                                          variant="ghost"
                                          className="h-5 w-5 p-0 text-xs text-white/50 hover:text-white"
                                          onClick={() => updateFlavor(flavor.id, { lowStockAlert: alertThreshold + 1 })}
                                        >
                                          +
                                        </Button>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-3 space-y-2 border-t border-white/10 pt-2.5">
                                    {/* Quick Stock Controls & Direct Entry */}
                                    <div className="flex items-center justify-between gap-1">
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs text-white/50">Stock:</span>
                                        <Input
                                          type="number"
                                          min={0}
                                          key={flavor.stock}
                                          defaultValue={flavor.stock}
                                          className="h-7 w-14 p-1 text-center text-xs font-bold bg-black/40 border-white/10"
                                          onKeyDown={async (e) => {
                                            if (e.key === "Enter") {
                                              const val = Number((e.target as HTMLInputElement).value);
                                              if (!isNaN(val) && val >= 0) {
                                                await updateFlavor(flavor.id, { stock: val });
                                                toast.success(`Updated ${flavor.name} stock to ${val}`);
                                              }
                                            }
                                          }}
                                          onBlur={async (e) => {
                                            const val = Number(e.target.value);
                                            if (!isNaN(val) && val >= 0 && val !== flavor.stock) {
                                              await updateFlavor(flavor.id, { stock: val });
                                              toast.success(`Updated ${flavor.name} stock to ${val}`);
                                            }
                                          }}
                                        />
                                      </div>
                                      <div className="flex gap-1">
                                        <Button
                                          variant="outline"
                                          className="h-7 px-2 text-xs border-white/15 hover:bg-white/10"
                                          onClick={async () => {
                                            try {
                                              await updateFlavor(flavor.id, { stock: Math.max(0, flavor.stock - 1) });
                                            } catch {
                                              toast.error("Could not update stock");
                                            }
                                          }}
                                        >
                                          -1
                                        </Button>
                                        <Button
                                          variant="outline"
                                          className="h-7 px-2 text-xs border-white/15 hover:bg-white/10"
                                          onClick={async () => {
                                            try {
                                              await updateFlavor(flavor.id, { stock: flavor.stock + 1 });
                                            } catch {
                                              toast.error("Could not update stock");
                                            }
                                          }}
                                        >
                                          +1
                                        </Button>
                                        <Button
                                          variant="outline"
                                          className="h-7 px-2 text-xs border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                                          onClick={async () => {
                                            try {
                                              await updateFlavor(flavor.id, { stock: flavor.stock + 5 });
                                              toast.success(`Added +5 stock to ${flavor.name}`);
                                            } catch {
                                              toast.error("Could not update stock");
                                            }
                                          }}
                                        >
                                          +5
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Edit & Delete Action Buttons */}
                                    <div className="flex items-center gap-1.5 pt-1">
                                      <Button
                                        variant="outline"
                                        onClick={() => setEditingFlavor(flavor)}
                                        className="flex-1 flex items-center justify-center gap-1 text-xs border-white/15 hover:bg-white/10"
                                      >
                                        <Edit2 className="h-3 w-3" /> Edit Flavor
                                      </Button>
                                      <Button
                                        variant="danger"
                                        onClick={async () => {
                                          if (confirm(`Delete flavor "${flavor.name}"?`)) {
                                            try {
                                              await deleteFlavor(flavor.id);
                                              toast.success("Flavor deleted");
                                            } catch {
                                              toast.error("Could not delete flavor");
                                            }
                                          }
                                        }}
                                        className="h-8 px-2 text-xs"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {!activeBrandFlavors.length && (
                        <Card className="p-8 text-center bg-slate-900/40 border-white/10">
                          <Boxes className="mx-auto mb-2 h-8 w-8 text-white/40" />
                          <p className="font-semibold">No flavors found for {activeBrand.name}</p>
                          <p className="mt-1 text-xs text-white/60">
                            Click &quot;Add Flavor to {activeBrand.name}&quot; above to create new flavors!
                          </p>
                        </Card>
                      )}
                    </div>
                  </div>
                )
              )}

              {/* MODAL: CREATE NEW BRAND */}
              <AnimatePresence>
                {isCreateBrandOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full max-w-lg rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-red-400" /> Create New Brand
                        </h3>
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsCreateBrandOpen(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-white/70">Brand Name</label>
                          <Input
                            placeholder="e.g. Relx Infinity, Shift Pods..."
                            value={brandForm.name}
                            onChange={(e) => setBrandForm((s) => ({ ...s, name: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-white/70">Price (₱)</label>
                            <Input
                              type="number"
                              min={0}
                              step="0.01"
                              placeholder={`Default: ₱${settings.podPrice}`}
                              value={brandForm.price}
                              onChange={(e) => setBrandForm((s) => ({ ...s, price: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label htmlFor="add-brand-category" className="mb-1 block text-xs font-medium text-white/70">Category</label>
                            <select
                              id="add-brand-category"
                              aria-label="Category"
                              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
                              value={brandForm.category}
                              onChange={(e) => setBrandForm((s) => ({ ...s, category: e.target.value as PodCategory }))}
                            >
                              <option value="non-transparent">Non-Transparent</option>
                              <option value="transparent">Transparent</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="add-brand-status" className="mb-1 block text-xs font-medium text-white/70">Availability Status</label>
                          <select
                            id="add-brand-status"
                            aria-label="Availability Status"
                            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
                            value={brandForm.status}
                            onChange={(e) => setBrandForm((s) => ({ ...s, status: e.target.value as ProductStatus }))}
                          >
                            {Object.entries(PRODUCT_STATUS_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-white/70">Brand Image</label>
                          <Input
                            type="file"
                            accept="image/*"
                            disabled={brandUploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setBrandUploading(true);
                              try {
                                const imageUrl = await uploadImage(file, "brands");
                                setBrandForm((s) => ({ ...s, imageUrl }));
                                toast.success("Brand image uploaded");
                              } catch (error) {
                                toast.error(error instanceof Error ? error.message : "Could not upload brand image.");
                              } finally {
                                setBrandUploading(false);
                                e.target.value = "";
                              }
                            }}
                          />
                          {brandUploading && <p className="text-xs text-red-400">Uploading brand image…</p>}
                          {brandForm.imageUrl && (
                            <ProductImage
                              src={brandForm.imageUrl}
                              alt="Brand preview"
                              className="h-28 w-full rounded-xl bg-black/40 object-contain p-2"
                            />
                          )}
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCreateBrandOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          disabled={brandUploading || !brandForm.name.trim()}
                          onClick={async () => {
                            try {
                              await createBrand({
                                ...brandForm,
                                name: brandForm.name.trim(),
                                price: Number(brandForm.price || settings.podPrice),
                                imageUrl: brandForm.imageUrl || BRAND_PLACEHOLDER,
                              });
                              setBrandForm({ name: "", category: "non-transparent", status: "available", price: "", imageUrl: "" });
                              setIsCreateBrandOpen(false);
                              toast.success("Brand created successfully");
                            } catch (error) {
                              toast.error(error instanceof Error ? error.message : "Could not create brand.");
                            }
                          }}
                        >
                          Save Brand
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* MODAL: ADD FLAVOR */}
              <AnimatePresence>
                {isAddFlavorOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full max-w-lg rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <PackagePlus className="h-5 w-5 text-red-400" /> Add New Flavor
                        </h3>
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsAddFlavorOpen(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-white/70">Select Brand</label>
                          <select
                            className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm"
                            value={flavorForm.brandId}
                            onChange={(e) => setFlavorForm((s) => ({ ...s, brandId: e.target.value }))}
                          >
                            <option value="">-- Choose Brand --</option>
                            {brands.map((brand) => (
                              <option key={brand.id} value={brand.id}>
                                {brand.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-white/70">Flavor Name</label>
                          <Input
                            placeholder="e.g. Watermelon Chill, Fresh Taro..."
                            value={flavorForm.name}
                            onChange={(e) => setFlavorForm((s) => ({ ...s, name: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-white/70">Starting Stock</label>
                            <Input
                              type="number"
                              min={0}
                              placeholder="1"
                              value={flavorForm.stock}
                              onChange={(e) => setFlavorForm((s) => ({ ...s, stock: e.target.value }))}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-white/70">Low Stock Alert</label>
                            <Input
                              type="number"
                              min={1}
                              placeholder={`Default: ${settings.lowStockDefault}`}
                              value={flavorForm.lowStockAlert}
                              onChange={(e) => setFlavorForm((s) => ({ ...s, lowStockAlert: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-white/70">Flavor Image</label>
                          <Input
                            type="file"
                            accept="image/*"
                            disabled={flavorUploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setFlavorUploading(true);
                              try {
                                const imageUrl = await uploadImage(file, "flavors");
                                setFlavorForm((s) => ({ ...s, imageUrl }));
                                toast.success("Flavor image uploaded");
                              } catch (error) {
                                toast.error(error instanceof Error ? error.message : "Could not upload flavor image.");
                              } finally {
                                setFlavorUploading(false);
                                e.target.value = "";
                              }
                            }}
                          />
                          {flavorUploading && <p className="text-xs text-red-400">Uploading flavor image…</p>}
                          {flavorForm.imageUrl && (
                            <ProductImage
                              src={flavorForm.imageUrl}
                              alt="Flavor preview"
                              fallback={FLAVOR_PLACEHOLDER}
                              className="h-24 w-full rounded-xl bg-black/40 object-contain p-2"
                            />
                          )}
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddFlavorOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          disabled={flavorUploading || !flavorForm.brandId || !flavorForm.name.trim()}
                          onClick={async () => {
                            try {
                              await createFlavor({
                                ...flavorForm,
                                name: flavorForm.name.trim(),
                                stock: Number(flavorForm.stock || 1),
                                lowStockAlert: Number(flavorForm.lowStockAlert || settings.lowStockDefault),
                                imageUrl: flavorForm.imageUrl || FLAVOR_PLACEHOLDER,
                              });
                              setFlavorForm({ brandId: "", name: "", stock: "1", imageUrl: "", lowStockAlert: "" });
                              setIsAddFlavorOpen(false);
                              toast.success("Flavor created successfully");
                            } catch (error) {
                              toast.error(error instanceof Error ? error.message : "Could not add flavor.");
                            }
                          }}
                        >
                          Save Flavor
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CUSTOMERS SECTION */}
          {/* ========================================================================= */}
          {active === "Customers" && (
            <div className="space-y-4">
              <Card className="flex flex-wrap gap-2 p-4">
                <Input placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="max-w-sm" />
                <Button
                  onClick={async () => {
                    if (!customerName.trim()) return toast.error("Please enter a customer name.");
                    await createCustomer({ name: customerName.trim() });
                    setCustomerName("");
                    toast.success("Customer created");
                  }}
                >
                  Create Customer
                </Button>
              </Card>
              <div className="grid gap-3 md:grid-cols-2">
                {customers.map((customer) => {
                  const reward = computeRewardState(customer.totalPurchased, customer.totalRedeemed);
                  return (
                    <Card key={customer.id} className="p-4">
                      {editingCustomerId === customer.id ? (
                        <div className="flex flex-wrap gap-2">
                          <Input value={editingCustomerName} onChange={(event) => setEditingCustomerName(event.target.value)} aria-label="Customer name" />
                          <Button
                            onClick={async () => {
                              const name = editingCustomerName.trim();
                              if (!name) return toast.error("Customer name is required.");
                              await updateCustomer(customer.id, { name });
                              setEditingCustomerId(null);
                              toast.success("Customer name updated");
                            }}
                          >
                            Save
                          </Button>
                          <Button variant="outline" onClick={() => setEditingCustomerId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-white">{customer.name}</p>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingCustomerId(customer.id);
                              setEditingCustomerName(customer.name);
                            }}
                          >
                            Edit Name
                          </Button>
                        </div>
                      )}
                      <p className="mt-1 text-sm text-white/80">Purchases: {customer.totalPurchased} | Redeemed: {customer.totalRedeemed}</p>
                      <p className="text-sm text-red-400">Progress: {reward.progress}/10 | Claimable: {reward.claimable}</p>
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
                        <Button
                          variant="danger"
                          onClick={() => {
                            if (confirm(`Delete customer "${customer.name}"?`)) {
                              deleteCustomer(customer.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
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
                              const displayName =
                                matchingFlavor && !item.flavorName.toLowerCase().startsWith(matchingFlavor.brandName.toLowerCase())
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
                                    onChange={(event) =>
                                      setEditedCustomerItems((items) =>
                                        items.map((currentItem) =>
                                          currentItem.flavorId === item.flavorId
                                            ? { ...currentItem, quantity: Math.max(1, Math.floor(Number(event.target.value) || 1)) }
                                            : currentItem,
                                        ),
                                      )
                                    }
                                  />
                                  <Button
                                    variant="danger"
                                    onClick={() => setEditedCustomerItems((items) => items.filter((currentItem) => currentItem.flavorId !== item.flavorId))}
                                  >
                                    Remove
                                  </Button>
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
                                    ? items.map((item) =>
                                        item.flavorId === flavor.id ? { ...item, flavorName: flavorDisplayName, quantity: item.quantity + customerItemQuantity } : item,
                                      )
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

          {/* ========================================================================= */}
          {/* SALES & REDEMPTIONS SECTION */}
          {/* ========================================================================= */}
          {active === "Sales" && (
            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="space-y-3 p-5">
                <h3 className="text-lg font-bold">Create Purchase</h3>
                <select className="h-10 w-full rounded-xl bg-white/5 px-3" value={purchase.customerId} onChange={(e) => setPurchase((s) => ({ ...s, customerId: e.target.value }))}>
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                <select
                  className="h-10 w-full rounded-xl bg-white/5 px-3"
                  value={purchase.brandId}
                  onChange={(e) => setPurchase((s) => ({ ...s, brandId: e.target.value, flavorId: "" }))}
                >
                  <option value="">Select brand</option>
                  {availableBrands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <select
                  className="h-10 w-full rounded-xl bg-white/5 px-3"
                  disabled={!purchase.brandId}
                  value={purchase.flavorId}
                  onChange={(e) => setPurchase((s) => ({ ...s, flavorId: e.target.value }))}
                >
                  <option value="">
                    {purchase.brandId ? (flavorOptions.length ? "Select available flavor" : "No flavors in stock") : "Select brand first"}
                  </option>
                  {flavorOptions.map((flavor) => (
                    <option key={flavor.id} value={flavor.id}>
                      {flavor.name} ({flavor.stock} in stock)
                    </option>
                  ))}
                </select>
                <Input type="number" min={1} value={purchase.quantity} onChange={(e) => setPurchase((s) => ({ ...s, quantity: Number(e.target.value) }))} />
                <Button
                  onClick={async () => {
                    const customer = customers.find((x) => x.id === purchase.customerId);
                    const brand = brands.find((x) => x.id === purchase.brandId);
                    const flavor = catalogFlavors.find((x) => x.id === purchase.flavorId);
                    if (!customer) return toast.error("Please select a customer.");
                    if (!brand) return toast.error("Please select a brand.");
                    if (!flavor) return toast.error("Please select a flavor.");
                    const qty = Math.max(1, Math.floor(Number(purchase.quantity) || 1));
                    if (flavor.stock < qty) {
                      return toast.error(`Insufficient stock for ${flavor.name} (Available: ${flavor.stock}, Requested: ${qty}). Please increase stock in Products & Inventory.`);
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
                  }}
                >
                  Save Purchase
                </Button>
              </Card>

              <Card className="space-y-3 p-5">
                <h3 className="text-lg font-bold">Redeem Free Pod</h3>
                <select
                  className="h-10 w-full rounded-xl bg-white/5 px-3"
                  value={redeem.customerId}
                  onChange={(e) => setRedeem({ customerId: e.target.value, brandId: "", flavorId: "" })}
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => {
                    const claimable = computeRewardState(customer.totalPurchased, customer.totalRedeemed).claimable;
                    return (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({claimable} claimable)
                      </option>
                    );
                  })}
                </select>
                <select
                  className="h-10 w-full rounded-xl bg-white/5 px-3"
                  disabled={!redeem.customerId}
                  value={redeem.brandId}
                  onChange={(e) => setRedeem((s) => ({ ...s, brandId: e.target.value, flavorId: "" }))}
                >
                  <option value="">{redeem.customerId ? "Select brand" : "Select customer first"}</option>
                  {availableBrands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <select
                  className="h-10 w-full rounded-xl bg-white/5 px-3"
                  disabled={!redeem.brandId}
                  value={redeem.flavorId}
                  onChange={(e) => setRedeem((s) => ({ ...s, flavorId: e.target.value }))}
                >
                  <option value="">
                    {redeem.brandId ? (redeemFlavorOptions.length ? "Select available flavor" : "No flavors in stock") : "Select brand first"}
                  </option>
                  {redeemFlavorOptions.map((flavor) => (
                    <option key={flavor.id} value={flavor.id}>
                      {flavor.name} ({flavor.stock} in stock)
                    </option>
                  ))}
                </select>
                <Button
                  onClick={async () => {
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
                  }}
                >
                  Redeem
                </Button>
              </Card>

              <Card className="xl:col-span-2 p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold">Sales History</h3>
                  <p className="text-sm text-white/70">{sales.length} recorded</p>
                </div>
                <div className="space-y-2">
                  {sales.map((sale) => (
                    <div key={sale.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 p-3 text-sm">
                      <div>
                        <p className="font-semibold text-white">
                          {sale.customerName} · {sale.brandName} - {sale.flavorName}
                        </p>
                        <p className="text-white/70">
                          {sale.quantity} pod(s) · {toCurrency(sale.amount)}
                        </p>
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

          {/* ========================================================================= */}
          {/* ROULETTE & REWARD SPIN MANAGEMENT SECTION */}
          {/* ========================================================================= */}
          {active === "Roulette" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Dices className="h-6 w-6 text-red-500" />
                    Roulette & Reward Wheel
                  </h2>
                  <p className="text-sm text-white/70">
                    Generate single-use spin links for customers reaching 10 pods and configure dynamic wheel odds.
                  </p>
                </div>
              </div>

              {/* Top Banner: Ticket Generator & Quick Link */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="space-y-4 p-5 border-red-500/20 bg-gradient-to-br from-red-950/20 via-slate-900/60 to-slate-900/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-400 font-semibold text-base">
                      <Sparkles className="h-5 w-5" />
                      Issue Spin Voucher Link
                    </div>
                    <Button
                      variant="outline"
                      className="text-xs h-7 px-2.5 py-0 border-red-400/40 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                      onClick={async () => {
                        try {
                          const testName = `Test Customer (${Math.floor(100 + Math.random() * 900)})`;
                          await createCustomer({
                            name: testName,
                            totalPurchased: 10,
                            totalRedeemed: 0,
                          });
                          toast.success(`Created ${testName} with 10 purchased pods!`);
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Failed to add test customer");
                        }
                      }}
                    >
                      + Add Test Customer (10 Pods)
                    </Button>
                  </div>
                  <p className="text-xs text-white/60">
                    Select an eligible customer who has reached at least 10 purchased pods (1+ claimable reward) to generate a unique 1-time spin link.
                  </p>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-white/80" htmlFor="spin-customer-select">
                        Customer
                      </label>
                      <select
                        id="spin-customer-select"
                        aria-label="Customer for spin ticket"
                        className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none"
                        value={selectedSpinCustomerId}
                        onChange={(e) => setSelectedSpinCustomerId(e.target.value)}
                      >
                        <option value="">Select an eligible customer...</option>
                        {customers.map((c) => {
                          const reward = computeRewardState(c.totalPurchased, c.totalRedeemed);
                          return (
                            <option key={c.id} value={c.id}>
                              {c.name} — {c.totalPurchased} pods bought ({reward.claimable} reward{reward.claimable === 1 ? "" : "s"} ready)
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-950/50"
                      disabled={!selectedSpinCustomerId || generatingSpinTicket}
                      onClick={async () => {
                        const targetCustomer = customers.find((c) => c.id === selectedSpinCustomerId);
                        if (!targetCustomer) return;
                        setGeneratingSpinTicket(true);
                        try {
                          const ticket = await createSpinTicket(targetCustomer.id, targetCustomer.name);
                          setNewlyCreatedTicket(ticket);
                          toast.success(`Spin voucher generated: ${ticket.code}`);
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Failed to generate spin ticket.");
                        } finally {
                          setGeneratingSpinTicket(false);
                        }
                      }}
                    >
                      <Dices className="h-4 w-4" />
                      {generatingSpinTicket ? "Generating..." : "Generate 1-Time Spin Link"}
                    </Button>

                    {newlyCreatedTicket && (
                      <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/40 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-red-400">Generated Ticket:</span>
                          <Badge className="font-mono text-xs border-red-400 bg-red-900/40 text-red-200">
                            {newlyCreatedTicket.code}
                          </Badge>
                        </div>
                        <p className="text-xs text-white/70">
                          Customer: <span className="font-medium text-white">{newlyCreatedTicket.customerName}</span>
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            className="flex-1 text-xs gap-1.5 py-1 px-2 h-8"
                            onClick={() => {
                              const spinUrl = `${window.location.origin}/spin?code=${newlyCreatedTicket.code}`;
                              navigator.clipboard.writeText(spinUrl);
                              toast.success("Spin link copied to clipboard!");
                            }}
                          >
                            <Copy className="h-3.5 w-3.5" /> Copy Link
                          </Button>
                          <Button
                            variant="outline"
                            className="text-xs gap-1.5 py-1 px-2 h-8"
                            onClick={() => {
                              window.open(`/spin?code=${newlyCreatedTicket.code}`, "_blank");
                            }}
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Open
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Probability & Chances Settings */}
                <Card className="space-y-4 p-5 border-white/10 bg-slate-900/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-400 font-semibold text-base">
                      <SlidersHorizontal className="h-5 w-5" />
                      Wheel Probability Odds
                    </div>
                    <Button
                      disabled={savingOdds}
                      onClick={async () => {
                        setSavingOdds(true);
                        try {
                          await saveSettings(settings);
                          toast.success("Probability weights saved!");
                        } catch {
                          toast.error("Failed to save wheel odds.");
                        } finally {
                          setSavingOdds(false);
                        }
                      }}
                      className="text-xs bg-red-600 hover:bg-red-500 text-white h-8 px-3 py-1"
                    >
                      {savingOdds ? "Saving..." : "Save Odds"}
                    </Button>
                  </div>
                  <p className="text-xs text-white/60">
                    Adjust the relative weight chances for the Stage 1 Category Spin and Stage 2 Brand Spin. Higher weight means higher probability.
                  </p>

                  <div className="space-y-4">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                      <p className="text-xs font-semibold text-red-400">Stage 1: Category Odds</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-white/70 block mb-1">Non-Transparent Weight</label>
                          <Input
                            type="number"
                            min={1}
                            value={settings.nonTransparentWeight ?? 50}
                            onChange={(e) =>
                              setSettings((s) => ({
                                ...s,
                                nonTransparentWeight: Math.max(1, Number(e.target.value) || 1),
                              }))
                            }
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-white/70 block mb-1">Transparent Weight</label>
                          <Input
                            type="number"
                            min={1}
                            value={settings.transparentWeight ?? 50}
                            onChange={(e) =>
                              setSettings((s) => ({
                                ...s,
                                transparentWeight: Math.max(1, Number(e.target.value) || 1),
                              }))
                            }
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div className="text-[11px] text-white/50 pt-1">
                        Chance ratio:{" "}
                        <span className="text-white font-semibold">
                          {(
                            ((settings.nonTransparentWeight ?? 50) /
                              ((settings.nonTransparentWeight ?? 50) + (settings.transparentWeight ?? 50))) *
                            100
                          ).toFixed(1)}
                          %
                        </span>{" "}
                        Non-Transparent vs{" "}
                        <span className="text-red-400 font-semibold">
                          {(
                            ((settings.transparentWeight ?? 50) /
                              ((settings.nonTransparentWeight ?? 50) + (settings.transparentWeight ?? 50))) *
                            100
                          ).toFixed(1)}
                          %
                        </span>{" "}
                        Transparent
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-red-400">Stage 2: Brand Odds (Relative Weights)</p>
                        <span className="text-[10px] text-red-200/70 font-mono">Live Win Chance</span>
                      </div>
                      <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                        {(() => {
                          const eligibleBrands = brands.filter(
                            (brand) =>
                              (brand.status ?? "available") === "available" &&
                              !/\b(battery|batteries|device|devices|mod|mods|kit|kits)\b/i.test(brand.name)
                          );
                          const totalBrandWeight = eligibleBrands.reduce(
                            (sum, b) => sum + (settings.brandWeights?.[b.id] ?? 100),
                            0
                          );

                          return eligibleBrands.map((brand) => {
                            const currentWeight = settings.brandWeights?.[brand.id] ?? 100;
                            const percent = totalBrandWeight > 0 ? ((currentWeight / totalBrandWeight) * 100).toFixed(1) : "0.0";
                            return (
                              <div key={brand.id} className="flex items-center justify-between gap-3 text-xs p-1.5 rounded-lg bg-black/20 border border-white/5">
                                <div className="truncate max-w-[150px]">
                                  <span className="text-white font-medium block truncate">{brand.name}</span>
                                  <span className="text-[10px] text-red-400 font-mono font-semibold">{percent}% win chance</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-white/50">Weight:</span>
                                  <Input
                                    type="number"
                                    min={1}
                                    value={currentWeight}
                                    onChange={(e) => {
                                      const val = Math.max(1, Number(e.target.value) || 1);
                                      setSettings((prev) => ({
                                        ...prev,
                                        brandWeights: {
                                          ...(prev.brandWeights || {}),
                                          [brand.id]: val,
                                        },
                                      }));
                                    }}
                                    className="h-7 w-16 text-xs text-center font-mono"
                                  />
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Tickets Audit & Live Log Table */}
              <Card className="p-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Issued Reward Spin Tickets</h3>
                    <p className="text-xs text-white/60">Complete audit log of all generated roulette vouchers and claimed pod flavors.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase text-white/50">
                        <th className="py-2.5 px-3">Ticket Code</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Prize Claimed</th>
                        <th className="py-2.5 px-3">Issued Date</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {spinTickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-3 font-mono font-medium text-red-400">
                            {ticket.code}
                          </td>
                          <td className="py-3 px-3 text-white font-medium">
                            {ticket.customerName}
                          </td>
                          <td className="py-3 px-3">
                            <Badge
                              className={
                                ticket.status === "claimed"
                                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                                  : ticket.status === "expired"
                                  ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                                  : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                              }
                            >
                              {ticket.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-xs text-white/80">
                            {ticket.status === "claimed" ? (
                              <div>
                                <span className="font-semibold text-white">{ticket.brandWonName}</span>
                                <span className="text-red-400"> · {ticket.flavorWonName}</span>
                                <p className="text-[10px] text-white/40">{ticket.categoryWon}</p>
                              </div>
                            ) : (
                              <span className="text-white/40 italic">Not yet spun</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-xs text-white/60">
                            {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {ticket.status === "pending" && (
                                <Button
                                  variant="ghost"
                                  className="h-8 px-2 py-1 text-xs gap-1 text-red-400 hover:text-white"
                                  onClick={() => {
                                    const spinUrl = `${window.location.origin}/spin?code=${ticket.code}`;
                                    navigator.clipboard.writeText(spinUrl);
                                    toast.success(`Copied link for ${ticket.code}`);
                                  }}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                  Copy Link
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                className="h-8 px-2 py-1 text-xs gap-1 text-white/60 hover:text-white"
                                onClick={() => {
                                  window.open(`/spin?code=${ticket.code}`, "_blank");
                                }}
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {!spinTickets.length && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-sm text-white/50">
                            No spin tickets issued yet. Select an eligible customer above to generate one!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ANALYTICS SECTION */}
          {/* ========================================================================= */}
          {active === "Analytics" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 xl:grid-cols-2">
              <Card className="p-4">
                <h3 className="mb-3 font-semibold">Daily Sales</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.byDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#cbd5e1" />
                      <YAxis stroke="#cbd5e1" />
                      <Tooltip />
                      <Bar dataKey="value">
                        {chartData.byDay.map((entry, index) => (
                          <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="p-4">
                <h3 className="mb-3 font-semibold">Top Selling Brands</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData.byBrand} dataKey="value" nameKey="name">
                        {chartData.byBrand.map((entry, index) => (
                          <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="p-4">
                <h3 className="mb-3 font-semibold">Top Selling Flavors</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.byFlavor}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#cbd5e1" />
                      <YAxis stroke="#cbd5e1" />
                      <Tooltip />
                      <Bar dataKey="value">
                        {chartData.byFlavor.map((entry, index) => (
                          <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="p-4">
                <h3 className="mb-3 font-semibold">Most Loyal Customers</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.loyalty} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" stroke="#cbd5e1" />
                      <YAxis type="category" dataKey="name" stroke="#cbd5e1" width={120} />
                      <Tooltip />
                      <Bar dataKey="value">
                        {chartData.loyalty.map((entry, index) => (
                          <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* REPORTS SECTION */}
          {/* ========================================================================= */}
          {active === "Reports" && (
            <Card className="space-y-3 p-5">
              <h3 className="text-lg font-bold">Export Reports</h3>
              <p className="text-sm text-white/80">Generate daily, weekly, and monthly reports in Excel format.</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => {
                    const now = Date.now();
                    const rows = [["Type", "Sales", "Revenue", "Redeemed"]];
                    const daily = sales.filter((s) => now - s.createdAt <= 24 * 60 * 60 * 1000);
                    rows.push([
                      "Daily",
                      `${daily.length}`,
                      `${daily.reduce((sum, s) => sum + s.amount, 0)}`,
                      `${claims.filter((c) => now - c.createdAt <= 24 * 60 * 60 * 1000).length}`,
                    ]);
                    exportWorkbook("daily-report", rows);
                  }}
                >
                  Daily Report
                </Button>
                <Button
                  onClick={() => {
                    const now = Date.now();
                    const rows = [["Type", "Sales", "Revenue", "Redeemed"]];
                    const weekly = sales.filter((s) => now - s.createdAt <= 7 * 24 * 60 * 60 * 1000);
                    rows.push([
                      "Weekly",
                      `${weekly.length}`,
                      `${weekly.reduce((sum, s) => sum + s.amount, 0)}`,
                      `${claims.filter((c) => now - c.createdAt <= 7 * 24 * 60 * 60 * 1000).length}`,
                    ]);
                    exportWorkbook("weekly-report", rows);
                  }}
                >
                  Weekly Report
                </Button>
                <Button
                  onClick={() => {
                    const now = Date.now();
                    const rows = [["Type", "Sales", "Revenue", "Redeemed"]];
                    const monthly = sales.filter((s) => now - s.createdAt <= 30 * 24 * 60 * 60 * 1000);
                    rows.push([
                      "Monthly",
                      `${monthly.length}`,
                      `${monthly.reduce((sum, s) => sum + s.amount, 0)}`,
                      `${claims.filter((c) => now - c.createdAt <= 30 * 24 * 60 * 60 * 1000).length}`,
                    ]);
                    exportWorkbook("monthly-report", rows);
                  }}
                >
                  Monthly Report
                </Button>
              </div>
            </Card>
          )}

          {/* ========================================================================= */}
          {/* SETTINGS SECTION */}
          {/* ========================================================================= */}
          {active === "Settings" && (
            <Card className="space-y-3 p-5">
              <h3 className="text-lg font-bold">Store Settings</h3>
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="pod-price">
                  Pod price
                </label>
                <Input
                  id="pod-price"
                  type="number"
                  min={1}
                  placeholder="Price charged for one pod"
                  value={settings.podPrice}
                  onChange={(e) => setSettings((s) => ({ ...s, podPrice: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="low-stock-default">
                  Default low-stock alert
                </label>
                <Input
                  id="low-stock-default"
                  type="number"
                  min={1}
                  placeholder="Alert when stock reaches this amount"
                  value={settings.lowStockDefault}
                  onChange={(e) => setSettings((s) => ({ ...s, lowStockDefault: Number(e.target.value) }))}
                />
              </div>
              <Button
                onClick={async () => {
                  await saveSettings(settings);
                  toast.success("Settings saved");
                }}
              >
                Save Settings
              </Button>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
