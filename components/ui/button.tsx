import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "danger";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90",
        variant === "outline" && "border border-white/20 bg-white/5 text-white hover:bg-white/10",
        variant === "ghost" && "bg-transparent text-white hover:bg-white/10",
        variant === "danger" && "bg-rose-500 text-white hover:bg-rose-600",
        className,
      )}
      {...props}
    />
  );
}
