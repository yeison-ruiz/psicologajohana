"use client";

import {
  LayoutDashboard,
  CalendarDays,
  CreditCard,
  User,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function PatientLayoutClient({
  profile,
  children,
}: {
  profile: {
    id: string;
    full_name: string;
    avatar_url?: string;
  } | null;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Mis Citas", href: "/paciente/mis-citas", icon: CalendarDays },
    { name: "Pagos", href: "/paciente/pagar", icon: CreditCard },
    { name: "Perfil", href: "/paciente/perfil", icon: User },
  ];

  // Helper to determine active prefix (e.g. /paciente/pagar/something)
  const isLinkActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname.startsWith("/paciente/mis-citas")) return "Mis Citas";
    if (pathname.startsWith("/paciente/pagar")) return "Recibos de Pago";
    if (pathname.startsWith("/paciente/perfil")) return "Mi Perfil";
    return "";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 w-64 h-full flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-[0%]" : "-translate-x-full"
        }`}
      >
        <div className="flex h-40 items-center justify-center border-b border-slate-100 dark:border-slate-800 shrink-0">
          <Link
            href="/"
            className="flex flex-col items-center gap-2 group w-full"
          >
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Logo"
                width={400}
                height={400}
                unoptimized
                className="h-20 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-base font-black text-slate-900 dark:text-white leading-none tracking-tighter">
                PSICOCONNECT
              </span>
              <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] mt-1">
                Portal Paciente
              </span>
            </div>
          </Link>
        </div>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-6">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isLinkActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base transition-colors ${
                    isActive
                      ? "bg-primary-50 dark:bg-primary-900/20 font-bold text-primary-700 dark:text-primary-300"
                      : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-5 h-5" /> {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Top Header */}
        <header className="flex h-16 md:h-20 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 sm:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <LayoutDashboard className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white hidden sm:block">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 dark:border-slate-700 bg-primary-100 text-primary-700 font-bold shrink-0">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile?.full_name || "Usuario"}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  profile?.full_name?.charAt(0) || "U"
                )}
              </div>
              <div className="hidden lg:block">
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  {profile?.full_name || "Cargando..."}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
