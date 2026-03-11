"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  CalendarX,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getPatientPayments } from "./actions";

export default function PagarIndexPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getPatientPayments();
      if (data) {
        setPayments(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex w-full h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    const s = status?.toUpperCase();
    if (s === "APPROVED") {
      return {
        label: "Pago aceptado",
        color: "bg-green-50 text-green-700 border-green-200",
        icon: <CheckCircle2 className="w-4 h-4" />,
      };
    }
    if (s === "REJECTED") {
      return {
        label: "Pago rechazado",
        color: "bg-red-50 text-red-700 border-red-200",
        icon: <AlertCircle className="w-4 h-4" />,
      };
    }
    return {
      label: "Pendiente de revisión",
      color: "bg-orange-50 text-orange-700 border-orange-200",
      icon: <Clock className="w-4 h-4" />,
    };
  };

  if (payments.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:border-slate-700 border border-slate-200 mb-6 shadow-sm">
            <CalendarX className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Sin pagos pendientes
          </h2>
          <p className="text-slate-600 font-bold mb-10 text-lg leading-relaxed">
            Actualmente no tienes ninguna cita pendiente de pago. Puedes agendar
            una sesión nueva cuando desees.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/book"
              className="w-full rounded-2xl bg-primary-600 px-8 py-5 text-lg font-black text-white shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-[0.98]"
            >
              Agendar Nueva Cita
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-3">
            Recibos de Pago
          </h2>
          <p className="text-slate-600 font-black text-lg leading-relaxed">
            Historial de transacciones y comprobantes
          </p>
        </div>
        <Link
          href="/book"
          className="px-8 py-4 bg-primary-600 text-white text-base font-black rounded-2xl shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition-all active:scale-95 flex items-center gap-3"
        >
          <Calendar className="w-6 h-6" /> Nueva Cita
        </Link>
      </div>

      <div className="space-y-4">
        {payments.map((p) => {
          const status = getStatusInfo(p.status);
          const date = p.appointments?.start_at
            ? new Date(p.appointments.start_at)
            : new Date(p.created_at);

          return (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight leading-none mb-2">
                    Pago de Sesión
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-base font-black text-slate-500">
                    <span className="flex items-center gap-1.5 hover:text-primary-600 transition-colors">
                      <Calendar className="w-5 h-5" />
                      {format(date, "d 'de' MMMM", { locale: es })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5 text-primary-600">
                      <DollarSign className="w-5 h-5" />
                      {new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        maximumFractionDigits: 0,
                      }).format(p.amount_expected || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div
                  className={`px-6 py-2.5 rounded-2xl text-base font-black border flex items-center gap-3 shadow-sm ${status.color}`}
                >
                  <span className="scale-110">{status.icon}</span>
                  {status.label}
                </div>
                {p.status === "PENDING_PAYMENT" && (
                  <Link
                    href={`/paciente/pagar/${p.appointment_id}`}
                    className="text-primary-600 font-black text-base hover:underline decoration-2 underline-offset-4"
                  >
                    Pagar ahora
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
