"use server";

import { createClient } from "@/utils/supabase/server";

export async function getPatientPayments() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // We fetch all records in payments table for the current user's appointments
  const { data, error } = await supabase
    .from("payments")
    .select(`
      id, 
      status, 
      amount_expected, 
      amount_declared, 
      approved_at,
      created_at,
      appointment_id,
      appointments (
        start_at
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching payments:", error);
    return null;
  }

  // Filter or transform if needed
  return data.map((p: any) => ({
    ...p,
    status: p.status?.toUpperCase(),
  }));
}
