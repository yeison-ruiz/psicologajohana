"use client";

import Image from "next/image";
import Link from "next/link";

export default function MeetingSection() {
  return (
    <section
      className="py-0 mt-0 md:-mt-[70px] relative pb-16"
      style={{ zIndex: 999, backgroundColor: "transparent" }}
    >
      <div className="max-w-[1300px] mx-auto px-6">
        <div className="flex flex-col md:flex-row shadow-[0_8px_40px_rgba(0,0,0,0.10)] relative bg-white">
          {/* Left — Image with Video Button */}
          <div className="relative md:w-[42%]">
            <div className="relative w-full h-[500px] md:h-full">
              <Image
                src="/profesional2.png"
                alt="Sesión online por Videollamada"
                fill
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover object-top md:object-[80%_0%]"
              />
            </div>
            {/* Video Camera Button Overlay */}
            <div className="absolute bottom-0 md:top-1/2 right-0 translate-x-1/2 translate-y-1/2 md:-translate-y-1/2 w-[70px] h-[70px] z-10 flex items-center justify-center">
              {/* Ping animation backdrop */}
              <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-60"></div>
              {/* Actual button */}
              <div className="relative w-full h-full rounded-full bg-white flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
                <Image
                  src="/google-meet.svg"
                  width={35}
                  height={35}
                  alt="Google Meet"
                  className="w-[35px] h-[35px]"
                />
              </div>
            </div>
          </div>

          {/* Right — Text Content */}
          <div className="md:w-[58%] bg-white px-10 py-10 flex flex-col justify-center relative overflow-hidden">
            {/* Decorative dots */}
            <div
              className="absolute top-4 right-4 opacity-[0.15]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #8A6046 2.5px, transparent 2.5px)",
                backgroundSize: "14px 14px",
                width: "90px",
                height: "90px",
              }}
            />

            <h3 className="text-[#2b2b2b] text-[28px] lg:text-[34px] font-black leading-tight mb-4" style={{ fontFamily: 'var(--font-raleway)' }}>
              Tu bienestar no tiene fronteras.
            </h3>
            <p className="text-[#666] text-[1.2rem] lg:text-[1.35rem] leading-[1.6] mb-6">
              Conecta desde la <strong>privacidad de tu hogar</strong>. Nuestras sesiones por <strong>Google Meet</strong> eliminan las distancias para ofrecerte un espacio <strong>profesional y cálido</strong>, justo donde te encuentres.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center text-[#8A6046] font-black uppercase tracking-[0.15em] text-[14px] group"
            >
              Agendar mi espacio
              <span className="ml-2 group-hover:translate-x-1 duration-300 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
