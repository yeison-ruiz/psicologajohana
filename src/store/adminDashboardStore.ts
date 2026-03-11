import { create } from 'zustand';
import { createClient } from "@/utils/supabase/client";
import { approvePayment, rejectPayment } from "@/app/admin/payments/[id]/actions";
import { completeAppointmentAction } from "@/app/admin/dashboard/actions";
import { 
  startOfMonth, 
  endOfMonth, 
  isToday, 
  startOfWeek, 
  endOfWeek, 
  addWeeks 
} from "date-fns";

export interface Appointment {
  id: string;
  start_at: string;
  status: string;
  duration_minutes: number;
  meet_link: string | null;
  patient_id: string;
  patient: { full_name: string; email: string } | null;
  payments: {
    id: string;
    amount_expected: number;
    proof_url: string | null;
    status: string;
  }[] | null;
  pre_consultation_report?: {
    id: string;
    emotional_state: string;
    keywords: string[];
    urgency_level: string;
    suggested_focus: string;
    emotional_scores: any;
    chat_history: any[];
  } | null;
}

interface DashboardStats {
  monthlyAppointments: number;
  expectedRevenue: number;
  pendingPayments: number;
  occupationRate: number;
}

interface AdminDashboardState {
  allAppointments: Appointment[];
  todayAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  pendingPayments: Appointment[];
  stats: DashboardStats;
  weeklyData: number[];
  loading: boolean;
  error: string | null;
  
  fetchDashboardData: () => Promise<void>;
  approveAppointment: (appointmentId: string) => Promise<{ success: boolean; error?: string }>;
  rejectAppointment: (appointmentId: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  completeAppointment: (appointmentId: string, patientId: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
  markNoShow: (appointmentId: string, patientId: string) => Promise<{ success: boolean; error?: string }>;
}

import { markNoShowAction } from "@/app/admin/dashboard/actions";

export const useAdminDashboardStore = create<AdminDashboardState>((set, get) => ({
  allAppointments: [],
  todayAppointments: [],
  upcomingAppointments: [],
  pendingPayments: [],
  stats: {
    monthlyAppointments: 0,
    expectedRevenue: 0,
    pendingPayments: 0,
    occupationRate: 0,
  },
  weeklyData: [0, 0, 0, 0],
  loading: true,
  error: null,

  fetchDashboardData: async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    const monthStart = startOfMonth(now).toISOString();
    const monthEnd = endOfMonth(now).toISOString();

    const { data: allAppointments, error } = await supabase
      .from("appointments")
      .select(`
        id, start_at, status, duration_minutes, meet_link, patient_id,
        patient:profiles!appointments_patient_id_fkey(full_name, email),
        payments(id, amount_expected, proof_url, status),
        pre_consultation_report:pre_consultation_reports(id, emotional_state, keywords, urgency_level, suggested_focus, emotional_scores, chat_history)
      `)
      .gte("start_at", monthStart)
      .lte("start_at", monthEnd)
      .order("start_at", { ascending: true });

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }

    const appointments = (allAppointments as unknown as Appointment[]) || [];
    
    // Process Today items
    const todayAppts = appointments.filter(a => isToday(new Date(a.start_at)));

    // Process Upcoming (future dates, not today)
    const upcoming = appointments.filter(a => {
      const d = new Date(a.start_at);
      return d > now && !isToday(d);
    });
    
    // Process Pending (case-insensitive filter)
    const pending = appointments.filter(a => 
      a.status.toUpperCase() === "PENDING_APPROVAL" || 
      (a.payments && a.payments[0]?.status === "pending_approval")
    );

    const confirmed = appointments.filter(a => 
      ["CONFIRMED", "DONE", "PENDING_APPROVAL", "PENDING_PAYMENT", "NO_SHOW"].includes(a.status.toUpperCase())
    );
    
    const totalRevenue = appointments.reduce((sum, a) => sum + (a.payments?.[0]?.amount_expected || 0), 0);
    
    // Available slots for occupation rate
    const { count: totalSlots } = await supabase
      .from("availability_slots")
      .select("*", { count: "exact", head: true })
      .gte("start_time", monthStart)
      .lte("start_time", monthEnd);

    const occupation = totalSlots ? Math.round((appointments.length / totalSlots) * 100) : 0;

    // Weekly data
    const weekData: number[] = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = startOfWeek(addWeeks(startOfMonth(now), i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekCount = appointments.filter(a => {
        const d = new Date(a.start_at);
        return d >= weekStart && d <= weekEnd;
      }).length;
      weekData.push(weekCount);
    }

    set({
      allAppointments: appointments,
      todayAppointments: todayAppts,
      upcomingAppointments: upcoming,
      pendingPayments: pending,
      stats: {
        monthlyAppointments: confirmed.length,
        expectedRevenue: totalRevenue,
        pendingPayments: pending.length,
        occupationRate: occupation,
      },
      weeklyData: weekData,
      loading: false,
    });
  },

  approveAppointment: async (appointmentId: string) => {
    const { allAppointments } = get();
    const appt = allAppointments.find(a => a.id === appointmentId);
    if (!appt || !appt.payments?.[0]?.id) return { success: false, error: "Cita o pago no encontrado." };

    const paymentId = appt.payments[0].id;

    // Optimistic Update
    set(state => ({
      allAppointments: state.allAppointments.map(a => 
        a.id === appointmentId ? { ...a, status: "CONFIRMED" } : a
      ),
      todayAppointments: state.todayAppointments.map(a => 
        a.id === appointmentId ? { ...a, status: "CONFIRMED" } : a
      ),
      pendingPayments: state.pendingPayments.filter(a => a.id !== appointmentId),
      stats: {
        ...state.stats,
        pendingPayments: Math.max(0, state.stats.pendingPayments - 1)
      }
    }));

    const result = await approvePayment(paymentId);
    if (result.error) {
       // Rollback or show error
       await get().fetchDashboardData();
       return { success: false, error: result.error };
    }

    await get().fetchDashboardData();
    return { success: true };
  },

  rejectAppointment: async (appointmentId: string, reason: string) => {
    const { allAppointments } = get();
    const appt = allAppointments.find(a => a.id === appointmentId);
    if (!appt || !appt.payments?.[0]?.id) return { success: false, error: "Cita o pago no encontrado." };

    const paymentId = appt.payments[0].id;
    
    const result = await rejectPayment(paymentId, reason);
    if (result.error) return { success: false, error: result.error };

    await get().fetchDashboardData();
    return { success: true };
  },

  completeAppointment: async (appointmentId: string, patientId: string, notes?: string) => {
    // Optimistic Update
    set(state => ({
      allAppointments: state.allAppointments.map(a => 
        a.id === appointmentId ? { ...a, status: "DONE" } : a
      ),
      todayAppointments: state.todayAppointments.map(a => 
        a.id === appointmentId ? { ...a, status: "DONE" } : a
      ),
    }));

    const result = await completeAppointmentAction(appointmentId, patientId, notes);
    
    if (result.error) {
      await get().fetchDashboardData();
      return { success: false, error: result.error };
    }

    await get().fetchDashboardData();
    return { success: true };
  },

  markNoShow: async (appointmentId: string, patientId: string) => {
    // Optimistic Update
    set(state => ({
      allAppointments: state.allAppointments.map(a => 
        a.id === appointmentId ? { ...a, status: "NO_SHOW" } : a
      ),
      todayAppointments: state.todayAppointments.map(a => 
        a.id === appointmentId ? { ...a, status: "NO_SHOW" } : a
      ),
    }));

    const result = await markNoShowAction(appointmentId, patientId);
    
    if (result.error) {
      await get().fetchDashboardData();
      return { success: false, error: result.error };
    }

    await get().fetchDashboardData();
    return { success: true };
  },
}));
