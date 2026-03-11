import { createClient } from "@/utils/supabase/server";
import { subHours } from "date-fns";

/**
 * PAY-01: Expiration of payments after 48 hours.
 * Replaces status to CANCELLED and frees slots if payment proof was not uploaded.
 */
export async function cleanupExpiredPayments() {
  const supabase = await createClient();
  
  // Find appointments in PENDING_PAYMENT created more than 48 hours ago
  const expirationThreshold = subHours(new Date(), 48).toISOString();
  
  const { data: expiredAppts, error } = await supabase
    .from("appointments")
    .select("id, slot_id")
    .eq("status", "PENDING_PAYMENT")
    .lt("created_at", expirationThreshold);
    
  if (error) {
    console.error("[Cleanup] Error fetching expired appointments:", error);
    return;
  }
  
  if (!expiredAppts || expiredAppts.length === 0) return;
  
  console.log(`[Cleanup] Found ${expiredAppts.length} expired appointments.`);
  
  for (const appt of expiredAppts) {
    // 1. Cancel appointment
    await supabase
      .from("appointments")
      .update({ status: "CANCELLED" })
      .eq("id", appt.id);
      
    // 2. Free slot
    if (appt.slot_id) {
      await supabase
        .from("availability_slots")
        .update({ is_available: true })
        .eq("id", appt.slot_id);
    }
    
    // 3. Mark payment as expired
    await supabase
      .from("payments")
      .update({ status: "expired" })
      .eq("appointment_id", appt.id);
  }
}
