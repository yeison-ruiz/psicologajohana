import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getChatResponse } from "@/lib/ai/groq";

export async function POST(req: NextRequest) {
  try {
    const { appointmentId, history } = await req.json();

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // 1. Authenticate user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // 2. Verify appointment ownership
    const { data: appointment, error: apptError } = await supabase
      .from("appointments")
      .select("patient_id")
      .eq("id", appointmentId)
      .single();

    if (apptError || !appointment || appointment.patient_id !== user.id) {
       // Also check if admin
       const ADMIN_EMAILS = ["carolinavillabon01@gmail.com", "ingyeisonruiz26@gmail.com"];
       if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
         return NextResponse.json({ message: "No tienes permiso para acceder a esta cita" }, { status: 403 });
       }
    }

    // Get the assistant response
    const assistantMessage = await getChatResponse(history);

    // Refined logic to extract and hide the report from the patient
    let cleanMessage = assistantMessage;
    let jsonStr = "";
    let reportData = null;

    // 1. Try to find by specific prefix
    if (assistantMessage.includes("REPORT_JSON:")) {
      const parts = assistantMessage.split("REPORT_JSON:");
      cleanMessage = parts[0].trim();
      jsonStr = parts[1].trim();
    } 
    // 2. Fallback: Try to find markdown JSON or raw JSON at the end
    else if (assistantMessage.includes("```json")) {
      const parts = assistantMessage.split("```json");
      cleanMessage = parts[0].trim();
      jsonStr = parts[1].split("```")[0].trim();
    }
    // 3. Last resort: find the last occurrence of { and try to parse
    else if (assistantMessage.lastIndexOf("{") > assistantMessage.lastIndexOf("!")) {
      const lastBrace = assistantMessage.lastIndexOf("{");
      if (lastBrace !== -1 && assistantMessage.includes("}", lastBrace)) {
        jsonStr = assistantMessage.substring(lastBrace).trim();
        cleanMessage = assistantMessage.substring(0, lastBrace).trim();
      }
    }

    if (jsonStr) {
      try {
        // Remove markdown markers if any left
        const sanitizedJson = jsonStr.replace(/```json|```/g, "").trim();
        reportData = JSON.parse(sanitizedJson);
        
        const { data: appointment } = await supabase
          .from("appointments")
          .select("patient_id")
          .eq("id", appointmentId)
          .single();

        if (appointment) {
          await supabase
            .from("pre_consultation_reports")
            .upsert({
              appointment_id: appointmentId,
              patient_id: appointment.patient_id,
              emotional_state: reportData.emotional_state,
              keywords: reportData.keywords,
              urgency_level: reportData.urgency_level,
              suggested_focus: reportData.suggested_focus,
              emotional_scores: reportData.emotional_scores,
              chat_history: history.concat([{ role: "model", parts: [{ text: cleanMessage }] }])
            }, { onConflict: 'appointment_id' });
        }

        return NextResponse.json({ 
          message: cleanMessage || "Análisis completado.", 
          isFinished: true,
          report: reportData 
        });
      } catch (e) {
        console.error("Error parsing AI JSON:", e, "Payload:", jsonStr);
      }
    }

    return NextResponse.json({ 
      message: assistantMessage, 
      isFinished: assistantMessage.toLowerCase().includes("información ya está lista") 
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Pre-consult API Error]:", errorMessage);
    return NextResponse.json({ 
      message: "Lo siento, tuve un problema técnico. ¿Podrías intentar de nuevo? Error: " + errorMessage,
      error: "No se pudo procesar tu mensaje" 
    }, { status: 200 }); // Retornamos 200 con mensaje de error para evitar burbujas vacías
  }
}
