"use client";

import { Sidebar } from "@/components/admin/Sidebar";
import { useUIStore } from "@/store/uiStore";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { adminSidebarOpen, setAdminSidebarOpen } = useUIStore();
  const pathname = usePathname();

  // If we need to hide the sidebar on specific admin pages, we can do it here
  const hideSidebar = false;

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950">
      {!hideSidebar && (
        <Sidebar 
          isOpen={adminSidebarOpen} 
          onClose={() => setAdminSidebarOpen(false)} 
        />
      )}
      
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* We can optionally put a global header here if we want to unify it */}
        {children}
      </div>
    </div>
  );
}
