"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { 
  Save, 
  DollarSign, 
  Smartphone, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Menu
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { setAdminSidebarOpen } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nequiNumber, setNequiNumber] = useState("");
  const [daviplataNumber, setDaviplataNumber] = useState("");
  const [sessionPrice, setSessionPrice] = useState("");
  const [hasGoogle, setHasGoogle] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("psicologa_settings")
        .select("*")
        .eq("psicologa_id", user.id)
        .single();

      if (data) {
        setNequiNumber(data.nequi_number || "");
        setDaviplataNumber(data.daviplata_number || "");
        setSessionPrice(data.session_price?.toString() || "");
        setHasGoogle(!!data.google_access_token);
      }
      setLoading(false);
    }
    loadSettings();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const price = sessionPrice ? parseFloat(sessionPrice) : null;

    if (sessionPrice && isNaN(price!)) {
      setMessage({
        type: "error",
        text: "El precio debe ser un número válido.",
      });
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("psicologa_settings").upsert(
      {
        psicologa_id: user?.id,
        nequi_number: nequiNumber,
        daviplata_number: daviplataNumber,
        session_price: price,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "psicologa_id" },
    );

    if (error) {
      setMessage({
        type: "error",
        text: `Error al guardar: ${error.message}`,
      });
    } else {
      setMessage({ type: "success", text: "Ajustes guardados correctamente." });
    }
    setSaving(false);
  };

  const connectGoogle = () => {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/admin/settings`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        scopes: "https://www.googleapis.com/auth/calendar.events",
      },
    });
  };

  if (loading) return <div className="p-8">Cargando...</div>;

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 flex flex-col gap-8">
        <header className="mb-4 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <button
               className="text-slate-500 md:hidden hover:text-slate-700 dark:text-slate-400 p-2"
               onClick={() => setAdminSidebarOpen(true)}
             >
               <Menu className="w-6 h-6" />
             </button>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Configuración
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-bold text-lg">
            Gestiona tu cuenta, métodos de pago y conexión con Google Calendar.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nequi & Price Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
                <Smartphone className="text-primary-600 dark:text-primary-400 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                Pagos y Tarifas
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Número Nequi
                </label>
                <input
                  type="text"
                  value={nequiNumber}
                  onChange={(e) => setNequiNumber(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-primary-500 outline-none transition-all font-bold text-lg"
                  placeholder="Ej: 300 000 0000"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Número Daviplata
                </label>
                <input
                  type="text"
                  value={daviplataNumber}
                  onChange={(e) => setDaviplataNumber(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-primary-500 outline-none transition-all font-bold text-lg"
                  placeholder="Ej: 300 000 0000"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Precio por Sesión (COP)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                  <input
                    type="text"
                    value={sessionPrice}
                    onChange={(e) => setSessionPrice(e.target.value)}
                    className="w-full pl-14 pr-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-primary-500 outline-none transition-all font-bold text-xl text-primary-600"
                    placeholder="Ej: 100000"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Google Calendar Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                <ExternalLink className="text-emerald-600 dark:text-emerald-400 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                Integración Google
              </h2>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 mb-6 text-center">
              {hasGoogle ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Conectado
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 font-bold">
                    Tu agenda está sincronizada con Google Calendar.
                  </p>
                  <button
                    onClick={connectGoogle}
                    className="mt-4 text-emerald-600 hover:text-emerald-700 font-black text-sm uppercase tracking-widest"
                  >
                    Reconectar cuenta
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-4">
                  <p className="text-slate-600 dark:text-slate-400 font-bold max-w-xs mx-auto">
                    Conecta tu cuenta de Google para crear automáticamente links
                    de Meet al confirmar pagos.
                  </p>
                  <button
                    onClick={connectGoogle}
                    className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black transition-all shadow-lg shadow-emerald-200 dark:shadow-none"
                  >
                    Conectar Google Calendar
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "p-6 rounded-3xl flex items-center gap-4 font-bold text-lg",
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-red-50 text-red-700 border border-red-100",
            )}
          >
            {message.type === "success" ? <CheckCircle2 /> : <AlertCircle />}
            {message.text}
          </motion.div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-3 px-10 py-5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-2xl shadow-slate-300 dark:shadow-none"
          >
            {saving ? (
              "Guardando..."
            ) : (
              <>
                <Save className="w-6 h-6" /> Guardar Cambios
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
