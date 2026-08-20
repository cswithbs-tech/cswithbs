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
    href: "",
    image: "/images/Research/R_Carousel_3.png", 
    mobileImage: "/images/Research/Mobile_R-1.png",
    hideText: true,
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
    href: "",
    image: "/images/Research/R_Carousel_2.png",
    mobileImage: "/images/Research/Mobile_R-3.png",
    hideText: false,
    features: [
      { label: "Disease Detection", desc: "Identifying blights early" },
      { label: "Drone Imagery", desc: "Capturing spectral data" },
      { label: "Yield Prediction", desc: "Optimizing harvest metrics" }
    ],
    gradient: "from-[#060d1a] via-[#0d0d0d] to-[#0d0d0d]",
    orb1: "bg-green-500/15",
    orb2: "bg-emerald-500/10",
    accentColor: "#10b981", // Emerald green to match the image
    badgeColor: "bg-green-500/10 border border-green-500/30 text-green-400",
  },
  {
    id: 3,
    tag: "Healthcare",
    title: "Medical Image Processing",
    subtitle:
      "Advanced segmentation and classification techniques for robust medical diagnosis.",
    cta: "Learn More",
    href: "",
    image: "/images/Research/R_Carousel_4.png", 
    mobileImage: "/images/Research/Mobile_R-4.png",
    hideText: true,
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

  useEffect(() => {
    const timer = setInterval(goNext, 5500);
    return () => clearInterval(timer);
  }, [goNext]);

  const slide = SLIDES[current];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] md:min-h-[550px] shadow-2xl shadow-black/50 group">
      {/* Background layer */}
      <div className="relative md:absolute md:inset-0 w-full h-full">
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
                  width={1000}
                  height={1500}
                  priority={current === 0}
                  className={`block md:hidden w-full h-auto object-contain transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] ${
                    isAnimating ? "scale-[1.03]" : "scale-100"
                  }`}
                  sizes="100vw"
                />

                {/* @ts-ignore */}
                {!slide.hideText && (
                  <div
                    className="absolute inset-y-0 left-0 pointer-events-none hidden md:block"
                    style={{ width: '55%', background: 'linear-gradient(to right, rgba(3,0,10,0.95) 0%, rgba(3,0,10,0.85) 60%, transparent 100%)' }}
                  />
                )}
              </>
            );

            return slide.href ? (
              // @ts-ignore
              <Link href={slide.href} className={`block w-full h-full relative z-0 ${slide.hideText ? 'cursor-pointer' : ''}`}>
                {ImageContent}
              </Link>
            ) : (
              <div className="block w-full h-full relative z-0">
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
      {/* @ts-ignore */}
      {!slide.hideText && (
        <div className="absolute inset-0 z-10 hidden md:flex flex-col justify-center px-10 md:px-12 py-14">
          {/* Strictly lock to 28% width so we don't overlap R_Carousel_2's diagrams */}
          <div style={{ maxWidth: '28%' }}>
            {/* Tag badge */}
            <div
              className={`inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-md text-[10px] font-black uppercase tracking-[0.2em] mb-5 ${slide.badgeColor}`}
            >
              {slide.tag}
            </div>

            <h2
              className="font-black text-white leading-[1.1] md:leading-[1.02] tracking-tight mb-4"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)', letterSpacing: '-0.02em' }}
            >
              {slide.title}
            </h2>
            
            <p 
              className="text-white/60 leading-relaxed mb-6 font-medium"
              style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1.1rem)' }}
            >
              {slide.subtitle}
            </p>

            {/* Features (Optional) */}
            {/* @ts-ignore */}
            {slide.features && (
              <div className="flex flex-col gap-4 mb-6 border-t border-white/10 pt-6">
                {/* @ts-ignore */}
                {slide.features.map((feat, idx) => (
                  <div key={idx}>
                    <div style={{ color: slide.accentColor }} className="font-bold text-sm mb-1">{feat.label}</div>
                    <div className="text-white/40 text-xs leading-snug pr-2">{feat.desc}</div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Technologies (Optional) */}
            {/* @ts-ignore */}
            {slide.technologies && (
              <div className="flex flex-wrap items-center gap-2 mb-8">
                {/* @ts-ignore */}
                {slide.technologies.map((tech, idx) => (
                  <div key={idx} className="px-3 py-1 rounded border border-white/10 bg-white/5 text-xs text-white/70 font-medium whitespace-nowrap">
                    {tech}
                  </div>
                ))}
              </div>
            )}

            {slide.href && (
              <Link
                href={slide.href}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:gap-3.5 hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: slide.accentColor,
                  color: "#fff",
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

      {/* Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:bottom-10 md:right-10 flex items-center gap-4 z-20">
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                current === i ? "w-6 md:w-8 bg-white/60 md:bg-white" : "w-1.5 md:w-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2 ml-4">
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
