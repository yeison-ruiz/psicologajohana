"use client";

import { format, isPast } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle2,
  Video,
  FileText,
  AlertCircle,
  UploadCloud,
} from "lucide-react";
import { getPatientAppointments } from "./actions";
import { createClient } from "@/utils/supabase/client";

const STEPS = [
  {
    status: "PENDING_PAYMENT",
    label: "Cita creada",
    description: "Realiza tu pago por Nequi y sube el comprobante",
    icon: <FileText className="w-5 h-5" />,
    cta: (id: string) => ({
      label: "Subir comprobante",
      href: `/paciente/pagar/${id}`,
    }),
  },
  {
    status: "PENDING_APPROVAL",
    label: "Comprobante enviado",
    description: "La psicóloga revisará tu pago pronto",
    icon: <Clock className="w-5 h-5" />,
    cta: () => null,
  },
  {
    status: "CONFIRMED",
    label: "Cita confirmada",
    description: "Tu pago fue aprobado. ¡Todo listo!",
    icon: <CheckCircle2 className="w-5 h-5" />,
    cta: () => null, // Omit calendar action for simplicity here
  },
  {
    status: "DONE",
    label: "Sesión completada",
    description: "Sesión finalizada. ¡Gracias por tu confianza!",
    icon: <CheckCircle2 className="w-5 h-5 text-primary-600" />,
    cta: () => ({ label: "Agendar próxima cita", href: "/book" }),
  },
];

function JoinSessionButton({
  meetLink,
}: {
  meetLink: string | null;
}) {
  if (!meetLink) return null;

  // Show the button as soon as it exists for confirmed sessions
  return (
    <a
      href={meetLink}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 text-lg"
    >
      <Video className="w-6 h-6" />
      Unirme a la sesión ahora
    </a>
  );
}

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
  start_at: string;
  status: string;
  duration_minutes: number;
  meet_link: string | null;
  payments: {
    id: string;
    amount_expected: number;
    proof_url: string;
    status: string;
  }[];
}

export default function MisCitasPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Active means it's coming up OR it's a confirmed session that just happened
  const activeAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        const isStatusActive = ["PENDING_PAYMENT", "PENDING_APPROVAL", "CONFIRMED"].includes(a.status);
        if (!isStatusActive) return false;
        
        const appointmentDate = new Date(a.start_at);
        const now = new Date();
        
        if (["PENDING_PAYMENT", "PENDING_APPROVAL"].includes(a.status)) {
          return appointmentDate >= now;
        }
        
        if (a.status === "CONFIRMED") {
          const twoHoursAgo = new Date(now.getTime() - 1000 * 60 * 60 * 2);
          return appointmentDate >= twoHoursAgo;
        }
        
        return true;
      })
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  }, [appointments]);

  // History includes anything else or expired pending/confirmed ones
  const historyAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        const isHistoryStatus = !["PENDING_PAYMENT", "PENDING_APPROVAL", "CONFIRMED"].includes(a.status);
        if (isHistoryStatus) return true;
        
        const appointmentDate = new Date(a.start_at);
        const now = new Date();

        if (["PENDING_PAYMENT", "PENDING_APPROVAL", "CONFIRMED"].includes(a.status)) {
          const twoHoursAgo = new Date(now.getTime() - 1000 * 60 * 60 * 2);
          return appointmentDate < twoHoursAgo;
        }
        
        return false;
      })
      .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());
  }, [appointments]);

  useEffect(() => {
    async function load() {
      const data = await getPatientAppointments();
      if (data) {
        setAppointments(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  // Realtime subscription for first active appointment
  useEffect(() => {
    if (activeAppointments.length === 0) return;
    const activeApp = activeAppointments[0];

    const supabase = createClient();
    const channel = supabase
      .channel(`appointment-${activeApp.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "appointments",
          filter: `id=eq.${activeApp.id}`,
        },
        (payload) => {
          setAppointments((prev) =>
            prev.map((app) =>
              app.id === payload.new.id
                ? { ...app, status: payload.new.status?.toUpperCase() }
                : app,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeAppointments]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 text-lg font-black text-slate-500 hover:text-slate-800 transition-colors mb-5"
            >
              <ArrowLeft className="w-6 h-6" /> Volver al Dashboard
            </Link>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">
              Mis Citas
            </h1>
            <p className="text-slate-600 mt-2 font-black text-lg leading-relaxed">
              Gestiona tu próxima sesión y revisa tu historial
            </p>
          </div>
          <Link
            href="/book"
            className="hidden sm:inline-flex items-center gap-3 px-8 py-4 bg-primary-600 text-white text-base font-black rounded-2xl shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-95"
          >
            <Calendar className="w-6 h-6" /> Nueva Cita
          </Link>
        </div>

        {/* Active Appointments */}
        {activeAppointments.length > 0 ? (
          <div className="space-y-10 mb-10">
            {activeAppointments.map((app: Appointment) => {
              const activeIndex = STEPS.findIndex((s) => s.status === app.status);
              const isPastDate = isPast(new Date(app.start_at));

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 mb-2">
                        <span
                          className={`w-5 h-5 rounded-full ${isPastDate ? "bg-amber-500" : "bg-green-500"} animate-pulse`}
                        ></span>
                        {isPastDate
                          ? "Fecha Expirada (Contactar Profesional)"
                          : "Cita Activa"}
                      </h2>
                      <p className="text-slate-600 font-black text-xl flex items-center gap-3 mt-2 leading-relaxed">
                        <Calendar className="w-7 h-7 text-primary-600" />
                        {format(new Date(app.start_at), "EEEE, d 'de' MMMM yyyy", {
                          locale: es,
                        })}
                        {" • "}
                        {format(new Date(app.start_at), "h:mm a", {
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-slate-100 dark:bg-slate-800 sm:left-auto sm:top-5 sm:bottom-auto sm:right-10 sm:h-0.5 sm:w-[calc(100%-80px)]"></div>
                    <div className="space-y-8 sm:space-y-0 sm:flex sm:justify-between relative z-10">
                      {STEPS.map((step, idx) => {
                        const isCompleted = activeIndex > idx;
                        const isCurrent = activeIndex === idx;

                        return (
                          <div
                            key={step.status}
                            className="relative flex items-center sm:flex-col sm:items-center group"
                          >
                            <div
                              className={`w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 transition-all duration-500 shadow-sm ${
                                isCompleted
                                  ? "bg-primary-600 text-white shadow-primary-500/30"
                                  : isCurrent
                                    ? "bg-white text-primary-600 border-2 border-primary-600 shadow-xl shadow-primary-500/20 ring-4 ring-primary-50"
                                    : "bg-slate-50 text-slate-400 border border-slate-200"
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-6 h-6" />
                              ) : (
                                step.icon
                              )}
                            </div>

                            <div className="ml-4 sm:ml-0 sm:mt-4 sm:text-center flex-1">
                              <p
                                className={`text-lg font-black ${
                                  isCurrent
                                    ? "text-primary-600"
                                    : isCompleted
                                      ? "text-slate-900"
                                      : "text-slate-400"
                                }`}
                              >
                                {step.label}
                              </p>
                              <p
                                className={`text-base mt-2 max-w-[220px] leading-relaxed ${
                                  isCurrent
                                    ? "text-slate-600 font-black"
                                    : "hidden sm:block text-slate-400 font-medium"
                                }`}
                              >
                                {step.description}
                              </p>

                              {isCurrent &&
                                step.cta &&
                                step.cta(app.id) && (
                                  <Link
                                    href={step.cta(app.id)!.href}
                                    className="inline-flex mt-4 items-center gap-3 text-base font-black text-white bg-primary-600 hover:bg-primary-700 px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95"
                                  >
                                    <UploadCloud className="w-5 h-5" />
                                    {step.cta(app.id)!.label}
                                  </Link>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Join Button rendered dynamically if status CONFIRMED */}
                  {app.status === "CONFIRMED" && (
                    <div className="mt-8 pt-8 border-t border-slate-100 flex justify-center sm:justify-start">
                      <JoinSessionButton meetLink={app.meet_link} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-slate-200/50 mb-10 border border-slate-100 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              No tienes citas activas
            </h2>
            <p className="text-slate-500 font-black mt-3 mb-8 max-w-sm text-base leading-relaxed">
              Cuando agendes una sesión, podrás hacerle seguimiento y unirte a
              la videollamada desde aquí.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-3 px-10 py-5 bg-primary-600 text-white text-base font-black rounded-2xl shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-95"
            >
              Agendar Primera Cita
            </Link>
          </div>
        )}

        {/* History */}
        {historyAppointments.length > 0 && (
          <div>
            <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
              <Clock className="w-7 h-7 text-primary-600" /> Historial de
              Sesiones
            </h3>
            <div className="space-y-4">
              {historyAppointments.map((app: Appointment) => (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        app.status === "DONE"
                          ? "bg-green-50 text-green-600"
                          : app.status === "REJECTED"
                            ? "bg-red-50 text-red-600"
                            : app.status === "CONFIRMED"
                              ? "bg-primary-50 text-primary-700"
                              : "bg-slate-50 text-slate-500"
                      }`}
                    >
                      {app.status === "DONE" ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : app.status === "REJECTED" ? (
                        <AlertCircle className="w-6 h-6" />
                      ) : (
                        <Clock className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-lg leading-none">
                        {format(new Date(app.start_at), "d 'de' MMMM, yyyy", {
                          locale: es,
                        })}
                      </p>
                      <p className="text-base font-black text-slate-500 flex items-center gap-3 mt-2">
                        <Clock className="w-5 h-5 text-primary-500" />
                        {format(new Date(app.start_at), "h:mm a", {
                          locale: es,
                        })}
                        {" • "}
                        {app.duration_minutes} min
                        <span
                          className={`ml-3 px-3.5 py-1.5 text-xs font-black uppercase rounded-lg tracking-widest border ${
                             app.status === "DONE"
                               ? "bg-green-50 text-green-700 border-green-100"
                               : app.status === "REJECTED" || app.status === "NO_SHOW"
                                 ? "bg-red-50 text-red-700 border-red-100"
                                 : app.status === "CONFIRMED"
                                   ? "bg-amber-50 text-amber-700 border-amber-100"
                                   : "bg-slate-50 text-slate-700 border-slate-100"
                          }`}
                        >
                          {app.status === "CONFIRMED"
                            ? "No asistida/Expirada"
                            : (STATUS_LABELS[app.status as keyof typeof STATUS_LABELS] || app.status)}
                        </span>
                      </p>
                    </div>
                  </div>
                  {/* Optional action if rejected */}
                  {app.status === "REJECTED" && (
                    <Link
                      href="/book"
                      className="text-primary-600 hover:text-white text-base font-black bg-primary-50 hover:bg-primary-600 px-6 py-3 rounded-xl transition-all duration-300 shadow-sm"
                    >
                      Reagendar
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
