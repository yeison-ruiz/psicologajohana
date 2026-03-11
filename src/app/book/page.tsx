"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CalendarCheck,
  Video,
  Timer,
  ArrowRight,
  Lock,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useMemo, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getAvailableSlots, createAppointment } from "./actions";
import {
  format,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  startOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useBookingStore, SlotData } from "@/store/bookingStore";

function BookPageContent() {
  const {
    currentMonth,
    selectedDate,
    selectedTime,
    slots,
    setCurrentMonth,
    setSelectedDate,
    setSelectedTime,
    setSlots,
  } = useBookingStore();

  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const paramType = searchParams.get("type");

  const displayType = useMemo(() => {
    if (paramType === "individual") return "Terapia Individual";
    if (paramType === "conjunta") return "Terapia Conjunta";
    return null;
  }, [paramType]);

  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<{
    full_name: string;
    avatar_url: string | null;
  } | null>(null);

  // Load user profile
  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
    }
    loadProfile();
  }, []);

  // Generate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad start of month to align with weekday (Mon=0)
    const startDay = getDay(monthStart); // 0=Sun, 1=Mon...
    const padStart = startDay === 0 ? 6 : startDay - 1; // Convert to Mon=0
    const paddedDays: (Date | null)[] = Array(padStart).fill(null);

    return [...paddedDays, ...allDays];
  }, [currentMonth]);

  useEffect(() => {
    async function loadSlots() {
      setLoading(true);
      setError(null);
      const res = await getAvailableSlots();
      console.log("[BookPage] Slots loaded:", res.slots?.length, res.error);
      if (res.error) {
        setError(res.error);
      } else {
        setSlots((res.slots || []) as SlotData[]);
      }
      setLoading(false);
    }
    loadSlots();
  }, [setSlots]);

  // Filter slots for the selected date
  // Note: server already filters is_available=true, no need to re-check
  const availableSlotsForDate = useMemo(() => {
    return slots.filter((slot) => {
      const isDateMatch = isSameDay(parseISO(slot.start_at), selectedDate);
      if (!isDateMatch) return false;

      // Filter by therapy type if provided in the URL
      if (displayType) {
        const slotType = slot.session_type;
        if (displayType === "Terapia Individual") {
          return slotType === "Terapia Individual" || slotType === "Individual (1 hr)";
        }
        if (displayType === "Terapia Conjunta") {
          return slotType === "Terapia Conjunta" || slotType === "Conjunta (1.5 hrs)";
        }
        return slotType === displayType;
      }

      return true;
    });
  }, [slots, selectedDate, displayType]);

  const isDayAvailable = (date: Date) => {
    return slots.some((slot) => {
      const isDateMatch = isSameDay(parseISO(slot.start_at), date);
      if (!isDateMatch) return false;

      if (displayType) {
        const slotType = slot.session_type;
        if (displayType === "Terapia Individual") {
          return slotType === "Terapia Individual" || slotType === "Individual (1 hr)";
        }
        if (displayType === "Terapia Conjunta") {
          return slotType === "Terapia Conjunta" || slotType === "Conjunta (1.5 hrs)";
        }
        return slotType === displayType;
      }

      return true;
    });
  };

  const handleBook = () => {
    if (!selectedTime) return;

    startTransition(async () => {
      setError(null);
      const res = await createAppointment(
        selectedTime.id,
        selectedTime.psicologa_id,
      );
      if (res?.error) {
        setError(res.error);
        return;
      }
      // Redirect to payment step
      window.location.href = `/paciente/pagar/${res.appointmentId}`;
    });
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const goNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goPrevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    // Don't go before current month
    if (
      prev >= startOfMonth(new Date()) ||
      format(prev, "yyyy-MM") >= format(new Date(), "yyyy-MM")
    ) {
      setCurrentMonth(prev);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] dark:from-slate-950 dark:via-slate-900 dark:to-primary-950/20 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200/60 px-6 md:px-10 py-4 bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Logo"
                width={120}
                height={120}
                className="h-14 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-slate-900 tracking-tighter leading-none">
                Psicóloga Johana Villabón
              </span>
              <span className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em] mt-0.5">
                Portal Paciente
              </span>
            </div>
          </Link>
        </div>
        <div className="flex flex-1 justify-end gap-8 items-center">
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-slate-500 text-base font-bold leading-normal hover:text-slate-900 transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/paciente/mis-citas"
              className="text-slate-500 text-base font-bold leading-normal hover:text-slate-900 transition-colors"
            >
              Mis Citas
            </Link>
            <Link
              href="/book"
              className="text-primary-600 text-base font-black leading-normal relative after:absolute after:bottom-[-6px] after:left-0 after:right-0 after:h-[2.5px] after:bg-primary-500 after:rounded-full"
            >
              Agendar
            </Link>
          </div>
          <div className="h-7 w-px bg-slate-200 mx-1"></div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white font-semibold text-xs shrink-0 shadow-sm">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                profile?.full_name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>
            <span className="text-base font-black text-slate-700 hidden sm:block capitalize">
              {profile?.full_name || "Cargando..."}
            </span>
            <button
              onClick={handleSignOut}
              className="p-1.5 text-slate-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary-100/30 via-transparent to-transparent rounded-full -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-50/40 via-transparent to-transparent rounded-full -z-10 pointer-events-none" />

        <div className="w-full max-w-5xl space-y-7 relative z-10">
          {/* Page Header */}
          <motion.div
            className="flex flex-col md:flex-row md:items-end justify-between gap-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-bold border border-primary-100">
                  <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                  Disponible ahora
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-[-0.04em] text-slate-900 leading-none mb-3">
                Agendar {displayType || "cita"}
              </h1>
              <p className="mt-4 text-xl text-slate-500 font-black leading-relaxed">
                Selecciona fecha y hora para tu sesión con la Psicóloga Johana
                Villabón
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3.5 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center gap-2.5 text-sm font-medium"
                >
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <span className="text-red-500 text-xs">!</span>
                  </div>
                  {error}
                </motion.div>
              )}
            </div>
            {/* Step Indicator */}
            <div className="flex items-center gap-2 text-lg font-black bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm">
              <span
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-full text-base font-black transition-colors",
                  !selectedTime
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-emerald-500 text-white",
                )}
              >
                {selectedTime ? "✓" : "1"}
              </span>
              <span className="text-slate-800 font-black hidden sm:inline ml-1.5 mr-1.5">
                Fecha
              </span>
              <div className="w-8 h-px bg-slate-200 mx-2" />
              <span
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-full text-base font-black transition-colors",
                  selectedTime
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-400",
                )}
              >
                2
              </span>
              <span className="text-slate-400 hidden sm:inline ml-1.5 mr-1.5">
                Hora
              </span>
              <div className="w-8 h-px bg-slate-200 mx-2" />
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-400 text-base font-black">
                3
              </span>
              <span className="text-slate-400 hidden sm:inline ml-1.5">
                Confirmar
              </span>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Column: Selection Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Calendar */}
              <motion.div
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.02)]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
              >
                <div className="px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center border border-primary-100 shadow-sm">
                      <Calendar className="w-6 h-6 text-primary-500" />
                    </div>
                    Seleccionar Fecha
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={goPrevMonth}
                      className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all active:scale-95 text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xl font-black text-slate-800 min-w-[200px] text-center capitalize tracking-tight">
                      {format(currentMonth, "MMMM yyyy", { locale: es })}
                    </span>
                    <button
                      onClick={goNextMonth}
                      className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all active:scale-95 text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 mb-1">
                    {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                      <div
                        key={`${d}-${i}`}
                        className="text-center text-sm font-black text-slate-400 uppercase py-4"
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-y-1">
                    {calendarDays.map((date, idx) => {
                      if (!date) {
                        return <div key={`pad-${idx}`} className="h-11" />;
                      }
                      const available = isDayAvailable(date);
                      const isSelected = isSameDay(date, selectedDate);
                      const isToday = isSameDay(date, new Date());

                      return (
                        <div
                          key={date.toISOString()}
                          className="flex items-center justify-center"
                        >
                          <button
                            disabled={!available}
                            onClick={() => {
                              if (available) {
                                setSelectedDate(startOfDay(date));
                                setSelectedTime(null);
                              }
                            }}
                            className={cn(
                              "w-14 h-14 rounded-full text-lg font-black transition-all duration-300 relative flex items-center justify-center",
                              // Unavailable
                              !available &&
                                "text-slate-200 cursor-not-allowed bg-transparent",
                              // Available (not selected)
                              available &&
                                !isSelected &&
                                "text-primary-600 bg-primary-50/80 hover:bg-primary-100 cursor-pointer font-black shadow-sm",
                              // Selected
                              isSelected &&
                                "bg-primary-600 text-white shadow-xl shadow-primary-500/40 font-black scale-[1.12] z-10",
                              // Today ring
                              isToday &&
                                !isSelected &&
                                "ring-2 ring-primary-300 ring-offset-2",
                            )}
                          >
                            {format(date, "d")}
                            {available && !isSelected && (
                              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary-400" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {/* Legend */}
                  <div className="mt-5 pt-4 border-t border-slate-50 flex items-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-primary-100 border border-primary-200" />
                      <span className="text-slate-500 font-bold">
                        Disponible
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-primary-600 shadow-sm" />
                      <span className="text-slate-500 font-bold">
                        Seleccionado
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full ring-2 ring-primary-200 ring-offset-1" />
                      <span className="text-slate-500 font-bold">Hoy</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2: Time Slots */}
              <motion.div
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.02)]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center border border-primary-100 shadow-sm">
                      <Clock className="w-6 h-6 text-primary-500" />
                    </div>
                    Seleccionar Hora
                  </h2>
                  {availableSlotsForDate.length > 0 && (
                    <span className="text-base font-black text-primary-600 bg-primary-50 px-4 py-2 rounded-2xl border border-primary-100 shadow-sm">
                      {availableSlotsForDate.length}{" "}
                      {availableSlotsForDate.length !== 1
                        ? "Disponibles"
                        : "Disponible"}
                    </span>
                  )}
                </div>
                <div className="px-6 pb-6 min-h-[120px]">
                  {loading ? (
                    <div className="flex gap-3 flex-wrap">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-[52px] w-[140px] bg-slate-50 rounded-xl animate-pulse"
                        />
                      ))}
                    </div>
                  ) : availableSlotsForDate.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-50 flex items-center justify-center">
                        <Timer className="w-7 h-7 text-slate-200" />
                      </div>
                      <p className="text-base font-bold text-slate-400">
                        No hay horarios para esta fecha
                      </p>
                      <p className="text-sm text-slate-300 mt-1 font-bold">
                        Selecciona un día con disponibilidad
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {availableSlotsForDate.map((slot, i) => {
                        const parsedDate = parseISO(slot.start_at);
                        const parsedEnd = parseISO(slot.end_at);
                        const timeStr = format(parsedDate, "h:mm a");
                        const endStr = format(parsedEnd, "h:mm a");
                        const isSelected = selectedTime?.id === slot.id;

                        return (
                          <motion.button
                            key={slot.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: i * 0.05 }}
                            onClick={() => setSelectedTime(slot)}
                            className={cn(
                              "relative py-4 px-5 rounded-2xl text-left transition-all duration-300 border-2 group",
                              isSelected
                                ? "bg-primary-600 border-primary-600 shadow-xl shadow-primary-500/30 scale-[1.03]"
                                : "border-slate-100 bg-white hover:border-primary-300 hover:bg-primary-50/80 hover:shadow-md",
                            )}
                          >
                            <span
                              className={cn(
                                "block text-lg font-black tracking-tight",
                                isSelected ? "text-white" : "text-slate-800",
                              )}
                            >
                              {timeStr}
                            </span>
                            <span
                              className={cn(
                                "block text-sm mt-1.5 font-black",
                                isSelected
                                  ? "text-primary-100"
                                  : "text-slate-400",
                              )}
                            >
                              hasta {endStr} · {slot.duration_minutes}m
                            </span>
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right Column: Summary Card (Sticky) */}
            <motion.div
              className="lg:col-span-1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <div className="bg-white rounded-2xl border border-slate-100 sticky top-20 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
                {/* Card Header with gradient */}
                <div className="p-6 pb-5 bg-gradient-to-b from-slate-50/80 to-white border-b border-slate-100">
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-5">
                    Resumen de la Cita
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-primary-500/20 rotate-3 transition-transform group-hover:rotate-0 overflow-hidden">
                      <Image
                        src="/profesional.png"
                        alt="Psicóloga Johana Villabón"
                        width={56}
                        height={56}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 leading-tight tracking-tight">
                        Psicóloga Johana Villabón
                      </h3>
                      <p className="text-base font-black text-primary-600 mt-1">
                        Psicóloga
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4">
                  {/* Date & Time */}
                  <div className="flex gap-4 items-start">
                    <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center shrink-0 border border-primary-100 shadow-sm">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-black text-slate-900 capitalize truncate tracking-tight">
                        {selectedDate
                          ? format(selectedDate, "eeee, d 'de' MMMM", {
                              locale: es,
                            })
                          : "Fecha sin seleccionar"}
                      </p>
                      <p className="text-base font-black text-slate-500 mt-1">
                        {selectedTime
                          ? format(parseISO(selectedTime.start_at), "h:mm a") +
                            " - " +
                            format(parseISO(selectedTime.end_at), "h:mm a")
                          : "Selecciona una hora"}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex gap-4 items-start">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-100 shadow-sm">
                      <Timer className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-900 tracking-tight">
                        {selectedTime?.duration_minutes || (displayType === "Terapia Individual" ? "60" : displayType === "Terapia Conjunta" ? "90" : "—")} Minutos
                      </p>
                      <p className="text-base font-black text-primary-600 mt-1 capitalize">
                        {selectedTime?.session_type?.replace(/_/g, " ") || displayType || "Esperando selección"}
                      </p>
                    </div>
                  </div>

                  {/* Platform */}
                  <div className="flex gap-4 items-start">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm">
                      <Video className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-900 tracking-tight">
                        Google Meet
                      </p>
                      <p className="text-base font-black text-slate-500 mt-1">
                        Link al confirmarse tu pago
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price + CTA */}
                <div className="p-5 pt-0 space-y-3.5">
                  <div className="bg-slate-50/80 rounded-2xl p-5 flex justify-between items-center border border-slate-100 shadow-inner">
                    <p className="text-base font-black text-slate-400 uppercase tracking-widest">
                      Total
                    </p>
                    <p className="text-4xl font-black text-primary-600 tracking-tighter">
                      {selectedTime
                        ? new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                          }).format(selectedTime.price)
                        : "—"}
                    </p>
                  </div>

                  <button
                    onClick={handleBook}
                    disabled={!selectedTime || isPending}
                    className={cn(
                      "w-full font-black py-6 px-8 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group text-xl shadow-xl hover:shadow-2xl",
                      !selectedTime || isPending
                        ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-1 active:scale-95",
                    )}
                  >
                    <span>
                      {isPending ? "Procesando..." : "Confirmar Cita"}
                    </span>
                    {!isPending && (
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    )}
                  </button>
                  <p className="text-center text-[10px] font-medium text-slate-300 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" />
                    Pago seguro con SSL 256-bit
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs font-medium text-slate-300">
            © 2026 - Psicóloga Johana Villabón. Todos los derechos reservados.
          </p>
          <div className="flex gap-5">
            <Link
              href="#"
              className="text-xs font-medium text-slate-300 hover:text-slate-500 transition-colors"
            >
              Privacidad
            </Link>
            <Link
              href="#"
              className="text-xs font-medium text-slate-300 hover:text-slate-500 transition-colors"
            >
              Términos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function BookAppointment() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8fafb] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
          <p className="text-slate-400 font-black">Cargando portal...</p>
        </div>
      </div>
    }>
      <BookPageContent />
    </Suspense>
  );
}
