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
  Sparkles,
} from "lucide-react";
import { getPatientAppointments } from "./actions";
import { createClient } from "@/utils/supabase/client";
import PreConsultationChat from "@/components/PreConsultationChat";
import { AnimatePresence } from "framer-motion";

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
  hasReport,
  onPrepare,
}: {
  meetLink: string | null;
  hasReport: boolean;
  onPrepare: () => void;
}) {
  if (!meetLink) return null;

  if (!hasReport) {
    return (
      <div className="flex flex-col items-center gap-6 w-full mt-4">
        {/* Advanced Warning Card */}
        <div className="relative w-full overflow-hidden bg-linear-to-b from-amber-50/80 to-white dark:from-amber-950/20 dark:to-slate-900 border-2 border-dashed border-amber-200 dark:border-amber-800/40 p-8 sm:p-10 rounded-[2.5rem] text-center shadow-xl shadow-amber-500/5">
          {/* Subtle Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/10 blur-3xl -z-10" />
          
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/40 rounded-2xl mb-5 shadow-sm">
            <AlertCircle className="w-9 h-9 text-amber-600 animate-pulse" />
          </div>
          
          <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Preparación Requerida</h4>
          <p className="text-base font-bold text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">
            Tu psicóloga necesita el reporte previo para brindarte la mejor atención. El acceso a la sesión se habilitará al completar este paso.
          </p>
          
          <button
            onClick={onPrepare}
            className="group relative inline-flex items-center justify-center gap-4 px-12 py-5 bg-linear-to-br from-primary-600 via-primary-600 to-primary-700 text-white font-black rounded-2xl shadow-2xl shadow-primary-600/30 transition-all hover:scale-[1.03] active:scale-[0.97] overflow-hidden"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
            
            <div className="p-1.5 bg-white/20 rounded-lg group-hover:rotate-12 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-lg tracking-tight">Completar Preparación Ahora</span>
          </button>
        </div>
        
        {/* Disabled Meeting Button */}
        <div className="relative w-full group/disabled">
          <button
            disabled
            className="flex items-center justify-center gap-4 w-full sm:w-auto mx-auto px-12 py-5 bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 font-black rounded-3xl cursor-not-allowed border-2 border-slate-200 dark:border-slate-700 text-xl grayscale opacity-70 transition-all"
          >
            <Video className="w-8 h-8 opacity-40" />
            Unirme a la sesión ahora
          </button>
          <div className="mt-4 text-center">
            <span className="text-xs uppercase tracking-[0.2em] font-black text-amber-600 animate-pulse">
              Candado de Seguridad Activo
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <a
      href={meetLink}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden flex items-center justify-center gap-5 w-full sm:w-auto px-16 py-6 bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white font-black rounded-3xl shadow-2xl shadow-emerald-500/30 transition-all hover:scale-[1.03] active:scale-[0.97] text-2xl tracking-tighter border border-emerald-400/20"
    >
      {/* Background Watermark */}
      <Video className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10 -rotate-12 pointer-events-none transition-transform duration-700 group-hover:scale-125 group-hover:-rotate-6" />
      
      {/* Shine Effect */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
      
      <div className="relative flex items-center gap-4">
        <Video className="w-8 h-8 animate-bounce-subtle drop-shadow-md" />
        <span>Unirme a la sesión ahora</span>
      </div>
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
  pre_consultation_reports: { id: string }[];
  has_report: boolean;
  session_type: string;
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
  const [profile, setProfile] = useState<{ full_name: string } | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Active means it's coming up OR it's a confirmed session that just happened
  const activeAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        const isStatusActive = ["PENDING_PAYMENT", "PENDING_APPROVAL", "CONFIRMED"].includes(a.status);
        if (!isStatusActive) return false;
        
        const appointmentDate = new Date(a.start_at);
        const now = new Date();
        const twoHoursAgo = new Date(now.getTime() - 1000 * 60 * 60 * 2);
        
        // Show if date is in the future OR if it started less than 2 hours ago
        // This prevents appointments from disappearing during the session time
        return appointmentDate >= twoHoursAgo;
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
        const twoHoursAgo = new Date(now.getTime() - 1000 * 60 * 60 * 2);

        // If it's one of the "active" statuses but it's older than 2 hours, move to history
        return appointmentDate < twoHoursAgo;
      })
      .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());
  }, [appointments]);

  useEffect(() => {
    async function load() {
      // 1. Get user profile
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: prof } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (prof) setProfile(prof);

      // 2. Fetch appointments and reports in parallel for maximum speed and accuracy
      const [appts, reportsData] = await Promise.all([
        getPatientAppointments(),
        supabase.from("pre_consultation_reports").select("appointment_id").eq("patient_id", user.id)
      ]);

      if (appts) {
        const reportMap = new Set(reportsData.data?.map(r => r.appointment_id) || []);
        
        const finalAppts = (appts as any[]).map((app) => {
          // Normalize status and payments
          const normalizedApp = {
            ...app,
            status: app.status?.toUpperCase(),
            session_type: app.availability_slots?.session_type || "Consulta",
            payments: app.payments?.map((p: any) => ({
              ...p,
              status: p.status?.toUpperCase(),
            })),
          };

          // Check if report exists via direct join OR via the explicit reports fetch
          const hasReportJoin = Array.isArray(normalizedApp.pre_consultation_reports) 
            ? normalizedApp.pre_consultation_reports.length > 0 
            : !!normalizedApp.pre_consultation_reports;

          return {
            ...normalizedApp,
            has_report: hasReportJoin || reportMap.has(normalizedApp.id)
          };
        });

        setAppointments(finalAppts);
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
                      <JoinSessionButton 
                        meetLink={app.meet_link} 
                        hasReport={app.has_report}
                        onPrepare={() => {
                          setSelectedAppId(app.id);
                          setShowAIChat(true);
                        }}
                      />
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
              className="inline-flex items-center gap-3 px-10 py-5 bg-primary-600 text-white text-base font-black rounded-2xl shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-95 border-b-4 border-primary-800"
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
      
      <AnimatePresence>
        {showAIChat && selectedAppId && profile && (
          <PreConsultationChat
            appointmentId={selectedAppId}
            patientName={profile.full_name}
            onClose={async () => {
              setShowAIChat(false);
              // Reload appointments to update report status
              const data = await getPatientAppointments();
              if (data) setAppointments(data);
            }}
          />
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        :global(.animate-bounce-subtle) {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
