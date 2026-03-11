"use client";

import { motion } from "framer-motion";
import { 
  Video, 
  Calendar as CalendarIcon, 
  PlusCircle, 
  Clock, 
  UploadCloud, 
  Sparkles, 
  Check 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format, isPast } from "date-fns";
import { es } from "date-fns/locale";

interface Appointment {
  id: string;
  status: string;
  start_at: string;
  duration_minutes: number;
  meet_link?: string;
  availability_slots?: {
    session_type: string;
  } | {
    session_type: string;
  }[];
}

interface ActiveAppointmentCardProps {
  appointment: Appointment | null;
  hasReport: boolean;
  onPrepareSession: () => void;
  hasHistory: boolean;
}

export function ActiveAppointmentCard({ 
  appointment, 
  hasReport, 
  onPrepareSession,
  hasHistory 
}: ActiveAppointmentCardProps) {
  if (!appointment) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="group relative overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-900/50 p-8 shadow-sm transition-all border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center h-64"
      >
        <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 mb-4 shadow-sm border border-slate-100 dark:border-slate-700">
          <CalendarIcon className="w-8 h-8" />
        </div>
        <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
          {hasHistory
            ? "No tienes sesiones pendientes"
            : "Aún no tienes sesiones activas"}
        </p>
        <p className="text-slate-500 font-bold mb-8 text-base mt-2">
          {hasHistory
            ? "¡Te esperamos pronto! Agenda tu próxima consulta."
            : "Agenda una nueva consulta desde el sistema."}
        </p>
        <Link
          href="/book"
          className="bg-primary-600 hover:bg-primary-700 text-white font-black py-5 px-10 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-3 text-lg"
        >
          <PlusCircle className="w-7 h-7" />
          {hasHistory ? "Agendar Nueva Sesión" : "Agendar Primera Sesión"}
        </Link>
      </motion.div>
    );
  }

  const isExpired = isPast(new Date(appointment.start_at));
  
  let sessionType = "Psicoterapia";
  if (appointment.availability_slots) {
    if (Array.isArray(appointment.availability_slots) && appointment.availability_slots[0]) {
      sessionType = appointment.availability_slots[0].session_type;
    } else if (!Array.isArray(appointment.availability_slots)) {
      sessionType = appointment.availability_slots.session_type;
    }
  }
  sessionType = sessionType.replace(/_/g, " ");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="group relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md border border-slate-100 dark:border-slate-800"
    >
      <div className="flex flex-col md:flex-row h-full">
        <div className="relative h-48 w-full md:h-auto md:w-2/5 shrink-0 overflow-hidden">
          <Image
            src="/profesional.png"
            alt="Psicóloga Johana Villabón"
            fill
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent md:hidden"></div>
        </div>

        <div className="flex flex-col justify-between p-6 md:p-8 flex-1">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span
                className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-bold border ${isExpired ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50" : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50"}`}
              >
                <span className="mr-2 relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isExpired ? "bg-amber-400" : "bg-emerald-400"}`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${isExpired ? "bg-amber-500" : "bg-emerald-500"}`}
                  ></span>
                </span>
                {isExpired
                  ? "Fecha Expirada (Contactar Profesional)"
                  : "Próxima Sesión"}
              </span>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {appointment.duration_minutes} min
              </span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-3 capitalize">
              {sessionType}
            </h3>
            <p className="text-lg font-black text-primary-600 dark:text-primary-400 capitalize">
              {format(
                new Date(appointment.start_at),
                "MMMM d, yyyy • h:mm a",
                { locale: es },
              )}
            </p>
            <div className="mt-5 flex items-center gap-4">
              <p className="font-black text-slate-900 dark:text-white text-lg hidden md:block">
                Psicóloga Johana Villabón
              </p>
              {!hasReport && appointment.status === "CONFIRMED" && (
                <button
                  onClick={onPrepareSession}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-black uppercase tracking-wider border border-primary-100 dark:border-primary-800/50 hover:bg-primary-100 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Preparar mi sesión
                </button>
              )}
              {hasReport && (
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider border border-emerald-100 dark:border-emerald-800/50">
                  <Check className="w-3.5 h-3.5" />
                  Sesión preparada
                </span>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full">
            {appointment.status === "CONFIRMED" ? (
              appointment.meet_link ? (
                <a
                  href={appointment.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-3 w-full flex items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-8 py-5 font-black text-white hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                  <Video className="w-7 h-7" />
                  <span className="text-xl">Unirme a Google Meet</span>
                </a>
              ) : (
                <div className="flex flex-col w-full gap-3">
                  <Link
                    href="/paciente/mis-citas"
                    className="flex-3 w-full flex items-center justify-center gap-3 rounded-2xl bg-primary-600 px-8 py-5 font-black text-white hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20 active:scale-95"
                  >
                    <Clock className="w-7 h-7" />
                    <span className="text-lg">
                      Ver Detalles de Cita
                    </span>
                  </Link>
                  <p className="text-sm font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl text-center border border-amber-100 dark:border-amber-800/30">
                    El enlace de Meet se está generando o será enviado
                    pronto.
                  </p>
                </div>
              )
            ) : (
              <Link
                href={
                  appointment.status === "PENDING_PAYMENT"
                    ? `/paciente/pagar/${appointment.id}`
                    : `/paciente/mis-citas`
                }
                className="flex-3 w-full flex items-center justify-center gap-3 rounded-2xl bg-primary-600 px-8 py-5 font-black text-white hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20 active:scale-95"
              >
                {appointment.status === "PENDING_PAYMENT" ? (
                  <>
                    <UploadCloud className="w-7 h-7" />
                    <span className="text-lg">Subir Comprobante</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-7 h-7" />
                    <span className="text-lg">
                      Ver Detalles de Cita
                    </span>
                  </>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
