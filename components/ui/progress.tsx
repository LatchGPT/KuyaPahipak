import { motion } from "framer-motion";

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  );
}
