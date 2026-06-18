"use client";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  colorClass: string;
}

export function StatCard({ icon: Icon, label, value, colorClass }: StatCardProps) {
  return (
    <motion.div
      className="stat-card"
      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
    >
      <div className={`stat-icon ${colorClass}`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </motion.div>
  );
}
