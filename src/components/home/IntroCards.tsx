"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Bell, Sparkles, Brain } from "lucide-react";
import { toast } from "sonner";

export default function IntroCards() {
  return (
    <section className="relative z-20 max-w-[1400px] mx-auto px-6 -mt-[40px] md:-mt-[20px] pb-10">
      <div className="flex flex-col md:flex-row shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-sm overflow-hidden">
        {/* Left Card */}
        <div className="flex-3 bg-white px-6 py-10 md:px-12 md:py-12 flex flex-col justify-center">
          <h2 className="text-[32px] md:text-[42px] font-black text-[#2b2b2b] leading-[1.2] md:leading-[1.1] mb-5 tracking-tight">
            Bienvenido a tu espacio de{" "}
            <span className="text-[#8A6046]">transformación.</span>
          </h2>
          <p className="text-[1.1rem] md:text-[1.25rem] text-[#6b6b6b] leading-relaxed mb-8 max-w-[500px]">
            Soy la <strong>Psicóloga Johana Villabon</strong>. Mi misión es
            brindarte las herramientas necesarias para que puedas navegar tus
            emociones y construir la vida que deseas.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5 mb-12">
            {[
              "Manejo de Ansiedad y Estrés",
              "Terapia de Pareja y Relaciones",
              "Duelo y Procesos de Pérdida",
              "Sanación de Autoestima",
              "Sesiones Online por Google Meet",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-[10px] h-[10px] rounded-full bg-[#8A6046]" />
                <span className="text-[17px] font-bold text-[#444]">
                  {item}
                </span>
              </div>
            ))}
          </div>
          <a
            href="#services"
            className="group text-[#8A6046] text-[17px] font-black uppercase tracking-widest flex items-center gap-3 hover:text-[#6D4934] transition-all"
          >
            Conoce mis servicios
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1.5 transition-transform" />
          </a>
        </div>

        {/* Right Card */}
        <div className="flex-2 relative px-6 py-8 md:px-10 md:py-9 text-white flex flex-col justify-center overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center z-0 object-cover"
            style={{
              backgroundImage: "url('/profesional1.png')",
            }}
          />
          {/* Brown Overlay layer */}
          <div className="absolute inset-0 bg-[#8A6046]/85 z-0" />

          {/* Content Container (relative z-10 to stay above bg) */}
          <div className="relative z-10 w-full h-full flex flex-col justify-center">
            <h3 className="text-[22px] sm:text-[30px] lg:text-[36px] leading-none mb-3 uppercase tracking-tighter text-white flex items-baseline gap-x-2 flex-wrap">
              <span className="font-medium">Consulta</span>
              <span className="text-[40px] sm:text-[54px] lg:text-[64px] font-black text-white leading-none">100%</span>
              <span className="font-medium">Online</span>
            </h3>
            <p className="text-white/80 text-[1rem] md:text-[1.2rem] lg:text-[1.3rem] leading-[1.6] mb-6">
              Sesiones seguras por <strong>Google Meet</strong>, integradas en
              tu <strong>Google Calendar</strong> y acompañadas de un{" "}
              <strong>Análisis Pre-sesión con IA</strong>.
            </p>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 bg-white/5 p-3 md:p-4 rounded-2xl border border-white/10 backdrop-blur-sm group/ai cursor-help relative overflow-hidden">
                {/* Subtle animated background glow */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#8A6046]/10 to-transparent -translate-x-full group-hover/ai:translate-x-full transition-transform duration-1000" />
                
                <div className="flex items-center gap-2.5 relative z-10">
                  <div className="w-[45px] h-[45px] lg:w-[50px] lg:h-[50px] rounded-xl bg-white p-2 shadow-lg flex items-center justify-center transform group-hover/ai:scale-110 transition-transform relative">
                    <Image
                      src="/google-meet.svg"
                      alt="Google Meet"
                      fill
                      className="p-2 object-contain"
                    />
                  </div>
                  <div className="w-[45px] h-[45px] lg:w-[50px] lg:h-[50px] rounded-xl bg-white p-2 shadow-lg flex items-center justify-center transform group-hover/ai:scale-110 transition-transform relative">
                    <Image
                      src="/google-calendar.svg"
                      alt="Google Calendar"
                      fill
                      className="p-2 object-contain"
                    />
                  </div>
                  
                  <motion.div 
                    animate={{ 
                      boxShadow: ["0 0 0px rgba(138, 96, 70, 0)", "0 0 20px rgba(138, 96, 70, 0.2)", "0 0 0px rgba(138, 96, 70, 0)"] 
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-[45px] h-[45px] lg:w-[50px] lg:h-[50px] rounded-xl bg-white border border-[#8A6046]/20 p-2 shadow-lg flex items-center justify-center transform group-hover/ai:scale-110 group-hover/ai:border-[#8A6046]/50 transition-all relative overflow-hidden"
                  >
                    <Sparkles className="w-5 h-5 text-[#8A6046]" />
                    {/* Subtle shine effect */}
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent skew-x-12"
                    />
                  </motion.div>
                </div>
                
                <div className="h-[40px] w-px bg-white/20 mx-1 relative z-10" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-[.15em] text-[#8A6046] bg-[#8A6046]/10 border border-[#8A6046]/20 px-2 py-0.5 rounded-full">
                      Tecnología Inteligente
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest">Activo</span>
                    </div>
                  </div>
                  <span className="text-[17px] lg:text-[19px] font-bold text-white flex items-center gap-2">
                    Análisis Pre-sesión IA
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Brain className="w-4 h-4 text-white/60" />
                    </motion.div>
                  </span>
                  <p className="text-[11px] text-white/50 font-medium leading-tight mt-1">
                    Preparamos tu sesión para que aproveches cada minuto al máximo.
                  </p>
                </div>
              </div>

              <Link
                href="/book"
                onClick={() =>
                  toast("Cargando Portal de Citas", {
                    description: "Preparando tu espacio de bienestar...",
                    icon: (
                      <Bell className="w-5 h-5 text-white animate-bounce" />
                    ),
                  })
                }
                className="bg-white text-[#8A6046] px-8 py-4 md:px-10 md:py-5 rounded-full font-black text-[14px] md:text-[16px] uppercase tracking-widest hover:bg-[#fdfaf7] transition-all shadow-xl block md:inline-block text-center w-full md:w-fit"
              >
                Agendar Cita Virtual
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
