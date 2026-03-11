"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Calendar as CalendarIcon,
  CheckCircle,
  FileText,
  PlusCircle,
  Check,
  Clock,
  UploadCloud,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import PreConsultationChat from "@/components/PreConsultationChat";
import { createClient } from "@/utils/supabase/client";
import { getPatientAppointments } from "@/app/(patient)/paciente/mis-citas/actions";
import { format, isPast } from "date-fns";
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

export default function PatientDashboard() {
  const [profile, setProfile] = useState<{
    full_name: string;
    email: string;
  } | null>(null);
  const [appointments, setAppointments] = useState<
    {
      id: string;
      status: string;
      start_at: string;
      duration_minutes: number;
      meet_link?: string;
      availability_slots?: any;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);
  const [hasReport, setHasReport] = useState(false);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
      const appts = await getPatientAppointments();
      if (appts) setAppointments(appts as any);
      setLoading(false);
    }

    loadData();

    // Subscribe to realtime changes
    const supabaseClient = createClient();
    const channel = supabaseClient
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
        },
        () => {
          loadData();
        },
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  const activeAppointment = useMemo(() => {
    return appointments
      .filter((a) => {
        const isStatusActive = [
          "PENDING_PAYMENT",
          "PENDING_APPROVAL",
          "CONFIRMED",
        ].includes(a.status);
        if (!isStatusActive) return false;

        const appointmentDate = new Date(a.start_at);
        const now = new Date();

        if (["PENDING_PAYMENT", "PENDING_APPROVAL"].includes(a.status)) {
          return appointmentDate >= now;
        }

        // For CONFIRMED, show it if it's in the future OR if it happened in the last 2 hours
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        return appointmentDate >= twoHoursAgo;
      })
      .sort(
        (a, b) =>
          new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
      )[0];
  }, [appointments]);

  // Check if current active appointment has a report
  useEffect(() => {
    if (activeAppointment) {
      const checkReport = async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from("pre_consultation_reports")
          .select("id")
          .eq("appointment_id", activeAppointment.id)
          .single();
        setHasReport(!!data);
      };
      checkReport();
    }
  }, [activeAppointment]);

  const historyAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        // Not in active list
        const isStatusPlanned = [
          "PENDING_PAYMENT",
          "PENDING_APPROVAL",
          "CONFIRMED",
        ].includes(a.status);
        if (!isStatusPlanned) return true;

        const appointmentDate = new Date(a.start_at);
        const now = new Date();

        // If it was supposed to happen and is still pending, move to history
        if (
          ["PENDING_PAYMENT", "PENDING_APPROVAL", "CONFIRMED"].includes(
            a.status,
          )
        ) {
          const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
          return appointmentDate < twoHoursAgo;
        }

        return false;
      })
      .sort(
        (a, b) =>
          new Date(b.start_at).getTime() - new Date(a.start_at).getTime(),
      )
      .slice(0, 3);
  }, [appointments]);

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

  const getStepIndex = (status: string) => {
    if (status === "PENDING_PAYMENT") return 0;
    if (status === "PENDING_APPROVAL") return 2;
    if (status === "CONFIRMED") return 3;
    if (status === "DONE") return 4;
    return -1;
  };
  const activeIndex = activeAppointment
    ? getStepIndex(activeAppointment.status)
    : -1;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
      {/* Welcome Banner */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800"
      >
        <div className="relative z-10 w-full md:w-2/3">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-2">
            {getGreeting()},{" "}
            {profile?.full_name
              ? profile.full_name.split(" ")[0]
              : "Cargando..."}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 font-bold text-base mt-3 leading-relaxed">
            Tu camino hacia el bienestar mental continúa aquí.{" "}
            {activeAppointment
              ? "Tienes una sesión programada."
              : "No tienes citas activas, anímate a agendar una."}
          </p>
        </div>
        {/* Abstract decorative background */}
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-10 pointer-events-none hidden md:block">
          <div className="absolute inset-0 bg-linear-to-l from-primary-500 to-transparent"></div>
        </div>
      </motion.section>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column: Hero Card & Actions */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Next Session Card */}
          {activeAppointment ? (
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
                        className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-bold border ${isPast(new Date(activeAppointment.start_at)) ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50" : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50"}`}
                      >
                        <span className="mr-2 relative flex h-2 w-2">
                          <span
                            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPast(new Date(activeAppointment.start_at)) ? "bg-amber-400" : "bg-emerald-400"}`}
                          ></span>
                          <span
                            className={`relative inline-flex rounded-full h-2 w-2 ${isPast(new Date(activeAppointment.start_at)) ? "bg-amber-500" : "bg-emerald-500"}`}
                          ></span>
                        </span>
                        {isPast(new Date(activeAppointment.start_at))
                          ? "Fecha Expirada (Contactar Profesional)"
                          : "Próxima Sesión"}
                      </span>
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {activeAppointment.duration_minutes} min
                      </span>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-3 capitalize">
                      {(Array.isArray(activeAppointment.availability_slots)
                        ? activeAppointment.availability_slots[0]?.session_type
                        : activeAppointment.availability_slots?.session_type
                      )?.replace(/_/g, " ") || "Psicoterapia"}
                    </h3>
                    <p className="text-lg font-black text-primary-600 dark:text-primary-400 capitalize">
                      {format(
                        new Date(activeAppointment.start_at),
                        "MMMM d, yyyy • h:mm a",
                        { locale: es },
                      )}
                    </p>
                    <div className="mt-5 flex items-center gap-4">
                      <p className="font-black text-slate-900 dark:text-white text-lg hidden md:block">
                        Psicóloga Johana Villabón
                      </p>
                      {!hasReport &&
                        activeAppointment.status === "CONFIRMED" && (
                          <button
                            onClick={() => setShowAIChat(true)}
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
                    {activeAppointment.status === "CONFIRMED" ? (
                      activeAppointment.meet_link ? (
                        <a
                          href={activeAppointment.meet_link}
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
                          activeAppointment.status === "PENDING_PAYMENT"
                            ? `/paciente/pagar/${activeAppointment.id}`
                            : `/paciente/mis-citas`
                        }
                        className="flex-3 w-full flex items-center justify-center gap-3 rounded-2xl bg-primary-600 px-8 py-5 font-black text-white hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20 active:scale-95"
                      >
                        {activeAppointment.status === "PENDING_PAYMENT" ? (
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
          ) : (
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
                {appointments.length > 0
                  ? "No tienes sesiones pendientes"
                  : "Aún no tienes sesiones activas"}
              </p>
              <p className="text-slate-500 font-bold mb-8 text-base mt-2">
                {appointments.length > 0
                  ? "¡Te esperamos pronto! Agenda tu próxima consulta."
                  : "Agenda una nueva consulta desde el sistema."}
              </p>
              <Link
                href="/book"
                className="bg-primary-600 hover:bg-primary-700 text-white font-black py-5 px-10 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-3 text-lg"
              >
                <PlusCircle className="w-7 h-7" />
                {appointments.length > 0
                  ? "Agendar Nueva Sesión"
                  : "Agendar Primera Sesión"}
              </Link>
            </motion.div>
          )}

          {/* Appointment Status Timeline */}
          {activeAppointment && (
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
            </motion.div>
          )}
        </div>

        {/* Right Column: Quick Actions & History */}
        <div className="space-y-6 md:space-y-8">
          {/* Quick Actions */}
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
                  activeAppointment
                    ? `/paciente/pagar/${activeAppointment.id}`
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

          {/* My Appointments List */}
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
                        {format(new Date(activeAppointment.start_at), "MMM", {
                          locale: es,
                        })}
                      </span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">
                        {format(new Date(activeAppointment.start_at), "d", {
                          locale: es,
                        })}
                      </span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900 dark:text-white capitalize">
                        {isPast(new Date(activeAppointment.start_at))
                          ? "Fecha Expirada (Contactar Profesional)"
                          : "Próxima Sesión"}
                      </p>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                        {format(
                          new Date(activeAppointment.start_at),
                          "h:mm a",
                          { locale: es },
                        )}
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
                    {activeAppointment.status === "CONFIRMED"
                      ? "Confirmada"
                      : "En proceso"}
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
                            {format(new Date(app.start_at), "MMM", {
                              locale: es,
                            })}
                          </span>
                          <span className="text-2xl font-black text-slate-500 dark:text-slate-400 leading-none mt-1">
                            {format(new Date(app.start_at), "d", {
                              locale: es,
                            })}
                          </span>
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                            Sesión
                          </p>
                          <p className="text-sm font-bold text-slate-500 mt-0.5">
                            {format(new Date(app.start_at), "h:mm a", {
                              locale: es,
                            })}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                          app.status === "REJECTED" || app.status === "NO_SHOW"
                            ? "bg-red-50 text-red-500 border border-red-100"
                            : app.status === "CONFIRMED"
                              ? "bg-amber-50 text-amber-600 border border-amber-100" // Indicating it passed without closure
                              : app.status === "DONE"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {app.status === "CONFIRMED"
                          ? "No asistida/Expirada"
                          : STATUS_LABELS[
                              app.status as keyof typeof STATUS_LABELS
                            ] || app.status}
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
        </div>
      </div>

      <AnimatePresence>
        {showAIChat && activeAppointment && profile && (
          <PreConsultationChat
            appointmentId={activeAppointment.id}
            patientName={profile.full_name}
            onClose={() => {
              setShowAIChat(false);
              // Refresh report status
              const supabase = createClient();
              supabase
                .from("pre_consultation_reports")
                .select("id")
                .eq("appointment_id", activeAppointment.id)
                .single()
                .then(({ data }) => setHasReport(!!data));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
