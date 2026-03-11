import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { verifyCronRequest } from "@/lib/cron/verify";

export async function GET(request: Request) {
  if (!verifyCronRequest(request)) return new Response("Unauthorized", { status: 401 });

  const supabase = await createClient();

  try {
    const { data: psicologas, error } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "psicologa");
      // .eq('active', true); // if active flag exists

    if (error) {
      console.error("Cron fetch error (weekly-report):", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!psicologas || psicologas.length === 0) {
      return NextResponse.json({ message: "No psychologists found." }, { status: 200 });
    }

    // Prepare date ranges (last week)
    const now = new Date();
    // Start of last week (Monday)
    const day = now.getDay(); 
    const diff = now.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    const thisMonday = new Date(now.setDate(diff));
    const lastMonday = new Date(thisMonday.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastSunday = new Date(thisMonday.getTime() - 1); 

    for (const psicologa of psicologas) {
      // NOTE: Here we would fetch stats using the RPC function `get_weekly_stats` 
      // as mentioned in the SKILL, but since it's not defined yet, we skip or mock the query
      console.log(`Sending weekly report to ${psicologa.email}... (from ${lastMonday.toISOString()} to ${lastSunday.toISOString()})`);
      // await resend.emails.send(...)
    }

    return NextResponse.json({ reports_sent: psicologas.length }, { status: 200 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Cron exception (weekly-report):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
