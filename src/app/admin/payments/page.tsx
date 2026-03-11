"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  Calendar,
  CreditCard,
  Receipt,
  User,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Sidebar } from "@/components/admin/Sidebar";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getPendingPayments } from "./actions";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Payment {
  id: string;
  amount_expected: number;
  amount_declared: number;
  created_at: string;
  status: string;
  appointments: {
    id: string;
    start_at: string;
    status: string;
    patient: {
      full_name: string;
      avatar_url?: string;
    }[];
  }[];
}

export default function PendingPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadPayments() {
      const res = await getPendingPayments();
      if (!ignore) {
        if (res.error) {
          setError(res.error);
        } else {
          setPayments(res.payments || []);
        }
        setLoading(false);
      }
    }
    loadPayments();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      {/* Main Content */}
      <main className="flex flex-col flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-3xl font-black leading-tight text-slate-900 dark:text-white tracking-tight">
              Pagos Pendientes de Revisión
            </h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {loading ? (
            <div className="text-center text-slate-500 mt-10">
              Cargando pagos pendientes...
            </div>
          ) : error ? (
            <div className="text-center text-red-500 mt-10">{error}</div>
          ) : payments.length === 0 ? (
            <div className="text-center text-slate-500 mt-10 border-2 border-dashed border-slate-300 dark:border-slate-700 p-12 rounded-3xl bg-white dark:bg-slate-800">
              <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="font-bold text-lg text-slate-900 dark:text-white">
                Todo al día
              </p>
              <p>No tienes comprobantes de pago pendientes por revisar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {payments.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/payments/${p.id}`}
                  className="block"
                >
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="relative bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200/60 dark:border-slate-700/50 hover:border-primary-300 dark:hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/5 transition-all group overflow-hidden"
                  >
                    {/* Status accent side bar */}
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-400 dark:bg-orange-500/80 rounded-l-full"></div>

                    {/* Patient info */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <div
                          className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-600 flex items-center justify-center shadow-inner"
                          style={{
                            backgroundImage: p.appointments?.[0]?.patient?.[0]?.avatar_url
                              ? `url(${p.appointments[0].patient[0].avatar_url})`
                              : "none",
                          }}
                        >
                          {!p.appointments?.[0]?.patient?.[0]?.avatar_url && (
                            <User className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center">
                          <Receipt className="w-3 h-3 text-orange-500" />
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-black text-slate-900 dark:text-white truncate text-xl tracking-tight">
                          {p.appointments?.[0]?.patient?.[0]?.full_name}
                        </p>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-base font-bold">
                            {format(
                              parseISO(p.appointments?.[0]?.start_at || new Date().toISOString()),
                              "EEEE d 'de' MMMM",
                              {
                                locale: es,
                              },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Amount area */}
                    <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100/50 dark:border-slate-800/50">
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          Monto Declarado
                        </span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      </div>
                      <p className="font-black text-emerald-600 dark:text-emerald-400 text-4xl tracking-tighter">
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          maximumFractionDigits: 0,
                        }).format(p.amount_declared)}
                      </p>
                    </div>

                    {/* Action area */}
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-5">
                      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/30 px-3 py-1.5 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-sm font-bold uppercase tracking-wider">
                          Hace{" "}
                          {formatDistanceToNow(parseISO(p.created_at), {
                            locale: es,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-black text-lg bg-primary-50 dark:bg-primary-900/20 px-5 py-2.5 rounded-xl group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-primary-500/30">
                        Validar{" "}
                        <ArrowRight className="w-5 h-5 translate-x-0 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
