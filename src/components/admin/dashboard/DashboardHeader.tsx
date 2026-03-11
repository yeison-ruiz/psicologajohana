"use client";

import { 
  Menu, 
  Search, 
  Bell 
} from "lucide-react";

interface Profile {
  full_name: string;
  avatar_url?: string;
}

interface DashboardHeaderProps {
  profile: Profile | null;
  pendingPaymentsCount: number;
  onOpenSidebar: () => void;
}

export function DashboardHeader({ 
  profile, 
  pendingPaymentsCount, 
  onOpenSidebar 
}: DashboardHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8 dark:border-slate-800 dark:bg-slate-900 shrink-0">
      <div className="flex items-center gap-4">
        <button
          className="text-slate-500 md:hidden hover:text-slate-700 dark:text-slate-400"
          onClick={onOpenSidebar}
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Dashboard General
        </h2>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="relative hidden w-64 md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            className="h-12 w-full rounded-2xl border-none bg-slate-100 pl-11 text-lg font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-600/20 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 shadow-inner"
          />
        </div>
        <div className="hidden items-center rounded-xl bg-primary-50 px-4 py-1.5 text-xs font-black tracking-widest uppercase text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 sm:flex border border-primary-100 dark:border-primary-800/50 shadow-sm">
          Psicóloga
        </div>
        <div className="flex items-center gap-3">
          <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5" />
            {pendingPaymentsCount > 0 && (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"></span>
            )}
          </button>
          <div
            className="flex items-center justify-center h-10 w-10 overflow-hidden rounded-full border-2 border-primary-100 dark:border-slate-700 bg-primary-100 text-primary-700 font-bold bg-cover bg-center shadow-sm"
            style={{
              backgroundImage: profile?.avatar_url
                ? `url("${profile.avatar_url}")`
                : "none",
            }}
          ></div>
        </div>
      </div>
    </header>
  );
}
