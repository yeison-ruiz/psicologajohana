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

  // Normalize status to uppercase to avoid case-sensitivity issues in comparisons
  const normalizedData = (data as any[]).map((app) => ({
    ...app,
    status: app.status?.toUpperCase(),
    payments: app.payments?.map((p: any) => ({
      ...p,
      status: p.status?.toUpperCase(),
    })),
  }));

  return normalizedData;
}
