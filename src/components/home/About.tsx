"use client";

import Image from "next/image";

export default function About() {
  return (
    <section
      id="about"
      className="relative bg-white pt-24 pb-0 overflow-hidden"
    >
      {/* Decorative cross/plus patterns — top right */}
      <div className="absolute top-8 right-[12%] opacity-[0.08]">
        {Array.from({ length: 5 }).map((_, row) =>
          Array.from({ length: 5 }).map((_, col) => (
            <span
              key={`${row}-${col}`}
              className="absolute text-[#8A6046] text-[10px] font-bold"
              style={{ top: row * 16, left: col * 16 }}
            >
              +
            </span>
          )),
        )}
      </div>
      {/* Decorative cross/plus — bottom right */}
      <div className="absolute bottom-[20%] right-[8%] opacity-[0.06]">
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 4 }).map((_, col) => (
            <span
              key={`b${row}-${col}`}
              className="absolute text-[#8A6046] text-[10px] font-bold"
              style={{ top: row * 16, left: col * 16 }}
            >
              +
            </span>
          )),
        )}
      </div>

      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left — Photo + Quote */}
          <div className="relative">
            {/* Main Photo wrapper */}
            <div className="relative w-full max-w-[480px] mx-auto lg:ml-12 group">
              <div className="relative w-full h-[620px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src="/profesional.png"
                  alt="Psicóloga Johana Villabón"
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  className="object-cover object-[center_top] transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              </div>
            </div>

            {/* Quote Card — absolute on desktop, static block on mobile */}
            <div className="mt-5 lg:absolute lg:-bottom-8 lg:-right-24 bg-[#f8f3ee] px-5 py-5 lg:px-8 lg:py-8 w-full lg:w-[340px] shadow-lg lg:shadow-2xl border-l-[6px] border-[#8A6046] rounded-2xl lg:rounded-r-3xl z-20">
              <span
                className="text-[#8A6046] text-[36px] lg:text-[44px] font-bold leading-none block mb-1"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                &ldquo;
              </span>
              <p
                className="text-[#444] text-[1.05rem] lg:text-[1.25rem] leading-[1.6] italic font-medium"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Cuidar tu salud mental es un gran acto de amor propio.
              </p>
            </div>
          </div>

          {/* Right — Bio Text */}
          <div className="pt-4 lg:pt-2">
            {/* Subtitle */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1.5">
                <span className="w-[6px] h-[6px] rounded-full bg-[#8A6046]" />
                <span className="w-[30px] h-[1.5px] bg-[#8A6046]" />
              </div>
              <span className="text-[13px] font-bold text-[#8A6046] uppercase tracking-[.2em]">
                Permítanme Presentarme
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="text-[#2b2b2b] text-[44px] lg:text-[56px] font-black leading-[1.05] mb-8 tracking-tight">
              Soy la{" "}
              <span
                className="italic font-normal text-[#8A6046]"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Psicóloga
              </span>{" "}
              <span className="text-[#8A6046]">Johana Villabón</span>, experta
              en salud mental.
            </h2>

            {/* Paragraphs */}
            <p className="text-[#777] text-[1.3rem] leading-[1.8] mb-4">
              Con más de 6 años de experiencia profesional, me especializo en
              brindar acompañamiento en salud mental a través de un enfoque
              humano y comprensivo, ayudando a las personas en su camino hacia
              una vida con mayor bienestar y sentido.
            </p>
            <p
              className="text-[#777] text-[1.3rem] leading-[1.8] mb-8"
              style={{
                fontFamily: "var(--font-playfair)",
                fontStyle: "italic",
              }}
            >
              Mi consulta se enfoca en ofrecer un espacio libre de juicios,
              incorporando empatía, estrategias psicoeducativas y herramientas
              terapéuticas probadas para caminar junto a ti en tu proceso de
              comprensión de tus emociones y decisiones
            </p>

            {/* Signature + Button */}
            <div className="flex items-end justify-between">
              <div>
                <p
                  className="text-[1.5rem] text-[#8A6046] mb-1 font-bold"
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontStyle: "italic",
                  }}
                >
                  Johana Villabón
                </p>
                <p className="text-[1.3rem] text-[#555]">
                  <span className="font-bold text-[#2b2b2b]">
                    Psicóloga Profesional
                  </span>{" "}
                  –{" "}
                  <span className="text-[#8A6046] underline underline-offset-2">
                    Especialista en Salud Mental
                  </span>
                </p>
              </div>
              <a
                href="#services"
                className="bg-[#8A6046] hover:bg-[#6D4934] text-white text-[13px] font-bold uppercase tracking-[.15em] px-6 py-[14px] transition-colors inline-block"
              >
                Acerca de Mí
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
