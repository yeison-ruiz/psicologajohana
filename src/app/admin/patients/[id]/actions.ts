"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getPatientData(patientId: string) {
  const supabase = await createClient();

  // 1. Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", patientId)
    .single();

  // 2. Fetch appointments (history)
  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("patient_id", patientId)
    .order("start_at", { ascending: false });

  // 3. Fetch clinical notes
  const { data: notes } = await supabase
    .from("clinical_notes")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  return { profile, appointments, notes };
}

export async function saveClinicalNote(
  patientId: string, 
  content: string, 
  appointmentId?: string | null,
  diagnosis_codes: string[] = [],
  tasks: string[] = []
) {

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clinical_notes")
    .insert({
      patient_id: patientId,
      appointment_id: appointmentId,
      content,
      status: "draft",
      diagnosis_codes,
      tasks,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving clinical note:", error);
    return { error: "Error al guardar la nota." };
  }

  revalidatePath(`/admin/patients/${patientId}`);
  return { success: true, note: data };
}

export async function signNote(noteId: string, patientId: string) {
    const supabase = await createClient();
    
    const { error } = await supabase
        .from("clinical_notes")
        .update({
            status: 'signed',
            signed_at: new Date().toISOString()
        })
        .eq("id", noteId);
        
    if (error) return { error: error.message };
    
    revalidatePath(`/admin/patients/${patientId}`);
    return { success: true };
}

export async function updateClinicalNote(
  noteId: string,
  patientId: string,
  content: string,
  diagnosis_codes: string[] = [],
  tasks: string[] = []
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("clinical_notes")
    .update({
      content,
      diagnosis_codes,
      tasks,
    })
    .eq("id", noteId);

  if (error) {
    console.error("Error updating clinical note:", error);
    return { error: "Error al actualizar la nota." };
  }

  revalidatePath(`/admin/patients/${patientId}`);
  return { success: true };
}
