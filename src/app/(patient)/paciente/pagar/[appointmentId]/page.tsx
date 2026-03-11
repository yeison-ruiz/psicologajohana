"use client";

import { motion } from "framer-motion";
import {
  UploadCloud,
  FileImage,
  Clock,
  CalendarCheck,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useTransition } from "react";
import { getAppointmentPaymentDetails, uploadPaymentProof } from "./actions";
import { useParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import imageCompression from "browser-image-compression";

interface AppointmentWithPayments {
  id: string;
  start_at: string;
  duration_minutes: number;
  status: string;
  payments: {
    amount_expected: number;
    status: string;
    attempt_count: number;
  }[];
}

export default function PagarCitaPage() {
  const params = useParams();
  const appointmentId = params.appointmentId as string;

  const [appointment, setAppointment] = useState<{
    id: string;
    start_at: string;
    duration_minutes: number;
    status: string;
    payments: {
      amount_expected: number;
      status: string;
      attempt_count: number;
    }[];
  } | null>(null);
  const [settings, setSettings] = useState<{
    nequi_number?: string;
    daviplata_number?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedMethod, setSelectedMethod] = useState<"nequi" | "daviplata">(
    "nequi",
  );

  useEffect(() => {
    async function load() {
      const res = await getAppointmentPaymentDetails(appointmentId);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setAppointment((res?.appointment as AppointmentWithPayments) || null);
        setSettings(res?.settings || null);
        setLoading(false);
      }
    }
    load();
  }, [appointmentId]);

  const MAX_FILE_SIZE_MB = 5;

  const processFileSelection = async (selected: File) => {
    setUploadError(null);
    if (
      selected.type === "application/pdf" &&
      selected.size > MAX_FILE_SIZE_MB * 1024 * 1024
    ) {
      setUploadError(
        `El archivo PDF es muy pesado. El límite es de ${MAX_FILE_SIZE_MB}MB. Por favor optimízalo.`,
      );
      setFile(null);
      return;
    }

    const processed = await compressImageIfPossible(selected);

    if (processed.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setUploadError(
        `El archivo final es demasiado pesado (${(processed.size / 1024 / 1024).toFixed(1)}MB). Límite: ${MAX_FILE_SIZE_MB}MB.`,
      );
      setFile(null);
      return;
    }

    setFile(processed);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFileSelection(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const compressImageIfPossible = async (
    fileToCompress: File,
  ): Promise<File> => {
    if (fileToCompress.type === "application/pdf") return fileToCompress;

    try {
      const compressedBlob = await imageCompression(fileToCompress, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      });
      // Convert Blob back to File to maintain the name
      return new File([compressedBlob], fileToCompress.name, {
        type: compressedBlob.type,
      });
    } catch (err) {
      console.error("Compression error:", err);
      return fileToCompress;
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    startTransition(async () => {
      setUploadError(null);
      const formData = new FormData(e.target as HTMLFormElement);
      // It includes "proof" via the input name='proof' if we append it
      formData.set("proof", file);
      // We also need to send the expected amount as declared amount by default
      formData.set(
        "amount",
        appointment?.payments?.[0]?.amount_expected?.toString() || "0",
      );

      const res = await uploadPaymentProof(appointmentId, formData);
      if (res?.error) {
        setUploadError(res.error);
      } else {
        // Redirection is handled by the server action
      }
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Cargando detalles de pago...
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            ⚠️
          </div>
          <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
            Error de Carga
          </h2>
          <p className="text-slate-500 mb-6">
            {error || "Cita no encontrada."}
          </p>
          <Link
            href="/dashboard"
            className="text-primary-600 hover:underline font-bold"
          >
            Volver al Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const paymentData = appointment?.payments?.[0];

  return (
    <div className="max-w-4xl w-full mx-auto flex flex-col lg:flex-row gap-8 pb-12">
      {/* Left Col: Selector & Upload */}
      <div className="flex-1 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight leading-none">
            Elige tu método de pago
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8 font-black text-lg leading-relaxed">
            Transfiere el valor exacto a la cuenta de tu elección y sube el
            comprobante.
          </p>

          <div className="flex gap-3 mb-8 p-1.5 bg-slate-100 dark:bg-slate-700 rounded-2xl">
            <button
              onClick={() => setSelectedMethod("nequi")}
              className={`flex-1 py-5 rounded-xl font-black text-base transition-all ${selectedMethod === "nequi" ? "bg-white dark:bg-slate-800 text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Nequi
            </button>
            <button
              onClick={() => setSelectedMethod("daviplata")}
              className={`flex-1 py-5 rounded-xl font-black text-base transition-all ${selectedMethod === "daviplata" ? "bg-white dark:bg-slate-800 text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Daviplata
            </button>
          </div>

          <div
            className={`p-6 rounded-2xl flex items-center justify-between shadow-md overflow-hidden relative transition-colors duration-500
              ${selectedMethod === "nequi" ? "bg-[#1c0b2b]" : "bg-[#ed1c24]"}
            `}
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-30 pointer-events-none transition-colors duration-500
                ${selectedMethod === "nequi" ? "bg-[#FF007F]" : "bg-white"}
              `}
            ></div>
            <div className="relative z-10 space-y-2 text-white">
              <p className="font-black text-lg uppercase tracking-widest mb-2 opacity-80">
                {selectedMethod === "nequi" ? "Nequi Personal" : "Daviplata"}
              </p>
              <p className="text-3xl font-black tracking-widest leading-none">
                {selectedMethod === "nequi"
                  ? settings?.nequi_number || "Por definir"
                  : settings?.daviplata_number || "Por definir"}
              </p>
              <p className="font-black text-lg pt-3 opacity-90">
                Beneficiario: Psicóloga Johana Villabón
              </p>
            </div>
            <div
              className={`relative z-10 w-16 h-16 rounded-xl flex items-center justify-center shrink-0 shadow-lg rotate-3 text-white
                ${selectedMethod === "nequi" ? "bg-[#FF007F]" : "hidden"}
              `}
            >
              <span className="font-extrabold text-2xl">
                {selectedMethod === "nequi" ? "N" : "D"}
              </span>
            </div>
            {selectedMethod === "daviplata" && (
              <div className="relative z-10 w-16 h-16 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-lg -rotate-3">
                <span className="font-black text-[#ed1c24] text-2xl">D</span>
              </div>
            )}
          </div>
        </motion.div>

        <form onSubmit={handleUpload}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 tracking-tight">
              <UploadCloud className="w-8 h-8 text-primary-500" />
              Sube tu comprobante
            </h3>

            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer 
                  ${file ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10" : "border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}
                `}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              {!file ? (
                <div className="flex flex-col items-center">
                  <FileImage className="w-12 h-12 text-slate-400 mb-4" />
                  <p className="text-slate-700 dark:text-slate-300 font-black mb-2 text-lg">
                    Arrastra tu comprobante aquí
                  </p>
                  <p className="text-slate-500 text-base font-black">
                    o haz clic para seleccionar (JPG, PNG, PDF)
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-primary-700 dark:text-primary-300">
                  <CheckCircle className="w-12 h-12 mb-4 text-primary-500" />
                  <p className="font-black text-lg">{file.name}</p>
                  <p className="text-sm font-bold opacity-80 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="mt-6 text-lg font-black underline decoration-2 underline-offset-4 hover:text-primary-800 dark:hover:text-primary-400"
                  >
                    Eliminar y seleccionar otro
                  </button>
                </div>
              )}
              <input
                type="file"
                name="proof"
                id="fileInput"
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
              />
            </div>

            {uploadError && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800/50 text-base font-bold">
                {uploadError}
              </div>
            )}

            <p className="text-center text-sm text-slate-400 font-black mt-4">
              Intento {paymentData?.attempt_count + 1 || 1} de 3
            </p>

            <button
              type="submit"
              disabled={!file || isPending}
              className={`w-full mt-6 py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl text-lg
                  ${!file || isPending ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/30 hover:-translate-y-1 active:scale-95"}
                `}
            >
              {isPending ? "Validando y subiendo..." : "Enviar Comprobante"}
            </button>
          </motion.div>
        </form>
      </div>

      {/* Right Col: Appointment Info */}
      <div className="w-full lg:w-80 shrink-0">
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 sticky top-24"
        >
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-6">
            Detalles de la Cita
          </h3>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 p-3 rounded-2xl shadow-sm border border-primary-100">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-black text-slate-900 dark:text-white capitalize leading-none mb-2">
                  {format(parseISO(appointment.start_at), "eeee, d 'de' MMMM", {
                    locale: es,
                  })}
                </p>
                <p className="text-base font-black text-slate-500">
                  {format(parseISO(appointment.start_at), "h:mm a")}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 p-3 rounded-2xl shadow-sm border border-primary-100">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-base font-black text-slate-900 dark:text-white leading-none">
                  {appointment.duration_minutes} Minutos
                </p>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-700" />

            <div className="flex justify-between items-center">
              <p className="text-slate-500 font-black text-lg tracking-tight">
                Total a Pagar
              </p>
              <p className="text-3xl font-black text-primary-600 dark:text-primary-400 tracking-tighter">
                {new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  maximumFractionDigits: 0,
                }).format(paymentData?.amount_expected || 0)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
