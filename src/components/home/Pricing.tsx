"use client";

import Link from "next/link";

export default function Pricing() {
  return (
    <section
      className="py-12 md:py-24 bg-[#FAFAF8] relative overflow-hidden"
      id="pricing"
    >
      {/* Background decorative pattern */}
      <div
        className="absolute right-0 top-16 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #8A6046 2px, transparent 2px)",
          backgroundSize: "20px 20px",
          width: "300px",
          height: "400px",
        }}
      />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-[4px] h-[4px] rounded-full bg-[#8A6046]" />
            <span className="w-[30px] h-px bg-[#8A6046]" />
            <span className="text-[11px] font-bold text-[#8A6046] uppercase tracking-[.2em] ml-2">
              Precios de Consulta
            </span>
          </div>
          <h2
            className="text-[#2b2b2b] text-[36px] md:text-[42px] font-bold leading-[1.2] max-w-[600px] mx-auto"
            style={{ fontFamily: "var(--font-raleway)" }}
          >
            Inversión clara en tu bienestar, ahora con Análisis Pre-sesión IA.
          </h2>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-[1100px] mx-auto">
          {/* Card 1: Individual */}
          <div className="bg-white rounded-md shadow-[0_5px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col border border-gray-100/50">
            <div className="bg-[#EAE0D9] py-6 px-8 text-center border-b border-[#DBCABF]">
              <h3
                className="text-[#5D3F2E] text-[26px] font-black"
                style={{ fontFamily: "var(--font-raleway)" }}
              >
                Terapia Individual
              </h3>
            </div>
            <div className="px-10 py-12 flex-1 flex flex-col">
              <div className="text-center mb-14">
                <div
                  className="text-[#2b2b2b] text-[54px] font-black leading-none mb-3"
                  style={{ fontFamily: "var(--font-raleway)" }}
                >
                  $80.000
                </div>
                <div
                  className="text-[#888] text-[18px] font-bold italic"
                  style={{ fontFamily: "var(--font-raleway)" }}
                >
                  por sesión (1 hora)
                </div>
              </div>

              <ul className="space-y-5 mb-14 flex-1">
                {[
                  "Diagnóstico y tratamiento",
                  "Autoestima, estrés, ansiedad",
                  "Incluye Análisis Pre-sesión IA",
                  "Atención 100% Online",
                ].map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-[#555] text-[17px]"
                  >
                    <svg
                      className="w-[20px] h-[20px] text-[#8A6046] shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/book?type=individual"
                className="w-full bg-[#8A6046] hover:bg-[#6D4934] text-white text-[14px] font-bold uppercase tracking-[.15em] py-[18px] text-center transition-colors rounded-sm"
              >
                Agendar Cita
              </Link>
            </div>
          </div>

          {/* Card 2: Couples (Highlighted) */}
          <div className="bg-white rounded-md shadow-[0_15px_40px_rgba(138,96,70,0.15)] overflow-hidden flex flex-col relative transform md:-translate-y-4">
            <div className="bg-[#8A6046] py-6 px-8 flex items-center justify-between border-b border-[#6D4934]">
              <h3
                className="text-white text-[26px] font-black"
                style={{ fontFamily: "var(--font-raleway)" }}
              >
                Terapia Conjunta
              </h3>
              <span className="text-[12px] font-black uppercase tracking-wider text-white border-2 border-white/50 px-3 py-1.5 rounded-lg bg-white/10">
                Popular
              </span>
            </div>
            <div className="px-10 py-12 flex-1 flex flex-col">
              <div className="text-center mb-14">
                <div
                  className="text-[#2b2b2b] text-[54px] font-black leading-none mb-3"
                  style={{ fontFamily: "var(--font-raleway)" }}
                >
                  $120.000
                </div>
                <div
                  className="text-[#888] text-[18px] font-bold italic"
                  style={{ fontFamily: "var(--font-raleway)" }}
                >
                  por sesión (1.5 horas)
                </div>
              </div>

              <ul className="space-y-5 mb-14 flex-1">
                {[
                  "Terapia de Pareja o Familia",
                  "Análisis Pre-sesión IA Individual",
                  "Mediación y diálogo guiado",
                  "Orientación y pautas de crianza",
                ].map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-[#555] text-[17px]"
                  >
                    <svg
                      className="w-[18px] h-[18px] text-[#8A6046] shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/book?type=conjunta"
                className="w-full bg-[#8A6046] hover:bg-[#6D4934] text-white text-[14px] font-bold uppercase tracking-[.15em] py-[18px] text-center transition-colors rounded-sm shadow-md"
              >
                Agendar Cita
              </Link>
            </div>
          </div>

          {/* Card 3: Business */}
          <div className="bg-white rounded-md shadow-[0_5px_30px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col border border-gray-100/50">
            <div className="bg-[#EAE0D9] py-6 px-8 text-center border-b border-[#DBCABF]">
              <h3
                className="text-[#5D3F2E] text-[26px] font-black"
                style={{ fontFamily: "var(--font-raleway)" }}
              >
                Talleres y Prev.
              </h3>
            </div>
            <div className="px-10 py-12 flex-1 flex flex-col">
              <div className="text-center mb-14">
                <div
                  className="text-[#2b2b2b] text-[42px] font-bold leading-none mb-3 pt-2"
                  style={{ fontFamily: "var(--font-raleway)" }}
                >
                  A Medida
                </div>
                <div
                  className="text-[#999] text-[15px] italic"
                  style={{ fontFamily: "var(--font-raleway)" }}
                >
                  según requerimientos
                </div>
              </div>

              <ul className="space-y-5 mb-14 flex-1">
                {[
                  "Charlas y Psicoeducación",
                  "Grupos, colegios y empresas",
                  "Diseño de programas a medida",
                ].map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-[#555] text-[17px]"
                  >
                    <svg
                      className="w-[18px] h-[18px] text-[#8A6046] shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="#contact"
                className="w-full bg-[#8A6046] hover:bg-[#6D4934] text-white text-[14px] font-bold uppercase tracking-[.15em] py-[18px] text-center transition-colors rounded-sm"
              >
                Cotizar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
