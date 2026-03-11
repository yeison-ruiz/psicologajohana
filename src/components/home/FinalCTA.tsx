"use client";

import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24" id="book-cta">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-r from-[#6D4934] to-[#8A6046] z-0" />

      {/* Decorative Overlay Patterns */}
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)",
        }}
      ></div>

      <div className="max-w-[1000px] mx-auto px-6 relative z-10 text-center">
        <h2
          className="text-white text-[44px] md:text-[64px] font-black leading-[1.05] mb-8 shadow-sm tracking-tight"
          style={{ fontFamily: "var(--font-raleway)" }}
        >
          ¿Listo para dar el primer paso?
        </h2>
        <p
          className="text-white/95 text-[20px] md:text-[26px] max-w-[800px] mx-auto mb-12 leading-normal font-medium"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Agenda tu cita hoy mismo y comienza a trabajar en tu bienestar
          emocional. Ofrezco horarios flexibles adaptados a tu estilo de vida,
          desde la comodidad de tu hogar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="/book"
            className="group relative inline-flex items-center justify-center px-12 py-[22px] bg-white text-[#8A6046] font-black text-[16px] uppercase tracking-[.25em] rounded-full overflow-hidden transition-transform hover:scale-105 shadow-[0_15px_40px_rgba(0,0,0,0.2)]"
          >
            <span className="relative z-10 flex items-center gap-3">
              Agendar Mi Sesión
              <svg
                className="w-5 h-5 transition-transform group-hover:translate-x-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gray-50 transform scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100 z-0"></div>
          </Link>

          <a
            href="https://wa.me/573000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-12 py-[20px] border-2 border-white/40 text-white font-black text-[16px] uppercase tracking-[.15em] rounded-full hover:bg-white hover:text-[#8A6046] transition-all duration-300 shadow-lg"
          >
            Hablemos por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
