"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-[#1C1512] text-[#A3A3A3] pt-24 pb-12 overflow-hidden relative"
    >
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Column 1: Info */}
          <div className="flex flex-col gap-8">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="Johana Villabón Logo"
                width={200}
                height={60}
                className="brightness-0 invert opacity-90"
              />
            </Link>
            <p className="text-[15px] leading-relaxed max-w-[320px]">
              Especialista en psicología con enfoque empático y profesional.
              Brindo herramientas para mejorar tu calidad de vida y salud
              mental.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, MessageCircle, Instagram].map((Ic, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-[42px] h-[42px] rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#8A6046] hover:border-[#8A6046] transition-all hover:-translate-y-1"
                >
                  <Ic className="w-[16px] h-[16px] text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white text-[18px] font-bold mb-6 pb-4 border-b border-[#333] relative inline-block w-full">
              Contacto
              <span className="absolute bottom-[-1px] left-0 w-[40px] h-[2px] bg-[#8A6046]"></span>
            </h3>

            <ul className="flex flex-col gap-6 text-[14px]">
              <li className="flex gap-4">
                <span className="text-[#8A6046] mt-1 shrink-0">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span className="leading-snug text-[16px] font-bold">
                  Consulta 100% Virtual
                  <br />
                  Atención Online
                </span>
              </li>
              <li className="flex gap-4">
                <span className="text-[#8A6046] mt-1 shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
                    />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </span>
                <div>
                  <span className="block text-white mb-2 font-medium">
                    Tel: 321 970 6495
                  </span>
                  <span className="block text-white font-medium">
                    Email: info@psicologajohanavillabon.com
                  </span>
                </div>
              </li>
              <li className="flex gap-4 mt-1">
                <span className="text-[#8A6046] mt-1 shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <div>
                  <span className="block text-white font-medium mb-1">
                    Lun - Vie : ( 9am - 6pm )
                  </span>
                  <span className="block text-[#A3A3A3]">
                    Sáb & Dom : CERRADO
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 3: My Programs */}
          <div>
            <h3 className="text-white text-[18px] font-bold mb-6 pb-4 border-b border-[#333] relative inline-block w-full">
              Programas
              <span className="absolute bottom-[-1px] left-0 w-[40px] h-[2px] bg-[#8A6046]"></span>
            </h3>

            <ul className="flex flex-col gap-4 text-[14px]">
              {[
                "Talleres Psicoeducativos",
                "Acompañamiento Online",
                "Prevención y Promoción en Salud",
                "Terapia de Pareja",
                "Consejería de Duelo",
                "Terapia de Autoestima",
                "Niños y Familia",
                "Planificación del Futuro",
                "Adultos Mayores",
              ].map((program, index) => (
                <li
                  key={index}
                  className="flex gap-3 items-center hover:text-white transition-colors cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-sm bg-[#8A6046] transition-transform group-hover:scale-125"></span>
                  {program}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Book Appointment */}
          <div>
            <h3 className="text-white text-[18px] font-bold mb-6 pb-4 border-b border-[#333] relative inline-block w-full">
              Reservar Cita
              <span className="absolute bottom-[-1px] left-0 w-[40px] h-[2px] bg-[#8A6046]"></span>
            </h3>

            <div
              className="bg-[#2A2A2A] rounded-md p-5 flex items-center gap-4 mb-6 relative overflow-hidden group hover:bg-[#333] transition-colors cursor-pointer"
              onClick={() =>
                window.open("https://wa.me/573219706495", "_blank")
              }
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[#8A6046]"></div>
              <div className="w-12 h-12 rounded-full bg-[#8A6046] flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[#A3A3A3] font-bold mb-1">
                  HABLEMOS
                </div>
                <div className="text-white text-[16px] xl:text-[18px] font-bold tracking-wide">
                  321 970 6495
                </div>
              </div>
            </div>

            <p className="text-[13px] leading-relaxed">
              Contáctanos ahora para agendar una cita (Disponible 24/7).
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-[#333]/60 pt-6 pb-0">
        <div className="max-w-[1200px] mx-auto px-6 flex justify-center text-center items-center">
          <div className="bg-[#2A2A2A]/50 text-[#888] text-[13px] py-3 px-8 rounded-md w-full sm:w-auto font-medium shadow-sm">
            © 2026 - Psicóloga Johana Villabón. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </footer>
  );
}
