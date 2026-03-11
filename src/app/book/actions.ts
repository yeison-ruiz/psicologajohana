"use server";

import { createClient } from "@/utils/supabase/server";
import { addHours } from "date-fns";

export async function getAvailableSlots(psicologaId: string | null = null) {
  const supabase = await createClient();

  // Eliminé la restricción de 24 horas para que el paciente vea las de "hoy".
  // Si deseas un tiempo mínimo de anticipación, usa addHours(new Date(), 2).toISOString()
  const threshold = new Date().toISOString();

  let query = supabase
    .from("availability_slots")
    .select("id, start_at, end_at, duration_minutes, price, session_type, psicologa_id, profiles(full_name)")
    .eq("is_available", true)
    .gte("start_at", threshold)
    .order("start_at", { ascending: true });

  if (psicologaId) {
    query = query.eq("psicologa_id", psicologaId);
  }

  const { data, error } = await query;

  console.log("[getAvailableSlots] Result:", { count: data?.length, error: error?.message });

  if (error) {
    console.error("Error fetching slots:", error);
    return { error: error.message };
  }

  return { slots: data };
}

import { bookAppointmentSchema } from "@/lib/validations";

export async function createAppointment(slotId: string, psicologaId: string) {
  const parseResult = bookAppointmentSchema.safeParse({ slotId, psicologaId });
  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para agendar." };
  }

  // Use the SECURITY DEFINER RPC function to atomically:
  // 1. Check for existing active appointments
  // 2. Lock and claim the slot
  // 3. Create the appointment
  // This bypasses RLS issues where patients can't UPDATE availability_slots
  const { data, error } = await supabase.rpc("book_appointment", {
    p_slot_id: slotId,
    p_patient_id: user.id,
    p_psicologa_id: psicologaId,
  });

  if (error) {
    console.error("RPC book_appointment error:", error);
    return { error: "Error al procesar tu reserva. Inténtalo de nuevo." };
  }

  // The RPC returns a JSON object with either { error: "..." } or { success: true, appointmentId: "..." }
  if (data?.error) {
    return { error: data.error };
  }

  return { success: true, appointmentId: data.appointmentId };
}
