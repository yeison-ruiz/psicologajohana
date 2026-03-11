"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bell } from "lucide-react";
import { toast } from "sonner";

export default function IntroCards() {
  return (
    <section className="relative z-20 max-w-[1400px] mx-auto px-6 -mt-[40px] md:-mt-[20px] pb-10">
      <div className="flex flex-col md:flex-row shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-sm overflow-hidden">
        {/* Left Card */}
        <div className="flex-3 bg-white px-12 py-12 flex flex-col justify-center">
          <h2 className="text-[42px] font-black text-[#2b2b2b] leading-[1.1] mb-5 tracking-tight">
            Bienvenido a tu espacio de{" "}
            <span className="text-[#8A6046]">transformación.</span>
          </h2>
          <p className="text-[1.25rem] text-[#6b6b6b] leading-relaxed mb-8 max-w-[500px]">
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
        <div className="flex-2 relative px-10 py-9 text-white flex flex-col justify-center overflow-hidden">
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
            <h3 className="text-[32px] font-black leading-tight mb-3 uppercase tracking-tight text-white">
              Consulta 100% Online
            </h3>
            <p className="text-white/80 text-[1.3rem] leading-[1.6] mb-6">
              Todas las sesiones se realizan de forma segura a través de{" "}
              <strong>Google Meet</strong>. Programación integrada
              directamente en tu <strong>Google Calendar</strong>.
            </p>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-[50px] h-[50px] rounded-xl bg-white p-2.5 shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform relative">
                  <Image
                    src="/google-meet.svg"
                    alt="Google Meet"
                    fill
                    className="p-2.5 object-contain"
                  />
                </div>
                <div className="w-[50px] h-[50px] rounded-xl bg-white p-2.5 shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform relative">
                  <Image
                    src="/google-calendar.svg"
                    alt="Google Calendar"
                    fill
                    className="p-2.5 object-contain"
                  />
                </div>
                <div className="h-[30px] w-px bg-white/20 mx-2" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[.2em] text-white/70 block mb-0.5">
                    Sincronización Total
                  </span>
                  <span className="text-[18px] font-bold text-white">
                    Asistencia Garantizada
                  </span>
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
                className="bg-white text-[#8A6046] px-10 py-5 rounded-full font-black text-[16px] uppercase tracking-widest hover:bg-[#fdfaf7] transition-all shadow-xl inline-block text-center w-fit"
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
