"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Gift,
  Heart,
  PartyPopper,
  Sparkles,
  Ticket,
  Volume2,
  VolumeX,
} from "lucide-react";
import { claimSpinTicket, updateSpinTicketProgress } from "@/lib/firestore";
import type { Brand, Flavor, PodCategory, Settings, SpinTicket } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface SpinWheelProps {
  ticket: SpinTicket;
  brands: Brand[];
  flavors: Flavor[];
  settings: Settings;
  onClaimComplete?: () => void;
}

// Red, White, Black palette for wheel segments
const SEGMENT_COLORS = [
  { bg: "#dc2626", text: "#ffffff", border: "#f87171" }, // Crimson Red
  { bg: "#18181b", text: "#ffffff", border: "#3f3f46" }, // Carbon Black
  { bg: "#b91c1c", text: "#ffffff", border: "#ef4444" }, // Deep Crimson
  { bg: "#27272a", text: "#ffffff", border: "#52525b" }, // Charcoal
  { bg: "#ef4444", text: "#ffffff", border: "#fca5a5" }, // Bright Red
  { bg: "#09090b", text: "#ffffff", border: "#27272a" }, // Pure Black
  { bg: "#991b1b", text: "#ffffff", border: "#dc2626" }, // Dark Ruby
  { bg: "#3f3f46", text: "#ffffff", border: "#71717a" }, // Zinc Dark
];

// Lightweight native audio synthesizer for ticker clicks & fanfare
class WheelAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  public playTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === "suspended") this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(650, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.035);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch {
      // Audio policy safe
    }
  }

  public playWin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === "suspended") this.ctx.resume();
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + index * 0.12);
        gain.gain.setValueAtTime(0.25, this.ctx!.currentTime + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + index * 0.12 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(this.ctx!.currentTime + index * 0.12);
        osc.stop(this.ctx!.currentTime + index * 0.12 + 0.4);
      });
    } catch {
      // Audio policy safe
    }
  }
}

const wheelAudio = new WheelAudio();

// Canvas Confetti Generator
function triggerConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const count = 130;
  const particles: Array<{
    x: number;
    y: number;
    r: number;
    d: number;
    color: string;
    tilt: number;
    tiltAngleIncrement: number;
    tiltAngle: number;
  }> = [];

  const colors = ["#dc2626", "#ffffff", "#000000", "#ef4444", "#fca5a5", "#ffffff"];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * count + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngleIncrement: Math.random() * 0.07 + 0.05,
      tiltAngle: 0,
    });
  }

  let frame = 0;
  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.tiltAngle += p.tiltAngleIncrement;
      p.y += (Math.cos(frame + p.d) + 1 + p.r / 2) * 2;
      p.x += Math.sin(frame);
      p.tilt = Math.sin(p.tiltAngle) * 15;

      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    }
    frame += 0.01;
    if (frame < 4) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
  draw();
}

export function SpinWheelGame({ ticket, brands, flavors, settings, onClaimComplete }: SpinWheelProps) {
  // Step state:
  // 1 = Category Spin, 2 = Brand Spin, 3 = Flavor Pick, 4 = Claimed Voucher
  // CRITICAL: Determine initial step from already persisted ticket fields so refreshing NEVER allows re-drawing!
  const initialStep: 1 | 2 | 3 | 4 = useMemo(() => {
    if (ticket.status === "claimed") return 4;
    if (ticket.brandWonId) return 3;
    if (ticket.categoryWon) return 2;
    return 1;
  }, [ticket]);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(initialStep);
  const [categoryWon, setCategoryWon] = useState<PodCategory | null>(ticket.categoryWon ?? null);
  const [brandWon, setBrandWon] = useState<Brand | null>(() => {
    if (ticket.brandWonId) {
      return (
        brands.find((b) => b.id === ticket.brandWonId) ??
        ({
          id: ticket.brandWonId,
          name: ticket.brandWonName || "Brand",
          category: ticket.categoryWon || "non-transparent",
        } as Brand)
      );
    }
    return null;
  });

  const [selectedFlavorId, setSelectedFlavorId] = useState<string>(ticket.flavorWonId ?? "");
  const [isSpinning, setIsSpinning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [claiming, setClaiming] = useState(false);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    wheelAudio.enabled = soundEnabled;
  }, [soundEnabled]);

  // Slices for Step 1: Category Spin (Alternating Red & Black)
  const categorySegments = useMemo(() => {
    return [
      { id: "non-transparent-1", label: "NON-TRANSPARENT", category: "non-transparent" as PodCategory, color: "#18181b", subText: "Dark Pods" },
      { id: "transparent-1", label: "TRANSPARENT", category: "transparent" as PodCategory, color: "#dc2626", subText: "Clear Pods" },
      { id: "non-transparent-2", label: "NON-TRANSPARENT", category: "non-transparent" as PodCategory, color: "#09090b", subText: "Dark Pods" },
      { id: "transparent-2", label: "TRANSPARENT", category: "transparent" as PodCategory, color: "#b91c1c", subText: "Clear Pods" },
    ];
  }, []);

  // Helper to exclude batteries and non-pod hardware
  const isBattery = (name: string) => /\b(battery|batteries|device|devices|mod|mods|kit|kits)\b/i.test(name);

  // Slices for Step 2: Available In-Stock Pod Brands for the Won Category (no batteries, no coming soon)
  const brandSegments = useMemo(() => {
    if (!categoryWon) return [];
    // Only brands with status === 'available', category matching categoryWon, not a battery, and having stock
    const validBrands = brands.filter((brand) => {
      const isAvailable = (brand.status ?? "available") === "available";
      const notBattery = !isBattery(brand.name);
      const hasStock = flavors.some((f) => f.brandId === brand.id && f.stock > 0 && !isBattery(f.name));
      return brand.category === categoryWon && isAvailable && notBattery && hasStock;
    });

    if (validBrands.length === 0) {
      // Fallback: available pod brands with stock regardless of category
      return brands.filter((b) => {
        const isAvailable = (b.status ?? "available") === "available";
        const notBattery = !isBattery(b.name);
        const hasStock = flavors.some((f) => f.brandId === b.id && f.stock > 0 && !isBattery(f.name));
        return isAvailable && notBattery && hasStock;
      });
    }
    return validBrands;
  }, [categoryWon, brands, flavors]);

  // Flavors available for the Won Brand (only in-stock pod flavors, no batteries)
  const brandAvailableFlavors = useMemo(() => {
    if (!brandWon) return [];
    return flavors.filter((f) => f.brandId === brandWon.id && f.stock > 0 && !isBattery(f.name));
  }, [brandWon, flavors]);

  // Determine category spin outcome based on admin probability weights
  const selectWeightedCategory = (): PodCategory => {
    const transWeight = Math.max(1, settings.transparentWeight ?? 50);
    const nonTransWeight = Math.max(1, settings.nonTransparentWeight ?? 50);
    const totalWeight = transWeight + nonTransWeight;
    const random = Math.random() * totalWeight;
    return random < transWeight ? "transparent" : "non-transparent";
  };

  // Determine brand spin outcome based on admin brand weights
  const selectWeightedBrand = (availableBrands: Brand[]): Brand => {
    if (availableBrands.length === 1) return availableBrands[0];
    const brandWeights = settings.brandWeights ?? {};
    const weights = availableBrands.map((b) => Math.max(1, brandWeights[b.id] ?? 100));
    const total = weights.reduce((sum, w) => sum + w, 0);
    let r = Math.random() * total;
    for (let i = 0; i < availableBrands.length; i++) {
      r -= weights[i];
      if (r <= 0) return availableBrands[i];
    }
    return availableBrands[0];
  };

  // Execute Step 1 Spin (Category Wheel)
  const spinCategoryWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const winnerCategory = selectWeightedCategory();
    // Pick matching segment index on the 4-segment wheel
    const matchingIndices = categorySegments
      .map((seg, idx) => (seg.category === winnerCategory ? idx : -1))
      .filter((idx) => idx !== -1);
    const targetSegmentIndex = matchingIndices[Math.floor(Math.random() * matchingIndices.length)];

    const segmentCount = categorySegments.length;
    const segmentDegree = 360 / segmentCount;
    // Pointer is at top (12 o'clock / 270 deg in default SVG or 0 deg if rotated).
    // SVG starts at -90deg, so segment i starts at (i * segmentDegree - 90deg).
    // When pointer is at top (0 deg/12 o'clock), to align segment center with pointer:
    // targetAngle = 360 - (targetSegmentIndex * segmentDegree + segmentDegree / 2)
    const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;
    const targetAngle = 360 - (targetSegmentIndex * segmentDegree + segmentDegree / 2);
    const currentModulo = rotationAngle % 360;
    const diff = (targetAngle - currentModulo + 360) % 360;
    const finalRotation = rotationAngle + extraSpins + diff;

    // Realistic decelerating audio ticks
    let tickTimer: NodeJS.Timeout | null = null;
    let ticks = 0;
    const maxTicks = 38;
    tickTimer = setInterval(() => {
      ticks++;
      wheelAudio.playTick();
      if (ticks > maxTicks && tickTimer) {
        clearInterval(tickTimer);
      }
    }, 90);

    setRotationAngle(finalRotation);

    setTimeout(async () => {
      if (tickTimer) clearInterval(tickTimer);
      wheelAudio.playWin();
      setIsSpinning(false);
      setCategoryWon(winnerCategory);

      // CRITICAL: Immediately persist won category to Firestore so refresh cannot reset or grant another draw!
      try {
        await updateSpinTicketProgress(ticket.id, { categoryWon: winnerCategory });
      } catch (err) {
        console.error("Failed to persist category progress:", err);
      }

      toast.success(
        `🎉 Landed on ${winnerCategory === "transparent" ? "Transparent" : "Non-Transparent"}!`
      );
    }, 4800);
  };

  // Execute Step 2 Spin (Brand Wheel)
  const spinBrandWheel = () => {
    if (isSpinning || !brandSegments.length) return;
    setIsSpinning(true);

    const winnerBrand = selectWeightedBrand(brandSegments);
    const targetIndex = brandSegments.findIndex((b) => b.id === winnerBrand.id);

    const segmentCount = brandSegments.length;
    const segmentDegree = 360 / segmentCount;
    const extraSpins = (6 + Math.floor(Math.random() * 3)) * 360;
    const targetAngle = 360 - (targetIndex * segmentDegree + segmentDegree / 2);
    const currentModulo = rotationAngle % 360;
    const diff = (targetAngle - currentModulo + 360) % 360;
    const finalRotation = rotationAngle + extraSpins + diff;

    let tickTimer: NodeJS.Timeout | null = null;
    let ticks = 0;
    tickTimer = setInterval(() => {
      ticks++;
      wheelAudio.playTick();
      if (ticks > 42 && tickTimer) {
        clearInterval(tickTimer);
      }
    }, 85);

    setRotationAngle(finalRotation);

    setTimeout(async () => {
      if (tickTimer) clearInterval(tickTimer);
      wheelAudio.playWin();
      setIsSpinning(false);
      setBrandWon(winnerBrand);

      // CRITICAL: Immediately persist won brand to Firestore so refresh cannot reset or grant another draw!
      try {
        await updateSpinTicketProgress(ticket.id, {
          brandWonId: winnerBrand.id,
          brandWonName: winnerBrand.name,
        });
      } catch (err) {
        console.error("Failed to persist brand progress:", err);
      }

      toast.success(`🎉 You won brand: ${winnerBrand.name}!`);
    }, 4900);
  };

  // Confirm and Claim the selected flavor
  const handleConfirmClaim = async () => {
    if (!categoryWon || !brandWon || !selectedFlavorId) {
      return toast.error("Please select an available flavor to claim.");
    }
    setClaiming(true);
    try {
      await claimSpinTicket({
        ticketId: ticket.id,
        categoryWon,
        brandId: brandWon.id,
        flavorId: selectedFlavorId,
      });

      setStep(4);
      wheelAudio.playWin();
      if (confettiCanvasRef.current) {
        triggerConfetti(confettiCanvasRef.current);
      }
      toast.success("Pod reward successfully claimed!");
      onClaimComplete?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not claim pod.");
    } finally {
      setClaiming(false);
    }
  };

  // Generate 24 decorative LED dots around perimeter
  const ledBulbs = useMemo(() => {
    const dots = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i * 360) / 24;
      dots.push({ id: i, angle });
    }
    return dots;
  }, []);

  return (
    <div className="relative min-h-[720px] w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Confetti canvas */}
      <canvas ref={confettiCanvasRef} className="pointer-events-none fixed inset-0 z-50 h-full w-full" />

      {/* Top Header info */}
      <div className="w-full flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-amber-400" />
          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
            Ticket: {ticket.code}
          </span>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-full transition shadow-sm"
        >
          {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-emerald-400" /> : <VolumeX className="h-3.5 w-3.5 text-rose-400" />}
          <span>{soundEnabled ? "Audio On" : "Muted"}</span>
        </button>
      </div>

      {/* 4-Step Segmented Progress Bar */}
      <div className="w-full mb-5 px-1">
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {[
            { num: 1, label: "1. Pod Category" },
            { num: 2, label: "2. Brand Draw" },
            { num: 3, label: "3. Choose Flavor" },
            { num: 4, label: "4. Voucher" },
          ].map((s) => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div
                key={s.num}
                className={`py-2 px-1 text-center rounded-xl border text-[11px] sm:text-xs font-bold transition-all duration-300 ${
                  isCurrent
                    ? "border-amber-400/80 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/40"
                    : isDone
                      ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-400"
                      : "border-slate-800 bg-slate-900/40 text-slate-500"
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  {isDone ? <Check className="h-3 w-3 text-emerald-400" /> : null}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.num}. {s.num === 1 ? "Type" : s.num === 2 ? "Brand" : s.num === 3 ? "Flavor" : "Claim"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: CATEGORY WHEEL */}
      {step === 1 && (
        <Card className="w-full border-red-500/30 bg-gradient-to-b from-neutral-950/95 via-black/95 to-neutral-950/95 p-6 backdrop-blur shadow-2xl flex flex-col items-center relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-red-600/15 blur-3xl pointer-events-none rounded-full" />

          <div className="text-center mb-5 relative z-10">
            <Badge className="mb-2 bg-red-500/20 text-red-300 border-red-500/40 px-3 py-0.5 text-xs font-semibold">
              Step 1 of 2: Category Draw
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              SPIN FOR POD TYPE
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Test your luck: Will you get <b>Transparent</b> or <b>Non-Transparent</b> pods?
            </p>
          </div>

          {/* Wheel Container with Golden Pointer & LED Bulbs */}
          <div className="relative my-4 flex items-center justify-center p-4">
            {/* Red & White Casino Pointer Needle with physics wiggle */}
            <div className="absolute -top-3 z-30 flex flex-col items-center pointer-events-none">
              <motion.div
                animate={
                  isSpinning
                    ? {
                        rotate: [-14, 8, -10, 6, -3, 0],
                        transition: { repeat: Infinity, duration: 0.14, ease: "linear" },
                      }
                    : { rotate: 0 }
                }
                style={{ transformOrigin: "top center" }}
                className="flex flex-col items-center"
              >
                {/* Pointer tip and jewel */}
                <div className="h-4 w-4 rounded-full bg-gradient-to-br from-red-400 to-red-700 border-2 border-white shadow-[0_0_12px_rgba(220,38,38,0.9)]" />
                <div className="h-0 w-0 border-x-[10px] border-x-transparent border-t-[24px] border-t-red-600 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] -mt-1" />
              </motion.div>
            </div>

            {/* LED Rim Border */}
            <div className="relative p-3 rounded-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border-4 border-red-600/30 shadow-[0_0_40px_rgba(220,38,38,0.35)]">
              {/* Perimeter LED Dots */}
              {ledBulbs.map((led) => {
                const rad = (led.angle * Math.PI) / 180;
                return (
                  <div
                    key={led.id}
                    className="absolute h-2 w-2 rounded-full -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `calc(50% + ${Math.cos(rad) * 48}%)`,
                      top: `calc(50% + ${Math.sin(rad) * 48}%)`,
                      backgroundColor: isSpinning
                        ? led.id % 2 === 0
                          ? "#dc2626"
                          : "#ffffff"
                        : "#ef4444",
                      boxShadow: isSpinning
                        ? led.id % 2 === 0
                          ? "0 0 8px #dc2626"
                          : "0 0 8px #ffffff"
                        : "0 0 4px #ef4444",
                    }}
                  />
                );
              })}

              {/* Rotating SVG Wheel */}
              <motion.div
                animate={{ rotate: rotationAngle }}
                transition={{ duration: 4.8, ease: [0.15, 0.9, 0.2, 1] }}
                className="relative h-72 w-72 sm:h-80 sm:w-80 rounded-full border-4 border-slate-950 bg-slate-950 overflow-hidden shadow-inner"
              >
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  {categorySegments.map((segment, index) => {
                    const angle = 360 / categorySegments.length;
                    const startAngle = (index * angle * Math.PI) / 180;
                    const endAngle = (((index + 1) * angle) * Math.PI) / 180;
                    const x1 = 50 + 50 * Math.cos(startAngle);
                    const y1 = 50 + 50 * Math.sin(startAngle);
                    const x2 = 50 + 50 * Math.cos(endAngle);
                    const y2 = 50 + 50 * Math.sin(endAngle);
                    const d = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                    // Mid angle for text positioning
                    const midAngle = index * angle + angle / 2;
                    const midRad = (midAngle * Math.PI) / 180;
                    const tx = 50 + 31 * Math.cos(midRad);
                    const ty = 50 + 31 * Math.sin(midRad);

                    return (
                      <g key={segment.id}>
                        <path d={d} fill={segment.color} stroke="#ffffff" strokeWidth="0.8" />
                        <text
                          x={tx}
                          y={ty}
                          fill="#ffffff"
                          fontSize="4.4"
                          fontWeight="900"
                          letterSpacing="0.05em"
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.9))" }}
                        >
                          {segment.category === "transparent" ? "TRANSPARENT" : "NON-TRANS"}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Center Hub */}
                <div className="absolute inset-0 m-auto h-16 w-16 rounded-full border-4 border-red-500 bg-black flex flex-col items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.7)]">
                  <Sparkles className="h-6 w-6 text-red-500 animate-pulse" />
                  <span className="text-[8px] font-black tracking-widest text-white uppercase">
                    ROLL
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Action Area */}
          <div className="mt-6 w-full max-w-sm text-center space-y-3 relative z-10">
            {!categoryWon ? (
              <Button
                disabled={isSpinning}
                onClick={spinCategoryWheel}
                className="w-full py-6 text-base font-black uppercase tracking-wider bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-[0_0_25px_rgba(220,38,38,0.5)] border border-red-500/30 transition-all transform active:scale-95 text-white"
              >
                {isSpinning ? "SPINNING WHEEL..." : "SPIN FOR CATEGORY 🎲"}
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="rounded-xl border-2 border-red-500/50 bg-red-950/40 p-3.5 shadow-[0_0_20px_rgba(220,38,38,0.25)]">
                  <p className="text-[11px] text-red-400 font-bold uppercase tracking-widest">
                    Category Won (Locked)
                  </p>
                  <p className="text-2xl font-black text-white capitalize mt-0.5">
                    {categoryWon === "transparent" ? "Transparent Pods" : "Non-Transparent Pods"}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setRotationAngle(0);
                    setStep(2);
                  }}
                  className="w-full py-5 text-sm font-black tracking-wider uppercase bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:opacity-95 shadow-[0_0_20px_rgba(220,38,38,0.4)] text-white"
                >
                  Proceed to Step 2: Spin Brand →
                </Button>
              </motion.div>
            )}
          </div>
        </Card>
      )}

      {/* STEP 2: BRAND WHEEL */}
      {step === 2 && (
        <Card className="w-full border-red-500/30 bg-gradient-to-b from-neutral-900/95 via-neutral-950/95 to-neutral-900/95 p-6 backdrop-blur shadow-2xl flex flex-col items-center relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-red-600/15 blur-3xl pointer-events-none rounded-full" />

          <div className="text-center mb-5 relative z-10">
            <Badge className="mb-2 bg-red-500/20 text-red-300 border-red-500/40 px-3 py-0.5 text-xs font-semibold">
              Step 2 of 2: Brand Draw
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              SPIN FOR YOUR BRAND
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1">
              Available in-stock brands for{" "}
              <b className="text-red-400 capitalize">
                {categoryWon === "transparent" ? "Transparent" : "Non-Transparent"}
              </b>
            </p>
          </div>

          {/* Wheel Container with Crimson Pointer & LED Bulbs */}
          <div className="relative my-4 flex items-center justify-center p-4">
            {/* Crimson & White Pointer Needle */}
            <div className="absolute -top-3 z-30 flex flex-col items-center pointer-events-none">
              <motion.div
                animate={
                  isSpinning
                    ? {
                        rotate: [-14, 8, -10, 6, -3, 0],
                        transition: { repeat: Infinity, duration: 0.14, ease: "linear" },
                      }
                    : { rotate: 0 }
                }
                style={{ transformOrigin: "top center" }}
                className="flex flex-col items-center"
              >
                <div className="h-4 w-4 rounded-full bg-gradient-to-br from-red-400 to-red-700 border-2 border-white shadow-[0_0_12px_rgba(220,38,38,0.9)]" />
                <div className="h-0 w-0 border-x-[10px] border-x-transparent border-t-[24px] border-t-red-600 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] -mt-1" />
              </motion.div>
            </div>

            {/* LED Rim Border */}
            <div className="relative p-3 rounded-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border-4 border-red-600/30 shadow-[0_0_40px_rgba(220,38,38,0.35)]">
              {ledBulbs.map((led) => {
                const rad = (led.angle * Math.PI) / 180;
                return (
                  <div
                    key={led.id}
                    className="absolute h-2 w-2 rounded-full -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `calc(50% + ${Math.cos(rad) * 48}%)`,
                      top: `calc(50% + ${Math.sin(rad) * 48}%)`,
                      backgroundColor: isSpinning
                        ? led.id % 2 === 0
                          ? "#dc2626"
                          : "#ffffff"
                        : "#ef4444",
                      boxShadow: isSpinning
                        ? led.id % 2 === 0
                          ? "0 0 8px #dc2626"
                          : "0 0 8px #ffffff"
                        : "0 0 4px #ef4444",
                    }}
                  />
                );
              })}

              {/* Rotating SVG Wheel */}
              <motion.div
                animate={{ rotate: rotationAngle }}
                transition={{ duration: 4.9, ease: [0.15, 0.9, 0.2, 1] }}
                className="relative h-72 w-72 sm:h-80 sm:w-80 rounded-full border-4 border-neutral-950 bg-neutral-950 overflow-hidden shadow-inner"
              >
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  {brandSegments.map((brand, index) => {
                    const segmentCount = brandSegments.length;
                    const angle = 360 / segmentCount;
                    const startAngle = (index * angle * Math.PI) / 180;
                    const endAngle = (((index + 1) * angle) * Math.PI) / 180;
                    const x1 = 50 + 50 * Math.cos(startAngle);
                    const y1 = 50 + 50 * Math.sin(startAngle);
                    const x2 = 50 + 50 * Math.cos(endAngle);
                    const y2 = 50 + 50 * Math.sin(endAngle);
                    const d = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                    const midAngle = index * angle + angle / 2;
                    const midRad = (midAngle * Math.PI) / 180;
                    const tx = 50 + 31 * Math.cos(midRad);
                    const ty = 50 + 31 * Math.sin(midRad);
                    const palette = SEGMENT_COLORS[index % SEGMENT_COLORS.length];

                    return (
                      <g key={brand.id}>
                        <path d={d} fill={palette.bg} stroke="#ffffff" strokeWidth="0.8" />
                        <text
                          x={tx}
                          y={ty}
                          fill={palette.text}
                          fontSize={segmentCount > 8 ? "3.2" : segmentCount > 5 ? "3.8" : "4.4"}
                          fontWeight="900"
                          letterSpacing="0.03em"
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.9))" }}
                        >
                          {brand.name.length > 10 ? `${brand.name.slice(0, 9)}…` : brand.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Center Hub */}
                <div className="absolute inset-0 m-auto h-16 w-16 rounded-full border-4 border-red-500 bg-black flex flex-col items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.7)]">
                  <Gift className="h-6 w-6 text-red-500 animate-pulse" />
                  <span className="text-[8px] font-black tracking-widest text-white uppercase">
                    BRAND
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Action Area */}
          <div className="mt-6 w-full max-w-sm text-center space-y-3 relative z-10">
            {!brandWon ? (
              <Button
                disabled={isSpinning || brandSegments.length === 0}
                onClick={spinBrandWheel}
                className="w-full py-6 text-base font-black uppercase tracking-wider bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-[0_0_25px_rgba(220,38,38,0.5)] border border-red-500/30 transition-all transform active:scale-95 text-white"
              >
                {isSpinning ? "SPINNING BRAND..." : "SPIN FOR BRAND 🎯"}
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="rounded-xl border-2 border-red-500/50 bg-red-950/40 p-3.5 shadow-[0_0_20px_rgba(220,38,38,0.25)]">
                  <p className="text-[11px] text-red-400 font-bold uppercase tracking-widest">
                    Brand Won (Locked)
                  </p>
                  <p className="text-2xl font-black text-white mt-0.5">{brandWon.name}</p>
                </div>
                <Button
                  onClick={() => setStep(3)}
                  className="w-full py-5 text-sm font-black tracking-wider uppercase bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:opacity-95 shadow-[0_0_20px_rgba(220,38,38,0.4)] text-white"
                >
                  Choose Your Flavor →
                </Button>
              </motion.div>
            )}
          </div>
        </Card>
      )}

      {/* STEP 3: FLAVOR SELECTION (NO RE-SPIN BUTTON - BRAND IS LOCKED) */}
      {step === 3 && brandWon && (
        <Card className="w-full border-red-500/30 bg-gradient-to-b from-neutral-900/95 via-neutral-950/95 to-neutral-900/95 p-6 backdrop-blur shadow-2xl relative overflow-hidden">
          <div className="text-center mb-6">
            <Badge className="mb-2 bg-red-500/20 text-red-300 border-red-500/40 px-3 py-0.5 text-xs font-semibold">
              Final Step: Flavor Selection
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Pick Your Free {brandWon.name} Pod
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1">
              Select one available in-stock flavor below to claim your reward voucher.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 max-h-80 overflow-y-auto pr-1">
            {brandAvailableFlavors.map((flavor) => {
              const isSelected = selectedFlavorId === flavor.id;
              return (
                <button
                  key={flavor.id}
                  onClick={() => setSelectedFlavorId(flavor.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border text-left transition transform active:scale-[0.98] ${
                    isSelected
                      ? "border-red-500 bg-red-600/20 shadow-[0_0_15px_rgba(220,38,38,0.3)] text-white ring-2 ring-red-500/50"
                      : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 text-neutral-300"
                  }`}
                >
                  <div>
                    <p className="font-bold text-sm text-white">{flavor.name}</p>
                    <p className="text-xs text-red-400 mt-0.5 font-medium">
                      {flavor.stock} in stock
                    </p>
                  </div>
                  {isSelected ? (
                    <CheckCircle2 className="h-5 w-5 text-red-500 shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-neutral-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {!brandAvailableFlavors.length && (
            <div className="text-center p-8 text-sm text-neutral-400 bg-neutral-900/50 rounded-xl border border-neutral-800">
              No flavors currently in stock for this brand. Please notify the store admin.
            </div>
          )}

          {/* Action: NO RE-SPIN BRAND BUTTON! Strictly locked claim button */}
          <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-end">
            <Button
              disabled={claiming || !selectedFlavorId}
              onClick={handleConfirmClaim}
              className="w-full sm:w-auto px-8 py-6 font-black text-sm uppercase tracking-wider bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:opacity-95 shadow-[0_0_25px_rgba(220,38,38,0.4)] transition text-white"
            >
              {claiming ? "Claiming..." : "Confirm & Claim My Pod 🎁"}
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: CLAIMED CONFIRMATION & THANK YOU */}
      {step === 4 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full"
        >
          <Card className="border-red-500/40 bg-gradient-to-b from-neutral-900/95 via-neutral-950/95 to-neutral-900/95 p-8 backdrop-blur shadow-2xl text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-red-600/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-red-900/20 blur-2xl pointer-events-none" />

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-600/20 border border-red-500/40 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <PartyPopper className="h-8 w-8 text-red-400" />
            </div>

            <Badge className="mb-2 bg-red-500/20 text-red-300 border-red-500/40 px-3 py-1 font-semibold">
              Reward Claimed!
            </Badge>
            <h2 className="text-3xl font-black text-white">Congratulations, {ticket.customerName}!</h2>
            <p className="text-sm text-neutral-300 mt-1">
              Your free pod reward has been officially claimed!
            </p>

            {/* Won Reward Summary */}
            <div className="my-5 rounded-2xl border border-red-500/30 bg-black/60 p-5 text-center space-y-2 shadow-xl">
              <p className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">Your Free Reward Pod</p>
              <p className="text-2xl sm:text-3xl font-black text-white">
                {brandWon?.name ?? ticket.brandWonName ?? "Brand"} -{" "}
                <span className="text-red-400">
                  {flavors.find((f) => f.id === selectedFlavorId)?.name ?? ticket.flavorWonName ?? "Flavor"}
                </span>
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <Badge className="bg-neutral-800 text-white border-neutral-700 text-xs capitalize">
                  {categoryWon ?? ticket.categoryWon ?? "Pod"}
                </Badge>
                <span className="text-xs text-neutral-400">
                  Customer: <b className="text-white">{ticket.customerName}</b>
                </span>
              </div>
            </div>

            {/* Thank You & Send to Latch Message Card */}
            <div className="my-5 rounded-2xl border border-red-500/40 bg-gradient-to-br from-red-950/40 via-neutral-900/80 to-black p-6 text-center space-y-3 shadow-2xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-600/20 border border-red-500/40 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                <Heart className="h-6 w-6 text-red-400 fill-red-500/30" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Thank you for supporting Kuya Pahipak! ❤️
              </h3>
              <p className="text-sm text-neutral-200 max-w-md mx-auto leading-relaxed">
                We truly appreciate your continuous support and loyalty. Please take a screenshot of this page and send this to <b className="text-white font-black underline underline-offset-4 decoration-red-500">Latch</b> to receive your free pod!
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <Link href="/">
                <Button variant="outline" className="text-xs border-neutral-700 hover:bg-neutral-800 text-white">
                  Return to Store Home
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
