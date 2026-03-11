"use client";

import { motion } from "framer-motion";
import { 
  Check, 
  CheckCircle, 
  Video 
} from "lucide-react";

const STEPS = [
  {
    status: "PENDING_PAYMENT",
    label: "Creada",
    shortLabel: "Creada",
    icon: <Check className="w-5 h-5" />,
  },
  {
    status: "PENDING_PAYMENT_2",
    label: "Comprobante Subido",
    shortLabel: "Pago",
    icon: <Check className="w-5 h-5" />,
  }, // Artificial step for UI
  {
    status: "PENDING_APPROVAL",
    label: "En Revisión",
    shortLabel: "Revisada",
    icon: <Check className="w-5 h-5" />,
  },
  {
    status: "CONFIRMED",
    label: "Confirmada",
    shortLabel: "Confirmada",
    icon: <CheckCircle className="w-5 h-5" />,
  },
  {
    status: "DONE",
    label: "Sesión",
    shortLabel: "Sesión",
    icon: <Video className="w-4 h-4" />,
  },
];

interface AppointmentTimelineProps {
  status: string;
}

export function AppointmentTimeline({ status }: AppointmentTimelineProps) {
  const getStepIndex = (status: string) => {
    if (status === "PENDING_PAYMENT") return 0;
    if (status === "PENDING_APPROVAL") return 2;
    if (status === "CONFIRMED") return 3;
    if (status === "DONE") return 4;
    return -1;
  };

  const activeIndex = getStepIndex(status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-3xl bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800"
    >
      <h3 className="mb-8 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
        Estado de la Cita
      </h3>

      {/* Desktop Horizontal Timeline */}
      <div className="hidden sm:flex justify-between relative z-10 mb-2">
        {STEPS.map((step, idx) => {
          const isCompleted = activeIndex > idx;
          const isCurrent = activeIndex === idx;
          const isActiveStyle = isCompleted || isCurrent;

          return (
            <div
              key={idx}
              className="flex flex-col items-center gap-3 flex-1 relative"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full z-10 transition-colors ${
                  isActiveStyle
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-slate-100 border-2 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700"
                }`}
              >
                {step.icon}
              </div>
              <p
                className={`text-sm font-bold uppercase tracking-wider ${
                  isActiveStyle
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {step.shortLabel}
              </p>

              {idx < STEPS.length - 1 && (
                <div
                  className={`absolute top-5 left-[50%] w-full h-1 z-0 transition-colors ${
                    isCompleted
                      ? "bg-emerald-500"
                      : "bg-slate-100 dark:bg-slate-800"
                  }`}
                ></div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Fallback for very small screens or different layout if needed */}
      <div className="sm:hidden flex flex-col gap-4">
        {STEPS.map((step, idx) => {
           const isCurrent = activeIndex === idx;
           if (!isCurrent && activeIndex !== idx) {
              // Only show current and maybe next/prev or just current for simple mobile view
           }
           // Simplified for now based on original code which just had hidden sm:flex
           return null;
        })}
        <p className="text-sm font-bold text-slate-500">
          Estado actual: <span className="text-emerald-600 font-black">{STEPS[activeIndex]?.label || status}</span>
        </p>
      </div>
    </motion.div>
  );
}
