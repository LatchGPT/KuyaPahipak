import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-white/10", className)}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  );
}
