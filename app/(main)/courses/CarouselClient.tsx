"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

// ─── Hardcoded slides — wire to admin panel later ───────────────────────────
const SLIDES = [
  {
    id: 1,
    tag: "Most Popular",
    title: "Data Structures & Algorithms",
    subtitle:
      "From arrays to graphs — build the problem-solving intuition every CS student needs.",
    cta: "Start Learning",
    href: "/courses/data-structures-and-algorithms",
    image: "", // Add premium image URL here later (e.g. "/images/carousel/dsa.jpg")
    gradient: "from-[#1a0a00] via-[#0d0d0d] to-[#0d0d0d]",
    orb1: "bg-[#E2C6B9]/20",
    orb2: "bg-amber-600/10",
    accentColor: "#E2C6B9",
    badgeColor: "bg-[#E2C6B9]/10 border-[#E2C6B9]/20 text-[#E2C6B9]",
  },
  {
    id: 2,
    tag: "Core Fundamentals",
    title: "Operating Systems",
    subtitle:
      "Understand how your computer actually works — processes, memory, scheduling, and more.",
    cta: "Explore Course",
    href: "/courses/operating-systems",
    image: "", // Add premium image URL here later
    gradient: "from-[#060d1a] via-[#0d0d0d] to-[#0d0d0d]",
    orb1: "bg-blue-500/15",
    orb2: "bg-cyan-500/10",
    accentColor: "#60a5fa",
    badgeColor: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  },
  {
    id: 3,
    tag: "Research Track",
    title: "Machine Learning & AI",
    subtitle:
      "From linear regression to deep learning — the complete journey with Professor Sasmal.",
    cta: "Dive In",
    href: "/courses",
    image: "", // Add premium image URL here later
    gradient: "from-[#0d0619] via-[#0d0d0d] to-[#0d0d0d]",
    orb1: "bg-purple-500/15",
    orb2: "bg-violet-600/10",
    accentColor: "#a78bfa",
    badgeColor: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  },
];

export function CarouselClient() {
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

  // Auto-rotate every 5.5 seconds
  useEffect(() => {
    const timer = setInterval(goNext, 5500);
    return () => clearInterval(timer);
  }, [goNext]);

  const slide = SLIDES[current];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] min-h-[450px] md:min-h-[550px] shadow-2xl shadow-black/50 group">
      {/* Background layer: Either Image or Gradient */}
      <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
        {slide.image ? (
          <>
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover opacity-60" // Lower opacity to make text readable
              priority
            />
            {/* Gradient overlay for text readability over image */}
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
            className="inline-flex items-center gap-2 self-start px-8 py-4 rounded-full font-bold text-base transition-all hover:gap-4 hover:opacity-90 active:scale-95 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            style={{
              backgroundColor: slide.accentColor,
              color: "#000",
            }}
          >
            {slide.cta}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Prev / Next buttons */}
      <button
        onClick={goPrev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 hover:border-white/30 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 hover:border-white/30 transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-10 md:left-20 z-20 flex items-center gap-3">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className="h-2 rounded-full transition-all duration-500 ease-out"
            style={{
              width: idx === current ? "32px" : "8px",
              backgroundColor: idx === current ? slide.accentColor : "rgba(255,255,255,0.3)",
              boxShadow: idx === current ? `0 0 10px ${slide.accentColor}80` : "none"
            }}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute top-8 right-8 z-20 flex items-center gap-2">
         <div className="text-sm font-bold text-white tracking-widest">
            {String(current + 1).padStart(2, "0")} <span className="text-white/40">/ {String(SLIDES.length).padStart(2, "0")}</span>
         </div>
      </div>
    </div>
  );
}
