"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface HeroProps {
  loadVideo: boolean;
  canBook: boolean;
}

export default function Hero({ loadVideo, canBook }: HeroProps) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((p) => (p + 1) % 2), 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative w-full h-[680px] md:h-[700px] lg:h-[820px] overflow-hidden">
      {/* Background Video (YouTube) - Optimized for Mobile & Desktop */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none bg-black/20">
        {loadVideo && (
          <iframe
            src="https://www.youtube.com/embed/l-DDATDH6hs?autoplay=1&mute=1&controls=0&loop=1&playlist=l-DDATDH6hs&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&vq=hd1080"
            title="Video Hero"
            loading="eager"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: "max(150%, 177.77vh)",
              height: "max(150%, 100vh)",
              minWidth: "100%",
              minHeight: "100%",
              pointerEvents: "none",
            }}
            allow="autoplay; encrypted-media"
            frameBorder="0"
          />
        )}
        {/* Overlay for legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, rgba(138,96,70,0.2) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 h-full flex items-start pt-28 md:pt-40 lg:pt-48">
        <div className="max-w-[1000px]">
          {/* Subtitle */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-[6px] h-[6px] rounded-full bg-[#8A6046]" />
              <span className="w-[30px] h-[1.5px] bg-[#8A6046]" />
            </div>
            <span className="text-[11px] md:text-[12px] font-black text-[#8A6046] uppercase tracking-[.25em] flex items-center gap-2">
              {slide === 0
                ? "Psicóloga · Terapia Online Profesional"
                : "Innovación · Análisis Pre-sesion IA"}
              {slide === 1 && (
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              )}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-white mb-4 leading-[1.12]">
            {slide === 0 ? (
              <>
                <span className="text-[32px] md:text-[42px] lg:text-[60px] font-black tracking-tight">
                  Mejores consejos para relaciones{" "}
                </span>
                <span
                  className="text-[32px] md:text-[42px] lg:text-[60px] italic tracking-tight"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  saludables y felices
                </span>
              </>
            ) : (
              <>
                <span className="text-[32px] md:text-[42px] lg:text-[60px] font-black tracking-tight">
                  Psicología potenciada con{" "}
                </span>
                <span
                  className="text-[32px] md:text-[42px] lg:text-[60px] italic tracking-tight"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Inteligencia Artificial
                </span>
              </>
            )}
          </h1>

          {/* Description */}
          <p className="text-white/90 text-[0.95rem] md:text-[1.1rem] lg:text-[1.25rem] font-medium leading-[1.6] mb-6 max-w-[850px]">
            {slide === 0
              ? "La salud mental es una prioridad. Acompañamiento profesional para fortalecer tus relaciones y bienestar emocional."
              : "Aprovecha nuestra tecnología de pre-consulta con IA para que cada minuto de tu sesión con Johana sea transformador."}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {canBook && (
              <Link
                href="/book"
                className="w-full sm:w-auto text-center bg-[#8A6046] hover:bg-[#6D4934] text-white text-[13px] md:text-[15px] font-black uppercase tracking-[.15em] px-8 py-4 md:px-12 md:py-6 transition-all duration-300 inline-block shadow-lg hover:shadow-[#8A6046]/40"
              >
                Agendar Sesión
              </Link>
            )}
            <Link
              href="#ai-innovation"
              className="w-full sm:w-auto text-center bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 text-[13px] md:text-[15px] font-black uppercase tracking-[.15em] px-8 py-4 md:px-12 md:py-6 transition-all duration-300 inline-block"
            >
              Ver Análisis Pre-sesion IA
            </Link>
          </div>
        </div>
      </div>

      {/* Nav Arrows */}
      <button
        onClick={() => setSlide((p) => (p - 1 + 2) % 2)}
        className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 z-20 w-[44px] h-[44px] rounded-full bg-white/70 hover:bg-white items-center justify-center shadow-md transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-[#333]" />
      </button>
      <button
        onClick={() => setSlide((p) => (p + 1) % 2)}
        className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 z-20 w-[44px] h-[44px] rounded-full bg-white/70 hover:bg-white items-center justify-center shadow-md transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-[#333]" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-[50px] z-20 flex items-center gap-2">
        {[0, 1].map((i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            className={`transition-all ${slide === i ? "w-[28px] h-[10px] rounded-full bg-[#8A6046]" : "w-[10px] h-[10px] rounded-full bg-[#ccc]"}`}
          />
        ))}
      </div>
    </section>
  );
}
