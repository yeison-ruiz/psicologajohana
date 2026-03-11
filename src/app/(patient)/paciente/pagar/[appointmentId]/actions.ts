"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadPaymentProofSchema } from "@/lib/validations";
import { sendEmail } from "@/lib/email/send";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const ADMIN_EMAILS = ["carolinavillabon01@gmail.com", "ingyeisonruiz26@gmail.com"];

export async function uploadPaymentProof(appointmentId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado." };
  }

  const file = formData.get("proof") as File;
  const amountDeclaredStr = formData.get("amount") as string;
  let amountDeclared = parseFloat(amountDeclaredStr?.replace(/[^0-9.-]+/g,"")); // Extract number

// 1. Validations via Zod wrapper
  const validationResult = uploadPaymentProofSchema.safeParse({
    amount: amountDeclared,
    proof: file,
  });

  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message };
  }

  // 2. Load appointment, payment and profiles
  const { data: appointment, error: apptError } = await supabase
    .from("appointments")
    .select(`
      status, 
      patient_id, 
      start_at,
      profiles!patient_id (full_name)
    `)
    .eq("id", appointmentId)
    .single();

  if (apptError || !appointment) {
    return { error: "Cita no encontrada." };
  }
  if (appointment.patient_id !== user.id) {
    return { error: "No tienes permiso para ver esta cita." };
  }
  const statusUpper = appointment.status?.toUpperCase();
  if (!statusUpper?.includes("PENDING") && !statusUpper?.includes("PAGAR")) {
    return { error: `Esta cita no está pendiente de pago. (Estado actual: ${appointment.status})` };
  }

  const { data: payment, error: fetchPayError } = await supabase
    .from("payments")
    .select("id, attempt_count, amount_expected")
    .eq("appointment_id", appointmentId)
    .single();

  if (fetchPayError || !payment) {
    return { error: "Error interno: Información de pago no encontrada para la cita." };
  }

  // Fallback to expected amount if declared is 0 or NaN
  if (!amountDeclared || isNaN(amountDeclared)) {
     amountDeclared = payment.amount_expected;
  }

  if (payment.attempt_count >= 3) {
    return { error: "Límite de intentos superado. Contacta a soporte." };
  }

  // 4. Upload to Supabase Storage (bucket_id: 'comprobantes')
  const ext = file.name.split('.').pop();
  const path = `comprobantes/${payment.id}_${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("comprobantes")
    .upload(path, file);

  if (uploadError) {
    console.error(uploadError);
    // If bucket doesn't exist, we fallback or show error.
    return { error: "Error al subir el archivo. " + uploadError.message };
  }

  // 5. Update DB (Without RPC first for simplicity, doing standard atomic update)
  const { error: updateError } = await supabase
    .from("payments")
    .update({ 
      proof_url: path, 
      amount_declared: amountDeclared,
      status: "pending_approval",
      attempt_count: payment.attempt_count + 1,
    })
    .eq("id", payment.id);

  if (updateError) {
    return { error: "Error registrando tu pago en la base de datos." };
  }

  const { error: updateApptError } = await supabase
    .from("appointments")
    .update({ status: "PENDING_APPROVAL" })
    .eq("id", appointmentId);

  if (updateApptError) {
    return { error: "Error actualizando el estado de la cita." };
  }

  // 6. Send Emails (Fire and forget style to not block user)
  interface AppointmentWithProfile {
    start_at: string;
    profiles: { full_name: string } | null;
  }
  const apptWithProfile = appointment as unknown as AppointmentWithProfile;
  const patientName = apptWithProfile.profiles?.full_name || "Paciente";
  const appointmentDate = format(parseISO(appointment.start_at), "eeee, d 'de' MMMM 'a las' h:mm a", { locale: es });

  // To patient
  sendEmail("payment_received_patient", user.email!, {
    patientName
  });

  // To all admins
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://psicologajohanavillabon.com";
  ADMIN_EMAILS.forEach(adminEmail => {
    sendEmail("payment_alert_admin", adminEmail, {
      patientName,
      appointmentDate,
      adminUrl: `${baseUrl}/admin/payments`
    });
  });

  // Done!
  // Revalidate ALL necessary paths to clear stale caches
  revalidatePath(`/paciente/pagar/${appointmentId}`);
  revalidatePath("/paciente/mis-citas");
  revalidatePath("/dashboard");
  
  redirect(`/paciente/mis-citas`);
}

export async function getAppointmentPaymentDetails(appointmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No autorizado." };

  const { data: appt, error } = await supabase
    .from("appointments")
    .select(`
       id, 
       start_at, 
       status,
       duration_minutes,
       payments(amount_expected, status, attempt_count)
    `)
    .eq("id", appointmentId)
    .eq("patient_id", user.id)
    .single();

  if (error || !appt) {
    return { error: "Cita no encontrada." };
  }

  interface PaymentRow {
    amount_expected: number;
    status: string;
    attempt_count: number;
  }

  // Normalize status to uppercase
  const normalizedAppt = {
    ...appt,
    status: appt.status?.toUpperCase(),
    payments: (appt.payments as unknown as PaymentRow[])?.map((p) => ({
      ...p,
      status: p.status?.toUpperCase(),
    })),
  };

  // Fetch settings — get the most recently updated settings
  const { data: settings } = await supabase
    .from("psicologa_settings")
    .select("nequi_number, daviplata_number")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return { appointment: normalizedAppt, settings };
}
