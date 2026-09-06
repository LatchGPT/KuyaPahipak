import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-red-500/40 bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-200 tracking-wide",
        className,
      )}
      {...props}
    />
  );
}
