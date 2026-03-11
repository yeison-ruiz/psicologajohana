"use client";

import { motion } from "framer-motion";
import { 
  FileX, 
  Receipt, 
  X, 
  Check 
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Appointment } from "@/store/adminDashboardStore";

interface PendingApprovalsProps {
  appointments: Appointment[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function PendingApprovals({ 
  appointments, 
  onApprove, 
  onReject 
}: PendingApprovalsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      className="rounded-3xl bg-white p-6 md:p-8 shadow-sm border border-slate-100 dark:bg-slate-900 dark:border-slate-800"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Aprobaciones Pendientes
          </h3>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Comprobantes subidos por pacientes
          </p>
        </div>
        <Link
          href="/admin/payments"
          className="text-sm font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 border border-primary-100 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors dark:border-primary-900/30 dark:hover:bg-primary-900/20"
        >
          Ver Todos
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileX className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
            No hay pagos pendientes de aprobación
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {appointments.map((appt) => {
            const payment = appt.payments?.[0];
            const patientName = appt.patient?.full_name || "Paciente";

            return (
              <div
                key={appt.id}
                className="flex flex-col gap-4 rounded-xl border border-orange-100 bg-orange-50/30 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-orange-900/30 dark:bg-orange-900/10"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm border border-orange-100 dark:border-orange-800/50 dark:bg-slate-800 dark:text-orange-400">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      {patientName}
                    </p>
                    <div className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                      <span>
                        {format(new Date(appt.start_at), "MMM d", { locale: es })}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-orange-600 dark:text-orange-400 font-black uppercase tracking-wider text-[10px] bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded">
                        Comprobante Nequi
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 sm:justify-end">
                  <p className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter">
                    {payment ? formatCurrency(payment.amount_expected) : "—"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onReject(appt.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-red-900/50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                      title="Rechazar"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onApprove(appt.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                      title="Aprobar"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
