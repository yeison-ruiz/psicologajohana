"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Testimonials from "@/components/home/Testimonials";
import Hero from "@/components/home/Hero";
import IntroCards from "@/components/home/IntroCards";
import About from "@/components/home/About";
import StatsCTA from "@/components/home/StatsCTA";
import Services from "@/components/home/Services";
import AIInnovation from "@/components/home/AIInnovation";
import MeetingSection from "@/components/home/MeetingSection";
import Pricing from "@/components/home/Pricing";
import BlogSection from "@/components/home/BlogSection";
import FinalCTA from "@/components/home/FinalCTA";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { testimonialsData } from "@/constants/landing";
import { Star } from "lucide-react";

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState("hogar");
  const [loadVideo, setLoadVideo] = useState(false);
  
  interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    category?: string | null;
    image_url?: string;
    created_at: string;
    profiles?: { full_name: string } | null;
  }
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const supabase = createClient();
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      // Delay heavy assets to prioritize LCP
      setTimeout(() => setLoadVideo(true), 1200);

      // Fetch recent posts
      const { data: posts } = await supabase
        .from("blog_posts")
        .select("*, profiles!blog_posts_author_id_fkey(full_name)")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (posts) setRecentPosts(posts as unknown as BlogPost[]);
    }
    init();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Periodic Testimonial Notifications
  useEffect(() => {
    let lastIndex = -1;
    const showRandomTestimonial = () => {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * testimonialsData.length);
      } while (randomIndex === lastIndex && testimonialsData.length > 1);

      lastIndex = randomIndex;
      const testimonial = testimonialsData[randomIndex];

      toast.custom(
        () => (
          <div className="p-5 w-full max-w-[350px] bg-slate-900 rounded-xl shadow-2xl border border-white/5 border-l-4 border-l-[#8A6046]">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-[16px] tracking-tight text-white">
                {testimonial.author}
              </span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 text-[#FFD700] fill-[#FFD700]"
                  />
                ))}
              </div>
            </div>
            <p className="text-[14px] leading-relaxed text-white/90 italic">
              &quot;{testimonial.text.substring(0, 100)}...&quot;
            </p>
          </div>
        ),
        {
          duration: 6000,
        },
      );
    };

    const firstTimeout = setTimeout(showRandomTestimonial, 3500);
    const interval = setInterval(showRandomTestimonial, 22000);

    return () => {
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const sections = [
      "hogar",
      "about",
      "services",
      "pricing",
      "blog",
      "contact",
    ];
    const observerOptions = {
      root: null,
      rootMargin: "-40% 0px -40% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id || "hogar");
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const isPsi = user?.user_metadata?.role === "psicologa";
  const canBook = !user || !isPsi;

  return (
    <div
      id="hogar"
      className="min-h-screen bg-white"
      style={{ fontFamily: "var(--font-raleway), sans-serif" }}
    >
      <Header activeSection={activeSection} />
      
      <Hero loadVideo={loadVideo} canBook={canBook} />
      <IntroCards />
      <About />
      <StatsCTA />
      <Services />
      <AIInnovation />
      <MeetingSection />
      <Pricing />
      <Testimonials />
      <BlogSection recentPosts={recentPosts} />
      <FinalCTA />

      <Footer />
    </div>
  );
}
