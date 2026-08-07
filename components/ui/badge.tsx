import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-purple-400/40 bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-100",
        className,
      )}
      {...props}
    />
  );
}
