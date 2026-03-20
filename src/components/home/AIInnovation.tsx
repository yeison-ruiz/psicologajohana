"use client";

import { motion } from "framer-motion";
import { Sparkles, Brain, Clock, ShieldCheck, Cpu } from "lucide-react";

export default function AIInnovation() {
  return (
    <section
      id="ai-innovation"
      className="py-12 md:py-24 bg-white relative overflow-hidden"
    >
      {/* Background blobs for tech feel */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8A6046]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#8A6046]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Left: Interactive Feel Mockup / Visual */}
          <div className="flex-1 w-full lg:max-w-[600px]">
            <div className="relative">
              {/* Decorative frames */}
              <div className="absolute -inset-4 bg-linear-to-tr from-[#8A6046]/20 to-transparent rounded-[3rem] blur-2xl" />

              <div className="relative bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/10 overflow-hidden">
                {/* Chat UI Simulation */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="w-10 h-10 rounded-full bg-[#8A6046] flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">
                        Asistente Virtual
                      </p>
                      <p className="text-white/40 text-xs">
                        Preparando tu sesión...
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                      <p className="text-white/80 text-sm italic">
                        &quot;Hola. Para que tu tiempo con la Psicóloga Johana
                        sea más productivo, cuéntame: ¿Cómo describirías tu
                        estado de ánimo esta semana?&quot;
                      </p>
                    </div>
                    <div className="bg-[#8A6046] rounded-2xl rounded-tr-none p-4 ml-auto max-w-[80%]">
                      <p className="text-white text-sm">
                        &quot;He sentido mucha ansiedad por el trabajo, me
                        cuesta desconectar al llegar a casa...&quot;
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                      <p className="text-white/80 text-sm">
                        &quot;Entiendo. He tomado nota de esto para Johana.
                        ¿Sientes esta presión más en el pecho o te genera
                        insomnio?&quot;
                      </p>
                    </div>
                  </div>

                  {/* Report Preview tag */}
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-white/60 text-xs font-medium uppercase tracking-widest">
                        Generando Reporte para Johana
                      </span>
                    </div>
                    <Brain className="w-5 h-5 text-[#8A6046]" />
                  </div>
                </div>
              </div>

              {/* Floating "Innovation" badge */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="hidden md:flex absolute -bottom-6 -right-6 md:-right-12 bg-white p-6 rounded-2xl shadow-2xl border border-[#8A6046]/10 items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[#8A6046]/10 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-[#8A6046]" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#8A6046] uppercase tracking-[.2em]">
                    Tecnología
                  </p>
                  <p className="text-slate-900 font-bold">
                    Análisis Pre-sesion IA
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right: Text Content */}
          <div className="flex-1 lg:pl-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1.5">
                <span className="w-[6px] h-[6px] rounded-full bg-[#8A6046]" />
                <span className="w-[30px] h-[1.5px] bg-[#8A6046]" />
              </div>
              <span className="text-[13px] font-bold text-[#8A6046] uppercase tracking-[.2em]">
                Análisis Pre-sesion IA
              </span>
            </div>

            <h2 className="text-[#2b2b2b] text-[30px] lg:text-[54px] font-black leading-[1.05] mb-6 md:mb-8 tracking-tight">
              Tu sesión inicia <span className="text-[#8A6046]">antes</span> de
              la videollamada.
            </h2>

            <p className="text-[#666] text-[1.1rem] md:text-[1.3rem] leading-[1.8] mb-8 md:mb-10">
              Somos pioneros en integrar Inteligencia Artificial diseñada
              exclusivamente para la psicología. Al agendar, nuestro asistente
              te guiará en una breve pre-consulta privada.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f8f3ee] flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#8A6046]" />
                  </div>
                  <h4 className="font-bold text-[#2b2b2b]">
                    Optimización de Tiempo
                  </h4>
                </div>
                <p className="text-[#777] text-base leading-relaxed">
                  Llega a la sesión con tus ideas organizadas. La Psicóloga
                  Johana recibirá un resumen clave para tu sesión.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f8f3ee] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-[#8A6046]" />
                  </div>
                  <h4 className="font-bold text-[#2b2b2b]">Privacidad Total</h4>
                </div>
                <p className="text-[#777] text-base leading-relaxed">
                  Tus respuestas son encriptadas y solo Johana tiene acceso a
                  ellas para preparar tu plan de tratamiento.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#f8f3ee] border-l-4 border-[#8A6046]">
              <p className="text-[#555] italic text-[1.1rem] leading-relaxed">
                &quot;Esta tecnología no reemplaza la conexión humana; la
                potencia, permitiendo que cada minuto de tu sesión sea
                verdaderamente transformador.&quot;
              </p>
              <p className="text-[#8A6046] font-bold mt-3 text-sm">
                — Psicóloga Johana Villabón
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
