"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Gift, Package, Search, ShoppingBag, Sparkles, Tag, User, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { categoryLabel, subscribeBrands, subscribeCustomers, subscribeFlavors, subscribeSettings } from "@/lib/firestore";
import { computeRewardState } from "@/lib/reward";
import { PRODUCT_STATUS_LABELS, productStatusRank, type Brand, type Customer, type Flavor, type Settings } from "@/lib/types";
import { toCurrency } from "@/lib/utils";

const sorters = {
  most: (a: Customer, b: Customer) => b.totalPurchased - a.totalPurchased,
  least: (a: Customer, b: Customer) => a.totalPurchased - b.totalPurchased,
  eligible: (a: Customer, b: Customer) => {
    const claimA = computeRewardState(a.totalPurchased, a.totalRedeemed).claimable;
    const claimB = computeRewardState(b.totalPurchased, b.totalRedeemed).claimable;
    return claimB - claimA;
  },
  alpha: (a: Customer, b: Customer) => a.name.localeCompare(b.name),
};

const FALLBACK_IMAGE = "/placeholder-brand-1.svg";

function ProductImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  return (
    // Cloudinary URLs are user-provided at runtime; a native image keeps the error fallback reliable.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || FALLBACK_IMAGE}
      alt={alt}
      className={className}
      onError={(event: React.SyntheticEvent<HTMLImageElement>) => {
        if (event.currentTarget.src.endsWith(FALLBACK_IMAGE)) return;
        event.currentTarget.src = FALLBACK_IMAGE;
      }}
    />
  );
}

export function PublicHome() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<Settings>({ id: "default", lowStockDefault: 10, podPrice: 350 });
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [flavorSearch, setFlavorSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof typeof sorters>("most");

  useEffect(() => {
    const unsubscribers = [
      subscribeBrands(setBrands),
      subscribeFlavors(setFlavors),
      subscribeCustomers(setCustomers),
      subscribeSettings(setSettings),
    ];
    return () => unsubscribers.forEach((unsub) => unsub());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedBrand(null);
        setSelectedCustomer(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const grouped = useMemo(
    () => ({
      transparent: brands.filter((brand) => brand.category === "transparent").sort((a, b) => productStatusRank(a.status) - productStatusRank(b.status) || a.name.localeCompare(b.name)),
      "non-transparent": brands.filter((brand) => brand.category === "non-transparent").sort((a, b) => productStatusRank(a.status) - productStatusRank(b.status) || a.name.localeCompare(b.name)),
    }),
    [brands],
  );

  const selectedFlavors = useMemo(() => {
    if (!selectedBrand) return [];
    return flavors
      .filter((flavor) => flavor.brandId === selectedBrand.id && flavor.name.toLowerCase().includes(flavorSearch.toLowerCase().trim()))
      .sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || a.name.localeCompare(b.name));
  }, [selectedBrand, flavors, flavorSearch]);

  const filteredCustomers = useMemo(() => {
    return customers
      .filter((customer) => customer.name.toLowerCase().includes(customerSearch.toLowerCase().trim()))
      .sort(sorters[sortBy]);
  }, [customers, customerSearch, sortBy]);

  // Group bought items for the selected customer by Brand then Flavor
  const customerBoughtGrouped = useMemo(() => {
    if (!selectedCustomer) return [];
    const items = selectedCustomer.items ?? [];
    if (!items.length) return [];

    const flavorMap = new Map(flavors.map((f) => [f.id, f]));
    const brandMap = new Map(brands.map((b) => [b.id, b]));

    const brandGroups = new Map<
      string,
      {
        brandName: string;
        brandCategory?: string;
        flavors: { flavorName: string; quantity: number }[];
        totalPods: number;
      }
    >();

    for (const item of items) {
      if (!item || item.quantity <= 0) continue;
      let brandName = item.brandName?.trim() || "";
      let flavorName = item.flavorName?.trim() || "";
      let brandCategory: string | undefined = undefined;

      const flavorObj = item.flavorId ? flavorMap.get(item.flavorId) : undefined;
      if (flavorObj) {
        const brandObj = brandMap.get(flavorObj.brandId);
        if (brandObj) {
          brandName = brandObj.name;
          brandCategory = brandObj.category;
        }
        if (!flavorName || flavorName === item.flavorId) {
          flavorName = flavorObj.name;
        }
      }

      // If brandName is still unassigned, try parsing from "Brand - Flavor" formatted string
      if (!brandName && flavorName.includes(" - ")) {
        const parts = flavorName.split(" - ");
        brandName = parts[0].trim();
        flavorName = parts.slice(1).join(" - ").trim();
      }

      if (!brandName) {
        brandName = "Vape Pods";
      }

      const existingGroup = brandGroups.get(brandName);
      if (existingGroup) {
        const existingFlavor = existingGroup.flavors.find(
          (f) => f.flavorName.toLowerCase() === flavorName.toLowerCase(),
        );
        if (existingFlavor) {
          existingFlavor.quantity += item.quantity;
        } else {
          existingGroup.flavors.push({ flavorName, quantity: item.quantity });
        }
        existingGroup.totalPods += item.quantity;
      } else {
        brandGroups.set(brandName, {
          brandName,
          brandCategory,
          flavors: [{ flavorName, quantity: item.quantity }],
          totalPods: item.quantity,
        });
      }
    }

    return Array.from(brandGroups.values()).sort(
      (a, b) => b.totalPods - a.totalPods || a.brandName.localeCompare(b.brandName),
    );
  }, [selectedCustomer, flavors, brands]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-red-950/30 text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/80 px-4 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href="/admin/login">
              <Button>Admin Login</Button>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 md:px-8">
        {/* Hero & Live Store Metrics Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-red-600/30 bg-gradient-to-r from-red-950/50 via-neutral-950/80 to-black p-6 md:p-8 backdrop-blur shadow-2xl">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-red-900/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300 shadow-[0_0_12px_rgba(220,38,38,0.2)]">
                <Sparkles className="h-3.5 w-3.5 text-red-400" />
                <span>Loyalty Reward Roulette Available</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Kuya Pahipak Vape Shop
              </h1>
              <p className="text-sm text-neutral-300">
                Explore our catalog of authentic transparent and non-transparent pods starting at{" "}
                <span className="font-bold text-red-400">{toCurrency(settings.podPrice)}</span> per pod. Complete 10 pod purchases to receive an exclusive roulette spin link for a free pod reward!
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              <div className="rounded-2xl border border-red-500/20 bg-black/60 p-3 text-center min-w-[80px] shadow-lg">
                <p className="text-xl sm:text-2xl font-black text-red-500">{brands.length}</p>
                <p className="text-[11px] text-neutral-400 font-medium">Brands</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-black/60 p-3 text-center min-w-[80px] shadow-lg">
                <p className="text-xl sm:text-2xl font-black text-white">
                  {flavors.filter((f) => f.stock > 0).length}
                </p>
                <p className="text-[11px] text-neutral-400 font-medium">In-Stock Flavors</p>
              </div>
              <div className="rounded-2xl border border-red-500/20 bg-black/60 p-3 text-center min-w-[80px] shadow-lg">
                <p className="text-xl sm:text-2xl font-black text-red-400">{toCurrency(settings.podPrice)}</p>
                <p className="text-[11px] text-neutral-400 font-medium">Pod Price</p>
              </div>
              <div className="rounded-2xl border border-red-500/20 bg-black/60 p-3 text-center min-w-[80px] shadow-lg">
                <p className="text-xl sm:text-2xl font-black text-red-400">10:1</p>
                <p className="text-[11px] text-neutral-400 font-medium">Reward Ratio</p>
              </div>
            </div>
          </div>
        </section>

        {/* Product Catalog Grid */}
        <section className="grid gap-6 lg:grid-cols-2">
          {(["non-transparent", "transparent"] as const).map((category) => (
            <Card key={category} className="space-y-4 border-neutral-800 bg-neutral-900/60">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{categoryLabel(category)}</h2>
                <Badge className="brand-count-badge">{grouped[category].length} Brands</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {grouped[category].map((brand) => {
                  const status = brand.status ?? "available";
                  const isAvailable = status === "available";
                  const isNotSelectable = !isAvailable;
                  const statusBadgeClass =
                    status === "available"
                      ? "bg-emerald-500/20 text-emerald-100"
                      : status === "coming-soon"
                        ? "bg-amber-500/20 text-amber-100"
                        : "bg-red-500/20 text-red-200";
                  const brandPrice = brand.price ?? settings.podPrice;

                  return (
                    <motion.button
                      key={brand.id}
                      whileHover={isNotSelectable ? {} : { y: -4 }}
                      className={`overflow-hidden rounded-xl border border-neutral-800 bg-black/60 text-left transition ${
                        isNotSelectable
                          ? "cursor-not-allowed opacity-60 grayscale-[40%]"
                          : "hover:border-red-500/60 hover:shadow-[0_0_20px_rgba(220,38,38,0.25)]"
                      }`}
                      disabled={isNotSelectable}
                      tabIndex={isNotSelectable ? -1 : 0}
                      onClick={() => {
                        if (isNotSelectable) return;
                        setFlavorSearch("");
                        setSelectedBrand(brand);
                      }}
                    >
                      <ProductImage
                        src={brand.imageUrl}
                        alt={brand.name}
                        className={`h-56 w-full bg-black/40 object-contain ${isNotSelectable ? "select-none" : ""}`}
                      />
                      <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`font-semibold ${isNotSelectable ? "text-white/60" : ""}`}>{brand.name}</p>
                          <Badge className={statusBadgeClass}>{PRODUCT_STATUS_LABELS[status]}</Badge>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                          <span className="text-neutral-400">Price per pod</span>
                          <span className="font-black text-red-400 text-sm">{toCurrency(brandPrice)}</span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          ))}
        </section>

        {/* Customer Reward Tracker */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Customer Reward Tracker</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Click on any customer to view what flavors and brands they have bought.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-white/50" />
                <Input
                  value={customerSearch}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCustomerSearch(event.target.value)}
                  placeholder="Search customer"
                  className="pl-8 border-neutral-700 bg-neutral-900/80 focus-visible:ring-red-500"
                />
              </div>
              <select
                className="h-10 rounded-xl border border-neutral-700 bg-neutral-900/80 px-3 text-sm text-white"
                value={sortBy}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setSortBy(event.target.value as keyof typeof sorters)}
              >
                <option value="most">Most Purchases</option>
                <option value="least">Least Purchases</option>
                <option value="eligible">Eligible for Free Pod</option>
                <option value="alpha">Alphabetical</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCustomers.map((customer) => {
              const reward = computeRewardState(customer.totalPurchased, customer.totalRedeemed);
              const isRewardReady = reward.claimable > 0;
              return (
                <Card
                  key={customer.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`View purchase history for ${customer.name}`}
                  onClick={() => setSelectedCustomer(customer)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedCustomer(customer);
                    }
                  }}
                  className={`group cursor-pointer space-y-4 p-5 transition-all relative overflow-hidden text-left hover:scale-[1.01] hover:border-red-500/70 hover:shadow-[0_0_25px_rgba(220,38,38,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                    isRewardReady
                      ? "border-red-500/50 bg-gradient-to-br from-red-950/30 via-neutral-900/90 to-black shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                      : "border-neutral-800 bg-neutral-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/20 text-red-400 font-black text-sm border border-red-500/30 group-hover:bg-red-600/30 transition-colors">
                        {customer.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                          {customer.name}
                        </h3>
                        <p className="text-[11px] text-white/50">{customer.totalPurchased} total pods purchased</p>
                      </div>
                    </div>
                    {isRewardReady && (
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-[11px] font-bold animate-pulse">
                        <Gift className="h-3 w-3 mr-1" /> Reward Ready
                      </Badge>
                    )}
                  </div>

                  {/* 10-Stamp Punch Card Visual */}
                  <div className="space-y-1.5 rounded-xl border border-neutral-800 bg-black/60 p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400 font-medium">Punch Card Progress:</span>
                      <span className="font-mono font-bold text-red-400">{reward.progress}/10</span>
                    </div>
                    <div className="grid grid-cols-10 gap-1 pt-1">
                      {Array.from({ length: 10 }).map((_, i) => {
                        const filled = i < reward.progress;
                        const isTenth = i === 9;
                        return (
                          <div
                            key={i}
                            title={isTenth ? "Milestone: Free Pod" : `Stamp ${i + 1}`}
                            className={`h-4 rounded flex items-center justify-center text-[9px] font-bold transition-all ${
                              filled
                                ? isTenth
                                  ? "bg-white text-black font-black shadow-[0_0_8px_#ffffff]"
                                  : "bg-red-600 text-white"
                                : isTenth
                                  ? "border border-dashed border-red-500/60 text-red-400/60 bg-red-500/5"
                                  : "bg-white/5 border border-white/10 text-white/30"
                            }`}
                          >
                            {isTenth ? "🎁" : filled ? "✓" : i + 1}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                    <span className="text-white/60">Claimable Free Pods:</span>
                    <span className={`font-mono font-bold ${isRewardReady ? "text-red-400 text-sm font-black" : "text-white/80"}`}>
                      {reward.claimable} {reward.claimable === 1 ? "Pod" : "Pods"}
                    </span>
                  </div>

                  {/* Click to view bought items prompt */}
                  <div className="flex items-center justify-between text-[11px] text-white/50 pt-1 border-t border-white/5 group-hover:text-red-300 transition-colors">
                    <span className="flex items-center gap-1.5">
                      <ShoppingBag className="h-3 w-3 text-red-400" /> Click to view bought items
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 transform transition-transform group-hover:translate-x-1 text-red-400" />
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      {/* Customer Purchase History Modal (Brand then Flavor) */}
      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            className="fixed inset-0 z-40 grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCustomer(null)}
          >
            <motion.div
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/15 bg-neutral-950 p-6 md:p-8 shadow-2xl text-white"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/20 text-red-400 font-black text-xl border border-red-500/40 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                    {selectedCustomer.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-white">{selectedCustomer.name}</h3>
                      {computeRewardState(selectedCustomer.totalPurchased, selectedCustomer.totalRedeemed).claimable > 0 ? (
                        <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-xs font-bold animate-pulse">
                          <Gift className="h-3 w-3 mr-1" /> Reward Ready
                        </Badge>
                      ) : (
                        <Badge className="bg-white/10 text-white/80 border-white/15 text-xs font-medium">
                          Active Member
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Customer Purchase Record · {selectedCustomer.totalPurchased} total pods purchased
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="h-9 w-9 p-0 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white"
                  onClick={() => setSelectedCustomer(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* 10-Stamp Punch Card Visual (Same as Home Screen) */}
              {(() => {
                const reward = computeRewardState(selectedCustomer.totalPurchased, selectedCustomer.totalRedeemed);
                const isRewardReady = reward.claimable > 0;
                return (
                  <div className="my-5 rounded-2xl border border-neutral-800 bg-black/60 p-4 space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-400 font-medium">Punch Card Progress:</span>
                        <span className="font-mono font-bold text-red-400">{reward.progress}/10</span>
                      </div>
                      <div className="grid grid-cols-10 gap-1.5 pt-1">
                        {Array.from({ length: 10 }).map((_, i) => {
                          const filled = i < reward.progress;
                          const isTenth = i === 9;
                          return (
                            <div
                              key={i}
                              title={isTenth ? "Milestone: Free Pod" : `Stamp ${i + 1}`}
                              className={`h-6 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                                filled
                                  ? isTenth
                                    ? "bg-white text-black font-black shadow-[0_0_10px_#ffffff]"
                                    : "bg-red-600 text-white"
                                  : isTenth
                                    ? "border border-dashed border-red-500/60 text-red-400/60 bg-red-500/5"
                                    : "bg-white/5 border border-white/10 text-white/30"
                              }`}
                            >
                              {isTenth ? "🎁" : filled ? "✓" : i + 1}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                      <span className="text-white/60">Claimable Free Pods:</span>
                      <span className={`font-mono font-bold ${isRewardReady ? "text-red-400 text-sm font-black" : "text-white/80"}`}>
                        {reward.claimable} {reward.claimable === 1 ? "Pod" : "Pods"}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Bought Items Section (Organized by Brand then Flavor) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" /> Purchased Pods Breakdown (Brand & Flavor)
                  </h4>
                  <span className="text-xs text-neutral-400">
                    {customerBoughtGrouped.reduce((sum, g) => sum + g.totalPods, 0)} pods categorized
                  </span>
                </div>

                {customerBoughtGrouped.length > 0 ? (
                  <div className="space-y-4">
                    {customerBoughtGrouped.map((group) => (
                      <div
                        key={group.brandName}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-black/50 p-4 shadow-md transition hover:border-red-500/30"
                      >
                        {/* Brand Banner */}
                        <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-red-600/20 px-2.5 py-1 text-xs font-bold text-red-400 border border-red-500/30">
                              Brand
                            </span>
                            <h5 className="text-base font-black text-white tracking-wide">{group.brandName}</h5>
                            {group.brandCategory && (
                              <span className="text-[11px] text-neutral-400">
                                ({group.brandCategory === "transparent" ? "Transparent" : "Non-Transparent"})
                              </span>
                            )}
                          </div>
                          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-white">
                            {group.totalPods} {group.totalPods === 1 ? "pod" : "pods"}
                          </span>
                        </div>

                        {/* Flavors under this Brand */}
                        <div className="grid gap-2 sm:grid-cols-2">
                          {group.flavors.map((flavor) => (
                            <div
                              key={flavor.flavorName}
                              className="flex items-center justify-between rounded-xl border border-white/5 bg-neutral-900/80 px-3 py-2 text-sm"
                            >
                              <span className="font-medium text-neutral-200">{flavor.flavorName}</span>
                              <span className="font-mono font-bold text-red-400 bg-red-500/15 border border-red-500/30 rounded-lg px-2 py-0.5 text-xs">
                                {flavor.quantity} {flavor.quantity === 1 ? "pc" : "pcs"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-black/40 p-8 text-center space-y-2">
                    <ShoppingBag className="mx-auto h-8 w-8 text-neutral-500" />
                    <p className="font-semibold text-white">No detailed flavor breakdown recorded</p>
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                      {selectedCustomer.totalPurchased > 0
                        ? `This customer currently has ${selectedCustomer.totalPurchased} total pods credited to their account.`
                        : "No purchases recorded for this customer yet."}
                    </p>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="mt-6 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCustomer(null)}
                  className="rounded-xl px-5 text-xs"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brand Details & Flavors Modal */}
      <AnimatePresence>
        {selectedBrand && (
          <motion.div
            className="fixed inset-0 z-30 grid place-items-center bg-black/70 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBrand(null)}
          >
            <motion.div
              className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl border border-white/10 bg-slate-950 p-5"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="flex min-h-80 items-center justify-center rounded-xl bg-black/20 p-3">
                  <ProductImage
                    src={selectedBrand.imageUrl}
                    alt={selectedBrand.name}
                    className="max-h-[32rem] w-full rounded-lg object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="mb-4 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-bold">{selectedBrand.name}</h3>
                        <Badge
                          className={
                            (selectedBrand.status ?? "available") === "available"
                              ? "bg-emerald-500/20 text-emerald-100"
                              : (selectedBrand.status ?? "available") === "coming-soon"
                                ? "bg-amber-500/20 text-amber-100"
                                : "bg-red-500/20 text-red-200"
                          }
                        >
                          {PRODUCT_STATUS_LABELS[selectedBrand.status ?? "available"]}
                        </Badge>
                      </div>
                      <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-3 py-1 text-sm font-black text-red-400">
                        {toCurrency(selectedBrand.price ?? settings.podPrice)} / pod
                      </div>
                    </div>
                    <Input
                      value={flavorSearch}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFlavorSearch(event.target.value)}
                      placeholder="Search flavor"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedFlavors.map((flavor) => {
                      const available = flavor.stock > 0;
                      return (
                        <Card
                          key={flavor.id}
                          aria-disabled={!available}
                          className={`space-y-2 p-3.5 ${available ? "" : "cursor-not-allowed opacity-55 grayscale"}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-white">{flavor.name}</p>
                            <span className="text-xs font-bold text-red-400 shrink-0">
                              {toCurrency(selectedBrand.price ?? settings.podPrice)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-white/80">
                            <span>{available ? `Stock: ${flavor.stock}` : "Out of Stock"}</span>
                            {!available && <Badge className="w-fit bg-white/10 text-white text-[10px]">Unavailable</Badge>}
                          </div>
                        </Card>
                      );
                    })}
                    {!selectedFlavors.length && <p className="text-sm text-white/70">No flavors found.</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
