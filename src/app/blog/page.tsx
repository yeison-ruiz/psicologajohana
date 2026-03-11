import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function BlogIndexPage() {
  const supabase = await createClient();

  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching blog posts:", error);
  }

  return (
    <>
      <Header activeSection="blog" />
      <main className="bg-white min-h-screen">
        <div className="max-w-[1400px] mx-auto px-6 pt-12 pb-24 flex flex-col gap-12">
          <div className="max-w-3xl">
            <h1
              className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Reflexiones y recursos para tu{" "}
              <span className="text-[#8A6046] italic">bienestar emocional</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed font-medium max-w-2xl">
              Explora artículos sobre psicología, relaciones, salud mental y
              desarrollo personal escritos para ayudarte a vivir una vida más
              plena y consciente.
            </p>
          </div>

          {!posts || posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-white shadow-sm border border-slate-100">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <CalendarDays className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Próximamente
              </h2>
              <p className="text-slate-500">
                Estamos preparando nuevos recursos y artículos para ti.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-3xl bg-white overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_40px_rgba(138,96,70,0.12)] transition-all duration-300 border border-slate-100 hover:border-[#8A6046]/20 transform hover:-translate-y-1"
                >
                  <div className="relative w-full aspect-4/3 bg-slate-100 overflow-hidden">
                    {post.image_url ? (
                      <Image
                        src={post.image_url}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-br from-[#8A6046]/10 to-slate-200/50" />
                    )}
                    {post.category && (
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#8A6046] px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                        {post.category}
                      </div>
                    )}
                  </div>

                  <div className="p-6 sm:p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                      <CalendarDays className="w-4 h-4 text-[#8A6046]" />
                      {format(new Date(post.created_at), "d 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                    </div>

                    <h3
                      className="text-xl sm:text-2xl font-black text-slate-900 mb-3 leading-tight group-hover:text-[#8A6046] transition-colors"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {post.title}
                    </h3>

                    <p className="text-sm font-medium text-slate-600 mb-6 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="mt-auto flex items-center gap-2 text-[#8A6046] text-sm font-black uppercase tracking-widest group-hover:gap-3 transition-all">
                      Leer artículo <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
