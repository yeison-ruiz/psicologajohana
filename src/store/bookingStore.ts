import { create } from 'zustand';
import { startOfDay, addDays } from "date-fns";

export interface SlotData {
  id: string;
  start_at: string;
  end_at: string;
  duration_minutes: number;
  price: number;
  session_type: string;
  psicologa_id: string;
  profiles?: { full_name: string }[] | { full_name: string } | null;
}

interface BookingState {
  currentMonth: Date;
  selectedDate: Date;
  selectedTime: SlotData | null;
  slots: SlotData[];
  setCurrentMonth: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedTime: (slot: SlotData | null) => void;
  setSlots: (slots: SlotData[]) => void;
  clearSelection: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  currentMonth: new Date(),
  selectedDate: startOfDay(addDays(new Date(), 1)),
  selectedTime: null,
  slots: [],
  setCurrentMonth: (date) => set({ currentMonth: date }),
  setSelectedDate: (date) => set({ selectedDate: date, selectedTime: null }),
  setSelectedTime: (slot) => set({ selectedTime: slot }),
  setSlots: (slots) => set({ slots }),
  clearSelection: () => set({ selectedTime: null }),
}));
