"use client";

import { motion } from "framer-motion";
import {
  ChevronLeft,
  Calendar,
  List,
  CreditCard,
  CheckCircle,
  XCircle,
  Receipt,
  Minus,
  Plus,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO, isPast } from "date-fns";
import { es } from "date-fns/locale";
import { getPaymentDetails, approvePayment, rejectPayment } from "./actions";

interface PaymentData {
  id: string;
  status: string;
  amount: number;
  amount_expected: number;
  amount_declared: number;
  patient_id: string;
  profiles: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
  appointments: {
    start_at: string;
    duration_minutes: number;
    patient?: {
      full_name: string;
      email: string;
      avatar_url?: string;
    } | null;
  };
}

export default function PaymentApproval() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id as string;

  const [scale, setScale] = useState(100);
  const [data, setData] = useState<PaymentData | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");

  useEffect(() => {
    async function fetchPayment() {
      try {
        const res = await getPaymentDetails(paymentId);
        if (res.error) {
          setError(res.error);
        } else {
          setData((res.payment as unknown as PaymentData) || null);
          setSignedUrl(res.signedUrl || null);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Error de red o servidor al cargar detalles.");
      } finally {
        setLoading(false);
      }
    }
    if (paymentId) fetchPayment();
  }, [paymentId]);

  const handleApprove = () => {
    startTransition(async () => {
      setError(null);
      const res = await approvePayment(paymentId);
      if (res?.error) setError(res.error);
      else {
        alert("Pago aprobado exitosamente.");
        router.push("/admin/dashboard");
      }
    });
  };

  const handleReject = () => {
    if (!reason || reason.length < 5) return;

    startTransition(async () => {
      setError(null);
      const res = await rejectPayment(paymentId, reason);
      if (res?.error) setError(res.error);
      else {
        alert("Pago rechazado.");
        router.push("/admin/dashboard");
      }
    });
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );

  if (error || !data)
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">
            {error || "No se encontró el pago"}
          </h2>
          <Link
            href="/admin/dashboard"
            className="text-primary-600 font-bold mt-4 inline-block"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );

  const patient = data.appointments.patient || data.profiles;
  const amountsMatch =
    Number(data.amount_expected) === Number(data.amount_declared);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="fixed md:relative z-40 w-64 h-full flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform duration-300 md:translate-x-0 -translate-x-full">
        <div className="flex h-24 items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Logo"
                width={120}
                height={120}
                className="h-16 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">
                PSICOCONNECT
              </span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mt-0.5">
                Panel Profesional
              </span>
            </div>
          </Link>
        </div>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-6">
          <nav className="flex flex-col gap-1">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-colors"
            >
              <List className="w-5 h-5" /> Dashboard
            </Link>
            <Link
              href="/admin/availability"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-colors"
            >
              <Calendar className="w-5 h-5" /> Agenda Virtual
            </Link>
            <Link
              href="/admin/payments"
              className="flex items-center gap-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 px-4 py-3 text-base font-bold text-primary-700 dark:text-primary-300"
            >
              <CreditCard className="w-5 h-5" /> Pagos
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-col flex-1 overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold leading-tight text-slate-900 dark:text-white">
                  Verificación de Pago
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    {data.status === "pending_approval"
                      ? "Pendiente de Revisión"
                      : data.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Split View */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left Panel: Visual (Image Viewer) */}
          <div className="relative flex-1 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden group/image-viewer p-8 h-full">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(currentColor 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            ></div>

            {signedUrl ? (
              <motion.div
                className="relative shadow-2xl rounded-2xl overflow-hidden max-h-full max-w-full transition-transform duration-200 border border-slate-200 dark:border-slate-800 bg-white dark:bg-black/50 p-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ transform: `scale(${scale / 100})` }}
              >
                <Image
                  alt="Comprobante de pago"
                  className="object-contain max-h-[70vh] rounded-xl"
                  src={signedUrl}
                  width={600}
                  height={800}
                  unoptimized
                />
              </motion.div>
            ) : (
              <div className="text-slate-400">No hay comprobante cargado.</div>
            )}

            {/* Floating Image Controls */}
            {signedUrl && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-2xl rounded-full px-5 py-3 border border-slate-200 dark:border-slate-700 opacity-0 group-hover/image-viewer:opacity-100 transition-opacity duration-300 z-10">
                <button
                  onClick={() => setScale(Math.max(50, scale - 10))}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-sm font-bold w-12 text-center text-slate-900 dark:text-white">
                  {scale}%
                </span>
                <button
                  onClick={() => setScale(Math.min(200, scale + 10))}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Panel: Data & Actions */}
          <div className="w-full lg:w-[480px] xl:w-[520px] flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full overflow-hidden shrink-0 z-10">
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              {/* Patient Profile */}
              <motion.div
                className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 shadow-sm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="relative shrink-0">
                  <div
                    className="h-16 w-16 rounded-full bg-cover bg-center ring-4 ring-white dark:ring-slate-900 shadow-md"
                    style={{
                      backgroundImage: `url(${patient?.avatar_url || "https://api.dicebear.com/7.x/initials/svg?seed=" + (patient?.full_name || "Usuario")})`,
                    }}
                  ></div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                    {patient?.full_name || "Usuario"}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-2 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-md w-fit text-sm font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Próxima:{" "}
                      {format(parseISO(data.appointments.start_at), "PPP p", {
                        locale: es,
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Financial Comparison */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" /> Verificación Financiera
                </h4>
                <div
                  className={`rounded-2xl p-6 border ${amountsMatch ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30" : "bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30"}`}
                >
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-5 pb-5 border-b border-dashed ${amountsMatch ? "border-emerald-200 dark:border-emerald-800/50" : "border-red-200 dark:border-red-800/50"}`}
                  >
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Monto Esperado
                      </p>
                      <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                        }).format(data.amount_expected || 0)}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Declarado
                      </p>
                      <p
                        className={`text-4xl font-black tracking-tight mt-1 ${amountsMatch ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                        }).format(data.amount_declared || 0)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`flex items-start gap-3 text-base font-medium ${amountsMatch ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}
                  >
                    {amountsMatch ? (
                      <CheckCircle className="w-6 h-6 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 shrink-0 mt-0.5" />
                    )}
                    <p className="leading-relaxed">
                      {amountsMatch
                        ? "Los montos coinciden perfectamente. Verifica la imagen adjunta antes de aprobar."
                        : "Hay una diferencia entre el monto esperado y el declarado por el paciente. Por favor verifica detalladamente."}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Rejection Flow */}
              <motion.div
                className="pt-6 border-t border-slate-200 dark:border-slate-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <details className="group/rejection">
                  <summary className="list-none cursor-pointer flex items-center justify-between py-3 px-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-sm font-bold text-red-600 dark:text-red-400 transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30">
                    <span>¿Necesitas rechazar este pago?</span>
                    <ChevronLeft className="w-5 h-5 group-open/rejection:-rotate-90 transition-transform" />
                  </summary>
                  <div className="pt-4 pb-2 animate-in slide-in-from-top-2 fade-in duration-200 px-2 mt-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                      Motivo del rechazo
                    </label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {[
                        "Monto Incorrecto",
                        "Recibo Ilegible",
                        "Transacción Duplicada",
                      ].map((r) => (
                        <button
                          key={r}
                          onClick={(e) => {
                            e.preventDefault();
                            setReason(r);
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold border-2 border-slate-200 hover:border-red-500 hover:text-red-600 hover:bg-red-50 bg-white dark:bg-slate-800 dark:border-slate-700 transition-all"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:border-red-500 focus:ring-0 p-4 resize-none shadow-sm"
                      placeholder="Agrega una nota explicando por qué el pago está siendo rechazado..."
                      rows={3}
                    ></textarea>
                  </div>
                </details>
              </motion.div>

              {/* Past Date Warning */}
              {isPast(parseISO(data.appointments.start_at)) &&
                data.status === "pending_approval" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 shadow-sm"
                  >
                    <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm font-black text-amber-900 leading-tight">
                        ⚠️ ¡Atención Profesional!
                      </p>
                      <p className="text-xs font-medium text-amber-700 mt-1 leading-relaxed">
                        La fecha de esta cita ya pasó (fue el{" "}
                        {format(parseISO(data.appointments.start_at), "PPP p", {
                          locale: es,
                        })}
                        ). Aprobarla creará un evento en el pasado y se enviará
                        el link de Meet tarde. Considera contactar al paciente
                        para reagendar antes de aprobar.
                      </p>
                    </div>
                  </motion.div>
                )}
            </div>

            {/* Action Footer */}
            {data.status === "pending_approval" && (
              <div className="shrink-0 p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-4">
                <button
                  disabled={isPending || !reason || reason.length < 5}
                  onClick={handleReject}
                  className={`flex-1 px-4 py-4 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all 
                  ${!reason || reason.length < 5 || isPending ? "border-slate-200 text-slate-400 cursor-not-allowed text-xs" : "border-red-100 text-red-600 hover:bg-red-50"}`}
                >
                  <XCircle className="w-5 h-5 hidden sm:block" /> Rechazar
                </button>
                <button
                  disabled={isPending}
                  onClick={handleApprove}
                  className="flex-2 px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />{" "}
                  {isPending ? "Procesando..." : "Aprobar Pago"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
