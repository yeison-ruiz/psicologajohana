"use client";

import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

interface Tip {
  text: string;
  category: string;
}

interface DailyTipProps {
  tip: Tip;
}

export function DailyTip({ tip }: DailyTipProps) {
  return (
    <motion.div
      className="rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="absolute -right-6 -top-6 h-32 w-32 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl transition-transform group-hover:scale-125"></div>

      <div className="mb-6 flex items-center gap-4 relative z-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
          <Lightbulb className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
            Tip del Día
          </h3>
          <p className="text-xs font-black text-primary-600 dark:text-primary-400 mt-1 uppercase tracking-widest bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded">
            {tip.category}
          </p>
        </div>
      </div>

      <div className="relative z-10 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-inner">
        <p className="text-base font-bold leading-relaxed text-slate-700 dark:text-slate-300 italic">
          &quot;{tip.text}&quot;
        </p>
      </div>
    </motion.div>
  );
}
