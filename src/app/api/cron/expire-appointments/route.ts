import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { verifyCronRequest } from "@/lib/cron/verify";

// This route should only be triggered by Vercel Cron or a secured trigger.
export async function GET(request: Request) {
  if (!verifyCronRequest(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Option: Check auth token here for security e.g. req.headers.get("Authorization")
  const supabase = await createClient();

  try {
    // 1. Find appointments pending payment created more than 48 hours ago
    const hoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: expiredAppts, error: fetchError } = await supabase
      .from("appointments")
      .select("id, slot_id")
      .eq("status", "PENDING_PAYMENT")
      .lt("created_at", hoursAgo);

    if (fetchError) {
      console.error("Cron fetch error:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!expiredAppts || expiredAppts.length === 0) {
      return NextResponse.json({ message: "No expired appointments found." }, { status: 200 });
    }

    // 2. Process cancellations
    const processedIds: string[] = [];
    const slotIdsToFree: string[] = [];

    for (const appt of expiredAppts) {
      if (appt.id) processedIds.push(appt.id);
      if (appt.slot_id) slotIdsToFree.push(appt.slot_id);
    }

    // Mark appointments as CANCELLED
    if (processedIds.length > 0) {
      const { error: cancelError } = await supabase
        .from("appointments")
        .update({ status: "CANCELLED" })
        .in("id", processedIds);

      if (cancelError) {
         console.error("Cron cancel error:", cancelError);
      }
    }

    // Free up availability slots
    if (slotIdsToFree.length > 0) {
      const { error: slotError } = await supabase
        .from("availability_slots")
        .update({ is_available: true })
        .in("id", slotIdsToFree);

      if (slotError) {
         console.error("Cron slot free error:", slotError);
      }
    }

    return NextResponse.json({ message: `Successfully cancelled ${processedIds.length} appointments.` }, { status: 200 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Cron exception:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
