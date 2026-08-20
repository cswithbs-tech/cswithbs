"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

// ─── Hardcoded slides — wire to admin panel later ───────────────────────────
const SLIDES = [
  {
    id: 1,
    tag: "Networking & Security",
    title: "Computer Networks",
    subtitle:
      "Understand the backbone of the internet, from protocols to architecture.",
    cta: "Start Learning",
    href: "/courses/computer-networks", 
    image: "/images/courses/carousel_1.png", 
    mobileImage: "/images/courses/networking-mobile.png",
    hideText: false,
    desktopHideText: true,
    
    features: [
      { label: "OSI Model", desc: "Master the 7 layers of networking" },
      { label: "Protocols", desc: "TCP/IP, HTTP, DNS, & more" },
      { label: "Security", desc: "Basics of network security & firewalls" }
    ],
    technologies: ["TCP/IP", "Wireshark", "Cisco", "DNS"],
    
    gradient: "from-[#000a1a] via-[#0d0d0d] to-[#0d0d0d]",
    orb1: "bg-blue-500/15",
    orb2: "bg-indigo-600/10",
    accentColor: "#3b82f6",
    badgeColor: "bg-blue-500/10 border border-blue-400/40 text-blue-300",
  },
  {
    id: 2,
    tag: "Core Fundamentals",
    title: "C Programming",
    subtitle:
      "Master the foundational language of systems programming and logic.",
    cta: "Explore Course",
    // Link to the course page
    href: "/courses/c-programming",
    // NOTE: If hideText is false, the HTML text (title, subtitle, features) will be rendered over the left side of the image.
    image: "/images/courses/carousel_4.png",
    mobileImage: "/images/courses/c-mobile.png",
    hideText: false,
    
    // NOTE: You can add features here to display below the subtitle. Remove or leave empty if not needed.
    features: [
      { label: "Memory Management", desc: "Master pointers & avoid leaks" },
      { label: "Data Structures", desc: "Build linked lists from scratch" },
      { label: "System Level", desc: "Interact directly with hardware" }
    ],
    // NOTE: Add technology tags here. Remove or leave empty if not needed.
    technologies: ["C", "GCC", "Make", "GDB"],
    
    gradient: "from-[#060d1a] via-[#0d0d0d] to-[#0d0d0d]",
    orb1: "bg-blue-500/15",
    orb2: "bg-cyan-500/10",
    accentColor: "#a855f7",
    badgeColor: "bg-purple-500/10 border border-purple-400/40 text-purple-300",
  },
  {
    id: 3,
    tag: "Research Track",
    title: "Machine Learning & AI",
    subtitle:
      "From linear regression to deep learning — the complete journey with Professor Sasmal.",
    cta: "Dive In",
    href: "/courses/machine-learning",
    image: "/images/courses/Carousel_5.png",
    mobileImage: "/images/courses/AI-ML-mobile.png",
    hideText: false,

    features: [
      { label: "Deep Learning", desc: "Build neural networks & CNNs" },
      { label: "Data Science", desc: "Predictive modeling & analytics" },
      { label: "Real World", desc: "Train models on live datasets" }
    ],
    technologies: ["Python", "TensorFlow", "PyTorch", "Scikit-Learn"],

    gradient: "from-[#1a0014] via-[#0d0d0d] to-[#0d0d0d]",
    orb1: "bg-fuchsia-500/15",
    orb2: "bg-pink-600/10",
    accentColor: "#d946ef",
    badgeColor: "bg-fuchsia-500/10 border border-fuchsia-400/40 text-fuchsia-300",
  },
];

export function CarouselClient() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(index);
    },
    []
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
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] min-h-[550px] md:min-h-[550px] shadow-2xl shadow-black/50 group">
      {/* Background layer: Either Image or Gradient */}
      <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
        {slide.image ? (
          (() => {
            const ImageContent = (
              <>
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={current === 0}
                  className={`hidden md:block object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] ${
                    isAnimating ? "scale-[1.03]" : "scale-100"
                  }`}
                  sizes="100vw"
                />
                
                <Image
                  src={(slide as any).mobileImage || slide.image}
                  alt={slide.title}
                  fill
                  priority={current === 0}
                  className={`block md:hidden object-contain object-top transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] ${
                    isAnimating ? "scale-[1.03]" : "scale-100"
                  }`}
                  sizes="100vw"
                />

                {/* Dark gradient fade from left for the text to sit on (only on desktop where text sits on left, or we can adjust mobile later) */}
                {!slide.hideText && (
                  <>
                    <div 
                      className={`absolute inset-y-0 left-0 pointer-events-none hidden ${(slide as any).desktopHideText ? '' : 'md:block'}`}
                      style={{ width: '45%', background: 'linear-gradient(to right, rgba(3,0,10,0.92) 0%, rgba(3,0,10,0.75) 50%, transparent 100%)' }}
                    />
                    <div 
                      className="absolute inset-x-0 bottom-0 top-[30%] pointer-events-none block md:hidden z-0"
                      style={{ background: 'linear-gradient(to bottom, transparent 0%, #0a0a0a 60%, #0a0a0a 100%)' }}
                    />
                  </>
                )}
              </>
            );

            return slide.href ? (
              <Link href={slide.href} className={`block w-full h-full relative z-0 ${slide.hideText ? 'cursor-pointer' : ''}`}>
                {ImageContent}
              </Link>
            ) : (
              <div className={`block w-full h-full relative z-0`}>
                {ImageContent}
              </div>
            );
          })()
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
      {!slide.hideText && (
        <div className={`absolute inset-0 z-10 flex flex-col justify-end md:justify-center px-6 md:px-16 pb-12 md:py-14 ${(slide as any).desktopHideText ? 'md:hidden' : ''}`}>
          <div className="w-full lg:max-w-3xl">
            {/* Tag badge — styled to match the image's color palette */}
            <div
              className={`inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-[0.2em] mb-5 ${slide.badgeColor}`}
            >
              {slide.tag}
            </div>

            {/* Large title — same weight and impact as carousel_1's baked-in text */}
            <h2
              className="font-black text-white leading-[1.1] md:leading-[1.02] tracking-tight mb-4"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)', letterSpacing: '-0.02em' }}
            >
              {slide.title}
            </h2>

            {/* Subtitle — lighter, slightly muted */}
            <p
              className="text-white/60 leading-relaxed mb-6 font-medium"
              style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1.1rem)' }}
            >
              {slide.subtitle}
            </p>

            {/* Features Columns (Optional) */}
            {/* @ts-ignore - Temporary bypass for TS since we added features ad-hoc */}
            {slide.features && (
              <div className="flex items-start gap-4 mb-6 border-t border-white/10 pt-6">
                {/* @ts-ignore */}
                {slide.features.map((feat, idx) => (
                  <div key={idx} className="flex-1">
                    <div style={{ color: slide.accentColor }} className="font-bold text-sm mb-1">{feat.label}</div>
                    <div className="text-white/40 text-xs leading-snug pr-2">{feat.desc}</div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Technologies Pills (Optional) */}
            {/* @ts-ignore */}
            {slide.technologies && (
              <div className="flex items-center gap-2 mb-8">
                {/* @ts-ignore */}
                {slide.technologies.map((tech, idx) => (
                  <div key={idx} className="px-3 py-1 rounded border border-white/10 bg-white/5 text-xs text-white/70 font-medium">
                    {tech}
                  </div>
                ))}
              </div>
            )}

            {/* CTA Button */}
            {slide.href && (
              <Link
                href={slide.href}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:gap-3.5 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: slide.accentColor,
                  color: '#fff',
                  boxShadow: `0 0 30px ${slide.accentColor}60`,
                }}
              >
                {slide.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}

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
      <div className="absolute top-8 right-8 z-20 hidden md:flex items-center gap-2">
         <div className="text-sm font-bold text-white tracking-widest">
            {String(current + 1).padStart(2, "0")} <span className="text-white/40">/ {String(SLIDES.length).padStart(2, "0")}</span>
         </div>
      </div>
    </div>
  );
}
