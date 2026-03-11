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
