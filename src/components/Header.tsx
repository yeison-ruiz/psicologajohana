"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Menu,
  X,
} from "lucide-react";

interface HeaderProps {
  activeSection?: string;
}

export default function Header({ activeSection = "hogar" }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    }
    init();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isPsi = user?.user_metadata?.role === "psicologa";

  return (
    <>
      {/* ═══════ TOP BAR ═══════ */}
      <div className="bg-[#333] text-[15px] font-bold text-white/90 hidden md:block">
        <div className="max-w-[1400px] mx-auto px-6 h-[44px] flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 opacity-60" />
              <span>
                <b className="text-white/90">Ubicación:</b> Colombia · Atención
                100% Online
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3 h-3 opacity-60" />
              <span>
                <b className="text-white/90">Correo electrónico:</b>{" "}
                info@psicologajohanavillabon.com
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {[Facebook, Twitter, MessageCircle, Instagram].map((Ic, i) => (
              <a
                key={i}
                href="#"
                className="w-[26px] h-[26px] rounded-full bg-white/10 hover:bg-[#8A6046] flex items-center justify-center transition-colors"
              >
                <Ic className="w-[11px] h-[11px] text-white" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════ NAVBAR ═══════ */}
      <nav
        className={`bg-white sticky top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "shadow-lg h-[85px] md:h-[80px]"
            : "shadow-[0_2px_15px_rgba(0,0,0,0.06)] h-[105px] md:h-[130px]"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-full flex items-center justify-between">
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/logo.png"
                alt="Logo Psicóloga Johana Villabón"
                width={220}
                height={70}
                priority
                loading="eager"
                sizes="(max-width: 768px) 150px, 220px"
                className={`w-auto object-contain transition-all duration-500 ${
                  isScrolled ? "h-[50px] md:h-[55px]" : "h-[68px] md:h-[70px]"
                }`}
              />
            </Link>
          </div>

          {/* Navigation & Actions Container */}
          <div className="flex items-center gap-1 md:gap-4 xl:gap-6">
            {/* Links - Hidden on mobile, shown on lg */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            {[
              ["Salud Mental", "/#hogar", "hogar"],
              ["Acerca de", "/#about", "about"],
              ["Servicios", "/#services", "services"],
              ["Precios", "/#pricing", "pricing"],
              ["Blog", "/blog", "blog"],
            ].map(([label, href, id]) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-full text-[13px] font-bold transition-all duration-300 whitespace-nowrap uppercase tracking-widest ${
                  activeSection === id
                    ? "bg-[#8A6046] text-white shadow-md shadow-[#8A6046]/20"
                    : "text-[#444] hover:bg-[#8A6046]/10 hover:text-[#8A6046]"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

            {/* Actions: Phone & Buttons */}
            <div className="flex items-center gap-2 md:gap-4 xl:gap-6">
              <a
                href="tel:3219706495"
                className="hidden xl:flex items-center gap-2.5"
              >
              <div className="relative w-[44px] h-[44px] flex items-center justify-center group/phone">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    y: [0, -1.5, 1.5, -1.5, 1.5, 0],
                    scale: [1, 1.03, 0.98, 1.03, 1],
                  }}
                  transition={{
                    duration: 0.4,
                    repeat: Infinity,
                    repeatDelay: 2.5,
                  }}
                  className="relative w-[44px] h-[44px] rounded-full bg-[#8A6046] flex items-center justify-center shadow-lg shadow-[#8A6046]/30 z-10 transition-shadow group-hover/phone:shadow-[#8A6046]/50"
                >
                  <motion.div
                    animate={{
                      rotate: [0, -20, 20, -20, 20, 0],
                    }}
                    transition={{
                      duration: 0.3,
                      repeat: Infinity,
                      repeatDelay: 2.5,
                    }}
                  >
                    <Phone className="w-[18px] h-[18px] text-white fill-white/20" />
                  </motion.div>
                </motion.div>
              </div>
              <div>
                <span className="text-[10px] text-[#999] uppercase tracking-[.25em] font-semibold block mb-0.5">
                  Hablemos
                </span>
                <span
                  className="text-[26px] font-bold text-[#2b2b2b] tracking-tight whitespace-nowrap"
                  style={{
                    fontFamily: "var(--font-poppins), sans-serif",
                  }}
                >
                  321 970 6495
                </span>
              </div>
            </a>

            {!loading && user && (
              <div className="flex items-center gap-1.5 md:gap-2">
                <Link
                  href={isPsi ? "/admin/dashboard" : "/dashboard"}
                  className="bg-[#8A6046] hover:bg-[#6D4934] text-white text-[10px] md:text-[13px] font-bold uppercase tracking-widest px-2 py-2 md:px-7 md:py-3.5 rounded-full shadow-md shadow-[#8A6046]/20 transition-all duration-300 whitespace-nowrap"
                >
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    await createClient().auth.signOut();
                    window.location.reload();
                  }}
                  className="bg-red-50 border border-red-200 hover:bg-red-600 text-red-600 hover:text-white text-[10px] md:text-[12px] font-bold uppercase tracking-widest px-2 py-2 md:px-6 md:py-3 rounded-full transition-all duration-300 shadow-sm whitespace-nowrap"
                >
                  Salir
                </button>
              </div>
            )}
            {!loading && !user && (
              <div className="flex items-center gap-1.5 md:gap-3">
                <Link
                  href="/login"
                  className="text-[12px] md:text-[12px] font-black uppercase tracking-widest text-[#8A6046] hover:text-white border-2 border-[#8A6046] hover:bg-[#8A6046] px-4 py-2 md:px-5 md:py-2.5 rounded-full transition-all duration-300 whitespace-nowrap shadow-sm"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="hidden md:inline-flex bg-[#8A6046] hover:bg-[#6D4934] text-white text-[10px] md:text-[12px] font-bold uppercase tracking-widest px-2 py-2 md:px-6 md:py-2.5 rounded-full shadow-lg shadow-[#8A6046]/20 transition-all duration-300 whitespace-nowrap"
                >
                  Unirse
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Button - positioned slightly separate */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-1 text-[#444] hover:bg-[#8A6046]/10 rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

        {/* Mobile Navigation Drawer */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isMenuOpen ? 1 : 0,
            height: isMenuOpen ? "auto" : 0,
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
        >
          <div className="flex flex-col p-4 gap-2">
            {[
              ["Salud Mental", "/#hogar", "hogar"],
              ["Acerca de", "/#about", "about"],
              ["Servicios", "/#services", "services"],
              ["Precios", "/#pricing", "pricing"],
              ["Blog", "/blog", "blog"],
            ].map(([label, href, id]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-6 py-4 rounded-xl text-[14px] font-bold uppercase tracking-widest transition-all ${
                  activeSection === id
                    ? "bg-[#8A6046] text-white shadow-lg"
                    : "text-[#444] hover:bg-[#8A6046]/5 hover:text-[#8A6046]"
                }`}
              >
                {label}
              </Link>
            ))}
            
            {/* Mobile specific call button since it's hidden in main header on mobile */}
            <a
              href="tel:3219706495"
              className="flex lg:hidden items-center gap-4 px-6 py-4 mt-2 bg-slate-50 rounded-xl"
            >
              <div className="w-10 h-10 rounded-full bg-[#8A6046] flex items-center justify-center text-white">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#999] uppercase tracking-widest font-bold">Llamar ahora</span>
                <span className="text-[18px] font-bold text-[#2b2b2b]">321 970 6495</span>
              </div>
            </a>
            {/* Authentication / Dashboard buttons in Mobile Menu */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
              {!loading && user && (
                <>
                  <Link
                    href={isPsi ? "/admin/dashboard" : "/dashboard"}
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full bg-[#8A6046] text-white text-center py-4 rounded-xl font-bold uppercase tracking-widest"
                  >
                    Ir al Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      await createClient().auth.signOut();
                      window.location.reload();
                    }}
                    className="w-full bg-red-50 text-red-600 py-4 rounded-xl font-bold uppercase tracking-widest"
                  >
                    Cerrar Sesión
                  </button>
                </>
              )}

            </div>
          </div>
        </motion.div>
      </nav>
    </>
  );
}
