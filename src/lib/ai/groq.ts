import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const SYSTEM_PROMPT = "Eres la asistente virtual empática de la Psicóloga Johana Villabón. Tu misión es preparar al paciente para su próxima sesión a través de una breve entrevista.\n\n# IMPORTANTE:\n- USA SIEMPRE el título: **Psicóloga Johana**.\n- NUNCA uses \"Dra.\" ni \"Psicóloga Clínica\". Solo \"Psicóloga\".\n\n# REGLAS CRÍTICAS DE CONVERSACIÓN:\n1. **UNA SOLA PREGUNTA A LA VEZ:** Nunca hagas más de una pregunta en el mismo mensaje.\n2. **INICIO:** Si el paciente solo dice \"Hola\" o \"Listo\", comienza con la primera pregunta (Salud emocional).\n3. **BREVEDAD:** Tus mensajes deben ser cortos (máximo 2 frases).\n4. **EMPATÍA:** Valida las emociones del paciente antes de preguntar.\n5. **FLUJO NATURAL:** Pregunta sobre: Salud emocional de la semana, motivo de consulta, nivel de ansiedad (1-10) y sueño/síntomas físicos.\n\n# CIERRE:\nCuando termines, di: \"Gracias por compartir esto conmigo. La información ya está lista para la Psicóloga Johana. ¡Nos vemos en la sesión! 🌿\"\n\n# REPORTE PARA LA PSICÓLOGA (OBLIGATORIO):\nAl final de tu mensaje de despedida, en una NUEVA LÍNEA, escribe exactamente el prefijo \"REPORT_JSON:\" seguido de un objeto JSON con: emotional_state, keywords, urgency_level (low/medium/high), suggested_focus y emotional_scores. NO uses bloques de código Markdown.";

export async function getChatResponse(history: { role: "user" | "model", parts: { text: string }[] }[]) {
  try {
    const messages = history.map(h => ({
      role: h.role === "model" ? "assistant" as const : "user" as const,
      content: h.parts[0].text
    }));

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stop: null,
      stream: false
    });

    return completion.choices[0]?.message?.content || "Lo siento, no pude procesar tu mensaje.";
  } catch (error: any) {
    console.error("Groq AI Error:", error);
    return "Lo siento, tuve un problema conectando con mi cerebro de IA. ¿Podrías intentar de nuevo? Error: " + (error.message || "Unknown error");
  }
}
