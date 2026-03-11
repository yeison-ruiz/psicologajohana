"use client";

import { motion } from "framer-motion";
import { 
  BarChart3, 
  LineChart 
} from "lucide-react";

interface WeeklyChartProps {
  data: number[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const maxWeekly = Math.max(...data, 1);

  return (
    <motion.div
      className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Citas por Semana
        </h3>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
          <button className="rounded-md bg-white p-1 shadow-sm dark:bg-slate-700 text-slate-900 dark:text-white">
            <BarChart3 className="w-4 h-4" />
          </button>
          <button className="rounded-md p-1 hover:bg-slate-200 text-slate-400 dark:hover:bg-slate-700">
            <LineChart className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex h-48 items-end justify-between gap-3 px-2">
        {data.map((count, i) => {
          const heightPercent = maxWeekly > 0 ? (count / maxWeekly) * 100 : 0;
          const isLast = i === data.length - 1;
          return (
            <div
              key={i}
              className="group flex w-full flex-col items-center gap-2"
            >
              <div
                className={`relative w-full max-w-[28px] rounded-t-xl ${isLast ? "bg-primary-600 shadow-lg shadow-primary-500/30" : "bg-primary-100 dark:bg-primary-900/30"} transition-colors group-hover:${isLast ? "bg-primary-700" : "bg-primary-200 dark:group-hover:bg-primary-900/50"}`}
                style={{ height: `${Math.max(heightPercent, 5)}%` }}
              >
                <div className="absolute -top-10 left-1/2 hidden -translate-x-1/2 rounded-lg bg-slate-900 px-2 py-1.5 text-xs font-bold text-white group-hover:block dark:bg-white dark:text-slate-900 shadow-lg z-20">
                  {count}
                </div>
              </div>
              <span
                className={`text-[10px] ${isLast ? "font-black text-primary-600 dark:text-primary-400" : "font-black text-slate-300"}`}
              >
                SEM {i + 1}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
