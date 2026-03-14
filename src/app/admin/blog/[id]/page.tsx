"use client";

import { useState, useEffect } from "react";
import { useUIStore } from "@/store/uiStore";
import { BlogForm } from "@/components/admin/BlogForm";
import { Menu, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function EditBlogPostPage() {
  const { setAdminSidebarOpen } = useUIStore();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const id = params.id as string;

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Artículo no encontrado");
        router.push("/admin/blog");
      } else {
        setInitialData(data);
      }
      setLoading(false);
    };
    if (id) {
      fetchPost();
    }
  }, [id, router, supabase]);

  return (
    <div className="flex h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center border-b border-slate-200 bg-white px-4 md:px-8 dark:border-slate-800 dark:bg-slate-900 shrink-0 md:hidden">
          <button
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 p-2"
            onClick={() => setAdminSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : (
            <BlogForm initialData={initialData} isEdit />
          )}
        </div>
      </main>
    </div>
  );
}
