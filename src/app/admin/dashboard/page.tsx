"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Calendar,
  DollarSign,
  Clock,
  PieChart,
  MoreHorizontal,
  Video,
  Receipt,
  X,
  Check,
  BarChart3,
  LineChart,
  Lightbulb,
  Menu,
  Loader2,
  CalendarX,
  FileX,
  CheckCircle,
  MessageSquare,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Sidebar } from "@/components/admin/Sidebar";
import PreConsultationReportModal from "@/components/admin/PreConsultationReportModal";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { format, isPast } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  approvePayment,
  rejectPayment,
} from "@/app/admin/payments/[id]/actions";

interface Appointment {
  id: string;
  start_at: string;
  status: string;
  duration_minutes: number;
  meet_link: string | null;
  patient_id: string;
  patient: { full_name: string; email: string; avatar_url?: string } | null;
  payments:
    | {
        id: string;
        amount_expected: number;
        proof_url: string | null;
        status: string;
      }[]
    | null;
  pre_consultation_report?: {
    id: string;
    emotional_state: string;
    keywords: string[];
    urgency_level: string;
    suggested_focus: string;
    emotional_scores: any;
    chat_history: any[];
  } | null;
}

import { useAdminDashboardStore } from "@/store/adminDashboardStore";

const TIPS = [
  {
    text: "Recuerda tomar micropausas de 5 minutos entre sesiones terapéuticas. Un ejercicio de respiración consciente mejora la empatía.",
    category: "Bienestar",
  },
  {
    text: "Establece límites claros con tus pacientes para proteger tu propia salud mental y energía profesional.",
    category: "Límites",
  },
  {
    text: "La supervisión profesional es fundamental. Compartir casos complejos con colegas previene el agotamiento.",
    category: "Crecimiento",
  },
  {
    text: "Dedica un momento al final del día para desconectar emocionalmente de las historias de tus pacientes.",
    category: "Auto-cuidado",
  },
  {
    text: "Hidratarte bien y mantener una postura ergonómica previene la fatiga física durante las consultas largas.",
    category: "Salud Física",
  },
  {
    text: "Celebra los pequeños avances de tus pacientes; esto también refuerza tu sentido de propósito profesional.",
    category: "Motivación",
  },
  {
    text: "Organiza tu espacio de trabajo para que sea un refugio de calma tanto para ti como para tus consultantes.",
    category: "Ambiente",
  },
];

export default function AdminDashboard() {
  const {
    todayAppointments,
    upcomingAppointments,
    pendingPayments,
    stats,
    weeklyData,
    loading,
    fetchDashboardData,
    completeAppointment,
    markNoShow,
  } = useAdminDashboardStore();

  const [profile, setProfile] = useState<{
    full_name: string;
    email: string;
    avatar_url?: string;
  } | null>(null);

  // States for finishing session
  const [finishingAppt, setFinishingAppt] = useState<Appointment | null>(null);
  const [sessionNotes, setSessionNotes] = useState("");
  const [isFinishing, setIsFinishing] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dailyTip, setDailyTip] = useState(TIPS[0]);
  const [viewingReportAppt, setViewingReportAppt] =
    useState<Appointment | null>(null);

  useEffect(() => {
    // Pick a tip based on the current date (rotates daily)
    const dayIndex =
      Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % TIPS.length;
    setDailyTip(TIPS[dayIndex]);
  }, []);

  const loadProfile = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profileData) setProfile(profileData);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleApprovePayment = async (appointmentId: string) => {
    const res = await approvePayment(appointmentId);
    if (res.error) alert("Error: " + res.error);
    else {
      alert("¡Pago aprobado y cita confirmada!");
      fetchDashboardData();
    }
  };

  const handleRejectPayment = async (appointmentId: string) => {
    const reason = prompt("Indique el motivo del rechazo:");
    if (!reason) return;
    const res = await rejectPayment(appointmentId, reason);
    if (res.error) alert("Error: " + res.error);
    else fetchDashboardData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const maxWeekly = Math.max(...weeklyData, 1);

  const handleFinishSessionAtOnce = async () => {
    if (!finishingAppt) return;
    setIsFinishing(true);
    const res = await completeAppointment(
      finishingAppt.id,
      finishingAppt.patient_id,
      sessionNotes,
    );
    setIsFinishing(false);

    if (res.error) {
      alert("Error: " + res.error);
    } else {
      setFinishingAppt(null);
      setSessionNotes("");
    }
  };

  const handleMarkNoShow = async (appointmentId: string, patientId: string) => {
    if (!confirm("¿Seguro que desea marcar esta cita como 'No asistida'?"))
      return;
    const res = await markNoShow(appointmentId, patientId);
    if (res.error) alert("Error: " + res.error);
    else alert("Cita marcada como 'No asistida'.");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-sm text-slate-500">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8 dark:border-slate-800 dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="text-slate-500 md:hidden hover:text-slate-700 dark:text-slate-400"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Dashboard General
            </h2>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative hidden w-64 md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar paciente..."
                className="h-12 w-full rounded-2xl border-none bg-slate-100 pl-11 text-lg font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-600/20 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 shadow-inner"
              />
            </div>
            <div className="hidden items-center rounded-xl bg-primary-50 px-4 py-1.5 text-xs font-black tracking-widest uppercase text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 sm:flex border border-primary-100 dark:border-primary-800/50 shadow-sm">
              Psicóloga
            </div>
            <div className="flex items-center gap-3">
              <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
                <Bell className="w-5 h-5" />
                {stats.pendingPayments > 0 && (
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"></span>
                )}
              </button>
              <div
                className="flex items-center justify-center h-10 w-10 overflow-hidden rounded-full border-2 border-primary-100 dark:border-slate-700 bg-primary-100 text-primary-700 font-bold bg-cover bg-center shadow-sm"
                style={{
                  backgroundImage: profile?.avatar_url
                    ? `url("${profile.avatar_url}")`
                    : "none",
                }}
              ></div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-8">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Metric Card 1 - Citas del Mes */}
              <motion.div
                className="flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Citas del Mes
                  </h3>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
                    <Calendar className="w-5 h-5" />
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {stats.monthlyAppointments}
                  </span>
                </div>
              </motion.div>

              {/* Metric Card 2 - Ingresos Esperados */}
              <motion.div
                className="flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Ingresos Esperados
                  </h3>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
                    <DollarSign className="w-5 h-5" />
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {formatCurrency(stats.expectedRevenue)}
                  </span>
                </div>
              </motion.div>

              {/* Metric Card 3 - Pagos Pendientes */}
              <motion.div
                className={`flex flex-col rounded-2xl bg-white p-6 shadow-sm border ${stats.pendingPayments > 0 ? "border-orange-200 dark:border-orange-800/50 shadow-orange-100/50" : "border-slate-100 dark:border-slate-800"} dark:bg-slate-900 relative overflow-hidden`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {stats.pendingPayments > 0 && (
                  <div className="absolute right-0 top-0 h-24 w-24 -mr-6 -mt-6 rounded-full bg-orange-100 dark:bg-orange-900/20 blur-2xl"></div>
                )}
                <div className="mb-4 flex items-center justify-between relative z-10">
                  <h3 className="text-base font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Pagos Pendientes
                  </h3>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-100 dark:border-orange-800/50">
                    <Clock className="w-5 h-5" />
                  </span>
                </div>
                <div className="flex items-end justify-between relative z-10">
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {stats.pendingPayments}
                  </span>
                  {stats.pendingPayments > 0 && (
                    <span className="mb-1 rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 uppercase tracking-wide border border-orange-200 dark:border-orange-800">
                      Requiere Acción
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Metric Card 4 - Tasa de Ocupación */}
              <motion.div
                className="flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Tasa de Ocupación
                  </h3>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50">
                    <PieChart className="w-5 h-5" />
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {stats.occupationRate}%
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Left Column (2/3 width) */}
              <div className="flex flex-col gap-8 lg:col-span-2">
                {/* Today's Schedule */}
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

                  {todayAppointments.length === 0 ? (
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

                      {todayAppointments.map((appt, index) => {
                        const apptTime = new Date(appt.start_at);
                        const isNow = !isPast(apptTime);
                        const isFirst = index === 0;
                        const patientName =
                          appt.patient?.full_name || "Paciente";

                        return (
                          <div
                            key={appt.id}
                            className={`relative z-10 flex gap-6 ${index < todayAppointments.length - 1 ? "pb-8" : ""} group`}
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
                                <p className="text-base font-bold text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{appt.duration_minutes} min</span>
                                  <span className="text-slate-200 dark:text-slate-700">
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
                                    {appt.status === "CONFIRMED"
                                      ? "Confirmada"
                                      : appt.status === "DONE"
                                        ? "Finalizada"
                                        : appt.status === "NO_SHOW"
                                          ? "No asistida"
                                          : appt.status === "PENDING_APPROVAL"
                                            ? "Pendiente Aprobación"
                                            : appt.status === "PENDING_PAYMENT"
                                              ? "Pendiente Pago"
                                              : appt.status}
                                  </span>
                                </p>
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
                                    onClick={() => setFinishingAppt(appt)}
                                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-500/20 bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all active:scale-95"
                                  >
                                    <CheckCircle className="w-4 h-4" />{" "}
                                    Finalizar
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleMarkNoShow(appt.id, appt.patient_id)
                                    }
                                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
                                  >
                                    <CalendarX className="w-4 h-4" /> No asistió
                                  </button>
                                  {appt.pre_consultation_report && (
                                    <button
                                      onClick={() => setViewingReportAppt(appt)}
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

                {/* Upcoming Appointments */}
                {upcomingAppointments.length > 0 && (
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
                      {upcomingAppointments.slice(0, 3).map((appt) => {
                        const apptTime = new Date(appt.start_at);
                        const patientName =
                          appt.patient?.full_name || "Paciente";

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
                                {appt.status === "CONFIRMED"
                                  ? "Confirmada"
                                  : appt.status === "PENDING_PAYMENT"
                                    ? "Pend. Pago"
                                    : appt.status === "PENDING_APPROVAL"
                                      ? "Pend. Aprobar"
                                      : appt.status}
                              </span>
                              <a
                                href={appt.meet_link || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-4 rounded-2xl bg-primary-600 px-10 py-5 text-xl font-black text-white shadow-2xl shadow-primary-500/40 transition-all hover:bg-primary-700 hover:-translate-y-1 hover:shadow-primary-500/50 active:scale-95 group focus:ring-4 focus:ring-primary-500/20 w-full mt-4"
                              >
                                <Video className="w-7 h-7 group-hover:scale-110 transition-transform" />
                                <span>Unirme a Meet</span>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                      {upcomingAppointments.length > 3 && (
                        <p className="text-center text-xs font-bold text-slate-400 mt-2">
                          + {upcomingAppointments.length - 3} citas adicionales
                          programadas
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Pending Payments */}
                <motion.div
                  className="rounded-3xl bg-white p-6 md:p-8 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Aprobaciones Pendientes
                      </h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        Comprobantes subidos por pacientes
                      </p>
                    </div>
                    <Link
                      href="/admin/payments"
                      className="text-sm font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 border border-primary-100 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors dark:border-primary-900/30 dark:hover:bg-primary-900/20"
                    >
                      Ver Todos
                    </Link>
                  </div>

                  {pendingPayments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <FileX className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                      <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
                        No hay pagos pendientes de aprobación
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {pendingPayments.map((appt) => {
                        const payment = appt.payments?.[0];
                        const patientName =
                          appt.patient?.full_name || "Paciente";

                        return (
                          <div
                            key={appt.id}
                            className="flex flex-col gap-4 rounded-xl border border-orange-100 bg-orange-50/30 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-orange-900/30 dark:bg-orange-900/10"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm border border-orange-100 dark:border-orange-800/50 dark:bg-slate-800 dark:text-orange-400">
                                <Receipt className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-lg font-black text-slate-900 dark:text-white">
                                  {patientName}
                                </p>
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">
                                  {format(new Date(appt.start_at), "MMM d", {
                                    locale: es,
                                  })}{" "}
                                  •{" "}
                                  <span className="text-orange-600 dark:text-orange-400 font-black uppercase tracking-wider text-[10px] bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded">
                                    Comprobante Nequi
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 sm:justify-end">
                              <p className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter">
                                {payment
                                  ? formatCurrency(payment.amount_expected)
                                  : "—"}
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleRejectPayment(appt.id)}
                                  className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-red-900/50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                                  title="Rechazar"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleApprovePayment(appt.id)}
                                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                                  title="Aprobar"
                                >
                                  <Check className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Right Column (1/3 width) */}
              <div className="flex flex-col gap-8 lg:col-span-1">
                {/* Weekly Sessions Chart */}
                <motion.div
                  className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Citas por Semana
                    </h3>
                    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                      <button className="rounded-md bg-white p-1 shadow-sm dark:bg-slate-700 text-slate-900 dark:text-white">
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button className="rounded-md p-1 hover:bg-slate-200 text-slate-400 dark:hover:bg-slate-700">
                        <LineChart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex h-48 items-end justify-between gap-3 px-2">
                    {weeklyData.map((count, i) => {
                      const heightPercent =
                        maxWeekly > 0 ? (count / maxWeekly) * 100 : 0;
                      const isLast = i === weeklyData.length - 1;
                      return (
                        <div
                          key={i}
                          className="group flex w-full flex-col items-center gap-2"
                        >
                          <div
                            className={`relative w-full max-w-[28px] rounded-t-xl ${isLast ? "bg-primary-600 shadow-lg shadow-primary-500/30" : "bg-primary-100 dark:bg-primary-900/30"} transition-colors group-hover:${isLast ? "bg-primary-700" : "bg-primary-200 dark:group-hover:bg-primary-900/50"}`}
                            style={{ height: `${Math.max(heightPercent, 5)}%` }}
                          >
                            <div className="absolute -top-10 left-1/2 hidden -translate-x-1/2 rounded-lg bg-slate-900 px-2 py-1.5 text-xs font-bold text-white group-hover:block dark:bg-white dark:text-slate-900 shadow-lg">
                              {count}
                            </div>
                          </div>
                          <span
                            className={`text-[10px] ${isLast ? "font-black text-primary-600 dark:text-primary-400" : "font-black text-slate-300"}`}
                          >
                            SEM {i + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Tip del Día */}
                <motion.div
                  className="rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="absolute -right-6 -top-6 h-32 w-32 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl transition-transform group-hover:scale-125"></div>

                  <div className="mb-6 flex items-center gap-4 relative z-10">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
                      <Lightbulb className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                        Tip del Día
                      </h3>
                      <p className="text-xs font-black text-primary-600 dark:text-primary-400 mt-1 uppercase tracking-widest bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded">
                        {dailyTip.category}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-inner">
                    <p className="text-base font-bold leading-relaxed text-slate-700 dark:text-slate-300 italic">
                      &quot;{dailyTip.text}&quot;
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal: Finalizar Sesión & Notas */}
      <AnimatePresence>
        {finishingAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="p-8">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Finalizar Sesión
                    </h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                      Paciente:{" "}
                      <span className="text-primary-600 dark:text-primary-400 font-bold">
                        {finishingAppt.patient?.full_name}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!isFinishing) setFinishingAppt(null);
                    }}
                    className="rounded-full bg-slate-100 dark:bg-slate-800 p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl bg-primary-50 dark:bg-primary-900/10 p-4 border border-primary-100 dark:border-primary-900/30 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-primary-800 dark:text-primary-300 leading-relaxed">
                      Al finalizar la sesión, la cita pasará al historial.
                      Puedes aprovechar para guardar tus apuntes profesionales
                      ahora mismo.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <MessageSquare className="w-4 h-4" /> Notas de la sesión
                    </label>
                    <textarea
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      placeholder="Escribe aquí los puntos clave tratados en la sesión..."
                      rows={6}
                      className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-5 text-base font-bold focus:border-primary-500 focus:ring-0 dark:text-white transition-all resize-none shadow-inner"
                      disabled={isFinishing}
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={() => setFinishingAppt(null)}
                    className="flex-1 rounded-2xl border-2 border-slate-200 dark:border-slate-800 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    disabled={isFinishing}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleFinishSessionAtOnce}
                    className="flex-[2] rounded-2xl bg-emerald-500 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    disabled={isFinishing}
                  >
                    {isFinishing ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-6 h-6" /> Finalizar y Guardar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {/* AI Report Modal */}
        {viewingReportAppt && viewingReportAppt.pre_consultation_report && (
          <PreConsultationReportModal
            report={viewingReportAppt.pre_consultation_report as any}
            patientName={viewingReportAppt.patient?.full_name || "Paciente"}
            onClose={() => setViewingReportAppt(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
