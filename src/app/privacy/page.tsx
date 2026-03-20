"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Shield, Scale, Lock, Heart, FileText } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-600 transition-colors">
              <ArrowLeft className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors" />
            </div>
            <span className="font-black text-slate-900 tracking-tight">Volver al Inicio</span>
          </Link>
          <div className="flex items-center gap-2">
             <Shield className="w-5 h-5 text-primary-600" />
             <span className="text-xs font-black text-primary-600 uppercase tracking-widest">Portal Legal</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 md:py-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-none">
              Política de Tratamiento de <span className="text-primary-600">Datos Personales</span>
            </h1>
            <p className="text-xl text-slate-500 font-black max-w-2xl mx-auto leading-relaxed">
              Tu privacidad y confianza son los pilares de mi práctica profesional.
            </p>
          </div>

          <div className="prose prose-slate prose-xl max-w-none space-y-12">
            {/* Intro */}
            <section className="bg-primary-50/50 p-8 rounded-3xl border border-primary-100">
               <div className="flex items-center gap-3 mb-4">
                  <Scale className="w-8 h-8 text-primary-600" />
                  <h2 className="text-2xl font-black text-slate-900 m-0">Cumplimiento Legal</h2>
               </div>
               <p className="text-slate-700 font-medium leading-relaxed m-0">
                 En cumplimiento de la <strong>Ley 1581 de 2012</strong> y el <strong>Decreto 1377 de 2013</strong> (Colombia), 
                 así como los estándares internacionales de protección de datos (GDPR), informamos a nuestros pacientes 
                 sobre el tratamiento de su información.
               </p>
            </section>

            {/* Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <section className="space-y-4">
                  <div className="flex items-center gap-3">
                     <FileText className="w-6 h-6 text-primary-500" />
                     <h3 className="text-xl font-black text-slate-900 m-0">Finalidad de los Datos</h3>
                  </div>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">
                    Sus datos son recolectados para el agendamiento de citas, la prestación del servicio psicológico 
                    y el registro obligatorio en la Historia Clínica según la ley sanitaria colombiana.
                  </p>
               </section>

               <section className="space-y-4">
                  <div className="flex items-center gap-3">
                     <Heart className="w-6 h-6 text-primary-500" />
                     <h3 className="text-xl font-black text-slate-900 m-0">Secreto Profesional</h3>
                  </div>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">
                    De acuerdo con la <strong>Ley 1090 de 2006</strong>, toda información compartida está protegida 
                    por el Secreto Profesional, garantizando total confidencialidad.
                  </p>
               </section>
            </div>

            <hr className="border-slate-100" />

            {/* Rights */}
            <section className="space-y-6">
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">Tus Derechos (Habeas Data)</h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Conocer, actualizar y rectificar tus datos.",
                    "Solicitar prueba de la autorización otorgada.",
                    "Ser informado sobre el uso de tus datos.",
                    "Revocar autorizaciones (cuando aplique legalmente).",
                    "Acceder de forma gratuita a tu información."
                  ].map((right, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                       <span className="text-base font-black text-slate-700">{right}</span>
                    </div>
                  ))}
               </div>
            </section>

            {/* Contact */}
            <section className="bg-slate-900 text-white p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
               <Lock className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5" />
               <h3 className="text-2xl font-black mb-4 relative z-10">Seguridad Garantizada</h3>
               <p className="text-slate-300 font-medium leading-relaxed mb-6 relative z-10">
                 Contamos con encriptación de grado bancario (SSL 256-bit) para asegurar que tus datos 
                 estén siempre protegidos y fuera del alcance de terceros.
               </p>
               <p className="text-sm font-black text-primary-400 m-0 uppercase tracking-widest relative z-10">
                 Psicóloga Johana Villabón · 2026
               </p>
            </section>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 text-center">
         <p className="text-sm font-black text-slate-400">
           © 2026 · Psicóloga Johana Villabón · Todos los derechos reservados · Colombia
         </p>
      </footer>
    </div>
  );
}
