import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getPsicologaSlots, createSlot, deleteSlot } from "@/app/admin/availability/actions";

export interface SlotInfo {
  id: string;
  start_at: string;
  end_at: string;
  duration_minutes: number;
  is_available: boolean;
}

export interface PresetBlock {
  id: string;
  title: string;
  duration_minutes: number;
  price: number;
  session_type: string;
}

const defaultPresets: PresetBlock[] = [
  { id: "1", title: "Individual (1 hr)", duration_minutes: 60, price: 80000, session_type: "Terapia Individual" },
  { id: "2", title: "Conjunta (1.5 hrs)", duration_minutes: 90, price: 120000, session_type: "Terapia Conjunta" },
  { id: "3", title: "Prioritaria (1 hr)", duration_minutes: 60, price: 150000, session_type: "Terapia Prioritaria" }
];

interface AdminAvailabilityState {
  slots: SlotInfo[];
  presets: PresetBlock[];
  loading: boolean;
  creating: boolean;
  errorMsg: string | null;
  totalHours: number;
  fetchSlots: () => Promise<void>;
  setCreating: (creating: boolean) => void;
  setErrorMsg: (msg: string | null) => void;
  addSlot: (start: Date, end: Date, duration: number, price: number, type: string) => Promise<boolean>;
  removeSlot: (id: string) => Promise<boolean>;
  updatePreset: (id: string, updates: Partial<PresetBlock>) => void;
}

export const useAdminAvailabilityStore = create<AdminAvailabilityState>()(
  persist(
    (set, get) => ({
      slots: [],
      presets: defaultPresets,
      loading: true,
      creating: false,
      errorMsg: null,
      totalHours: 0,
      
      fetchSlots: async () => {
        const start = new Date(new Date().setMonth(new Date().getMonth() - 2));
        const end = new Date(new Date().setMonth(new Date().getMonth() + 4));
        const data = await getPsicologaSlots(start, end);
        
        // Mantener loading true si estamos rehidratando? zustand persist lo hace automático.
        // Pero esta es la carga inicial de datos desde supabase.
        let minutes = 0;
        data.forEach((s: SlotInfo) => {
          if (s.is_available) minutes += s.duration_minutes;
        });
        
        set({
          slots: data,
          totalHours: Math.round(minutes / 60),
          loading: false
        });
      },
      
      setCreating: (creating) => set({ creating }),
      setErrorMsg: (errorMsg) => set({ errorMsg }),
      
      addSlot: async (start, end, duration, price, type) => {
        set({ creating: true, errorMsg: null });
        const result = await createSlot({
          start_at: start.toISOString(),
          end_at: end.toISOString(),
          duration_minutes: duration,
          price: price,
          session_type: type,
        });
        
        if (result.error) {
          set({ errorMsg: result.error as string, creating: false });
          return false;
        } else {
          await get().fetchSlots();
          set({ creating: false });
          return true;
        }
      },
      
      removeSlot: async (id) => {
        set({ errorMsg: null });
        const result = await deleteSlot(id);
        if (result.error) {
          set({ errorMsg: result.error as string });
          return false;
        } else {
          await get().fetchSlots();
          return true;
        }
      },

      updatePreset: (id, updates) => {
        set((state) => ({
          presets: state.presets.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      }
    }),
    {
      name: 'psico-admin-presets', // nombre clave en localStorage
      partialize: (state) => ({ presets: state.presets }), // solo guardar los presets
    }
  )
);
