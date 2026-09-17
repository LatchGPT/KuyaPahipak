"use client";

import Image from "next/image";
import { Bebas_Neue } from "next/font/google";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400", display: "swap" });

interface PreloaderProps {
  isVisible?: boolean;
  statusText?: string;
}

export function Preloader({ isVisible = true, statusText = "Loading authentic pods & flavors..." }: PreloaderProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02, filter: "blur(6px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden select-none"
      style={{
        background: "radial-gradient(circle at 50% 45%, rgba(185, 28, 28, 0.28) 0%, rgba(20, 3, 3, 0.92) 55%, #000000 100%)",
      }}
    >
      {/* Ambient background blur lights */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-red-900/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm">
        {/* Animated Brand Logo Container with Pulsing Glow */}
        <motion.div
          animate={{
            scale: [1, 1.04, 1],
            boxShadow: [
              "0 0 35px rgba(220, 38, 38, 0.35)",
              "0 0 65px rgba(239, 68, 68, 0.55)",
              "0 0 35px rgba(220, 38, 38, 0.35)",
            ],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative mb-6 flex h-28 w-28 items-center justify-center rounded-2xl border border-red-500/30 bg-black/60 p-3 backdrop-blur-md"
        >
          <Image
            src="/logo.png"
            alt="Kuya Pahipak Vape Supply"
            width={112}
            height={112}
            priority
            className="h-full w-full object-contain filter drop-shadow-[0_2px_12px_rgba(239,68,68,0.4)]"
          />
        </motion.div>

        {/* Brand Title and Tagline */}
        <div className="space-y-1 mb-5">
          <h1 className={`${bebasNeue.className} text-4xl tracking-[0.08em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]`}>
            KUYA PAHIPAK
          </h1>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-950/40 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-red-300">
            <Sparkles className="h-3 w-3 text-red-400" />
            <span>Premium Vape Hub</span>
          </div>
        </div>

        {/* Progress Glow Bar */}
        <div className="relative h-1.5 w-52 overflow-hidden rounded-full bg-neutral-900 border border-neutral-800">
          <motion.div
            className="absolute inset-y-0 w-24 rounded-full bg-gradient-to-r from-transparent via-red-500 to-amber-400 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
            animate={{
              x: [-100, 240],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Animated Subtitle / Status */}
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="mt-4 text-xs font-medium text-neutral-400 tracking-wide"
        >
          {statusText}
        </motion.p>
      </div>
    </motion.div>
  );
}
