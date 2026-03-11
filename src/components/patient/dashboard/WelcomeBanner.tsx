"use client";

import { motion } from "framer-motion";

interface WelcomeBannerProps {
  fullName: string | null;
  hasActiveAppointment: boolean;
}

export function WelcomeBanner({ fullName, hasActiveAppointment }: WelcomeBannerProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const firstName = fullName ? fullName.split(" ")[0] : "Paciente";

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800"
    >
      <div className="relative z-10 w-full md:w-2/3">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-2">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-slate-600 dark:text-slate-300 font-bold text-base mt-3 leading-relaxed">
          Tu camino hacia el bienestar mental continúa aquí.{" "}
          {hasActiveAppointment
            ? "Tienes una sesión programada."
            : "No tienes citas activas, anímate a agendar una."}
        </p>
      </div>
      {/* Abstract decorative background */}
      <div className="absolute right-0 top-0 h-full w-1/2 opacity-10 pointer-events-none hidden md:block">
        <div className="absolute inset-0 bg-linear-to-l from-primary-500 to-transparent"></div>
      </div>
    </motion.section>
  );
}
