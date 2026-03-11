"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Post {
  id: string;
  slug: string;
  title: string;
  image_url?: string | null;
  category?: string | null;
  excerpt?: string;
  created_at: string;
}

interface BlogSectionProps {
  recentPosts: Post[];
}

export default function BlogSection({ recentPosts }: BlogSectionProps) {
  return (
    <section className="py-24 relative overflow-hidden bg-[#FAF9F6]" id="blog">
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-20 justify-between items-start mb-16">
          {/* Title Area */}
          <div className="flex-1 max-w-[500px]">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-[4px] h-[4px] rounded-full bg-[#8A6046]" />
              <span className="w-[30px] h-px bg-[#8A6046]" />
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
            <div className="absolute left-0 top-0 bottom-0 w-px bg-[#8A6046] shadow-sm"></div>
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
                    <span className="text-[13px] text-[#888]">Nov 6, 2026</span>
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
                    <span className="text-[13px] text-[#888]">Nov 6, 2026</span>
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
                    <span className="text-[13px] text-[#888]">Nov 6, 2026</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
