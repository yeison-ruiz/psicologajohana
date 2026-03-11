import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { verifyCronRequest } from "@/lib/cron/verify";

export async function GET(request: Request) {
  if (!verifyCronRequest(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = await createClient();

  try {
    // We want to close CONFIRMED sessions that ended 30 mins ago.
    // Instead of computing end_at dynamically in PG directly if not possible,
    // we fetch CONFIRMED sessions where start_at was at least 30 mins ago + max duration (e.g. 120 mins)
    // Actually, we can fetch all CONFIRMED and do the math, or we rely on 'start_at' + duration calculation.
    
    // A simplified query: start_at < (NOW - 2 hours) -> definitely finished
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const { data: staleSessions, error: fetchError } = await supabase
      .from("appointments")
      .select("id, start_at, duration_minutes")
      .eq("status", "CONFIRMED")
      .lt("start_at", twoHoursAgo);

    if (fetchError) {
      console.error("Cron fetch error (close-sessions):", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!staleSessions || staleSessions.length === 0) {
      return NextResponse.json({ message: "No stale sessions to close." }, { status: 200 });
    }

    const idsToClose = staleSessions.map((s) => s.id);

    const { error: updateError } = await supabase
      .from("appointments")
      .update({ status: "DONE" })
      .in("id", idsToClose);

    if (updateError) {
      console.error("Cron update error (close-sessions):", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: `Successfully closed ${idsToClose.length} sessions.` }, { status: 200 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Cron exception (close-sessions):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
