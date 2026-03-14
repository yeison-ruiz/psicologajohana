import { Skeleton } from "@/components/ui/Skeleton";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Skeleton */}
      <header className="h-20 border-b border-slate-100 px-6 flex items-center justify-between">
        <Skeleton className="h-10 w-40" />
        <div className="hidden md:flex gap-8">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-12 space-y-12">
        {/* Banner Skeleton */}
        <Skeleton className="h-[400px] w-full rounded-3xl" />
        
        {/* Content Section Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
