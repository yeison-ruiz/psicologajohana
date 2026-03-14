import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BlogSkeleton } from "@/components/home/BlogSection";

export default function Loading() {
  return (
    <>
      <Header activeSection="blog" />
      <main className="bg-white min-h-screen">
        <div className="max-w-[1400px] mx-auto px-6 pt-12 pb-24 flex flex-col gap-12">
          <div className="max-w-3xl space-y-4">
            <div className="h-12 w-3/4 bg-slate-200 animate-pulse rounded-lg" />
            <div className="h-6 w-1/2 bg-slate-200 animate-pulse rounded-md" />
          </div>

          <BlogSkeleton />
        </div>
      </main>
      <Footer />
    </>
  );
}
