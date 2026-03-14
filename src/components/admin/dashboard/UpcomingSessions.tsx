"use client";

import { motion } from "framer-motion";
import { 
  MoreHorizontal, 
  Video 
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Appointment } from "@/store/adminDashboardStore";

const statusMap: Record<string, string> = {
  CONFIRMED: "Confirmada",
  DONE: "Finalizada",
  NO_SHOW: "No asistió",
  PENDING_APPROVAL: "Pendiente",
  PENDING_PAYMENT: "Pendiente de Pago",
};

interface UpcomingSessionsProps {
  appointments: Appointment[];
}

export function UpcomingSessions({ appointments }: UpcomingSessionsProps) {
  if (appointments.length === 0) return null;

  return (
    <motion.div
      className="rounded-3xl bg-white p-6 md:p-8 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.05 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Próximas Sesiones
          </h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Citas programadas para los próximos días
          </p>
        </div>
        <Link
          href="/admin/patients"
          className="text-xs font-bold text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 flex items-center gap-1 transition-colors"
        >
          Ver Todos <MoreHorizontal className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {appointments.slice(0, 3).map((appt) => {
          const apptTime = new Date(appt.start_at);
          const patientName = appt.patient?.full_name || "Paciente";

          return (
            <div
              key={appt.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/30 dark:border-slate-800 dark:bg-slate-800/20"
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">
                    {format(apptTime, "MMM", { locale: es })}
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white -mt-1">
                    {format(apptTime, "d")}
                  </span>
                </div>
                <div>
                  <p className="text-base font-black text-slate-900 dark:text-white leading-tight">
                    {patientName}
                  </p>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    {format(apptTime, "hh:mm a")} •{" "}
                    {appt.duration_minutes} min
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                    appt.status === "CONFIRMED"
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800",
                  )}
                >
                    {statusMap[appt.status] || appt.status}
                </span>
                {appt.meet_link && (
                  <a
                    href={appt.meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <Video className="w-3.5 h-3.5" /> Google Meet
                  </a>
                )}
              </div>
            </div>
          );
        })}
        {appointments.length > 3 && (
          <p className="text-center text-xs font-bold text-slate-400 mt-2">
            + {appointments.length - 3} citas adicionales programadas
          </p>
        )}
      </div>
    </motion.div>
  );
}
