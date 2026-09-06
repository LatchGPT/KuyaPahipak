"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Gift, Loader2, Sparkles, Ticket } from "lucide-react";
import { getSettings, getSpinTicket, subscribeBrands, subscribeFlavors } from "@/lib/firestore";
import type { Brand, Flavor, Settings, SpinTicket } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { SpinWheelGame } from "@/components/spin-wheel";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

function SpinPageContent() {
  const searchParams = useSearchParams();
  const urlCode = searchParams.get("code") || "";

  const [inputCode, setInputCode] = useState(urlCode);
  const [activeCode, setActiveCode] = useState(urlCode);
  const [ticket, setTicket] = useState<SpinTicket | null>(null);
  const [loadingTicket, setLoadingTicket] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [settings, setSettings] = useState<Settings>({ id: "default", lowStockDefault: 10, podPrice: 350 });

  // Subscribe to live catalog & settings
  useEffect(() => {
    const unsubBrands = subscribeBrands(setBrands);
    const unsubFlavors = subscribeFlavors(setFlavors);
    getSettings().then(setSettings).catch(() => undefined);

    return () => {
      unsubBrands();
      unsubFlavors();
    };
  }, []);

  // Fetch ticket when activeCode changes
  useEffect(() => {
    if (!activeCode.trim()) {
      setTicket(null);
      setTicketError(null);
      return;
    }

    let isMounted = true;
    setLoadingTicket(true);
    setTicketError(null);

    getSpinTicket(activeCode)
      .then((data) => {
        if (!isMounted) return;
        if (!data) {
          setTicket(null);
          setTicketError("Invalid or expired spin ticket code. Please check your link or contact the shop.");
        } else {
          setTicket(data);
          setTicketError(null);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setTicket(null);
        setTicketError(err instanceof Error ? err.message : "Could not verify spin ticket.");
      })
      .finally(() => {
        if (isMounted) setLoadingTicket(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeCode]);

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      return toast.error("Please enter your spin code.");
    }
    setActiveCode(inputCode.trim().toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-red-950/40 text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 px-4 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <a href="/" className="hover:opacity-80 transition">
            <Logo />
          </a>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href="/">
              <Button variant="outline" className="text-xs border-neutral-700 hover:bg-neutral-800 text-white">
                Back to Shop
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-4xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center">
        {loadingTicket ? (
          <div className="flex flex-col items-center justify-center gap-3 p-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            <p className="text-sm text-neutral-400">Verifying your spin ticket...</p>
          </div>
        ) : ticket ? (
          /* Render Active Spin Wheel */
          <div className="w-full">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/20 px-3.5 py-1 text-xs font-semibold text-red-200 mb-2 shadow-[0_0_15px_rgba(220,38,38,0.25)]">
                <Sparkles className="h-3.5 w-3.5 text-red-400" />
                Customer Reward Claim
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Welcome, {ticket.customerName}!
              </h1>
              <p className="text-sm text-neutral-300 mt-1 max-w-md mx-auto">
                You completed 10 pod purchases and earned this reward spin. Let&apos;s see what you win!
              </p>
            </div>

            <SpinWheelGame
              ticket={ticket}
              brands={brands}
              flavors={flavors}
              settings={settings}
              onClaimComplete={() => {
                // Re-fetch ticket to update status
                getSpinTicket(ticket.code).then((t) => t && setTicket(t));
              }}
            />
          </div>
        ) : (
          /* Enter Code Form */
          <Card className="w-full max-w-md border-red-500/30 bg-neutral-900/90 p-6 sm:p-8 backdrop-blur shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600/30 to-black border border-red-500/30 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <Gift className="h-8 w-8 text-red-500" />
            </div>

            <h2 className="text-2xl font-black text-white">Kuya Pahipak Reward Spin</h2>
            <p className="text-xs text-neutral-300 mt-2 mb-6">
              Completed 10 pod purchases? Enter the 6-character code given by Kuya Pahipak to spin the roulette wheel!
            </p>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="relative">
                <Ticket className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-neutral-400" />
                <Input
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="e.g. KPH-7X9B"
                  className="pl-9 text-center font-mono font-bold tracking-widest uppercase h-11 border-neutral-700 bg-black/60 focus-visible:ring-red-500 focus-visible:border-red-500 text-white"
                />
              </div>

              {ticketError && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
                  {ticketError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full py-5 text-sm font-black uppercase tracking-wider bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)] border border-red-500/30 text-white"
              >
                Access My Spin Wheel →
              </Button>
            </form>

            <p className="text-xs text-neutral-400 mt-6">
              Haven&apos;t received a code yet? Message Kuya Pahipak on Facebook or visit us in-store to check your loyalty points.
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}

export default function SpinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white grid place-items-center">
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Loader2 className="h-5 w-5 animate-spin text-red-500" /> Loading Kuya Pahipak Reward Portal...
          </div>
        </div>
      }
    >
      <SpinPageContent />
    </Suspense>
  );
}
