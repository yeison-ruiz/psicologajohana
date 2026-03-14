"use client";

import { useUIStore } from "@/store/uiStore";
import { BlogForm } from "@/components/admin/BlogForm";
import { Menu } from "lucide-react";

export default function NewBlogPostPage() {
  const { setAdminSidebarOpen } = useUIStore();

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
          <BlogForm />
        </div>
      </main>
    </div>
  );
}
