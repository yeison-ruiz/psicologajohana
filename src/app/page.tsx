"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { testimonialsData } from "@/constants/landing";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Users,
  GraduationCap,
  Laptop,
  ShieldCheck,
  Heart,
  Wind,
  Baby,
  Compass,
  Smile,
  Bell,
  Star,
  Clock,
  Brain,
  Cpu,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [testimonialSlide, setTestimonialSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hogar");
  const [loadVideo, setLoadVideo] = useState(false);
  interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    category?: string | null;
    image_url: string | null;
    created_at: string;
    profiles?: { full_name: string; avatar_url: string } | null;
  }
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const supabase = createClient();
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);

      // Delay heavy assets to prioritize LCP
      setTimeout(() => setLoadVideo(true), 1200);

      // Fetch recent posts
      const { data: posts } = await supabase
        .from("blog_posts")
        .select("*, profiles!blog_posts_author_id_fkey(full_name)")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (posts) setRecentPosts(posts);
    }
    init();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide((p) => (p + 1) % 2), 7000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTestimonialSlide((p) => (p + 1) % 4), 6000);
    return () => clearInterval(t);
  }, []);

  // Periodic Testimonial Notifications
  useEffect(() => {
    let lastIndex = -1;
    const showRandomTestimonial = () => {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * testimonialsData.length);
      } while (randomIndex === lastIndex && testimonialsData.length > 1);

      lastIndex = randomIndex;
      const testimonial = testimonialsData[randomIndex];

      toast.custom(
        () => (
          <div className="p-5 w-full max-w-[350px]">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-[16px] tracking-tight">
                {testimonial.author}
              </span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 text-[#FFD700] fill-[#FFD700]"
                  />
                ))}
              </div>
            </div>
            <p className="text-[14px] leading-relaxed text-white/90 italic">
              &quot;{testimonial.text.substring(0, 100)}...&quot;
            </p>
          </div>
        ),
        {
          duration: 6000,
        },
      );
    };

    const firstTimeout = setTimeout(showRandomTestimonial, 3500);
    const interval = setInterval(showRandomTestimonial, 22000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 50;
          setIsScrolled((current) => {
            if (current !== scrolled) return scrolled;
            return current;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = [
      "hogar",
      "about",
      "services",
      "pricing",
      "blog",
      "contact",
    ];
    const observerOptions = {
      root: null,
      rootMargin: "-40% 0px -40% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id || "hogar");
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const isPsi = user?.user_metadata?.role === "psicologa";
  const canBook = !user || !isPsi;

  return (
    <div
      id="hogar"
      className="min-h-screen bg-white"
      style={{ fontFamily: "var(--font-raleway), sans-serif" }}
    >
      <Header activeSection={activeSection} />

      {/* ═══════ HERO SLIDER ═══════ */}
      <section className="relative w-full h-[680px] md:h-[700px] lg:h-[820px] overflow-hidden">
        {/* Slide BGs */}
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

      {/* ═══════ CARDS ═══════ */}
      <section className="relative z-20 max-w-[1400px] mx-auto px-6 -mt-[40px] md:-mt-[20px] pb-10">
        <div className="flex flex-col md:flex-row shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-sm overflow-hidden">
          {/* Left Card */}
          <div className="flex-[3] bg-white px-12 py-12 flex flex-col justify-center">
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
          <div className="flex-[2] relative px-10 py-9 text-white flex flex-col justify-center overflow-hidden">
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
                  <div className="h-[30px] w-[1px] bg-white/20 mx-2" />
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

      {/* ═══════ ABOUT / BIO SECTION ═══════ */}
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
              {/* Main Photo */}
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

                {/* Quote Card — repositioned to be much lower and to the side */}
                <div className="absolute -bottom-8 -right-4 lg:-right-24 bg-[#f8f3ee] px-8 py-8 w-[340px] shadow-2xl border-l-[6px] border-[#8A6046] rounded-r-3xl z-20">
                  <span
                    className="text-[#8A6046] text-[44px] font-bold leading-none block mb-2"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    &ldquo;
                  </span>
                  <p
                    className="text-[#444] text-[1.25rem] leading-[1.6] italic font-medium"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    Puedo ayudarte a superar los miedos y obstáculos en tu vida.
                  </p>
                </div>
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
                  Permítanme Presentarles
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
                Con más de 10 años de experiencia profesional, me especializo en
                brindar acompañamiento en salud mental a través de un enfoque
                humano y comprensivo, ayudando a las personas a redescubrir su
                bienestar emocional.
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
                sanación interior.
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
                      Psicóloga Johana Villabón
                    </span>{" "}
                    –{" "}
                    <span className="text-[#8A6046] underline underline-offset-2">
                      Psicóloga
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

      {/* ═══════ STATS BAR ═══════ */}
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

      {/* ═══════ SERVICES SECTION ═══════ */}
      <section id="services" className="bg-[#2b2b2b] pt-20 pb-40 relative">
        <div className="max-w-[1400px] mx-auto px-6">
          {/* Header */}
          <div className="max-w-[700px] mb-16 relative z-10">
            {/* Subtitle */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1.5">
                <span className="w-[6px] h-[6px] rounded-full bg-white/50" />
                <span className="w-[30px] h-[1.5px] bg-white/50" />
              </div>
              <span className="text-[13px] font-bold text-white/70 uppercase tracking-[.2em]">
                ÁREAS DE ATENCIÓN
              </span>
            </div>

            <h2 className="text-white text-[36px] lg:text-[44px] font-bold leading-[1.12] mb-6">
              Servicios profesionales para tu crecimiento personal.
            </h2>
            <p className="text-white/50 text-[1.3rem] leading-[1.8]">
              Ofrecemos espacios de apoyo terapéutico y psicoeducativo diseñados
              para responder a tus verdaderas necesidades emocionales en cada
              etapa de la vida.
            </p>
          </div>

          {/* 9 Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14 relative z-10">
            {[
              {
                title: "Talleres Psicoeducativos",
                desc: "Espacios de aprendizaje interactivo para desarrollar habilidades emocionales y de afrontamiento diario.",
                icon: <GraduationCap className="w-6 h-6 text-white" />,
              },
              {
                title: "Acompañamiento Online",
                desc: "Terapia psicológica remota para cuidar tu salud mental desde cualquier lugar con total privacidad.",
                icon: <Laptop className="w-6 h-6 text-white" />,
              },
              {
                title: "Prevención y Promoción",
                desc: "Desarrollo de programas orientados a promover la salud mental y prevenir el deterioro emocional.",
                icon: <ShieldCheck className="w-6 h-6 text-white" />,
              },
              {
                title: "Terapia de Pareja",
                desc: "Orientación especializada para resolver crisis, mejorar la comunicación y reconectar efectivamente.",
                icon: <Heart className="w-6 h-6 text-white" />,
              },
              {
                title: "Duelo y Pérdida",
                desc: "Acompañamiento compasivo para transitar de forma sana situaciones de pérdida y promover la aceptación.",
                icon: <Wind className="w-6 h-6 text-white" />,
              },
              {
                title: "Terapia de Autoestima",
                desc: "Procesos para fortalecer el amor propio, el autoconocimiento y sanar la autoimagen personal.",
                icon: <Smile className="w-6 h-6 text-white" />,
              },
              {
                title: "Niños y Familia",
                desc: "Intervenciones enfocadas en dinámicas familiares sanas, pautas de crianza y el bienestar infantil.",
                icon: <Baby className="w-6 h-6 text-white" />,
              },
              {
                title: "Planificación del Futuro",
                desc: "Asesoramiento vocacional y vital para ayudar a tomar decisiones y gestionar el cambio de manera asertiva.",
                icon: <Compass className="w-6 h-6 text-white" />,
              },
              {
                title: "Adultos Mayores",
                desc: "Atención psicológica sobre los desafíos emocionales de la madurez promoviendo un envejecimiento activo.",
                icon: <Users className="w-6 h-6 text-white" />,
              },
            ].map((svc, i) => (
              <div key={i} className="group">
                {/* Icon Circle */}
                <div className="w-[52px] h-[52px] rounded-full bg-[#3a3a3a] group-hover:bg-[#8A6046] flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 shadow-lg">
                  {svc.icon}
                </div>
                <h3 className="text-white text-[24px] font-black mb-3 group-hover:text-[#e0d3c3] transition-colors">
                  {svc.title}
                </h3>
                <p className="text-white/50 text-[1.2rem] md:text-[1.3rem] leading-[1.6]">
                  {svc.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ AI INNOVATION SECTION ═══════ */}
      <section
        id="ai-innovation"
        className="py-24 bg-white relative overflow-hidden"
      >
        {/* Background blobs for tech feel */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8A6046]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#8A6046]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left: Interactive Feel Mockup / Visual */}
            <div className="flex-1 w-full lg:max-w-[600px]">
              <div className="relative">
                {/* Decorative frames */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#8A6046]/20 to-transparent rounded-[3rem] blur-2xl" />

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
                  className="absolute -bottom-6 -right-6 md:-right-12 bg-white p-6 rounded-2xl shadow-2xl border border-[#8A6046]/10 flex items-center gap-4"
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

              <h2 className="text-[#2b2b2b] text-[40px] lg:text-[54px] font-black leading-[1.05] mb-8 tracking-tight">
                Tu sesión inicia <span className="text-[#8A6046]">antes</span>{" "}
                de la videollamada.
              </h2>

              <p className="text-[#666] text-[1.3rem] leading-[1.8] mb-10">
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
                    Llega a la sesión con tus ideas organizadas. Johana recibirá
                    un resumen clave para ir directo al grano.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f8f3ee] flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-[#8A6046]" />
                    </div>
                    <h4 className="font-bold text-[#2b2b2b]">
                      Privacidad Total
                    </h4>
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

      {/* ═══════ FREE SESSION CTA BANNER ═══════ */}
      <section
        className="py-0 -mt-[120px] md:-mt-[70px] relative pb-16"
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

              <h3 className="text-[#2b2b2b] text-[24px] lg:text-[28px] font-bold leading-tight mb-3">
                Todas las sesiones se realizan a través de Google Meet.
              </h3>
              <p className="text-[#888] text-[1.3rem]">
                Reserva tu horario y agenda tu cita en nuestro{" "}
                <Link
                  href="/book"
                  className="text-[#8A6046] font-bold underline underline-offset-2 hover:text-[#6D4934]"
                >
                  portal web
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ PRICING SECTION ═══════ */}
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
              <span className="w-[30px] h-[1px] bg-[#8A6046]" />
              <span className="text-[11px] font-bold text-[#8A6046] uppercase tracking-[.2em] ml-2">
                Precios de Consulta
              </span>
            </div>
            <h2
              className="text-[#2b2b2b] text-[36px] md:text-[42px] font-bold leading-[1.2] max-w-[500px] mx-auto"
              style={{ fontFamily: "var(--font-raleway)" }}
            >
              Precios simples, opciones flexibles, & nada oculto.
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
                    $120.000
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
                    "Modalidad Presencial u Online",
                  ].map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-[#555] text-[18px] font-bold"
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
                    $180.000
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
                    "Mediación y diálogo guiado",
                    "Orientación y pautas de crianza",
                  ].map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-[#666] text-[16px]"
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
                      className="flex items-center gap-3 text-[#666] text-[16px]"
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
      {/* ═══════ TESTIMONIALS SECTION ═══════ */}
      <section className="pt-2 pb-12 md:py-24 relative overflow-hidden bg-gradient-to-br from-[#FAFAF8] to-[#EAE0D9]/30">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-10 md:mb-24">
            <h2
              className="text-[#2b2b2b] text-[36px] md:text-[50px] leading-[1.1] mb-3 md:mb-5 font-normal"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Lo que dicen nuestros{" "}
              <span className="text-[#8A6046] italic">clientes</span>
            </h2>
            <p className="text-[#666] text-[15px] font-medium">
              Experiencias reales de pacientes que han transformado su bienestar
              emocional
            </p>
          </div>

          {/* Testimonial Content */}
          <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-20 max-w-[1000px] mx-auto min-h-[450px]">
            {/* Left: Quote Slider */}
            <div className="flex-1 text-center flex flex-col items-center relative min-h-[300px] md:min-h-[350px] w-full max-w-[500px]">
              <div
                className="text-[#8A6046] text-[80px] leading-none mb-4 font-serif relative z-0"
                style={{ fontFamily: "Georgia, serif" }}
              >
                ”
              </div>

              {/* Slider logic for text */}
              <div className="relative w-full h-[250px] flex items-center justify-center">
                {testimonialsData.map((testi, i) => (
                  <div
                    key={i}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex flex-col items-center justify-center ${
                      testimonialSlide === i
                        ? "opacity-100 z-10"
                        : "opacity-0 z-0 pointer-events-none"
                    }`}
                  >
                    <p
                      className="text-[#2b2b2b] text-[18px] md:text-[22px] italic leading-[1.6] mb-8"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      “{testi.text}”
                    </p>

                    <div>
                      <span className="text-[#2b2b2b] text-[10px] font-bold uppercase tracking-[.2em] relative">
                        {testi.author}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dots */}
              <div className="flex items-center justify-center gap-2.5 mt-2 z-20">
                {testimonialsData.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialSlide(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      testimonialSlide === i
                        ? "bg-[#8A6046]"
                        : "bg-black/10 hover:bg-black/30 shadow-[0_0_2px_rgba(0,0,0,0.1)]"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right: Images Slider */}
            <div className="flex-1 w-full max-w-[450px] relative aspect-square md:aspect-auto md:h-[550px]">
              {testimonialsData.map((testi, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    testimonialSlide === i
                      ? "opacity-100 z-10"
                      : "opacity-0 z-0"
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={testi.image}
                      alt={`Testimonio de ${testi.author}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 450px"
                      className="object-cover rounded-[20px] shadow-[0_15px_40px_rgba(0,0,0,0.08)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* ═══════ RECENT BLOG POSTS ═══════ */}
      <section
        className="py-24 relative overflow-hidden bg-[#FAF9F6]"
        id="blog"
      >
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row gap-10 md:gap-20 justify-between items-start mb-16">
            {/* Title Area */}
            <div className="flex-1 max-w-[500px]">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-[4px] h-[4px] rounded-full bg-[#8A6046]" />
                <span className="w-[30px] h-[1px] bg-[#8A6046]" />
                <span className="text-[11px] font-bold text-[#8A6046] uppercase tracking-[.2em] ml-2">
                  Artículos Recientes del Blog
                </span>
              </div>
              <h2
                className="text-[#2b2b2b] text-[36px] md:text-[44px] leading-[1.2] font-semibold"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Mantente motivado, lee los artículos semanales del blog.
              </h2>
            </div>

            {/* Description Area */}
            <div className="flex-1 md:max-w-[450px] relative">
              <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-[#8A6046] shadow-sm"></div>
              <p className="text-[#666] text-[15px] leading-[1.8] pl-6 mb-4">
                Descubre consejos prácticos, reflexiones y estrategias para
                mejorar tu bienestar mental y emocional en tu día a día.
                Publicamos contenido nuevo cada semana para ayudarte en tu
                proceso.
              </p>
              <Link
                href="/blog"
                className="ml-6 inline-flex items-center gap-2 text-[#8A6046] font-bold uppercase tracking-wider text-[13px] hover:text-[#6D4934] transition-colors group"
              >
                Ver todos los artículos
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Blog Cards Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <Link
                  href={`/blog/${post.slug}`}
                  key={post.id}
                  className="group cursor-pointer flex flex-col h-full"
                >
                  <div className="relative h-[250px] w-full overflow-hidden rounded-t-md bg-slate-100 shrink-0">
                    {post.image_url && (
                      <Image
                        src={post.image_url}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="bg-white p-8 rounded-b-md shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex-1 flex flex-col relative -mt-6 mx-4 z-10">
                    <div className="flex items-center gap-3 text-[11px] text-[#888] uppercase tracking-wider mb-3">
                      <span className="text-[#8A6046] font-semibold">
                        {post.category || "General"}
                      </span>
                    </div>
                    <h3
                      className="text-[#2b2b2b] text-[20px] font-bold leading-tight mb-4 group-hover:text-[#8A6046] transition-colors"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {post.title}
                    </h3>
                    <p className="text-[#666] text-[14px] line-clamp-2 mb-6 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-400 border border-slate-100 relative">
                        <Image
                          src="/profesional.png"
                          alt="Johana Villabón"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-[13px] font-bold text-[#2b2b2b]">
                        Johana Villabón
                      </span>
                      <span className="text-[13px] text-[#888]">
                        {format(new Date(post.created_at), "MMM d, yyyy", {
                          locale: es,
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <>
                {/* Fallback Static Posts if no DB posts */}
                {/* Static Post 1 */}
                <div className="group cursor-pointer">
                  <div className="relative h-[250px] w-full overflow-hidden rounded-t-md">
                    <Image
                      src="https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&q=80&w=800&h=600"
                      alt="Uso de redes sociales"
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="bg-white p-8 rounded-b-md shadow-[0_10px_30px_rgba(0,0,0,0.05)] relative -mt-6 mx-4 z-10">
                    <div className="flex items-center gap-3 text-[11px] text-[#888] uppercase tracking-wider mb-3">
                      <span className="text-[#8A6046] font-semibold">
                        Personal
                      </span>
                      <span>2 MIN LECTURA</span>
                    </div>
                    <h3
                      className="text-[#2b2b2b] text-[20px] font-bold leading-tight mb-6 group-hover:text-[#8A6046] transition-colors"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      Un pequeño descanso de las redes sociales es importante.
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-400 border border-slate-100 relative">
                        <Image
                          src="/profesional.png"
                          alt="Johana Villabón"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-[13px] font-bold text-[#2b2b2b]">
                        Johana Villabón
                      </span>
                      <span className="text-[13px] text-[#888]">
                        Nov 6, 2026
                      </span>
                    </div>
                  </div>
                </div>

                {/* Static Post 2 */}
                <div className="group cursor-pointer">
                  <div className="relative h-[250px] w-full overflow-hidden rounded-t-md">
                    <Image
                      src="https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&q=80&w=800&h=600"
                      alt="Pareja"
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="bg-white p-8 rounded-b-md shadow-[0_10px_30px_rgba(0,0,0,0.05)] relative -mt-6 mx-4 z-10">
                    <div className="flex items-center gap-3 text-[11px] text-[#888] uppercase tracking-wider mb-3">
                      <span className="text-[#8A6046] font-semibold">
                        Personal
                      </span>
                      <span>2 MIN LECTURA</span>
                    </div>
                    <h3
                      className="text-[#2b2b2b] text-[20px] font-bold leading-tight mb-6 group-hover:text-[#8A6046] transition-colors"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      Equilibrando tu vida amorosa y laboral.
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-400 border border-slate-100 relative">
                        <Image
                          src="/profesional.png"
                          alt="Johana Villabón"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-[13px] font-bold text-[#2b2b2b]">
                        Johana Villabón
                      </span>
                      <span className="text-[13px] text-[#888]">
                        Nov 6, 2026
                      </span>
                    </div>
                  </div>
                </div>

                {/* Static Post 3 */}
                <div className="group cursor-pointer">
                  <div className="relative h-[250px] w-full overflow-hidden rounded-t-md">
                    <Image
                      src="https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800&h=600"
                      alt="Familia"
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="bg-white p-8 rounded-b-md shadow-[0_10px_30px_rgba(0,0,0,0.05)] relative -mt-6 mx-4 z-10">
                    <div className="flex items-center gap-3 text-[11px] text-[#888] uppercase tracking-wider mb-3">
                      <span className="text-[#8A6046] font-semibold">
                        Familia
                      </span>
                      <span>2 MIN LECTURA</span>
                    </div>
                    <h3
                      className="text-[#2b2b2b] text-[20px] font-bold leading-tight mb-6 group-hover:text-[#8A6046] transition-colors"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      Manteniendo a tu familia feliz y saludable
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-400 border border-slate-100 relative">
                        <Image
                          src="/profesional.png"
                          alt="Johana Villabón"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-[13px] font-bold text-[#2b2b2b]">
                        Johana Villabón
                      </span>
                      <span className="text-[13px] text-[#888]">
                        Nov 6, 2026
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      {/* ═══════ FINAL CTA BANNER ═══════ */}
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
      <Footer />
    </div>
  );
}
