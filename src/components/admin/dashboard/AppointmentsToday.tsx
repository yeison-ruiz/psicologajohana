"use client";

import { motion } from "framer-motion";
import { 
  CalendarX, 
  MoreHorizontal, 
  Clock, 
  Video, 
  CheckCircle, 
  Sparkles 
} from "lucide-react";
import Link from "next/link";
import { format, isPast } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Appointment } from "@/store/adminDashboardStore";

interface AppointmentsTodayProps {
  appointments: Appointment[];
  onFinish: (appt: Appointment) => void;
  onNoShow: (apptId: string, patientId: string) => void;
  onViewReport: (appt: Appointment) => void;
}

export function AppointmentsToday({ 
  appointments, 
  onFinish, 
  onNoShow, 
  onViewReport 
}: AppointmentsTodayProps) {
  return (
    <motion.div
      className="rounded-3xl bg-white p-6 md:p-8 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Agenda de Hoy
          </h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {format(new Date(), "d 'de' MMMM, yyyy", {
              locale: es,
            })}
          </p>
        </div>
        <Link
          href="/admin/availability"
          className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CalendarX className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-lg font-bold text-slate-400 dark:text-slate-500">
            No hay citas para hoy
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Disfruta tu día libre 🌿
          </p>
        </div>
      ) : (
        <div className="relative flex flex-col gap-0 pl-4">
          <div className="absolute bottom-4 left-7 top-4 w-[2px] bg-slate-100 dark:bg-slate-800 rounded-full"></div>

          {appointments.map((appt, index) => {
            const apptTime = new Date(appt.start_at);
            const isNow = !isPast(apptTime);
            const isFirst = index === 0;
            const patientName = appt.patient?.full_name || "Paciente";

            return (
              <div
                key={appt.id}
                className={`relative z-10 flex gap-6 ${index < appointments.length - 1 ? "pb-8" : ""} group`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${isFirst ? "bg-primary-100 dark:bg-primary-900/50" : "bg-slate-100 dark:bg-slate-800"} ring-[6px] ring-white dark:ring-slate-900 mt-2 transition-transform group-hover:scale-110`}
                >
                  <div
                    className={`${isFirst ? "h-2.5 w-2.5 bg-primary-600 dark:bg-primary-400" : "h-2 w-2 bg-slate-300 dark:bg-slate-600"} rounded-full`}
                  ></div>
                </div>
                <div
                  className={`flex flex-col w-full rounded-2xl border ${isFirst ? "border-primary-100 bg-primary-50/50 dark:border-primary-900/30 dark:bg-primary-900/10" : "border-slate-100 bg-white dark:border-slate-800/80 dark:bg-slate-900"} p-4 sm:flex-row sm:items-center sm:justify-between transition-colors`}
                >
                  <div className="flex flex-col mb-4 sm:mb-0">
                    <p className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                      {format(apptTime, "hh:mm a")}{" "}
                      <span className="text-slate-300 dark:text-slate-600 font-medium mx-1">
                        |
                      </span>{" "}
                      {patientName}
                    </p>
                    <div className="text-base font-bold text-slate-500 dark:text-slate-400 mt-1.5 flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{appt.duration_minutes} min</span>
                      </div>
                      <span className="text-slate-200 dark:text-slate-700 hidden sm:inline">
                        •
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md text-xs font-black uppercase tracking-wider",
                          appt.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : appt.status === "DONE"
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10 dark:text-emerald-400"
                              : appt.status === "NO_SHOW"
                                ? "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800",
                        )}
                      >
                        {appt.status}
                      </span>
                    </div>
                  </div>
                  {appt.status === "CONFIRMED" && (
                    <div className="flex flex-wrap gap-2 mt-4 sm:mt-0 sm:ml-4">
                      {appt.meet_link && (
                        <a
                          href={appt.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary-500/20 transition-all hover:bg-primary-700 hover:-translate-y-0.5"
                        >
                          <Video className="w-4 h-4" /> Unirse
                        </a>
                      )}
                      <button
                        onClick={() => onFinish(appt)}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-500/20 bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" />{" "}
                        Finalizar
                      </button>
                      <button
                        onClick={() => onNoShow(appt.id, appt.patient_id)}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
                      >
                        <CalendarX className="w-4 h-4" /> No asistió
                      </button>
                      {appt.pre_consultation_report && (
                        <button
                          onClick={() => onViewReport(appt)}
                          className="flex items-center justify-center gap-2 rounded-xl bg-primary-100 dark:bg-primary-900/30 px-4 py-2 text-xs font-black text-primary-600 dark:text-primary-400 hover:bg-primary-200 transition-all active:scale-95 animate-pulse"
                        >
                          <Sparkles className="w-4 h-4" /> Ver IA
                        </button>
                      )}
                    </div>
                  )}
                  {appt.status !== "CONFIRMED" &&
                    appt.status !== "DONE" &&
                    appt.status !== "NO_SHOW" && (
                      <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {isNow ? "Próxima" : "Pasada"}
                      </span>
                    )}
                  {appt.status === "DONE" && (
                    <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                      Finalizada ✓
                    </span>
                  )}
                  {appt.status === "NO_SHOW" && (
                    <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                      No asistida
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
