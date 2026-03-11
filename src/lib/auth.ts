import { createClient } from "@/utils/supabase/server";

export const ADMIN_EMAILS = [
  "carolinavillabon01@gmail.com",
  "ingyeisonruiz26@gmail.com",
];

export async function isAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const userEmail = user.email?.toLowerCase();
  return userEmail ? ADMIN_EMAILS.includes(userEmail) : false;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getAuthRole() {
  const user = await getCurrentUser();
  if (!user) return "guest";

  const userEmail = user.email?.toLowerCase();
  return userEmail && ADMIN_EMAILS.includes(userEmail) ? "psicologa" : "paciente";
}
