"use client";

import Link from "next/link";

export default function StatsCTA() {
  return (
    <section className="bg-[#f8f3ee] mt-20 relative overflow-hidden">
      {/* Decorative leaf shapes in background */}
      <svg
        className="absolute left-6 top-1/2 -translate-y-1/2 w-[120px] h-[120px] text-[#e0d3c3] opacity-40"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <path d="M20,80 Q10,50 30,30 Q50,10 70,30 Q60,50 50,45 Q40,60 20,80 Z" />
        <path
          d="M25,75 Q30,50 45,40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
      </svg>
      <svg
        className="absolute right-10 top-1/2 -translate-y-1/2 w-[100px] h-[100px] text-[#e0d3c3] opacity-30"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <path d="M70,85 Q80,55 60,35 Q40,15 20,35 Q30,55 40,50 Q50,65 70,85 Z" />
      </svg>
      <svg
        className="absolute left-[30%] top-0 w-[80px] h-[80px] text-[#e0d3c3] opacity-20"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <path d="M50,10 Q30,30 35,55 Q40,80 50,90 Q60,80 65,55 Q70,30 50,10 Z" />
      </svg>

      <div className="max-w-[1300px] mx-auto px-6 py-16 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-[#fdfaf7]/50 p-10 rounded-2xl border border-[#8A6046]/10">
          <div className="max-w-[700px]">
            <h3 className="text-[28px] md:text-[34px] font-bold text-[#2b2b2b] mb-4 leading-tight">
              ¿Listo para comenzar tu proceso de bienestar?
            </h3>
            <p className="text-[#6b6b6b] text-[1.2rem] leading-relaxed">
              No tienes que transitar este camino a solas. Agenda ahora tu
              primera sesión y comienza a transformar tu salud emocional con
              acompañamiento profesional.
            </p>
          </div>

          <Link
            href="/book"
            className="bg-[#8A6046] text-white px-10 py-5 rounded-full font-bold text-[16px] hover:bg-[#6D4934] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 whitespace-nowrap"
          >
            Agendar mi Cita Ahora
          </Link>
        </div>
      </div>
    </section>
  );
}
