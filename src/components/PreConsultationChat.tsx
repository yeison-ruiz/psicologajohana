"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, X, User, MessageCircle } from "lucide-react";

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

interface PreConsultationChatProps {
  appointmentId: string;
  onClose: () => void;
  patientName: string;
}

export default function PreConsultationChat({
  appointmentId,
  onClose,
  patientName,
}: PreConsultationChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      parts: [
        {
          text: `¡Hola, ${patientName.split(" ")[0]}! Soy tu asistente para tu próxima sesión con la Psicóloga Johana Villabón. 🌿 Me gustaría hacerte unas breves preguntas para que ella pueda conocerte mejor y prepararse para escucharte. Cuando estés listo, escribe "Hola" o "Listo" para comenzar.`,
        },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || isFinished) return;

    const userMessage: Message = { role: "user", parts: [{ text: input }] };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai/pre-consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, history: newHistory }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "model", parts: [{ text: data.message }] },
      ]);

      if (data.isFinished) {
        setIsFinished(true);
      }
    } catch (error) {
      console.error("Error context AI:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg h-[600px] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-4 bg-primary-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight">
                Preparación Inteligente
              </h3>
              <p className="text-xs font-bold text-white/80 uppercase tracking-widest">
                IA para tu bienestar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl flex gap-3 ${
                    msg.role === "user"
                      ? "bg-primary-600 text-white rounded-tr-none"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                  }`}
                >
                  {msg.role === "model" && (
                    <Sparkles className="w-5 h-5 shrink-0 mt-0.5 opacity-50" />
                  )}
                  <p className="text-sm font-medium leading-relaxed">
                    {msg.parts[0].text}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <span
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer/Input */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          {!isFinished ? (
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Escribe tu mensaje aquí..."
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                className="bg-primary-600 text-white p-3 rounded-2xl hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-500/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-2"
            >
              <p className="text-emerald-600 font-black text-sm mb-3">
                ✅ Análisis completado. ¡Gracias!
              </p>
              <button
                onClick={onClose}
                className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-3 rounded-2xl"
              >
                Cerrar y volver al Dashboard
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
