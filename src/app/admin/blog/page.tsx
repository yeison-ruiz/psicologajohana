"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { Plus, Edit, Trash2, Globe, EyeOff, Loader2, Menu } from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  created_at: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = createClient();

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar los artículos: " + error.message);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar "${title}"? Esta acción no se puede deshacer.`,
      )
    )
      return;

    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast.error("Error al eliminar: " + error.message);
    } else {
      toast.success("Artículo eliminado con éxito");
      fetchPosts();
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("blog_posts")
      .update({ published: !currentStatus })
      .eq("id", id);

    if (error) {
      toast.error("Error al publicar: " + error.message);
    } else {
      toast.success(currentStatus ? "Artículo ocultado" : "Artículo publicado");
      fetchPosts();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div
        className={`fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <div
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8 dark:border-slate-800 dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="text-slate-500 md:hidden hover:text-slate-700 dark:text-slate-400"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Blog
            </h2>
          </div>
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Nuevo Artículo
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-5xl">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 border-dashed bg-slate-50/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <Globe className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Aún no tienes artículos
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                  Empieza a compartir tu conocimiento creando el primer artículo
                  de tu blog.
                </p>
                <Link
                  href="/admin/blog/new"
                  className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-700 active:scale-95"
                >
                  <Plus className="w-5 h-5" /> Crear mi primer artículo
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest ${
                            post.published
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-400"
                              : "bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/30 dark:text-amber-400"
                          }`}
                        >
                          {post.published ? (
                            <>
                              <Globe className="w-3 h-3" /> Público
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" /> Borrador
                            </>
                          )}
                        </span>
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                          {format(
                            new Date(post.created_at),
                            "d 'de' MMMM, yyyy",
                            {
                              locale: es,
                            },
                          )}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {post.title}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <Globe className="w-4 h-4" />
                        /blog/{post.slug}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button
                        onClick={() => togglePublish(post.id, post.published)}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${
                          post.published
                            ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400"
                        }`}
                      >
                        {post.published ? "Ocultar" : "Publicar"}
                      </button>
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800/50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
