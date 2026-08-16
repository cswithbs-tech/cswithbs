"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    tag: "Optimization",
    title: "Metaheuristic Algorithms",
    subtitle:
      "Exploring nature-inspired optimization: from Artificial Hummingbird to Reptile Search Algorithms.",
    cta: "Explore Research",
    href: "#publications",
    image: "", 
    gradient: "from-[#1a0a00] via-[#0d0d0d] to-[#0d0d0d]",
    orb1: "bg-[#E2C6B9]/20",
    orb2: "bg-amber-600/10",
    accentColor: "#E2C6B9",
    badgeColor: "bg-[#E2C6B9]/10 border-[#E2C6B9]/20 text-[#E2C6B9]",
  },
  {
    id: 2,
    tag: "Agriculture",
    title: "AI in Precision Agriculture",
    subtitle:
      "Deep learning models for early detection and classification of crop diseases.",
    cta: "View Papers",
    href: "#publications",
    image: "", 
    gradient: "from-[#060d1a] via-[#0d0d0d] to-[#0d0d0d]",
    orb1: "bg-green-500/15",
    orb2: "bg-emerald-500/10",
    accentColor: "#34d399",
    badgeColor: "bg-green-500/10 border-green-500/20 text-green-400",
  },
  {
    id: 3,
    tag: "Healthcare",
    title: "Medical Image Processing",
    subtitle:
      "Advanced segmentation and classification techniques for robust medical diagnosis.",
    cta: "Learn More",
    href: "#publications",
    image: "", 
    gradient: "from-[#0d0619] via-[#0d0d0d] to-[#0d0d0d]",
    orb1: "bg-purple-500/15",
    orb2: "bg-violet-600/10",
    accentColor: "#a78bfa",
    badgeColor: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  },
];

export function ResearchCarouselClient() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrent(index);
      setTimeout(() => setIsAnimating(false), 600);
    },
    [isAnimating]
  );

  const goNext = useCallback(() => {
    goTo((current + 1) % SLIDES.length);
  }, [current, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length);
  }, [current, goTo]);

  useEffect(() => {
    const timer = setInterval(goNext, 5500);
    return () => clearInterval(timer);
  }, [goNext]);

  const slide = SLIDES[current];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] min-h-[450px] md:min-h-[550px] shadow-2xl shadow-black/50 group">
      {/* Background layer */}
      <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
        {slide.image ? (
          <>
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/40 to-transparent" />
          </>
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-all duration-700`} />
            <div className={`absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[120px] ${slide.orb1} transition-all duration-700`} />
            <div className={`absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full blur-[120px] ${slide.orb2} transition-all duration-700`} />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(#fff 1px, transparent 1px), linear-gradient(to right, #fff 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </>
        )}
      </div>

      {/* Content */}
      <div
        className={`relative z-10 flex flex-col justify-center h-full px-10 md:px-20 py-16 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isAnimating ? "opacity-0 translate-y-8 blur-sm scale-95" : "opacity-100 translate-y-0 blur-0 scale-100"
        }`}
      >
        <div className="max-w-3xl">
          {/* Tag badge */}
          <div
            className={`inline-flex items-center self-start px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border mb-6 ${slide.badgeColor}`}
          >
            {slide.tag}
          </div>

          <h2
            className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] font-display tracking-tight mb-6"
            style={{ textShadow: slide.image ? "0 4px 20px rgba(0,0,0,0.8)" : "none" }}
          >
            {slide.title}
          </h2>
          
          <p 
            className="text-zinc-300 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl font-medium"
            style={{ textShadow: slide.image ? "0 2px 10px rgba(0,0,0,0.8)" : "none" }}
          >
            {slide.subtitle}
          </p>

          <Link
            href={slide.href}
            className="group/btn inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-sm hover:bg-zinc-200 transition-all active:scale-95"
          >
            {slide.cta}
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-10 right-10 flex items-center gap-4 z-20">
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                current === i ? "w-8 bg-white" : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={goPrev}
            className="p-3 rounded-full bg-white/5 border border-white/10 text-white backdrop-blur-md hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            className="p-3 rounded-full bg-white/5 border border-white/10 text-white backdrop-blur-md hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
