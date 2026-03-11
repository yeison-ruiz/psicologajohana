import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { verifyCronRequest } from "@/lib/cron/verify";

export async function GET(request: Request) {
  if (!verifyCronRequest(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = await createClient();

  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const { data: oldPayments, error: fetchError } = await supabase
      .from("payments")
      .select(`id, proof_url, appointments(status)`)
      .not("proof_url", "is", null)
      .lt("updated_at", ninetyDaysAgo);
      
    if (fetchError) {
      console.error("Cron fetch error (cleanup):", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Filter to only EXPIRED or CANCELLED
    const orphanPayments = oldPayments?.filter(p => {
       const appts = p.appointments as any;
       // We joined the table, type usually expects array but since it's a 1-to-1 it's sometimes an object
       if (!appts) return false;
       return (Array.isArray(appts) ? appts[0]?.status : appts.status) === "EXPIRED" || 
              (Array.isArray(appts) ? appts[0]?.status : appts.status) === "CANCELLED";
    });

    if (!orphanPayments || orphanPayments.length === 0) {
      return NextResponse.json({ message: "No orphaned proofs to clean up." }, { status: 200 });
    }

    let deleted = 0;
    for (const payment of orphanPayments) {
      if (payment.proof_url) {
        // Remove from storage buffer
        const { error: removeError } = await supabase.storage.from("comprobantes").remove([payment.proof_url]);
        if (!removeError) {
          await supabase.from("payments").update({ proof_url: null }).eq("id", payment.id);
          deleted++;
        }
      }
    }

    return NextResponse.json({ message: `Successfully cleaned ${deleted} files.` }, { status: 200 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Cron exception (cleanup):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
