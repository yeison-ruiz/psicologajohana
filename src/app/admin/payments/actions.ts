"use server";

import { createClient } from "@/utils/supabase/server";

export async function getPendingPayments() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado" };

    const { data: payments, error } = await supabase
    .from("payments")
    .select(`
      id, amount_expected, amount_declared, created_at, attempt_count, status,
      appointments!inner (
        id, start_at, status, psicologa_id,
        patient:patient_id ( full_name, avatar_url )
      )
    `)
    .or("status.ilike.%pending%")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching pending payments:", error);
    return { error: "Error al cargar los pagos: " + error.message };
  }

  return { payments };
}
