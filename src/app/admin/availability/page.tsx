"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  GripVertical,
  Edit2,
  Save,
  X,
  Plus,
  Menu,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { Draggable, EventReceiveArg } from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import {
  useAdminAvailabilityStore,
  PresetBlock,
} from "@/store/adminAvailabilityStore";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";

function PresetBlockItem({ preset }: { preset: PresetBlock }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(preset.title);
  const [duration, setDuration] = useState(preset.duration_minutes);
  const [price, setPrice] = useState(preset.price);
  const updatePreset = useAdminAvailabilityStore((state) => state.updatePreset);

  const handleSave = () => {
    updatePreset(preset.id, {
      title,
      duration_minutes: duration,
      price,
    });
    setIsEditing(false);
  };

  const formattedHHMM =
    `0${Math.floor(preset.duration_minutes / 60)}:${preset.duration_minutes % 60 === 0 ? "00" : "30"}`.slice(-5);

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm font-bold"
        />
        <div className="flex gap-2">
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm font-bold"
            placeholder="Minutos"
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(parseInt(e.target.value))}
            className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm font-bold"
            placeholder="Precio"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-emerald-600 text-white rounded-lg py-1 text-xs font-bold hover:bg-emerald-700 transition-colors"
          >
            Guardar
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg py-1 text-xs font-bold transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fc-event cursor-move relative bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group"
      data-title={preset.title}
      data-duration-minutes={preset.duration_minutes}
      data-duration={formattedHHMM}
      data-price={preset.price}
      data-session-type={preset.session_type}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
          <GripVertical className="w-4 h-4 text-emerald-600" />
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary-600"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
      <h4 className="font-black text-slate-800 dark:text-white text-sm leading-tight">
        {preset.title}
      </h4>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1">
        {preset.duration_minutes} min • ${preset.price.toLocaleString()}
      </p>
    </div>
  );
}

export default function AvailabilityPage() {
  const { slots, fetchSlots, addSlot, removeSlot, presets, loading } =
    useAdminAvailabilityStore();
  const { setAdminSidebarOpen } = useUIStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchSlots();
    // Preparar presets draggables
    let draggableEl = document.getElementById("external-events");
    if (draggableEl) {
      new Draggable(draggableEl, {
        itemSelector: ".fc-event",
        eventData: function (eventEl) {
          return {
            title: eventEl.getAttribute("data-title"),
            duration: eventEl.getAttribute("data-duration"),
            extendedProps: {
              durationMinutes: parseInt(
                eventEl.getAttribute("data-duration-minutes") || "60",
              ),
              price: parseInt(eventEl.getAttribute("data-price") || "80000"),
              sessionType: eventEl.getAttribute("data-session-type") || eventEl.getAttribute("data-title"),
            },
          };
        },
      });
    }
  }, [fetchSlots]);

  const handleSelect = async (selectionInfo: { startStr: string; endStr: string }) => {
    const startVal = selectionInfo.startStr;
    const endVal = selectionInfo.endStr;
    const durationMins =
      (new Date(endVal).getTime() - new Date(startVal).getTime()) / 60000;

    if (durationMins > 180 || durationMins < 60) {
      setErrorMsg(
        "La duración debe ser de mínimo 1 hora (60 min) o 1.5 horas (90 min) para Terapia Conjunta.",
      );
      return;
    }

    let price = 80000;
    let type = "Terapia Individual";

    if (durationMins >= 90) {
      price = 180000;
      type = "Terapia Conjunta";
    }

    await addSlot(
      new Date(startVal),
      new Date(endVal),
      durationMins,
      price,
      type,
    );
  };

  const handleEventReceive = async (info: EventReceiveArg) => {
    const startVal = info.event.start;
    if (!startVal) return;
    
    const durationMins = info.event.extendedProps.durationMinutes;
    const price = info.event.extendedProps.price;
    const type = info.event.extendedProps.sessionType;
    const endVal =
      info.event.end || new Date(startVal.getTime() + durationMins * 60000);

    info.revert();

    if (startVal.getTime() < Date.now()) {
      setErrorMsg("No puedes crear disponibilidad en el pasado.");
      return;
    }

    await addSlot(startVal, endVal, durationMins, price, type);
  };

  const handleEventClick = async (clickInfo: {
    event: { id: string; remove: () => void };
  }) => {
    const slotId = clickInfo.event.id;
    if (
      confirm(
        "¿Estás seguro que deseas eliminar este horario de disponibilidad?",
      )
    ) {
      await removeSlot(slotId);
    }
  };

  const events = slots.map((slot) => ({
    id: slot.id,
    title: slot.is_available ? "Disponible" : "Ocupado",
    start: slot.start_at,
    end: slot.end_at,
    backgroundColor: slot.is_available ? "rgba(16, 185, 129, 0.1)" : "rgba(59, 130, 246, 0.1)",
    textColor: slot.is_available ? "#059669" : "#2563eb",
    borderColor: slot.is_available ? "#10b981" : "#3b82f6",
    extendedProps: {
      type: slot.is_available ? "available" : "busy"
    }
  }));

  return (
    <div className="flex xl:flex-row flex-col h-full overflow-hidden bg-slate-50 relative">
      <button 
        onClick={() => setAdminSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 bg-white rounded-xl shadow-md md:hidden border border-slate-200"
      >
        <Menu className="w-6 h-6 text-slate-600" />
      </button>

      <style jsx global>{`
        /* FullCalendar Google Style Overrides */
        .fc {
          --fc-border-color: #f1f5f9;
          --fc-today-bg-color: transparent;
          font-family: inherit;
        }

        .fc .fc-toolbar-title {
          font-size: 1.5rem !important;
          font-weight: 900 !important;
          color: #0f172a;
          letter-spacing: -0.025em;
        }

        .fc .fc-toolbar {
          margin-bottom: 2rem !important;
        }

        .fc .fc-button {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          color: #64748b !important;
          font-weight: 800 !important;
          text-transform: capitalize !important;
          padding: 8px 16px !important;
          border-radius: 12px !important;
          font-size: 14px !important;
          transition: all 0.2s !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
        }

        .fc .fc-button:hover {
          background: #f8fafc !important;
          color: #0f172a !important;
          border-color: #cbd5e1 !important;
        }

        .fc .fc-button-active {
          background: #0f172a !important;
          color: white !important;
          border-color: #0f172a !important;
        }

        .fc th {
          border: none !important;
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 8px 0 !important;
        }

        .fc .fc-col-header-cell-cushion {
          text-decoration: none !important;
          padding: 0 !important;
          width: 100%;
        }

        .fc .fc-timegrid-slot {
          height: 3.5rem !important;
          border-bottom: 1px solid #f8fafc !important;
        }

        .fc .fc-timegrid-axis-cushion {
          color: #94a3b8;
          font-weight: 600;
          font-size: 11px;
        }

        /* Event Styles */
        .fc-v-event {
          border: none !important;
          border-left: 4px solid var(--fc-event-border-color) !important;
          border-radius: 8px !important;
          padding: 4px 8px !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02) !important;
        }

        .fc-event-main {
          padding: 2px 4px !important;
        }

        .fc-event-title {
          font-weight: 800 !important;
          font-size: 12px !important;
        }

        .fc-timegrid-event .fc-event-time {
          font-size: 10px !important;
          font-weight: 700 !important;
          margin-bottom: 2px;
          opacity: 0.8;
        }

        /* Now Indicator */
        .fc .fc-now-indicator-line {
          border-color: #ef4444 !important;
          border-width: 2px !important;
        }

        .fc .fc-now-indicator-arrow {
          border-color: #ef4444 !important;
          border-top-color: transparent !important;
          border-bottom-color: transparent !important;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full px-4 lg:px-6 py-6 gap-6 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-8 md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Gestor de Agenda
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2 font-bold text-lg">
              Selecciona o{" "}
              <strong className="text-primary-600">
                arrastra bloques
              </strong>{" "}
              para definir tu disponibilidad.
            </p>
          </motion.div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 border border-red-100 dark:border-red-800/50 shadow-sm"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="font-bold">{errorMsg}</span>
                <button
                  onClick={() => setErrorMsg(null)}
                  className="ml-2 hover:text-red-800 font-bold"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 grow overflow-hidden">
          {/* Calendar Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grow bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col"
          >
            <div className="grow overflow-y-auto scrollbar-hide">
              <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "timeGridWeek,timeGridDay",
                }}
                locale={esLocale}
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                allDaySlot={false}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                events={events}
                select={handleSelect}
                eventClick={handleEventClick}
                eventReceive={handleEventReceive}
                editable={false}
                droppable={true}
                nowIndicator={true}
                height="auto"
                slotEventOverlap={false}
                dayHeaderContent={(arg) => {
                  const isToday = arg.isToday;
                  const date = arg.date;
                  const dayName = date.toLocaleDateString("es-ES", { weekday: "short" }).toUpperCase().replace(".", "");
                  const dayNumber = date.getDate();

                  return (
                    <div className="flex flex-col items-center py-2">
                      <span className={`text-[11px] font-black tracking-[0.1em] mb-1 ${isToday ? "text-blue-600" : "text-slate-400"}`}>
                        {dayName}
                      </span>
                      <span className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-black transition-all ${
                        isToday 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                          : "text-slate-700 hover:bg-slate-100"
                      }`}>
                        {dayNumber}
                      </span>
                    </div>
                  );
                }}
              />
            </div>
          </motion.div>

          {/* Presets Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-80 flex flex-col gap-6"
          >
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">
                  Bloques
                </h3>
              </div>
              <p className="text-slate-500 font-bold text-sm mb-6">
                Arrastra un bloque al calendario para crear disponibilidad.
              </p>

              <div id="external-events" className="space-y-4">
                {presets.map((preset) => (
                  <PresetBlockItem key={preset.id} preset={preset} />
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-7 h-7 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                      Auto-Save
                    </p>
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                      Sincronizado
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
