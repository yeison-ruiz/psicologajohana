"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 
            className="text-9xl font-black text-slate-100 mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            404
          </h1>
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            Página no encontrada
          </h2>
          <p className="text-slate-500 mb-10 font-medium leading-relaxed">
            Lo sentimos, la página que buscas no existe o ha sido movida. 
            Permítenos ayudarte a encontrar el camino de regreso.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#8A6046] text-white rounded-full font-bold hover:bg-[#6F4E37] transition-all shadow-lg shadow-[#8A6046]/20"
            >
              <Home size={18} />
              Volver al inicio
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 text-slate-700 rounded-full font-bold hover:bg-slate-200 transition-all"
            >
              <ArrowLeft size={18} />
              Regresar
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
