"use server";

import { createClient } from "@/utils/supabase/server";

interface Payment {
  id: string;
  amount_expected: number;
  proof_url: string;
  status: string;
}

interface AppointmentWithPayments {
  id: string;
  start_at: string;
  status: string;
  duration_minutes: number;
  meet_link: string | null;
  availability_slots: { session_type: string } | null;
  payments: Payment[];
}

export async function getPatientAppointments() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // We fetch appointments and related payments
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id, 
      start_at, 
      status, 
      duration_minutes,
      meet_link,
      pre_consultation_reports(id),
      availability_slots(session_type),
      payments (
        id, 
        amount_expected, 
        proof_url, 
        status
      )
    `)
    .eq("patient_id", user.id)
    .order("start_at", { ascending: false });

  if (error) {
    console.error("Error fetching appointments:", error);
    return null;
  }

  // Normalize data and ensure we return the report info clearly
  const normalizedData = (data as any[]).map((app) => ({
    ...app,
    status: app.status?.toUpperCase(),
    session_type: app.availability_slots?.session_type || "Consulta",
    has_report: app.pre_consultation_reports && app.pre_consultation_reports.length > 0,
    payments: app.payments?.map((p: any) => ({
      ...p,
      status: p.status?.toUpperCase(),
    })),
  }));

  return normalizedData;
}
