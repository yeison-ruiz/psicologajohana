import { Skeleton } from "@/components/ui/Skeleton";

export function AdminDashboardSkeleton() {
  return (
    <div className="flex h-full overflow-hidden bg-background animate-in fade-in duration-500">
      <main className="flex flex-1 flex-col overflow-hidden bg-background">
        {/* Header Skeleton */}
        <header className="h-16 border-b flex items-center justify-between px-8 bg-white shrink-0">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 lg:hidden rounded-lg" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="flex items-center gap-4">
             <Skeleton className="h-9 w-32 rounded-full" />
             <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-8">
            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border bg-white p-6 shadow-sm flex flex-col gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="flex flex-col gap-8 lg:col-span-2">
                {/* Appointments Today Skeleton */}
                <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
                  <Skeleton className="h-6 w-48" />
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-8 w-20 rounded-lg" />
                    </div>
                  ))}
                </div>

                {/* Upcoming Sessions Skeleton */}
                <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4">
                  <Skeleton className="h-6 w-40" />
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b last:border-0 border-slate-100">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-8 lg:col-span-1">
                {/* Chart Skeleton */}
                <div className="rounded-xl border bg-white p-6 shadow-sm h-64 flex flex-col gap-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="flex-1 flex gap-2 items-end">
                    {[60, 40, 80, 50, 90, 70, 45].map((height, i) => (
                      <Skeleton key={i} className="flex-1" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
                
                {/* Daily Tip Skeleton */}
                <div className="rounded-xl border bg-primary-50/10 p-6 shadow-sm space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
