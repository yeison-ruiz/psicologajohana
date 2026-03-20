"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Shield, Scale, FileCheck, Info, UserCheck } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <Header />
      
      {/* Page Content breadcrumb/back */}
      <div className="bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-200 flex items-center justify-center group-hover:bg-[#8A6046] group-hover:border-[#8A6046] transition-all">
              <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm font-bold text-slate-600 group-hover:text-[#8A6046] transition-colors">Volver al Inicio</span>
          </Link>
          <div className="flex items-center gap-2">
             <Shield className="w-4 h-4 text-[#8A6046]" />
             <span className="text-[10px] font-black text-[#8A6046] uppercase tracking-widest">Portal Legal</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 md:py-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-none">
              Términos y <span className="text-[#8A6046]">Condiciones de Uso</span>
            </h1>
            <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
              Reglas para el uso de nuestra plataforma y servicios de consulta psicológica.
            </p>
          </div>

          <div className="prose prose-slate prose-xl max-w-none space-y-12">
            {/* Intro */}
            <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
               <div className="flex items-center gap-3 mb-4">
                  <Info className="w-8 h-8 text-[#8A6046]" />
                  <h2 className="text-2xl font-black text-slate-900 m-0">Aceptación</h2>
               </div>
               <p className="text-slate-700 font-medium leading-relaxed m-0">
                 Al acceder y utilizar este sitio web, usted acepta cumplir con estos términos. 
                 Si no está de acuerdo, le pedimos amablemente que no utilice nuestros servicios.
               </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <section className="space-y-4">
                  <div className="flex items-center gap-3">
                     <UserCheck className="w-6 h-6 text-[#8A6046]" />
                     <h3 className="text-xl font-black text-slate-900 m-0">Uso del Servicio</h3>
                  </div>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">
                    Las citas agendadas son personales e intransferibles. El usuario se compromete a proporcionar 
                    información veraz para su registro y atención.
                  </p>
               </section>

               <section className="space-y-4">
                  <div className="flex items-center gap-3">
                     <FileCheck className="w-6 h-6 text-[#8A6046]" />
                     <h3 className="text-xl font-black text-slate-900 m-0">Cancelaciones</h3>
                  </div>
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">
                    Toda cancelación debe realizarse con al menos 24 horas de antelación para permitir la reasignación 
                    del espacio a otros pacientes.
                  </p>
               </section>
            </div>

            <hr className="border-slate-100" />

            {/* Responsabilidades */}
            <section className="space-y-6">
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">Responsabilidades del Consultante</h3>
               <div className="grid grid-cols-1 gap-4">
                  {[
                    "Asistir puntualmente a las sesiones virtuales programadas.",
                    "Contar con una conexión a internet estable y un espacio privado.",
                    "Realizar el pago correspondiente antes de la sesión para confirmar el agendamiento.",
                    "Respetar el entorno profesional y los tiempos asignados a la consulta."
                  ].map((rule, i) => (
                    <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="w-2 h-2 rounded-full bg-[#8A6046] shrink-0" />
                       <span className="text-base font-bold text-slate-700">{rule}</span>
                    </div>
                  ))}
               </div>
            </section>

            {/* General Policy */}
            <section className="bg-slate-900 text-white p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
               <Scale className="absolute -right-8 -bottom-8 w-40 h-40 text-white/5" />
               <h3 className="text-2xl font-black mb-4 relative z-10">Marco Regulatorio</h3>
               <p className="text-slate-300 font-medium leading-relaxed mb-6 relative z-10">
                 Nuestros servicios se rigen por la ética profesional de la psicología en Colombia y las 
                 normas de telemedicina vigentes. Nos reservamos el derecho de modificar estos términos.
               </p>
               <div className="flex items-center gap-2 text-sm font-black text-[#8A6046] m-0 uppercase tracking-widest relative z-10">
                 Psicóloga Johana Villabón · 2026
               </div>
            </section>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
