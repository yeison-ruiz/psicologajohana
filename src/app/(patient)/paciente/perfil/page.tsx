"use client";

import { motion } from "framer-motion";
import {
  User,
  Settings,
  Lock,
  Download,
  Trash2,
  Phone,
  Mail,
} from "lucide-react";
import { useState, useEffect, useTransition } from "react";
import {
  getPatientProfile,
  updateProfile,
  exportMyData,
  requestAccountDeletion,
} from "./actions";

export default function MiPerfil() {
  const [data, setData] = useState<{
    user: import("@supabase/supabase-js").User;
    profile: {
      full_name: string;
      phone_number: string | null;
      notification_preferences: Record<string, unknown> | null;
    } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [successProfile, setSuccessProfile] = useState<boolean>(false);
  const [isPendingProfile, startProfile] = useTransition();

  const [confirmText, setConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPendingDelete, startDelete] = useTransition();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await getPatientProfile();
      setData(result);
      setLoading(false);
    }
    load();
  }, []);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startProfile(async () => {
      setErrorProfile(null);
      setSuccessProfile(false);
      const res = await updateProfile(formData);
      if (res.error) setErrorProfile(res.error);
      else setSuccessProfile(true);
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    const res = await exportMyData();
    setIsExporting(false);
    if (!res.error && res.data) {
      // Create a downloadable blob
      const blob = new Blob([res.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "MisDatos_PSICOCONNECT.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      alert("Error al intentar exportar los datos.");
    }
  };

  const handleDelete = async () => {
    startDelete(async () => {
      setDeleteError(null);
      const res = await requestAccountDeletion(confirmText);
      if (res?.error) {
        setDeleteError(res.error);
      }
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tight leading-none">
            Mi Perfil
          </h1>
          <p className="text-slate-600 dark:text-slate-300 font-black text-xl leading-relaxed">
            Gestiona tu información personal, notificaciones y privacidad.
          </p>
        </motion.div>

        {/* User Info Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            <Settings className="h-7 w-7 text-primary-600" />
            Información Personal
          </h2>
          <form
            onSubmit={handleUpdate}
            className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:p-8"
          >
            {errorProfile && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-lg font-black text-red-600 shadow-sm leading-relaxed">
                {errorProfile}
              </div>
            )}
            {successProfile && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-lg font-black text-emerald-600 shadow-sm leading-relaxed">
                Perfil guardado exitosamente.
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-lg font-black text-slate-700 dark:text-slate-300 ml-1">
                  Nombre Completo
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <User className="w-6 h-6" />
                  </span>
                  <input
                    name="full_name"
                    defaultValue={data?.profile?.full_name}
                    required
                    className="w-full h-14 pl-14 pr-4 text-xl rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 outline-none focus:ring-2 ring-primary-500 font-black transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-lg font-black text-slate-700 dark:text-slate-300 ml-1">
                  Teléfono
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <Phone className="w-6 h-6" />
                  </span>
                  <input
                    name="phone_number"
                    defaultValue={data?.profile?.phone_number || ""}
                    className="w-full h-14 pl-14 pr-4 text-xl rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 outline-none focus:ring-2 ring-primary-500 font-black transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-lg font-black text-slate-700 dark:text-slate-300 ml-1">
                  Correo Electrónico (Solo Lectura)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400">
                    <Mail className="w-6 h-6" />
                  </span>
                  <input
                    value={data?.user?.email}
                    disabled
                    className="w-full h-14 pl-14 pr-4 text-xl rounded-2xl border border-slate-100 bg-slate-100 text-slate-400 font-black cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={isPendingProfile}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-black h-14 px-12 rounded-2xl transition-all shadow-xl shadow-primary-500/20 active:scale-95 text-xl"
              >
                {isPendingProfile ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </motion.div>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* Account Deletion Only */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col gap-6 p-6 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-800/20">
              <div className="flex flex-col gap-2">
                <h3 className="font-black text-red-900 dark:text-red-100 text-2xl tracking-tight leading-none mb-3">
                  Cerrar mi Cuenta
                </h3>
                <p className="text-lg font-black text-red-700 dark:text-red-300 max-w-xl leading-relaxed">
                  Si cierras tu cuenta, ya no podrás acceder al portal. Tus
                  datos personales básicos serán eliminados.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-end gap-3 pt-2">
                <div className="flex flex-col gap-1.5 w-full sm:flex-1">
                  <span className="text-xs font-black text-red-900/60 uppercase tracking-widest ml-1 mb-2 block">
                    Confirmación de Seguridad
                  </span>
                  <input
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder='Escribe "ELIMINAR MI CUENTA"'
                    className="w-full h-14 px-5 text-lg rounded-2xl border-2 border-red-200 bg-white/50 dark:bg-slate-900/50 outline-none focus:ring-4 ring-red-500/10 focus:border-red-500 placeholder:text-red-200 transition-all font-black text-slate-900"
                  />
                </div>
                <button
                  onClick={handleDelete}
                  disabled={
                    isPendingDelete || confirmText !== "ELIMINAR MI CUENTA"
                  }
                  className="shrink-0 flex items-center justify-center gap-3 bg-red-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-red-700 text-white font-black px-10 h-14 rounded-2xl transition-all shadow-xl shadow-red-500/20 active:scale-95 text-lg"
                >
                  <Trash2 className="w-6 h-6" />
                  {isPendingDelete ? "Procesando..." : "Confirmar Cierre"}
                </button>
              </div>
              {deleteError && (
                <p className="text-base font-black text-red-600 bg-white/50 dark:bg-red-900/20 p-4 rounded-xl border-2 border-red-100 dark:border-red-800/50 shadow-sm">
                  {deleteError}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
