import { create } from 'zustand';

interface UIStore {
  adminSidebarOpen: boolean;
  setAdminSidebarOpen: (isOpen: boolean) => void;
  toggleAdminSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  adminSidebarOpen: false,
  setAdminSidebarOpen: (isOpen) => set({ adminSidebarOpen: isOpen }),
  toggleAdminSidebar: () => set((state) => ({ adminSidebarOpen: !state.adminSidebarOpen })),
}));
