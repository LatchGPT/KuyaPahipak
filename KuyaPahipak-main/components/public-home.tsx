"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, Package, Search, Sparkles, User } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { categoryLabel, subscribeBrands, subscribeCustomers, subscribeFlavors } from "@/lib/firestore";
import { computeRewardState } from "@/lib/reward";
import { PRODUCT_STATUS_LABELS, productStatusRank, type Brand, type Customer, type Flavor } from "@/lib/types";

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
      onError={(event) => {
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
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [flavorSearch, setFlavorSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof typeof sorters>("most");

  useEffect(() => {
    const unsubscribers = [subscribeBrands(setBrands), subscribeFlavors(setFlavors), subscribeCustomers(setCustomers)];
    return () => unsubscribers.forEach((unsub) => unsub());
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
                Explore our catalog of authentic transparent and non-transparent pods. Complete 10 pod purchases to receive an exclusive roulette spin link for a free pod reward!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 shrink-0">
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
                <p className="text-xl sm:text-2xl font-black text-red-400">10:1</p>
                <p className="text-[11px] text-neutral-400 font-medium">Reward Ratio</p>
              </div>
            </div>
          </div>
        </section>

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
                  return (
                  <motion.button
                    key={brand.id}
                    whileHover={isNotSelectable ? {} : { y: -4 }}
                    className={`overflow-hidden rounded-xl border border-neutral-800 bg-black/60 text-left transition ${isNotSelectable ? "cursor-not-allowed opacity-60 grayscale-[40%]" : "hover:border-red-500/60 hover:shadow-[0_0_20px_rgba(220,38,38,0.25)]"}`}
                    disabled={isNotSelectable}
                    tabIndex={isNotSelectable ? -1 : 0}
                    onClick={() => {
                      if (isNotSelectable) return;
                      setFlavorSearch("");
                      setSelectedBrand(brand);
                    }}
                  >
                    <ProductImage src={brand.imageUrl} alt={brand.name} className={`h-56 w-full bg-black/40 object-contain ${isNotSelectable ? "select-none" : ""}`} />
                    <div className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-semibold ${isNotSelectable ? "text-white/60" : ""}`}>{brand.name}</p>
                        <Badge className={statusBadgeClass}>{PRODUCT_STATUS_LABELS[status]}</Badge>
                      </div>
                    </div>
                  </motion.button>
                  );
                })}
              </div>
            </Card>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold">Customer Reward Tracker</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-white/50" />
                <Input
                  value={customerSearch}
                  onChange={(event) => setCustomerSearch(event.target.value)}
                  placeholder="Search customer"
                  className="pl-8 border-neutral-700 bg-neutral-900/80 focus-visible:ring-red-500"
                />
              </div>
              <select
                className="h-10 rounded-xl border border-neutral-700 bg-neutral-900/80 px-3 text-sm text-white"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as keyof typeof sorters)}
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
                  className={`space-y-4 p-5 transition relative overflow-hidden ${
                    isRewardReady
                      ? "border-red-500/50 bg-gradient-to-br from-red-950/30 via-neutral-900/90 to-black shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                      : "border-neutral-800 bg-neutral-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/20 text-red-400 font-black text-sm border border-red-500/30">
                        {customer.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{customer.name}</h3>
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
                </Card>
              );
            })}
          </div>
        </section>
      </main>

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
                  <ProductImage src={selectedBrand.imageUrl} alt={selectedBrand.name} className="max-h-[32rem] w-full rounded-lg object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="mb-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2"><h3 className="text-2xl font-bold">{selectedBrand.name}</h3><Badge className={(selectedBrand.status ?? "available") === "available" ? "bg-emerald-500/20 text-emerald-100" : (selectedBrand.status ?? "available") === "coming-soon" ? "bg-amber-500/20 text-amber-100" : "bg-red-500/20 text-red-200"}>{PRODUCT_STATUS_LABELS[selectedBrand.status ?? "available"]}</Badge></div>
                    <Input
                      value={flavorSearch}
                      onChange={(event) => setFlavorSearch(event.target.value)}
                      placeholder="Search flavor"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedFlavors.map((flavor) => {
                      const available = flavor.stock > 0;
                      return (
                      <Card key={flavor.id} aria-disabled={!available} className={`space-y-2 ${available ? "" : "cursor-not-allowed opacity-55 grayscale"}`}>
                        <p className="font-semibold">{flavor.name}</p>
                        <p className="text-sm text-white/80">{available ? `Stock: ${flavor.stock}` : "Out of Stock"}</p>
                        {!available && <Badge className="w-fit bg-white/10 text-white">Unavailable</Badge>}
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
