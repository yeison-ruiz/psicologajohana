"use client";

import { motion } from "framer-motion";
import {
  X,
  Sparkles,
  AlertCircle,
  MessageCircle,
  Brain,
  Target,
  TrendingUp,
} from "lucide-react";

interface PreConsultationReportModalProps {
  report: {
    emotional_state: string;
    keywords: string[];
    urgency_level: string;
    suggested_focus: string;
    emotional_scores: {
      anxiety: number;
      stress: number;
      sadness: number;
    };
    chat_history: any[];
  };
  patientName: string;
  onClose: () => void;
}

export default function PreConsultationReportModal({
  report,
  patientName,
  onClose,
}: PreConsultationReportModalProps) {
  const urgencyColors = {
    low: "bg-emerald-100 text-emerald-700 border-emerald-200",
    medium: "bg-orange-100 text-orange-700 border-orange-200",
    high: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-2xl text-primary-600 dark:text-primary-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Análisis Inteligente: {patientName}
              </h3>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                Reporte Pre-consulta generado por IA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-3">
                <Brain className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Estado Detectado
                </span>
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                {report.emotional_state}
              </p>
            </div>

            <div
              className={`p-5 rounded-2xl border ${urgencyColors[report.urgency_level as keyof typeof urgencyColors] || urgencyColors.medium}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Nivel de Urgencia
                </span>
              </div>
              <p className="text-lg font-black capitalize">
                {report.urgency_level === "high"
                  ? "Alta"
                  : report.urgency_level === "medium"
                    ? "Media"
                    : "Baja"}
              </p>
            </div>
          </div>

          {/* Suggested Focus */}
          <div className="p-6 rounded-2xl bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/50">
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-4">
              <Target className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-widest">
                Sugerencia de Enfoque
              </span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              {report.suggested_focus}
            </p>
          </div>

          {/* Emotional Scores Chart (Simple Bars) */}
          <div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-6">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-widest">
                Indicadores Emocionales (1-10)
              </span>
            </div>
            <div className="space-y-5">
              {Object.entries(report.emotional_scores || {}).map(
                ([key, score]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-black text-slate-700 dark:text-slate-300 capitalize">
                        {key === "anxiety"
                          ? "Ansiedad"
                          : key === "stress"
                            ? "Estrés"
                            : key === "sadness"
                              ? "Tristeza"
                              : key}
                      </span>
                      <span className="text-sm font-black text-primary-600">
                        {score}/10
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(score as number) * 10}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full ${
                          (score as number) > 7
                            ? "bg-red-500"
                            : (score as number) > 4
                              ? "bg-orange-500"
                              : "bg-emerald-500"
                        }`}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-4">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-black uppercase tracking-widest">
                Palabras Clave Detectadas
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.keywords?.map((word, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold border border-slate-200 dark:border-slate-700"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all active:scale-[0.98]"
          >
            Entendido, cerrar reporte
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
