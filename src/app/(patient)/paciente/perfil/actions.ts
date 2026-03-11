"use server";

import { createClient } from "@/utils/supabase/server";
import { requestDeletionSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getPatientProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone_number, notification_preferences")
    .eq("id", user.id)
    .single();

  return { user, profile };
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado." };

  const fullName = formData.get("full_name") as string;
  const phoneNumber = formData.get("phone_number") as string;
  
  const { error } = await supabase
    .from("profiles")
    .update({ 
      full_name: fullName, 
      phone_number: phoneNumber 
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Error al actualizar tu perfil." };
  }

  revalidatePath("/paciente/perfil");
  return { success: true };
}

// Security: Export basic personal data (GDPR/Data Privacy practice)
export async function exportMyData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado." };

  // Fetch all user related data
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: appointments } = await supabase.from("appointments").select("id, start_at, duration_minutes, status").eq("patient_id", user.id);
  // Ideally payments history could also be attached
  
  const exportedData = {
    account: {
       email: user.email,
       created_at: user.created_at,
    },
    profile,
    appointments,
  };

  return { data: JSON.stringify(exportedData, null, 2) };
}

// Security: Request Account Deletion
export async function requestAccountDeletion(confirmText: string) {
  const parseResult = requestDeletionSchema.safeParse({ confirmText });
  if (!parseResult.success) {
    return { error: (parseResult.error as any).errors[0]?.message || "Texto de confirmación inválido." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado." };

  // RPC to delete account or set a 'to_be_deleted_at' flag
  // In a real production setup, calling the Admin Delete Auth User is complex.
  // Instead, typically a flag is set on profiles, and a cron job handles the rest,
  // or RPC securely deletes auth.users. 
  
  const { error } = await supabase
    .from("profiles")
    .update({ 
      full_name: "Anonymous User", 
      phone_number: null,
      notification_preferences: { push: false, email: false }
    })
    .eq("id", user.id);
    
  if (error) {
     return { error: "Ocurrió un error al procesar tu solicitud." };
  }

  // Then sign out manually. 
  await supabase.auth.signOut();
  redirect("/login");
}
