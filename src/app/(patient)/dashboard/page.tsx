"use client";

import { AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useCallback } from "react";
import PreConsultationChat from "@/components/PreConsultationChat";
import { createClient } from "@/utils/supabase/client";
import { getPatientAppointments } from "@/app/(patient)/paciente/mis-citas/actions";

// Components
import { WelcomeBanner } from "@/components/patient/dashboard/WelcomeBanner";
import { ActiveAppointmentCard } from "@/components/patient/dashboard/ActiveAppointmentCard";
import { AppointmentTimeline } from "@/components/patient/dashboard/AppointmentTimeline";
import { QuickActions } from "@/components/patient/dashboard/QuickActions";
import { AppointmentList } from "@/components/patient/dashboard/AppointmentList";
import { PatientDashboardSkeleton } from "@/components/patient/dashboard/DashboardSkeleton";

interface PatientAppointment {
  id: string;
  status: string;
  start_at: string;
  duration_minutes: number;
  meet_link?: string;
  availability_slots?: any;
}

export default function PatientDashboard() {
  const [profile, setProfile] = useState<{
    full_name: string;
    email: string;
  } | null>(null);
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);
  const [hasReport, setHasReport] = useState(false);

  const loadData = useCallback(async () => {
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
    if (appts) setAppointments(appts as PatientAppointment[]);
    setLoading(false);
  }, []);

  useEffect(() => {
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
  }, [loadData]);

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

        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        return appointmentDate >= twoHoursAgo;
      })
      .sort(
        (a, b) =>
          new Date(a.start_at).getTime() - new Date(b.start_at).getTime(),
      )[0];
  }, [appointments]);

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
        const isStatusPlanned = [
          "PENDING_PAYMENT",
          "PENDING_APPROVAL",
          "CONFIRMED",
        ].includes(a.status);
        if (!isStatusPlanned) return true;

        const appointmentDate = new Date(a.start_at);
        const now = new Date();

        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        return appointmentDate < twoHoursAgo;
      })
      .sort(
        (a, b) =>
          new Date(b.start_at).getTime() - new Date(a.start_at).getTime(),
      )
      .slice(0, 3);
  }, [appointments]);

  if (loading) {
    return <PatientDashboardSkeleton />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
      <WelcomeBanner 
        fullName={profile?.full_name || null} 
        hasActiveAppointment={!!activeAppointment} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <ActiveAppointmentCard 
            appointment={activeAppointment || null}
            hasReport={hasReport}
            onPrepareSession={() => setShowAIChat(true)}
            hasHistory={historyAppointments.length > 0}
          />

          {activeAppointment && (
            <AppointmentTimeline status={activeAppointment.status} />
          )}
        </div>

        <div className="space-y-6 md:space-y-8">
          <QuickActions activeAppointmentId={activeAppointment?.id} />
          
          <AppointmentList 
            activeAppointment={activeAppointment || null}
            historyAppointments={historyAppointments}
          />
        </div>
      </div>

      <AnimatePresence>
        {showAIChat && activeAppointment && profile && (
          <PreConsultationChat
            appointmentId={activeAppointment.id}
            patientName={profile.full_name}
            onClose={() => {
              setShowAIChat(false);
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
