"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "emerald" | "orange" | "purple";
  badge?: string;
  delay?: number;
}

const colorStyles = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-100 dark:border-blue-800/50",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50",
  orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border-orange-100 dark:border-orange-800/50",
  purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-100 dark:border-purple-800/50",
};

export function StatCard({ title, value, icon: Icon, color, badge, delay = 0 }: StatCardProps) {
  const isOrangeWarning = color === "orange" && badge;

  return (
    <motion.div
      className={cn(
        "flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800 relative overflow-hidden",
        isOrangeWarning && "border-orange-200 dark:border-orange-800/50 shadow-orange-100/50"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {isOrangeWarning && (
        <div className="absolute right-0 top-0 h-24 w-24 -mr-6 -mt-6 rounded-full bg-orange-100 dark:bg-orange-900/20 blur-2xl"></div>
      )}
      
      <div className="mb-4 flex items-center justify-between relative z-10">
        <h3 className="text-base font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          {title}
        </h3>
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", colorStyles[color])}>
          <Icon className="w-5 h-5" />
        </span>
      </div>
      
      <div className="flex items-end justify-between relative z-10">
        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {value}
        </span>
        {badge && (
          <span className={cn(
            "mb-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border",
            color === "orange" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800" : "bg-slate-100 text-slate-500"
          )}>
            {badge}
          </span>
        )}
      </div>
    </motion.div>
  );
}
