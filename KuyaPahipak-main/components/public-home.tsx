"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { categoryLabel, subscribeBrands, subscribeCustomers, subscribeFlavors } from "@/lib/firestore";
import { computeRewardState } from "@/lib/reward";
import type { Brand, Customer, Flavor } from "@/lib/types";

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
      transparent: brands.filter((brand) => brand.category === "transparent"),
      "non-transparent": brands.filter((brand) => brand.category === "non-transparent"),
    }),
    [brands],
  );

  const brandIsAvailable = (brandId: string) => flavors.some((flavor) => flavor.brandId === brandId && flavor.stock > 0);

  const selectedFlavors = useMemo(() => {
    if (!selectedBrand) return [];
    return flavors.filter(
      (flavor) =>
        flavor.brandId === selectedBrand.id &&
        flavor.name.toLowerCase().includes(flavorSearch.toLowerCase().trim()),
    );
  }, [selectedBrand, flavors, flavorSearch]);

  const filteredCustomers = useMemo(() => {
    return customers
      .filter((customer) => customer.name.toLowerCase().includes(customerSearch.toLowerCase().trim()))
      .sort(sorters[sortBy]);
  }, [customers, customerSearch, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-indigo-950 text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/60 px-4 py-4 backdrop-blur md:px-8">
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
        <section className="grid gap-6 lg:grid-cols-2">
          {(["non-transparent", "transparent"] as const).map((category) => (
            <Card key={category} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{categoryLabel(category)}</h2>
                <Badge className="brand-count-badge">{grouped[category].length} Brands</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {grouped[category].map((brand) => {
                  const available = brandIsAvailable(brand.id);
                  return (
                  <motion.button
                    key={brand.id}
                    whileHover={available ? { y: -4 } : undefined}
                    disabled={!available}
                    aria-disabled={!available}
                    className={`overflow-hidden rounded-xl border border-white/10 bg-black/40 text-left transition ${available ? "" : "cursor-not-allowed opacity-55 grayscale"}`}
                    onClick={() => {
                      if (!available) return;
                      setFlavorSearch("");
                      setSelectedBrand(brand);
                    }}
                  >
                    <ProductImage src={brand.imageUrl} alt={brand.name} className="h-56 w-full bg-black/20 object-contain" />
                    <div className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold">{brand.name}</p>
                        {!available && <Badge className="bg-white/10 text-white">Unavailable</Badge>}
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
                  className="pl-8"
                />
              </div>
              <select
                className="h-10 rounded-xl border border-white/15 bg-white/5 px-3 text-sm"
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
              return (
                <Card key={customer.id} className="space-y-3">
                  <h3 className="text-lg font-semibold">{customer.name}</h3>
                  <div className="space-y-1 text-sm text-white/80">
                    {customer.items.map((item) => (
                      <p key={item.flavorId}>
                        {item.flavorName} x{item.quantity}
                      </p>
                    ))}
                  </div>
                  <p className="text-sm">Total Purchased: {customer.totalPurchased} Pods</p>
                  <div className="space-y-1">
                    <p className="text-sm">Progress: {reward.progress}/10</p>
                    <Progress value={(reward.progress / 10) * 100} />
                  </div>
                  <p className="text-sm">Claimable Pods: {reward.claimable}</p>
                  {reward.claimable > 0 && <Badge>🎉 Free Pod Available</Badge>}
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
                    <h3 className="text-2xl font-bold">{selectedBrand.name}</h3>
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
