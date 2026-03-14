import { Skeleton } from "@/components/ui/Skeleton";

export function PatientDashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner Skeleton */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-8 md:p-12 shadow-sm border border-slate-100">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 md:w-96" />
          <Skeleton className="h-6 w-48 md:w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Active Appointment Card Skeleton */}
          <div className="rounded-3xl bg-white overflow-hidden shadow-sm border border-slate-100">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-10 w-48" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
              <div className="space-y-4 pt-4">
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
            </div>
          </div>

          {/* Timeline Skeleton */}
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 space-y-6">
             <Skeleton className="h-6 w-40" />
             <div className="flex justify-between items-center py-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          {/* Quick Actions Skeleton */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          </div>
          
          {/* Appointment List Skeleton */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
            <Skeleton className="h-6 w-40" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
