"use client";

import { 
  Search, 
  Bell, 
  Users, 
  ChevronRight, 
  Filter, 
  Menu,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

interface Patient {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  last_session?: string;
  total_sessions?: number;
}

export default function AdminPatientsList() {
  const { setAdminSidebarOpen } = useUIStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    const supabase = createClient();

    // Fetch profiles where role = 'patient'
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone_number")
      .eq("role", "paciente")
      .order("full_name");

    if (error) {
      console.error("Error fetching patients:", error);
    } else {
      // In a real app, we'd also join with appointments to get last_session and total_sessions
      setPatients(data as Patient[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = patients.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50 dark:bg-slate-950/20">
        {/* Header for Search/Profile */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-4 flex-1">
             <button
               className="text-slate-500 md:hidden hover:text-slate-700 dark:text-slate-400 p-2"
               onClick={() => setAdminSidebarOpen(true)}
             >
               <Menu className="w-6 h-6" />
             </button>
             <div className="flex-1 max-w-xl">
               <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary-500/50 transition-all">
                  <Search className="w-5 h-5 text-slate-500" />
                  <input
                    className="flex-1 bg-transparent border-none text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-0 placeholder:text-slate-400 px-3 text-sm font-bold"
                    placeholder="Buscar pacientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center rounded-xl size-11 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors border border-transparent hover:border-slate-200">
                <Bell className="w-6 h-6" />
            </button>
            <div className="bg-indigo-600 rounded-xl size-11 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
                J
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* ... Existing content ... */}
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                Pacientes
              </h1>
              <p className="text-slate-600 dark:text-slate-300 font-bold text-lg mt-2">
                Gestiona y consulta el expediente de tus pacientes.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="h-11 px-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors">
                <Filter className="w-4 h-4" />
                Filtrar
              </button>
            </div>
          </div>

          {/* Patients Table/Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredPatients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 italic">
                      <th className="px-6 py-4 text-base font-black text-slate-400 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-6 py-4 text-base font-black text-slate-400 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-4 text-base font-black text-slate-400 uppercase tracking-wider text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {filteredPatients.map((patient) => (
                      <tr
                        key={patient.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div 
                              className="size-10 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center font-black"
                            >
                              {patient.full_name?.charAt(0) || "P"}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-extrabold text-slate-900 dark:text-white leading-tight text-lg">
                                {patient.full_name}
                              </span>
                              <span className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-0.5">
                                ID: {patient.id.slice(0, 8)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                              {patient.email}
                            </span>
                            <span className="text-base text-slate-500 mt-0.5 font-bold">
                              {patient.phone_number || "No registrado"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/admin/patients/${patient.id}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-600 text-slate-700 dark:text-slate-200 rounded-xl text-lg font-black transition-all group"
                          >
                            <span>Ver Registro</span>
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 flex flex-col items-center text-center">
                <div className="size-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  No se encontraron pacientes
                </h3>
                <p className="text-slate-500 max-w-xs mt-1">
                  {searchTerm
                    ? `No hay resultados para "${searchTerm}"`
                    : "Aún no tienes pacientes registrados en el sistema."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  </div>
);
}
