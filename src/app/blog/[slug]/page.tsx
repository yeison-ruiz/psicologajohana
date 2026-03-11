import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CalendarDays,
  Share2,
  User as UserIcon,
  ChevronRight,
} from "lucide-react";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await params;

  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, image_url")
    .eq("slug", resolvedParams.slug)
    .single();

  if (!post) {
    return { title: "Artículo no encontrado | Psicóloga Johana" };
  }

  return {
    title: `${post.title} | Psicóloga Johana`,
    description: post.excerpt,
    openGraph: {
      images: [post.image_url || ""],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await params;

  // Fetch current post
  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*, profiles!blog_posts_author_id_fkey(full_name, avatar_url)")
    .eq("slug", resolvedParams.slug)
    .single();

  if (error || !post || !post.published) {
    notFound();
  }

  // Fetch recent posts for sidebar
  const { data: recentPosts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, image_url, created_at")
    .eq("published", true)
    .neq("id", post.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const contentParagraphs = post.content
    .split(/\n\n+/)
    .filter((p: string) => p.trim() !== "");

  return (
    <>
      <Header activeSection="blog" />
      <main className="bg-white">
        <div className="max-w-[1400px] mx-auto py-8 sm:py-16 px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-[#8A6046] transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" /> Todos los artículos
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            {/* Main Content */}
            <article className="lg:col-span-8">
              <header className="mb-12">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {post.category && (
                    <span className="px-4 py-1.5 rounded-full bg-[#8A6046]/10 text-[#8A6046] text-xs font-black uppercase tracking-widest">
                      {post.category}
                    </span>
                  )}
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                    <CalendarDays className="w-4 h-4 text-[#8A6046]" />
                    {format(new Date(post.created_at), "d 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </span>
                </div>

                <h1
                  className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {post.title}
                </h1>

                <div className="flex items-center gap-4 py-6 border-y border-slate-200">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border border-slate-200">
                    <Image
                      src="/profesional.png"
                      alt="Psicóloga Johana Villabón"
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-base leading-none mb-1">
                      Psicóloga Johana Villabón
                    </p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Autora
                    </p>
                  </div>

                  <button className="ml-auto w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-[#8A6046] hover:text-white hover:border-[#8A6046] transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </header>

              {post.image_url && (
                <figure className="mb-16 rounded-4xl overflow-hidden aspect-video bg-slate-100 relative border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
                  <Image
                    src={post.image_url}
                    alt={post.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    className="object-cover"
                    priority
                  />
                </figure>
              )}

              <div className="prose prose-lg prose-slate max-w-none dark:prose-invert prose-headings:font-black prose-headings:font-playfair prose-a:text-[#8A6046] prose-a:no-underline hover:prose-a:text-[#6D4934] prose-img:rounded-3xl">
                {contentParagraphs.map((paragraph: string, index: number) => {
                  if (paragraph.startsWith("## ")) {
                    return (
                      <h2
                        key={index}
                        className="text-3xl font-black text-slate-900 mt-12 mb-6"
                        style={{ fontFamily: "var(--font-playfair)" }}
                      >
                        {paragraph.replace("## ", "")}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith("### ")) {
                    return (
                      <h3
                        key={index}
                        className="text-2xl font-bold text-slate-900 mt-10 mb-4"
                      >
                        {paragraph.replace("### ", "")}
                      </h3>
                    );
                  }
                  const imgMatch = paragraph.match(/!\[([^\]]*)\]\(([^)]+)\)/);
                  if (imgMatch) {
                    return (
                      <figure
                        key={index}
                        className="my-10 rounded-3xl overflow-hidden shadow-lg border border-slate-100"
                      >
                        <img
                          src={imgMatch[2]}
                          alt={imgMatch[1]}
                          className="w-full object-cover"
                        />
                        {imgMatch[1] && (
                          <figcaption className="text-center text-sm text-slate-500 p-4 bg-slate-50 font-medium italic">
                            {imgMatch[1]}
                          </figcaption>
                        )}
                      </figure>
                    );
                  }
                  return (
                    <p
                      key={index}
                      className="text-[1.15rem] leading-[1.8] text-slate-700 font-medium mb-6"
                      dangerouslySetInnerHTML={{
                        __html: paragraph.replace(/\n/g, "<br />"),
                      }}
                    />
                  );
                })}
              </div>

              <div className="mt-16 pt-8 border-t border-slate-200">
                <div className="bg-[#f8f3ee] rounded-3xl p-8 sm:p-12 text-center">
                  <h3
                    className="text-2xl font-black text-slate-900 mb-4"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    ¿Necesitas ayuda profesional?
                  </h3>
                  <p className="text-slate-600 font-medium text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                    Si sientes que necesitas apoyo adicional para manejar tus
                    emociones, agenda una primera consulta. No tienes que
                    hacerlo solo(a).
                  </p>
                  <Link
                    href="/book"
                    className="inline-block bg-[#8A6046] text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-[#6D4934] transition-all shadow-xl hover:-translate-y-1"
                  >
                    Agendar Consulta
                  </Link>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-32">
                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                  <h3
                    className="text-2xl font-black text-slate-900 mb-8 pb-4 border-b border-slate-200 relative items-center flex"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    Noticias recientes
                    <span className="absolute bottom-[-1px] left-0 w-12 h-1 bg-[#8A6046]"></span>
                  </h3>

                  <div className="flex flex-col gap-8">
                    {recentPosts?.map((recent) => (
                      <Link
                        key={recent.id}
                        href={`/blog/${recent.slug}`}
                        className="group flex gap-4 items-start"
                      >
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-200 shadow-sm">
                          {recent.image_url ? (
                            <Image
                              src={recent.image_url}
                              alt={recent.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-slate-200" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <h4 className="text-[15px] font-bold text-slate-900 leading-snug group-hover:text-[#8A6046] transition-colors line-clamp-2">
                            {recent.title}
                          </h4>
                          <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <CalendarDays className="w-3 h-3" />
                            {format(
                              new Date(recent.created_at),
                              "d MMM, yyyy",
                              {
                                locale: es,
                              },
                            )}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <Link
                    href="/blog"
                    className="mt-10 flex items-center justify-center gap-2 w-full py-4 bg-white border border-slate-200 rounded-2xl text-[13px] font-black uppercase tracking-widest text-[#8A6046] hover:bg-[#8A6046] hover:text-white hover:border-[#8A6046] transition-all shadow-sm"
                  >
                    Ver todo el blog
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
