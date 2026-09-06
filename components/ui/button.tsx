import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "danger";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-950/50 border border-red-500/30",
        variant === "outline" && "border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-red-500/40",
        variant === "ghost" && "bg-transparent text-white hover:bg-white/10",
        variant === "danger" && "bg-red-700 text-white hover:bg-red-800 border border-red-600/40",
        className,
      )}
      {...props}
    />
  );
}
