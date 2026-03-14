"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  CreditCard,
  Settings,
  LogOut,
  BookOpen,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const supabase = createClient();

  const menuItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/availability",
      label: "Agenda Virtual",
      icon: CalendarDays,
    },
    {
      href: "/admin/patients",
      label: "Pacientes",
      icon: Users,
    },
    {
      href: "/admin/payments",
      label: "Pagos Pendientes",
      icon: CreditCard,
    },
    {
      href: "/admin/blog",
      label: "Blog",
      icon: BookOpen,
    },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed md:relative z-50 w-72 h-full flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
      <div className="flex h-48 items-center justify-center border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex flex-col items-center gap-3 group w-full">
          <div className="relative h-28 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={200}
              height={200}
              priority
              className="h-24 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">
              PSICOCONNECT
            </span>
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.25em] mt-2 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-100/50 dark:border-emerald-800/50">
              Panel Profesional
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-5 py-8">
        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 rounded-2xl px-5 py-4 text-lg font-bold transition-all border border-transparent shadow-sm hover:shadow-md",
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/30"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:border-slate-100 dark:hover:border-slate-700",
                )}
              >
                <item.icon
                  className={cn(
                    "w-6 h-6",
                    isActive ? "text-emerald-600" : "text-slate-400",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-3">
        <Link
          href="/admin/settings"
          className={cn(
            "flex items-center gap-4 rounded-2xl px-5 py-4 text-lg font-bold transition-all border border-transparent",
            pathname === "/admin/settings"
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800/30 shadow-sm"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50",
          )}
        >
          <Settings
            className={cn(
              "w-6 h-6",
              pathname === "/admin/settings"
                ? "text-emerald-600"
                : "text-slate-400",
            )}
          />
          Configuración
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-4 rounded-2xl px-5 py-4 text-lg font-bold text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-800/30 group"
        >
          <LogOut className="w-6 h-6 text-slate-400 group-hover:text-red-600 transition-colors" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
    </>
  );
}
