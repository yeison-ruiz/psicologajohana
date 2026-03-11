"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/auth";

export async function getPaymentDetails(paymentId: string) {
  try {
    // Security: Verify authorized user (admin)
    if (!(await isAdmin())) {
      return { error: "No autorizado." };
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey || serviceKey.length < 10) {
      console.error("ADMIN_MISSING_KEY: SUPABASE_SERVICE_ROLE_KEY is missing or too short:", serviceKey?.length);
      return { error: "Error de configuración: La SUPABASE_SERVICE_ROLE_KEY no se está cargando correctamente desde .env.local." };
    }

    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    );

    const { data: payment, error } = await supabaseAdmin
      .from("payments")
      .select(`
        id, amount_expected, amount_declared, proof_url, status, attempt_count,
        appointments (
          id, start_at, duration_minutes, status, psicologa_id,
          patient:patient_id (full_name, avatar_url)
        )
      `)
      .eq("id", paymentId)
      .maybeSingle();

    if (error) {
      console.error("ADMIN_ERROR_PAYMENT_DETAILS:", paymentId, error);
      return { error: "Error al cargar el pago: " + error.message };
    }

    if (!payment) {
      return { error: "Pago no encontrado en el sistema." };
    }

    // Get signed URL if proof exists
    let signedUrl = null;
    if (payment.proof_url) {
      console.log("ADMIN: Generating signed URL for:", payment.proof_url);
      const { data, error: storageError } = await supabaseAdmin.storage
        .from("comprobantes")
        .createSignedUrl(payment.proof_url, 3600);
      
      if (storageError) {
        console.error("ADMIN_STORAGE_ERROR:", storageError);
      } else {
        signedUrl = data?.signedUrl;
        console.log("ADMIN: Signed URL success:", !!signedUrl);
      }
    }

    return { payment, signedUrl };
  } catch (err: any) {
    console.error("ADMIN_CRASH_PAYMENT_DETAILS:", err);
    return { error: "Error interno del servidor: " + (err.message || "Desconocido") };
  }
}

import { sendEmail } from "@/lib/email/send";

export async function approvePayment(paymentId: string) {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return { error: "Servicio no disponible (ADMIN_KEY_MISSING)" };

    // Verify authorized user (admin)
    if (!(await isAdmin())) {
      return { error: "No autorizado. Solo la psicóloga puede realizar esta acción." };
    }

    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    );

    const supabaseShared = await createClient();
    const { data: { user } } = await supabaseShared.auth.getUser();
    if (!user) return { error: "No autorizado." };

    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("appointment_id")
      .eq("id", paymentId)
      .single();

    if (!payment) return { error: "Pago no encontrado." };

    // Update payment status using Admin Client to bypass RLS
    const { error: payError } = await supabaseAdmin
      .from("payments")
      .update({ 
        status: "approved", 
        approved_at: new Date().toISOString(),
        approved_by: user.id
      })
      .eq("id", paymentId);

    if (payError) {
      console.error("ADMIN_APPROVE_PAY_ERROR:", payError);
      return { error: "Error al aprobar el pago." };
    }

    // Update appointment status to CONFIRMED
    const { error: apptError } = await supabaseAdmin
      .from("appointments")
      .update({ status: "CONFIRMED" })
      .eq("id", payment.appointment_id);

    if (apptError) {
      console.error("ADMIN_APPROVE_APPT_ERROR:", apptError);
      return { error: "Error al confirmar la cita." };
    }

    // 2. Generate Google Meet Link if the appointment is virtual
    const { data: fullAppt, error: fullApptError } = await supabaseAdmin
      .from("appointments")
      .select(`
        id, start_at, duration_minutes, psicologa_id, patient_id,
        slot:availability_slots(session_type)
      `)
      .eq("id", payment.appointment_id)
      .single();

    if (fullApptError) {
      console.warn("Could not fetch full appointment details for Meet:", fullApptError);
    }

    let meetLink = "";

    if (fullAppt) {
      // In this system, "Terapia Individual" or "VIRTUAL" implies a virtual session.
      const sessionType = (fullAppt as any).slot?.session_type;
      // 1. We treat it as virtual unless it explicitly says "PRESENCIAL"
      // 2. We check common virtual labels used in this project
      const normalizedType = (sessionType || "").toUpperCase();
      const isVirtual = 
        !normalizedType.includes("PRESENCIAL") && 
        (normalizedType.includes("INDIVIDUAL") || 
         normalizedType.includes("TERAPIA") || 
         normalizedType.includes("CONJUNTA") || 
         normalizedType.includes("PRIORITARIA") ||
         normalizedType === "VIRTUAL");

      console.log(`Checking Meet generation for type: ${sessionType}, isVirtual: ${isVirtual}`);

      if (isVirtual) {
        // 1. Get Google tokens for the psicologa
        const { data: settings } = await supabaseAdmin
          .from("psicologa_settings")
          .select("*")
          .eq("psicologa_id", fullAppt.psicologa_id)
          .single();

        if (settings?.google_access_token) {
          try {
            let accessToken = settings.google_access_token;
            
            // Check for expiration (with 5 min buffer)
            const isExpired = settings.google_token_expires_at && 
                             (new Date(settings.google_token_expires_at).getTime() < Date.now() + 5 * 60 * 1000);
            
            if (isExpired && settings.google_refresh_token) {
              const { refreshGoogleToken } = await import("@/lib/google/calendar");
              const refreshed = await refreshGoogleToken(settings.google_refresh_token);
              accessToken = refreshed.access_token;
              
              await supabaseAdmin
                .from("psicologa_settings")
                .update({ 
                  google_access_token: refreshed.access_token,
                  google_token_expires_at: refreshed.expires_at,
                  updated_at: new Date().toISOString()
                })
                .eq("psicologa_id", fullAppt.psicologa_id);
            } else if (isExpired && !settings.google_refresh_token) {
              console.warn("ADMIN_MEET_ERROR: Access token expired and NO refresh token found for:", fullAppt.psicologa_id);
            }

            const { data: patientProfile } = await supabaseAdmin
              .from("profiles")
              .select("email, full_name")
              .eq("id", fullAppt.patient_id)
              .single();

            const { data: psicologaProfile } = await supabaseAdmin
              .from("profiles")
              .select("email")
              .eq("id", fullAppt.psicologa_id)
              .single();

            if (patientProfile?.email && psicologaProfile?.email) {
              const { createMeetSession } = await import("@/lib/google/calendar");
              
              const meet = await createMeetSession({
                start_at: new Date(fullAppt.start_at),
                duration_minutes: fullAppt.duration_minutes,
                patient_email: patientProfile.email,
                patient_name: patientProfile.full_name || undefined,
                patient_id: fullAppt.patient_id,
                psicologa_email: psicologaProfile.email,
                psicologa_access_token: accessToken,
                psicologa_refresh_token: settings.google_refresh_token
              });

              if (meet.meet_link) {
                meetLink = meet.meet_link;
                await supabaseAdmin
                  .from("appointments")
                  .update({ 
                    meet_link: meet.meet_link,
                    calendar_event_id: meet.calendar_event_id 
                  }) 
                  .eq("id", payment.appointment_id);
              }
            }
          } catch (error) {
            console.error("Failed to create Google Meet session:", error);
          }
        }
      }
      
      // 2. Send confirmation email
      const { data: ptData } = await supabaseAdmin
        .from("profiles")
        .select("full_name, email")
        .eq("id", fullAppt.patient_id)
        .single();

      if (ptData?.email) {
        const dateStr = new Date(fullAppt.start_at).toLocaleDateString("es-CO", { weekday:"long", month:"long", day:"numeric" });
        const timeStr = new Date(fullAppt.start_at).toLocaleTimeString("es-CO", { hour:"2-digit", minute:"2-digit" });
        
        await sendEmail("appointment_confirmed", ptData.email, {
          patientName: ptData.full_name || "Paciente",
          date: dateStr,
          time: timeStr,
          meetLink: meetLink || "https://psicologajohanavillabon.com/paciente/mis-citas"
        });
      }
    }

    revalidatePath(`/admin/payments/${paymentId}`);
    revalidatePath(`/admin/payments`);
    revalidatePath(`/admin/dashboard`);
    
    return { success: true };
  } catch (err: any) {
    console.error("ADMIN_APPROVE_CRASH:", err);
    return { error: "Error crítico al aprobar: " + (err.message || "Desconocido") };
  }
}

import { rejectPaymentSchema } from "@/lib/validations";

export async function rejectPayment(paymentId: string, reason: string) {
  // Security: Verify authorized user (admin)
  if (!(await isAdmin())) {
    return { error: "No autorizado. Solo la psicóloga puede realizar esta acción." };
  }

  const supabase = await createClient();

  const parseResult = rejectPaymentSchema.safeParse({ paymentId, reason });
  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }

  const { data: payment } = await supabase
    .from("payments")
    .select("appointment_id, attempt_count")
    .eq("id", paymentId)
    .single();

  if (!payment) return { error: "Pago no encontrado." };

  // Update payment
  const { error: payError } = await supabase
    .from("payments")
    .update({ 
      status: "rejected",
      rejection_reason: reason
    })
    .eq("id", paymentId);

  if (payError) return { error: "Error al rechazar el pago." };

  // Determine appointment status based on attempts
  const newApptStatus = payment.attempt_count >= 3 ? "CANCELLED" : "PENDING_PAYMENT";

  // If CANCELLED due to max attempts, we also free up the availability slot
  // But wait, the transaction is non-atomic here. It's fine for now as requested.
  // Actually let's just update the appointment status.
  const { error: apptError } = await supabase
    .from("appointments")
    .update({ status: newApptStatus })
    .eq("id", payment.appointment_id);

  if (apptError) return { error: "Error al rechazar la cita." };

  // If we cancel the appointment, we should free the availability slot
  if (newApptStatus === "CANCELLED") {
    // We need the slot_id to do this properly. Let's fetch it if needed.
    const { data: apptData } = await supabase
      .from("appointments")
      .select("slot_id")
      .eq("id", payment.appointment_id)
      .single();
    if (apptData?.slot_id) {
       await supabase.from("availability_slots").update({ is_available: true }).eq("id", apptData.slot_id);
    }
  }

  revalidatePath(`/admin/payments/${paymentId}`);
  revalidatePath(`/admin/payments`);
  
  return { success: true };
}
