"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { testimonialsData } from "@/constants/landing";

export default function Testimonials() {
  const [testimonialSlide, setTestimonialSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTestimonialSlide((p) => (p + 1) % testimonialsData.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="pt-2 pb-12 md:py-24 relative overflow-hidden bg-linear-to-br from-[#FAFAF8] to-[#EAE0D9]/30">
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="text-center mb-10 md:mb-24">
            <h2
              className="text-[#2b2b2b] text-[36px] md:text-[50px] leading-[1.1] mb-3 md:mb-5 font-normal"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Lo que dicen nuestros{" "}
              <span className="text-[#8A6046] italic">clientes</span>
            </h2>
            <p className="text-[#666] text-[15px] font-medium">
              Experiencias reales de pacientes que han transformado su bienestar
              emocional
            </p>
          </div>

          {/* Testimonial Content */}
          <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-20 max-w-[1000px] mx-auto min-h-[450px]">
            {/* Left: Quote Slider */}
            <div className="flex-1 text-center flex flex-col items-center relative min-h-[300px] md:min-h-[350px] w-full max-w-[500px]">
              <div
                className="text-[#8A6046] text-[80px] leading-none mb-4 font-serif relative z-0"
                style={{ fontFamily: "Georgia, serif" }}
              >
                ”
              </div>

              {/* Slider logic for text */}
              <div className="relative w-full h-[250px] flex items-center justify-center">
                {testimonialsData.map((testi, i) => (
                  <div
                    key={i}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex flex-col items-center justify-center ${
                      testimonialSlide === i
                        ? "opacity-100 z-10"
                        : "opacity-0 z-0 pointer-events-none"
                    }`}
                  >
                    <p
                      className="text-[#2b2b2b] text-[18px] md:text-[22px] italic leading-[1.6] mb-8"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      “{testi.text}”
                    </p>

                    <div>
                      <span className="text-[#2b2b2b] text-[10px] font-bold uppercase tracking-[.2em] relative">
                        {testi.author}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dots */}
              <div className="flex items-center justify-center gap-2.5 mt-2 z-20">
                {testimonialsData.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialSlide(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      testimonialSlide === i
                        ? "bg-[#8A6046]"
                        : "bg-black/10 hover:bg-black/30 shadow-[0_0_2px_rgba(0,0,0,0.1)]"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right: Images Slider */}
            <div className="flex-1 w-full max-w-[450px] relative aspect-square md:aspect-auto md:h-[550px]">
              {testimonialsData.map((testi, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    testimonialSlide === i
                      ? "opacity-100 z-10"
                      : "opacity-0 z-0"
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={testi.image}
                      alt={`Testimonio de ${testi.author}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 450px"
                      className="object-cover rounded-[20px] shadow-[0_15px_40px_rgba(0,0,0,0.08)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
  );
}
