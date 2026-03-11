"use client";

import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/admin/Sidebar";
import PreConsultationReportModal from "@/components/admin/PreConsultationReportModal";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  approvePayment,
  rejectPayment,
} from "@/app/admin/payments/[id]/actions";

import { useAdminDashboardStore, Appointment } from "@/store/adminDashboardStore";

// Components
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { StatsGrid } from "@/components/admin/dashboard/StatsGrid";
import { AppointmentsToday } from "@/components/admin/dashboard/AppointmentsToday";
import { UpcomingSessions } from "@/components/admin/dashboard/UpcomingSessions";
import { PendingApprovals } from "@/components/admin/dashboard/PendingApprovals";
import { WeeklyChart } from "@/components/admin/dashboard/WeeklyChart";
import { DailyTip } from "@/components/admin/dashboard/DailyTip";
import { FinishSessionModal } from "@/components/admin/dashboard/FinishSessionModal";

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

  const [, setSidebarOpen] = useState(false);
  const [viewingReportAppt, setViewingReportAppt] =
    useState<Appointment | null>(null);

  const [dailyTip, setDailyTip] = useState(TIPS[0]);

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
    fetchDashboardData();
    
    // Set daily tip on mount (stable for the session)
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % TIPS.length;
    setDailyTip(TIPS[dayIndex]);
  }, [loadProfile, fetchDashboardData]);

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
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        <DashboardHeader 
          profile={profile} 
          pendingPaymentsCount={stats.pendingPayments} 
          onOpenSidebar={() => setSidebarOpen(true)} 
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-8">
            <StatsGrid stats={stats} />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="flex flex-col gap-8 lg:col-span-2">
                <AppointmentsToday 
                  appointments={todayAppointments}
                  onFinish={(appt) => setFinishingAppt(appt)}
                  onNoShow={handleMarkNoShow}
                  onViewReport={(appt) => setViewingReportAppt(appt)}
                />

                <UpcomingSessions 
                  appointments={upcomingAppointments} 
                />

                <PendingApprovals 
                  appointments={pendingPayments}
                  onApprove={handleApprovePayment}
                  onReject={handleRejectPayment}
                />
              </div>

              <div className="flex flex-col gap-8 lg:col-span-1">
                <WeeklyChart data={weeklyData} />
                <DailyTip tip={dailyTip} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {finishingAppt && (
          <FinishSessionModal 
            appointment={finishingAppt}
            sessionNotes={sessionNotes}
            setSessionNotes={setSessionNotes}
            isFinishing={isFinishing}
            onClose={() => setFinishingAppt(null)}
            onFinish={handleFinishSessionAtOnce}
          />
        )}
        
        {viewingReportAppt && viewingReportAppt.pre_consultation_report && (
          <PreConsultationReportModal
            report={viewingReportAppt.pre_consultation_report}
            patientName={viewingReportAppt.patient?.full_name || "Paciente"}
            onClose={() => setViewingReportAppt(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
