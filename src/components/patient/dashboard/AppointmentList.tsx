"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_LABELS = {
  PENDING_PAYMENT: "Pago Pendiente",
  PENDING_APPROVAL: "En Revisión",
  CONFIRMED: "Confirmada",
  DONE: "Completada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No asistida",
};

interface Appointment {
  id: string;
  status: string;
  start_at: string;
  duration_minutes: number;
}

interface AppointmentListProps {
  activeAppointment: Appointment | null;
  historyAppointments: Appointment[];
}

export function AppointmentList({ activeAppointment, historyAppointments }: AppointmentListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-slate-100 dark:border-slate-800"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Mis Citas
        </h3>
        <Link
          className="text-sm font-black uppercase tracking-wider text-primary-600 hover:text-primary-700 dark:text-primary-400"
          href="/paciente/mis-citas"
        >
          Ver Todas
        </Link>
      </div>

      <div className="space-y-3">
        {/* Current Active if any (show it as first item) */}
        {activeAppointment && (
          <Link
            href="/paciente/mis-citas"
            className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 group hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center justify-center rounded-xl bg-white w-16 h-16 shadow-sm border border-slate-100 dark:bg-slate-700 dark:border-slate-600">
                <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                  {format(new Date(activeAppointment.start_at), "MMM", { locale: es })}
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">
                  {format(new Date(activeAppointment.start_at), "d", { locale: es })}
                </span>
              </div>
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-white capitalize">
                  Próxima Sesión
                </p>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                  {format(new Date(activeAppointment.start_at), "h:mm a", { locale: es })}
                </p>
              </div>
            </div>
            <span
              className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider border ${
                activeAppointment.status === "CONFIRMED"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-orange-50 text-orange-600 border-orange-100"
              }`}
            >
              {activeAppointment.status === "CONFIRMED" ? "Confirmada" : "En proceso"}
            </span>
          </Link>
        )}

        {/* Past Items */}
        {historyAppointments && historyAppointments.length > 0
          ? historyAppointments.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between rounded-2xl p-4 border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4 opacity-70 group-hover:opacity-100 transition-opacity">
                  <div className="flex flex-col items-center justify-center rounded-xl bg-slate-100 w-16 h-16 dark:bg-slate-800">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">
                      {format(new Date(app.start_at), "MMM", { locale: es })}
                    </span>
                    <span className="text-2xl font-black text-slate-500 dark:text-slate-400 leading-none mt-1">
                      {format(new Date(app.start_at), "d", { locale: es })}
                    </span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-700 dark:text-third-300">
                      Sesión
                    </p>
                    <p className="text-sm font-bold text-slate-500 mt-0.5">
                      {format(new Date(app.start_at), "h:mm a", { locale: es })}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                    app.status === "REJECTED" || app.status === "NO_SHOW"
                      ? "bg-red-50 text-red-500 border border-red-100"
                      : app.status === "CONFIRMED"
                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                        : app.status === "DONE"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {app.status === "CONFIRMED"
                    ? "No asistida/Expirada"
                    : STATUS_LABELS[app.status as keyof typeof STATUS_LABELS] || app.status}
                </span>
              </div>
            ))
          : !activeAppointment && (
              <p className="text-center text-sm text-slate-500 p-4">
                No hay historial de citas.
              </p>
            )}
      </div>
    </motion.div>
  );
}
