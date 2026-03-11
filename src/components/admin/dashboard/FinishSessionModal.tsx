"use client";

import { motion } from "framer-motion";
import { 
  X, 
  AlertCircle, 
  MessageSquare, 
  CheckCircle, 
  Loader2 
} from "lucide-react";

interface Appointment {
  id: string;
  patient_id: string;
  patient: { full_name: string } | null;
}

interface FinishSessionModalProps {
  appointment: Appointment;
  sessionNotes: string;
  setSessionNotes: (notes: string) => void;
  isFinishing: boolean;
  onClose: () => void;
  onFinish: () => void;
}

export function FinishSessionModal({
  appointment,
  sessionNotes,
  setSessionNotes,
  isFinishing,
  onClose,
  onFinish,
}: FinishSessionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800"
      >
        <div className="p-8">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Finalizar Sesión
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Paciente:{" "}
                <span className="text-primary-600 dark:text-primary-400 font-bold">
                  {appointment.patient?.full_name}
                </span>
              </p>
            </div>
            <button
              onClick={() => {
                if (!isFinishing) onClose();
              }}
              className="rounded-full bg-slate-100 dark:bg-slate-800 p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-primary-50 dark:bg-primary-900/10 p-4 border border-primary-100 dark:border-primary-900/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-primary-800 dark:text-primary-300 leading-relaxed">
                Al finalizar la sesión, la cita pasará al historial.
                Puedes aprovechar para guardar tus apuntes profesionales
                ahora mismo.
              </p>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <MessageSquare className="w-4 h-4" /> Notas de la sesión
              </label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Escribe aquí los puntos clave tratados en la sesión..."
                rows={6}
                className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-5 text-base font-bold focus:border-primary-500 focus:ring-0 dark:text-white transition-all resize-none shadow-inner"
                disabled={isFinishing}
              />
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl border-2 border-slate-200 dark:border-slate-800 py-4 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              disabled={isFinishing}
            >
              Cancelar
            </button>
            <button
              onClick={onFinish}
              className="flex-[2] rounded-2xl bg-emerald-500 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              disabled={isFinishing}
            >
              {isFinishing ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" /> Finalizar y Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
