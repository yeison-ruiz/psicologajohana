"use server";

import { createClient } from "@/utils/supabase/server";

export async function getPsicologaSlots(startDate: Date, endDate: Date) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("psicologa_id", user.id)
    .gte("start_at", startDate.toISOString())
    .lte("end_at", endDate.toISOString());

  if (error) {
    console.error("Error fetching slots:", error);
    return [];
  }
  return data;
}

import { createSlotSchema } from "@/lib/validations";
import { z } from "zod";

export async function createSlot(slotParams: z.infer<typeof createSlotSchema>) {
  const parseResult = createSlotSchema.safeParse(slotParams);
  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }
  const slotData = parseResult.data;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("No authentitcated");

  // Validate the actual daily limit (AG-07)
  const dateOnly = slotData.start_at.split("T")[0]; // YYYY-MM-DD
  const nextDay = new Date(dateOnly);
  nextDay.setDate(nextDay.getDate() + 1);

  const { count, error: countErr } = await supabase
    .from("availability_slots")
    .select("*", { count: "exact", head: true })
    .eq("psicologa_id", user.id)
    .gte("start_at", new Date(dateOnly).toISOString())
    .lt("start_at", nextDay.toISOString());

  if (countErr) throw new Error("Error checking daily limits");
  
  if (count && count >= 8) {
    return { error: "Has alcanzado el límite máximo de 8 sesiones permitidas por día (AG-07)." };
  }

  // Prevent overlaps (AG-06 extension)
  const { data: overlapping } = await supabase
    .from("availability_slots")
    .select("id")
    .eq("psicologa_id", user.id)
    .or(`and(start_at.lte."${slotData.start_at}",end_at.gt."${slotData.start_at}"),and(start_at.lt."${slotData.end_at}",end_at.gte."${slotData.end_at}"),and(start_at.gte."${slotData.start_at}",end_at.lte."${slotData.end_at}")`)
    .limit(1);

  if (overlapping && overlapping.length > 0) {
    return { error: "Ya existe un horario que se cruza con este rango." };
  }

  const { data, error } = await supabase
    .from("availability_slots")
    .insert([{ ...slotData, psicologa_id: user.id, is_available: true }])
    .select()
    .single();

  if (error) {
    console.error("Error creating slot:", error);
    return { error: error.message };
  }

  return { data };
}

export async function deleteSlot(slotId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "No authenticated" };

  // Verification if it is available (not active appointments)
  const { data: existingSlot, error: fetchErr } = await supabase
    .from("availability_slots")
    .select("is_available")
    .eq("id", slotId)
    .eq("psicologa_id", user.id)
    .single();

  if (fetchErr) return { error: "Slot no encontrado." };
  if (!existingSlot.is_available) return { error: "Este horario tiene una cita activa y no puede eliminarse." };

  const { error } = await supabase
    .from("availability_slots")
    .delete()
    .eq("id", slotId)
    .eq("psicologa_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}
