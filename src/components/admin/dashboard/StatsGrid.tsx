"use client";

import { Calendar, DollarSign, Clock, PieChart } from "lucide-react";
import { StatCard } from "./StatCard";

interface StatsGridProps {
  stats: {
    monthlyAppointments: number;
    expectedRevenue: number;
    pendingPayments: number;
    occupationRate: number;
  };
}

export function StatsGrid({ stats }: StatsGridProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Citas del Mes"
        value={stats.monthlyAppointments}
        icon={Calendar}
        color="blue"
        delay={0}
      />
      <StatCard
        title="Ingresos Esperados"
        value={formatCurrency(stats.expectedRevenue)}
        icon={DollarSign}
        color="emerald"
        delay={0.1}
      />
      <StatCard
        title="Pagos Pendientes"
        value={stats.pendingPayments}
        icon={Clock}
        color="orange"
        badge={stats.pendingPayments > 0 ? "Requiere Acción" : undefined}
        delay={0.2}
      />
      <StatCard
        title="Tasa de Ocupación"
        value={`${stats.occupationRate}%`}
        icon={PieChart}
        color="purple"
        delay={0.3}
      />
    </div>
  );
}
