import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { verifyCronRequest } from "@/lib/cron/verify";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export async function GET(request: Request) {
  if (!verifyCronRequest(request)) return new Response("Unauthorized", { status: 401 });

  const supabase = await createClient();

  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Setup date range for tomorrow
    const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0)).toISOString();
    const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999)).toISOString();

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`id, start_at, duration_minutes, patient_id, psicologa_id, meet_link`)
      .eq("status", "CONFIRMED")
      .gte("start_at", startOfTomorrow)
      .lte("start_at", endOfTomorrow);

    if (error) {
      console.error("Cron fetch error (reminders-24h):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({ message: "No reminders to send." }, { status: 200 });
    }

    // 2. Fetch profiles for patient emails
    const patientIds = appointments.map(a => a.patient_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", patientIds);

    const { sendEmail } = await import("@/lib/email/send");
    let sentCount = 0;

    for (const appt of appointments) {
      const patient = profiles?.find(p => p.id === appt.patient_id);
      if (patient?.email) {
        const dateStr = format(parseISO(appt.start_at), "eeee, d 'de' MMMM", { locale: es });
        const timeStr = format(parseISO(appt.start_at), "h:mm a");

        await sendEmail("session_reminder", patient.email, {
          patientName: patient.full_name || "Paciente",
          dateStr,
          timeStr,
          meetLink: appt.meet_link || "https://psicologajohanavillabon.com/paciente/mis-citas"
        });
        sentCount++;
      }
    }

    return NextResponse.json({ reminders_sent: sentCount }, { status: 200 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Cron exception (reminders-24h):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
