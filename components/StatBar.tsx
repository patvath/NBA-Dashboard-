import { motion } from "framer-motion";

export default function StatBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span>{value.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-gray-700 rounded">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6 }}
          className="h-2 bg-[#f0c14b] rounded"
        />
      </div>
    </div>
  );
}
