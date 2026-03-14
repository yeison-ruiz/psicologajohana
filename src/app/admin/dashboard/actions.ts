"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";

export async function completeAppointmentAction(
  appointmentId: string, 
  patientId: string, 
  notes?: string
) {
  // Security: Check if requester is admin
  if (!(await isAdmin())) {
    return { error: "No autorizado. Solo la psicóloga puede realizar esta acción." };
  }

  const supabase = await createClient();

  // 1. Update appointment status to DONE
  const { error: apptError } = await supabase
    .from("appointments")
    .update({ status: "DONE" })
    .eq("id", appointmentId);

  if (apptError) {
    console.error("Error completing appointment:", apptError);
    return { error: "Error al finalizar la cita." };
  }

  // 1.5 Send thank you email to patient
  try {
    const { data: patientProfile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", patientId)
      .single();

    if (patientProfile?.email) {
      const { sendEmail } = await import("@/lib/email/send");
      await sendEmail("session_finished", patientProfile.email, {
        patientName: patientProfile.full_name || "Paciente",
      });
    }
  } catch (emailErr) {
    console.error("Error sending post-session email:", emailErr);
    // We don't block the UI for email failures
  }

  // 2. If notes provided, save clinical note
  if (notes && notes.trim().length > 0) {
    const { error: noteError } = await supabase
      .from("clinical_notes")
      .insert({
        patient_id: patientId,
        appointment_id: appointmentId,
        content: notes,
        status: "draft",
      });

    if (noteError) {
      console.error("Error saving clinical note from dashboard:", noteError);
      // We don't fail the whole operation if only the note fails, 
      // but maybe we should notify.
      return { success: true, warning: "Cita finalizada, pero hubo un error al guardar la nota." };
    }
  }

  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/patients/${patientId}`);
  
  return { success: true };
}
export async function markNoShowAction(appointmentId: string, patientId: string) {
  // Security: Check if requester is admin
  if (!(await isAdmin())) {
    return { error: "No autorizado. Solo la psicóloga puede realizar esta acción." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("appointments")
    .update({ status: "NO_SHOW" })
    .eq("id", appointmentId);

  if (error) {
    console.error("Error marking no-show:", error);
    return { error: "Error al marcar como no asistida." };
  }

  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/patients/${patientId}`);
  
  return { success: true };
}
export async function generateMeetLinkAction(appointmentId: string) {
  if (!(await isAdmin())) {
    return { error: "No autorizado." };
  }

  const supabase = await createClient();
  const { data: appt, error: fetchErr } = await supabase
    .from("appointments")
    .select(`
      id, start_at, duration_minutes, psicologa_id, patient_id, status,
      patient:profiles!appointments_patient_id_fkey(email, full_name),
      psicologa:profiles!appointments_psicologa_id_fkey(email)
    `)
    .eq("id", appointmentId)
    .single();

  if (fetchErr || !appt) return { error: "Cita no encontrada." };
  if (appt.status !== "CONFIRMED") return { error: "La cita debe estar confirmada." };

  const { data: settings } = await supabase
    .from("psicologa_settings")
    .select("*")
    .eq("psicologa_id", appt.psicologa_id)
    .single();

  if (!settings?.google_access_token) {
    return { error: "Google no está conectado. Por favor vincule su cuenta en Configuración." };
  }

  try {
    const { createMeetSession, refreshGoogleToken } = await import("@/lib/google/calendar");
    let accessToken = settings.google_access_token;
    
    // Check for expiration
    const isExpired = settings.google_token_expires_at && 
                     (new Date(settings.google_token_expires_at).getTime() < Date.now() + 5 * 60 * 1000);
    
    if (isExpired && settings.google_refresh_token) {
      const refreshed = await refreshGoogleToken(settings.google_refresh_token);
      accessToken = refreshed.access_token;
      
      await supabase
        .from("psicologa_settings")
        .update({ 
          google_access_token: refreshed.access_token,
          google_token_expires_at: refreshed.expires_at,
          updated_at: new Date().toISOString()
        })
        .eq("psicologa_id", appt.psicologa_id);
    }

    const patientData = Array.isArray(appt.patient) ? appt.patient[0] : appt.patient;
    const psicologaData = Array.isArray(appt.psicologa) ? appt.psicologa[0] : appt.psicologa;

    const { meet_link, calendar_event_id } = await createMeetSession({
      start_at: new Date(appt.start_at),
      duration_minutes: appt.duration_minutes,
      patient_email: patientData?.email || "",
      patient_name: patientData?.full_name || "Paciente",
      patient_id: appt.patient_id,
      psicologa_email: psicologaData?.email || "",
      psicologa_access_token: accessToken || "",
      psicologa_refresh_token: settings.google_refresh_token
    });

    if (meet_link) {
      await supabase
        .from("appointments")
        .update({ meet_link, calendar_event_id })
        .eq("id", appointmentId);
      
      revalidatePath("/admin/dashboard");
      return { success: true, meet_link };
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error("GENERATE_MEET_ERROR:", error);
    
    let message = error.message || "Error desconocido";
    if (message.includes("invalid_grant")) {
      message = "Tu sesión de Google ha expirado. Por favor, ve a Configuración y vuelve a conectar tu cuenta de Google.";
    }
    
    return { error: "Error de Google: " + message };
  }

  return { error: "No se pudo generar el link." };
}
