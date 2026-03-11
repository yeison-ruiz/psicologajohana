"use client";

import { motion } from "framer-motion";
import {
  ChevronDown,
  ArrowLeft,
  Copy,
  HelpCircle,
  UploadCloud,
  Lock,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function UploadPayment() {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-10 py-4 sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <Image
              src="/logo.png"
              alt="Logo"
              width={120}
              height={120}
              className="h-14 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black text-slate-900 dark:text-white leading-none tracking-tighter">
              Psicóloga Johana Villabón
            </span>
            <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] mt-0.5">
              Portal Paciente
            </span>
          </div>
        </Link>
        <div className="flex flex-1 justify-end gap-8 items-center">
          <div className="hidden md:flex items-center gap-9">
            <Link
              href="/appointments"
              className="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal hover:text-primary-600 transition-colors"
            >
              Citas
            </Link>
            <Link
              href="/payments"
              className="text-primary-600 dark:text-primary-400 text-sm font-medium leading-normal"
            >
              Pagos
            </Link>
            <Link
              href="/profile"
              className="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal hover:text-primary-600 transition-colors"
            >
              Mi Perfil
            </Link>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
          <div className="flex items-center gap-3 cursor-pointer group">
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full w-9 h-9 border border-slate-200 dark:border-slate-700"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=250&auto=format&fit=crop")',
              }}
            ></div>
            <span className="text-sm font-medium hidden sm:block group-hover:text-primary-600 transition-colors">
              David Miller
            </span>
            <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-primary-600 transition-colors" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 md:px-10 py-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb / Back Link */}
        <div className="mb-8">
          <Link
            href="/appointments"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Citas
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Instructions & Status */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Status Card */}
            <motion.div
              className="glass dark:bg-slate-800/80 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 text-xs font-bold tracking-wide uppercase border border-orange-200 dark:border-orange-800/50">
                  Esperando Comprobante
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                  Intento 1 de 3
                </span>
              </div>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Subir Comprobante
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">
                Sesión con Psicóloga Johana Villabón
                <br />
                <span className="text-slate-400 dark:text-slate-500 mt-1 block">
                  24 Oct, 2023 • 10:00 AM
                </span>
              </p>

              <div className="h-px bg-slate-200 dark:bg-slate-700 w-full mb-6"></div>

              {/* Nequi Info */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2a004f] flex items-center justify-center text-white font-bold text-lg shadow-md">
                    N
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
                      Método de Pago
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Transferencia Nequi
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Número de Celular
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-mono font-medium text-slate-900 dark:text-white">
                        832 376 8933
                      </p>
                      <button
                        className="text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 p-1.5 rounded transition-colors"
                        title="Copiar número"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-700 w-full"></div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Monto Total
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      $150,000 COP
                    </p>
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-700 w-full"></div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Referencia (Opcional)
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Sesión #8492
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Help Card */}
            <motion.div
              className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 border border-primary-100 dark:border-primary-800/30 flex gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <HelpCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  ¿Necesitas ayuda con el pago?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Si tienes algún problema con Nequi o al subir el archivo, por
                  favor contacta a soporte o directamente a tu especialista.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Upload Zone */}
          <motion.div
            className="lg:col-span-8 h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="glass dark:bg-slate-800/80 rounded-xl p-8 border border-slate-200 dark:border-slate-700 h-full flex flex-col shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Comprobante de Pago
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Por favor sube una captura de pantalla o PDF de tu transferencia
                exitosa. Asegúrate de que la fecha y el monto sean claramente
                visibles.
              </p>

              {/* Drag & Drop Zone */}
              <div
                className={`flex-1 min-h-[400px] flex flex-col justify-center items-center rounded-xl transition-all duration-300 cursor-pointer relative overflow-hidden
                  border-2 border-dashed ${isHovering ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-primary-600/30 bg-slate-50 dark:bg-slate-900/30 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/10"}`}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsHovering(true);
                }}
                onDragLeave={() => setIsHovering(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsHovering(false);
                }}
              >
                {/* Content inside drop zone */}
                <div className="flex flex-col items-center gap-4 z-10 p-6 text-center">
                  <div
                    className={`w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-primary-600 transition-transform duration-300 ${isHovering ? "scale-110" : ""}`}
                  >
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      Haz clic para subir o arrastra y suelta
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      PNG, JPG o PDF (máx. 5MB)
                    </p>
                  </div>
                  <button className="mt-4 px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                    Explorar Archivos
                  </button>
                </div>
              </div>

              {/* Secure Notice & Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-6 sm:gap-4 sm:items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                  <Lock className="w-4 h-4" />
                  <span>Las transferencias son encriptadas y seguras.</span>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                    Cancelar
                  </button>
                  <button className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-md shadow-primary-600/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5">
                    <span>Confirmar Pago</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Previous Uploads / History Section */}
        <motion.div
          className="mt-12 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            Historial de Pagos para esta Cita
          </h3>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs py-3 uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="px-6 py-4 font-semibold">Fecha</th>
                    <th className="px-6 py-4 font-semibold">
                      Nombre de Archivo
                    </th>
                    <th className="px-6 py-4 font-semibold">Estado</th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  <tr className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-5 text-sm font-medium text-slate-600 dark:text-slate-300">
                      24 Oct, 2023 10:45 AM
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      nequi_comprobante_error.jpg
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800/50 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Rechazado
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-bold bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 px-3 py-1.5 rounded-md transition-colors">
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
            © 2026 - Psicóloga Johana Villabón. Todos los derechos reservados.
          </div>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors"
            >
              Política de Privacidad
            </Link>
            <Link
              href="/terms"
              className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors"
            >
              Términos de Servicio
            </Link>
            <Link
              href="/help"
              className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors"
            >
              Centro de Ayuda
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
