import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { verifyCronRequest } from "@/lib/cron/verify";

export async function GET(request: Request) {
  if (!verifyCronRequest(request)) return new Response("Unauthorized", { status: 401 });

  const supabase = await createClient();

  try {
    const in55min = new Date(Date.now() + 55 * 60 * 1000).toISOString();
    const in65min = new Date(Date.now() + 65 * 60 * 1000).toISOString();

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("id, start_at, meet_link, patient_id, psicologa_id")
      .eq("status", "CONFIRMED")
      .eq("reminder_1h_sent", false) // only those not sent yet
      .gte("start_at", in55min)
      .lte("start_at", in65min);

    if (error) {
      console.error("Cron fetch error (reminders-1h):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({ message: "No 1h reminders to send." }, { status: 200 });
    }

    // TODO: Send Emails (Resend) and Push Notifications here

    // Mark as sent
    for (const apt of appointments) {
      await supabase
        .from("appointments")
        .update({ reminder_1h_sent: true })
        .eq("id", apt.id);
    }

    return NextResponse.json({ reminders_sent: appointments.length }, { status: 200 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Cron exception (reminders-1h):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
