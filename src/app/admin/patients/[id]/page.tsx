"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Video,
  Edit3,
  History,
  CreditCard,
  Lock,
  Bold,
  Italic,
  Underline,
  List,
  ClipboardList,
  Stethoscope,
  Paperclip,
  Search,
  Bell,
  LayoutDashboard,
  CalendarDays,
  Settings,
  LogOut,
  Users,
  Save,
  X
} from "lucide-react";
import Link from "next/link";
import NextImage from "next/image";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { getPatientData, saveClinicalNote, signNote, updateClinicalNote } from "./actions";
import { format, parseISO, isToday } from "date-fns";
import { es } from "date-fns/locale";

interface PatientProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
}

interface Appointment {
  id: string;
  start_at: string;
  status: string;
  meet_link?: string | null;
}

interface ClinicalNote {
  id: string;
  content: string;
  created_at: string;
  signed_at?: string;
  diagnosis_codes?: string[];
  tasks?: string[];
}

export default function PatientClinicalRecord() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<{
    profile: PatientProfile | null;
    appointments: Appointment[];
    notes: ClinicalNote[];
  }>({
    profile: null,
    appointments: [],
    notes: [],
  });
  const [activeTab, setActiveTab] = useState("clinical-notes");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAppointmentId] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<string[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");

  const appointments = patientData.appointments;
  const profile = patientData.profile!; // verified below
  const notes = patientData.notes;

  const nextAppointment = appointments
    .filter((a) => a.status === "CONFIRMED" && parseISO(a.start_at) > new Date())
    .sort((a, b) => parseISO(a.start_at).getTime() - parseISO(b.start_at).getTime())[0];


  const loadData = useCallback(async () => {
    if (!id) return;
    const data = await getPatientData(id as string);
    setPatientData({
      profile: data.profile || null,
      appointments: data.appointments || [],
      notes: data.notes || [],
    });
  }, [id]);

  useEffect(() => {
    let active = true;
    if (id) {
      const fetchData = async () => {
        await loadData();
        if (active) setLoading(false);
      };
      fetchData();
    }
    return () => {
      active = false;
    };
  }, [id, loadData]);

  const handleSaveNote = async () => {
    if (!newNoteContent.trim() || !id) return;
    setIsSaving(true);
    
    // Find if there is a session today to link it
    const todaySession = appointments.find(a => isToday(parseISO(a.start_at)));
    
    const res = await saveClinicalNote(
        id as string, 
        newNoteContent, 
        selectedAppointmentId || todaySession?.id,
        diagnosis,
        tasks
    );
    
    if (res.success) {
      setNewNoteContent("");
      setDiagnosis([]);
      setTasks([]);
      await loadData();
    }
    setIsSaving(false);
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editingNoteContent.trim() || !id) return;
    setIsSaving(true);
    
    const res = await updateClinicalNote(
      noteId,
      id as string,
      editingNoteContent
    );
    
    if (res.success) {
      setEditingNoteId(null);
      setEditingNoteContent("");
      await loadData();
    }
    setIsSaving(false);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!patientData.profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Paciente no encontrado
        </h2>
        <Link
          href="/admin/patients"
          className="mt-4 text-primary-600 font-bold hover:underline"
        >
          Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Navigation Sidebar */}
      <aside className="fixed md:relative z-40 w-64 h-full flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-transform duration-300 md:translate-x-0 -translate-x-full">
        <div className="flex h-40 items-center justify-center border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex flex-col items-center gap-2 group w-full">
            <div className="relative">
              <NextImage
                src="/logo.png"
                alt="Logo"
                width={400}
                height={400}
                unoptimized
                className="h-24 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tighter">
                PSICOCONNECT
              </span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.25em] mt-1.5 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">
                Panel Profesional
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-6">
          <nav className="flex flex-col gap-1">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-lg font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
            >
              <LayoutDashboard className="w-6 h-6" /> Dashboard
            </Link>
            <Link
              href="/admin/availability"
              className="flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-lg font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
            >
              <CalendarDays className="w-6 h-6" /> Agenda Virtual
            </Link>
            <Link
              href="/admin/patients"
              className="flex items-center gap-3.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 px-4 py-3.5 text-lg font-black text-primary-700 dark:text-primary-300 shadow-sm border border-primary-100 dark:border-primary-800/30"
            >
              <Users className="w-6 h-6" /> Pacientes
            </Link>
            <Link
              href="/admin/payments"
              className="flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-lg font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
            >
              <CreditCard className="w-6 h-6" /> Pagos Pendientes
            </Link>
            <Link
              href="/admin/settings"
              className="flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-lg font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
            >
              <Settings className="w-6 h-6" /> Configuración
            </Link>
          </nav>
        </div>
        <div className="border-t border-slate-100 dark:border-slate-800 p-4">
           <Link href="/login" className="flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-lg font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all">
             <LogOut className="w-6 h-6" /> Cerrar Sesión
           </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950/20">
        {/* Simple Header for Search/Bell */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex-1 max-w-xl">
             <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary-500/50 transition-all">
                <Search className="w-5 h-5 text-slate-500" />
                <input
                  className="flex-1 bg-transparent border-none text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-0 placeholder:text-slate-400 px-3 text-sm font-bold"
                  placeholder="Buscar pacientes..."
                  readOnly
                />
              </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center rounded-xl size-11 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors border border-transparent hover:border-slate-200 relative">
                <Bell className="w-6 h-6" />
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
            </button>
            <div className="bg-indigo-600 rounded-xl size-11 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
                J
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-background">
        {/* Left Sidebar / Patient Info & Timeline */}
        <aside className="w-full lg:w-[380px] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto shrink-0 z-10">
          {/* Breadcrumbs */}
          <div className="px-6 pt-6 pb-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Link
                className="text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
                href="/admin/patients"
              >
                Pacientes
              </Link>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {profile.full_name}
              </span>
            </div>
          </div>

          {/* Patient Profile Card */}
          <div className="px-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div
                    className="flex items-center justify-center rounded-2xl size-20 shadow-sm border border-slate-100 dark:border-slate-800 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-3xl font-black bg-cover bg-center"
                    style={{ 
                      backgroundImage: profile.avatar_url ? `url("${profile.avatar_url}")` : 'none'
                    }}
                  >
                    {!profile.avatar_url && (profile.full_name?.charAt(0) || "P")}
                  </div>
                  <span
                    className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"
                    title="Active Patient"
                  ></span>
                </div>
                <div className="flex flex-col pt-1">
                  <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight">
                    {profile.full_name}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-base font-medium mt-0.5">
                    {profile.email} • {profile.phone_number || "Sin teléfono"}
                  </p>
                  {nextAppointment ? (
                    <div className="flex items-center gap-1.5 mt-2 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-lg w-fit">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-bold">
                        {format(parseISO(nextAppointment.start_at), "eeee d, h:mm a", { locale: es })}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-2 text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-lg w-fit italic">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-bold">Sin próximas citas</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                {appointments.find(a => a.status === "CONFIRMED" && a.meet_link) ? (
                  <a 
                    href={appointments.find(a => a.status === "CONFIRMED" && a.meet_link)?.meet_link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-4 h-16 px-10 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-xl font-black transition-all shadow-xl shadow-primary-500/30 active:scale-95 hover:-translate-y-1 hover:shadow-primary-500/40 w-full"
                  >
                    <Video className="w-7 h-7" />
                    <span>Unirme a Meet</span>
                  </a>
                ) : (
                   <button 
                     disabled
                     className="flex items-center justify-center gap-4 h-16 px-10 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl text-xl font-black cursor-not-allowed w-full"
                   >
                     <Video className="w-7 h-7" />
                     <span>Unirme a Meet</span>
                   </button>
                )}
                <Link href="/admin/availability" className="flex items-center justify-center gap-2 h-11 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-base font-bold transition-all active:scale-95">
                  <Calendar className="w-4 h-4" />
                  <span>Reagendar</span>
                </Link>
              </div>

              {/* Mini Stats */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {appointments.length}
                  </span>
                  <span className="text-sm uppercase font-bold tracking-wider text-slate-500 mt-0.5">
                    Sesiones
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {
                      appointments.filter((a) => a.status === "CONFIRMED")
                        .length
                    }
                  </span>
                  <span className="text-sm uppercase font-bold tracking-wider text-slate-500 mt-0.5">
                    Próximas
                  </span>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/20 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-red-600 dark:text-red-400">
                    {
                      appointments.filter((a) => a.status === "PENDING_PAYMENT")
                        .length
                    }
                  </span>
                  <span className="text-sm uppercase font-bold tracking-wider text-red-500/80 mt-0.5 text-center">
                    Pend. Pago
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm text-center  uppercase tracking-wider">
              Historial Clínico
            </h3>
            <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-bold">
              Ver Todo
            </button>
          </div>

          {/* Timeline List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {appointments.length > 0 ? (
              appointments.map((appt, idx) => {
                const isUpcoming = parseISO(appt.start_at) > new Date();
                return (
                  <div
                    key={appt.id}
                    className="relative pl-6 pb-2 group cursor-pointer"
                  >
                    {idx !== appointments.length - 1 && (
                      <div className="absolute left-[3px] top-6 bottom-[-8px] w-px bg-slate-200 dark:bg-slate-700"></div>
                    )}
                    <div
                      className={`absolute left-0 top-1.5 size-2.5 rounded-full ring-4 ${
                        isUpcoming
                          ? "bg-primary-600 ring-primary-600/20 shadow-[0_0_10px_rgba(35,197,185,0.4)]"
                          : appt.status === "CANCELED"
                            ? "bg-red-500 ring-red-500/20"
                            : "bg-slate-300 dark:bg-slate-600 ring-transparent"
                      }`}
                    ></div>
                    <div
                      className={`p-4 rounded-xl border transition-all hover:shadow-md ${
                        isUpcoming
                          ? "bg-white dark:bg-slate-800 border-primary-100 dark:border-primary-900/30 ring-1 ring-primary-50 dark:ring-primary-900/10"
                          : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span
                          className={`text-sm font-black uppercase tracking-wider ${isUpcoming ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-md" : "text-slate-400"}`}
                        >
                          {format(parseISO(appt.start_at), "MMM d, yyyy", {
                            locale: es,
                          })}
                          {isUpcoming && " • Próxima"}
                        </span>
                        {isUpcoming && (
                          <Video className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                        )}
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                        Sesión #{appointments.length - idx}
                      </h4>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                        {format(parseISO(appt.start_at), "h:mm a")}
                      </p>
                      
                      {appt.meet_link && isUpcoming && appt.status === 'CONFIRMED' && (
                        <a 
                          href={appt.meet_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all border border-indigo-400/20 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Video className="w-4 h-4" /> 
                          <span>UNIRSE A MEET</span>
                        </a>
                      )}
                    </div>

                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Calendar className="w-8 h-8 text-slate-300 mb-2 opacity-50" />
                <p className="text-slate-500 text-xs italic">
                  No hay sesiones registradas
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 flex flex-col bg-slate-50/50 dark:bg-black/20 h-full overflow-hidden">
          {/* Tabs */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 md:px-10 shrink-0">
            <div className="flex gap-8 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab("clinical-notes")}
                className={`relative flex items-center gap-2 py-4 font-bold text-base transition-all border-b-2 whitespace-nowrap ${
                  activeTab === "clinical-notes"
                    ? "text-primary-600 dark:text-primary-400 border-primary-600"
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Edit3 className="w-4 h-4" /> Notas Clínicas
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`relative flex items-center gap-2 py-4 font-bold text-base transition-all border-b-2 whitespace-nowrap ${
                  activeTab === "history"
                    ? "text-primary-600 dark:text-primary-400 border-primary-600"
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <History className="w-4 h-4" /> Historial
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`relative flex items-center gap-2 py-4 font-bold text-base transition-all border-b-2 whitespace-nowrap ${
                  activeTab === "payments"
                    ? "text-primary-600 dark:text-primary-400 border-primary-600"
                    : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <CreditCard className="w-4 h-4" /> Pagos
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <motion.div
              key={activeTab}
              className="max-w-4xl mx-auto flex flex-col h-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {activeTab === "clinical-notes" && (
                <>
                  {/* Editor Toolbar & Meta */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1 shadow-sm">
                        Nueva Nota de Sesión
                      </h2>
                      <div className="flex items-center gap-2 text-base text-slate-500 dark:text-slate-400 font-medium">
                        <span>{format(new Date(), "PP", { locale: es })}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md font-bold text-sm uppercase tracking-wider border border-emerald-100 dark:border-emerald-800">
                          <Lock className="w-3 h-3" /> Encriptada E2E
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Editor Container */}
                  <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden min-h-[400px]">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <button
                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                        title="Bold"
                      >
                        <Bold className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                        title="Italic"
                      >
                        <Italic className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                        title="Underline"
                      >
                        <Underline className="w-5 h-5" />
                      </button>
                      <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-2"></div>
                      <button
                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                        title="Bullet List"
                      >
                        <List className="w-5 h-5" />
                      </button>
                      <div className="flex-1"></div>
                      <span className="text-xs text-slate-400 px-3 italic">
                        {isSaving ? "Guardando..." : "Borrador de hoy"}
                      </span>
                    </div>
                    {/* Typing Area */}
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                      <textarea
                        className="w-full h-full min-h-[300px] bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-300 leading-relaxed font-bold placeholder:italic outline-none whitespace-pre-wrap resize-none p-0 text-lg"
                        placeholder="Escribe la nota de la sesión aquí (SOAP: Subjetivo, Objetivo, Análisis, Plan)..."
                        value={newNoteContent}
                        onChange={(e) => setNewNoteContent(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      onClick={handleSaveNote}
                      disabled={isSaving || !newNoteContent.trim()}
                      className="h-12 px-6 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-black text-base shadow-lg shadow-primary-500/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                      {isSaving ? "Guardando..." : "Guardar Nota"}
                    </button>
                  </div>
                </>
              )}

              {activeTab === "history" && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6">
                    Historial Clínico
                  </h2>
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                              Nota de Evolución
                            </span>
                            <span className="text-base font-bold text-slate-900 dark:text-white">
                              {format(parseISO(note.created_at), "PPP", {
                                locale: es,
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {!note.signed_at && editingNoteId !== note.id && (
                              <button
                                onClick={() => {
                                  setEditingNoteId(note.id);
                                  setEditingNoteContent(note.content);
                                }}
                                className="flex items-center gap-1.5 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 text-sm font-bold transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                                Editar
                              </button>
                            )}
                            
                            {note.signed_at ? (
                              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-bold border border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                                <Lock className="w-3 h-3" /> Firmado
                              </span>
                            ) : (
                              editingNoteId !== note.id && (
                                <button
                                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 text-sm font-black underline underline-offset-4"
                                  onClick={() =>
                                    signNote(note.id, id as string).then(() =>
                                      loadData(),
                                    )
                                  }
                                >
                                  Firmar Nota
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {editingNoteId === note.id ? (
                          <div className="space-y-4">
                            <textarea
                              className="w-full min-h-[200px] p-4 rounded-xl border-2 border-primary-100 dark:border-primary-900/30 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold text-lg focus:outline-none focus:border-primary-500 transition-all resize-y"
                              value={editingNoteContent}
                              onChange={(e) => setEditingNoteContent(e.target.value)}
                              autoFocus
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingNoteId(null)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 font-bold transition-all"
                              >
                                <X className="w-4 h-4" /> Cancelar
                              </button>
                              <button
                                onClick={() => handleUpdateNote(note.id)}
                                disabled={isSaving || !editingNoteContent.trim()}
                                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-black shadow-lg shadow-primary-500/20 transition-all active:scale-95"
                              >
                                <Save className="w-4 h-4" />
                                {isSaving ? "Guardando..." : "Guardar Cambios"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-700 dark:text-slate-300 text-base whitespace-pre-wrap leading-relaxed font-bold">
                            {note.content}
                          </div>
                        )}
                        {(note.diagnosis_codes?.length || 0) > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                             <span className="text-xs font-black text-orange-500 uppercase tracking-widest block mb-2">Diagnóstico:</span>
                             <div className="flex flex-wrap gap-2">
                               {note.diagnosis_codes?.map((d, idx) => (
                                 <span key={idx} className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded text-sm font-bold border border-orange-100 dark:border-orange-800/50">
                                   {d}
                                 </span>
                               ))}
                             </div>
                          </div>
                        )}
                        {(note.tasks?.length || 0) > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                             <span className="text-xs font-black text-indigo-500 uppercase tracking-widest block mb-2">Tareas / Ejercicios:</span>
                             <ul className="list-disc list-inside space-y-1">
                               {note.tasks?.map((t, idx) => (
                                 <li key={idx} className="text-slate-600 dark:text-slate-400 text-sm font-bold">
                                   {t}
                                 </li>
                               ))}
                             </ul>
                          </div>
                        )}
                      </div>

                    ))
                  ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                      <History className="w-12 h-12 text-slate-300 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Aún no hay notas
                      </h3>
                      <p className="text-slate-500 mt-1 italic">
                        Las notas que escribas aparecerán aquí ordenadas por
                        fecha.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "payments" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                    Estado de Pagos
                  </h2>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 italic">
                          <th className="px-6 py-4 text-sm font-black text-slate-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-6 py-4 text-sm font-black text-slate-500 uppercase tracking-wider">
                            Servicio
                          </th>
                          <th className="px-6 py-4 text-sm font-black text-slate-500 uppercase tracking-wider">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {appointments.map((appt) => (
                          <tr
                            key={appt.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                          >
                            <td className="px-6 py-4 text-base font-bold text-slate-700 dark:text-white">
                              {format(parseISO(appt.start_at), "PP", {
                                locale: es,
                              })}
                            </td>
                            <td className="px-6 py-4 text-base font-medium text-slate-600 dark:text-slate-400">
                              Consulta Psicológica Individual
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-sm font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                                  appt.status === "CONFIRMED"
                                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800"
                                    : appt.status === "PENDING_PAYMENT"
                                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800"
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                                }`}
                              >
                                {appt.status === "CONFIRMED"
                                  ? "Pagado"
                                  : appt.status === "PENDING_PAYMENT"
                                    ? "Pendiente"
                                    : appt.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Quick Actions Footer - Always visible outside specific tab logic but inside motion div for consistency */}
              <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div 
                  onClick={() => {
                    const t = prompt("Nueva tarea/ejercicio:");
                    if (t) setTasks([...tasks, t]);
                  }}
                  className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        Tareas ({tasks.length})
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                        Asignar ejercicios
                      </span>
                    </div>
                  </div>
                </div>
                <div 
                  onClick={() => {
                    const d = prompt("Código CIE-10 / Diagnóstico:");
                    if (d) setDiagnosis([...diagnosis, d]);
                  }}
                  className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group cursor-pointer hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 p-2.5 rounded-lg border border-orange-100 dark:border-orange-800/50">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        Diagnóstico ({diagnosis.length})
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                        Códigos CIE-10
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group cursor-pointer hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2.5 rounded-lg border border-blue-100 dark:border-blue-800/50">
                      <Paperclip className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        Adjuntos
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                        0 Archivos
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {(tasks.length > 0 || diagnosis.length > 0) && (
                <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl space-y-3">
                   {diagnosis.length > 0 && (
                     <div className="flex flex-wrap gap-2">
                       <span className="text-xs font-bold uppercase text-slate-400 w-full mb-1 italic">Diagnósticos:</span>
                       {diagnosis.map((d, i) => (
                         <span key={i} className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-md text-sm font-bold flex items-center gap-2">
                            {d} <button onClick={() => setDiagnosis(diagnosis.filter((_, idx) => idx !== i))}>×</button>
                         </span>
                       ))}
                     </div>
                   )}
                   {tasks.length > 0 && (
                     <div className="flex flex-wrap gap-2">
                       <span className="text-xs font-bold uppercase text-slate-400 w-full mb-1 italic">Tareas:</span>
                       {tasks.map((t, i) => (
                         <span key={i} className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded-md text-sm font-bold flex items-center gap-2">
                            {t} <button onClick={() => setTasks(tasks.filter((_, idx) => idx !== i))}>×</button>
                         </span>
                       ))}
                     </div>
                   )}
                </div>
              )}

            </motion.div>
          </div>
        </section>
        </main>
      </div>
    </div>
  );
}
