"use client";

import { motion } from "framer-motion";
import { 
  PlusCircle, 
  FileText 
} from "lucide-react";
import Link from "next/link";

interface QuickActionsProps {
  activeAppointmentId?: string;
}

export function QuickActions({ activeAppointmentId }: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800"
    >
      <h3 className="mb-6 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
        Acciones Rápidas
      </h3>
      <div className="grid grid-cols-1 gap-3">
        <Link
          href="/book"
          className="flex w-full items-center gap-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-4 text-left transition-colors hover:border-primary-500 hover:bg-slate-50 dark:hover:border-primary-500 dark:hover:bg-slate-800/50 group"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="block font-bold text-slate-900 dark:text-white text-lg">
              Agendar Nueva Cita
            </span>
            <span className="text-sm font-bold text-slate-500">
              Selecciona fecha y hora
            </span>
          </div>
        </Link>
        <Link
          href={
            activeAppointmentId
              ? `/paciente/pagar/${activeAppointmentId}`
              : "/paciente/mis-citas"
          }
          className="flex w-full items-center gap-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 p-4 text-left transition-colors hover:border-orange-500 hover:bg-orange-50 dark:hover:border-orange-500 dark:hover:bg-orange-900/10 group"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="block font-bold text-slate-900 dark:text-white text-lg">
              Subir Comprobante
            </span>
            <span className="text-sm font-bold text-slate-500">
              Recibo transferencia Nequi
            </span>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}
