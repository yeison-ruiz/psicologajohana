"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

const ADMIN_EMAILS = ["carolinavillabon01@gmail.com", "ingyeisonruiz26@gmail.com"];

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  
  // Enforce role based on email if metadata is missing or inconsistent
  const isPsicologa = ADMIN_EMAILS.includes(email.toLowerCase());
  const role = isPsicologa ? 'psicologa' : 'paciente';

  if (role === 'psicologa') {
    redirect("/admin/dashboard");
  } else {
    redirect("/dashboard");
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("name") as string;

  // Determine role based on allowed admin emails
  const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? "psicologa" : "paciente";

  const data = {
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      }
    }
  };

  const { data: signUpData, error } = await supabase.auth.signUp(data);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://psicologajohanavillabon.com';

  if (error) {
    return { error: error.message };
  }

  // Send welcome email (app level notification)
  if (signUpData.user?.email) {
    try {
      const { sendEmail } = await import("@/lib/email/send");
      await sendEmail("welcome", signUpData.user.email, {
        patientName: fullName,
        loginUrl: `${siteUrl}/login`
      });
    } catch (emailErr) {
      console.error("Welcome email failed:", emailErr);
    }
  }

  // If Supabase is configured to require email confirmation, session will be null
  if (!signUpData.session) {
    return { 
      success: true, 
      message: "¡Cuenta creada con éxito! Por favor verifica tu correo electrónico para confirmar tu cuenta y poder iniciar sesión." 
    };
  }

  revalidatePath("/", "layout");
  
  if (role === "psicologa") {
    redirect("/admin/dashboard");
  } else {
    redirect("/dashboard");
  }
}
