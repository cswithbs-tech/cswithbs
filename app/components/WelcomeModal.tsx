"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export function WelcomeModal() {
  const { status } = useSession();
  const [poster, setPoster] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    const checkAndFetchPoster = async () => {
      try {
        const res = await fetch("/api/posters/active");
        if (!res.ok) return;

        const activePoster = await res.json();
        if (!activePoster) return;

        if (activePoster.targetAudience === "GUESTS" && status === "authenticated") return;
        if (activePoster.targetAudience === "LOGGED_IN" && status === "unauthenticated") return;

        const storageKey = `seen_poster_${activePoster._id}`;
        const lastSeen = localStorage.getItem(storageKey);
        
        if (lastSeen) {
          const lastSeenDate = new Date(parseInt(lastSeen));
          const now = new Date();
          const hoursSinceSeen = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60);
          if (hoursSinceSeen < 24) return;
        }

        setPoster(activePoster);
        setIsOpen(true);
      } catch (error) {
        console.error("Failed to fetch active poster:", error);
      }
    };

    const timer = setTimeout(() => {
      checkAndFetchPoster();
    }, 1500);

    return () => clearTimeout(timer);
  }, [status]);

  const handleClose = () => {
    setIsOpen(false);
    if (poster) {
      localStorage.setItem(`seen_poster_${poster._id}`, Date.now().toString());
    }
  };

  const handleActionClick = () => {
    handleClose();
  };

  if (!isOpen || !poster) return null;

  const isImageOnly = poster.title === "Untitled Flyer";

  // Framer Motion Variants
  const containerVariants: any = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", damping: 25, stiffness: 300, staggerChildren: 0.1, delayChildren: 0.2 }
    },
    exit: { opacity: 0, scale: 0.95, y: 20 }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop with Deep Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`relative w-full ${isImageOnly ? 'max-w-3xl' : 'max-w-[950px]'} bg-[#0b0a12] border border-white/[0.08] rounded-[2rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.7)] flex flex-col ${!isImageOnly && 'md:flex-row'} max-h-[90vh]`}
          >
            {/* Ambient Background Glow — layered for depth */}
            <div className="absolute -inset-24 bg-accent/10 opacity-100 blur-3xl transition-opacity duration-700 pointer-events-none" />
            <div className="absolute -top-20 -left-20 w-[350px] h-[350px] rounded-full bg-purple-700/10 blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-[280px] h-[280px] rounded-full bg-indigo-600/8 blur-[100px] pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full text-zinc-400 hover:text-white transition-all border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Section */}
            <div className={`relative shrink-0 overflow-hidden bg-black ${isImageOnly ? 'w-full aspect-[4/3] sm:aspect-[16/9]' : 'w-full md:w-[45%] aspect-video md:aspect-square'}`}>
               <motion.div 
                 initial={{ scale: 1.15 }}
                 animate={{ scale: 1 }}
                 transition={{ duration: 10, ease: "easeOut" }}
                 className="absolute inset-0 w-full h-full"
               >
                 {isImageOnly && poster.link ? (
                    <Link href={poster.link} onClick={handleActionClick} className="w-full h-full block">
                      <Image src={poster.imageUrl} alt="Poster Flyer" fill priority className="object-cover" />
                    </Link>
                 ) : (
                    <Image src={poster.imageUrl} alt={poster.title} fill priority className="object-cover" />
                 )}
               </motion.div>
               {/* Mobile Gradient Overlay */}
               {!isImageOnly && (
                   <div className="md:hidden absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0e0c16]/95 to-transparent pointer-events-none" />
               )}
            </div>

            {/* Content Section */}
            {!isImageOnly && (
              <div className="p-8 md:p-12 w-full md:w-[55%] flex flex-col justify-center items-start text-left overflow-y-auto z-10 bg-gradient-to-br from-[#17132a] via-[#100e1c] to-[#0e0c16] relative">
                {/* Layered light flairs for editorial depth */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-accent/12 rounded-full blur-[90px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-700/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute top-1/2 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[50px] pointer-events-none" />
                {/* Slowly drifting ethereal orb — gives the panel a living feel */}
                <motion.div
                  className="absolute top-1/3 right-1/4 w-44 h-44 rounded-full bg-accent/5 blur-[70px] pointer-events-none"
                  animate={{ x: [0, 28, -18, 0], y: [0, -22, 16, 0], scale: [1, 1.12, 0.93, 1] }}
                  transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Corner geometric bracket ornament */}
                <div className="absolute top-8 right-8 pointer-events-none" aria-hidden="true">
                  <div className="relative w-8 h-8" style={{ opacity: 0.35 }}>
                    <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-accent to-transparent" />
                    <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-accent to-transparent" />
                    <div className="absolute top-2 right-2 w-3/4 h-px bg-gradient-to-l from-accent/60 to-transparent" />
                    <div className="absolute top-2 right-2 w-px h-3/4 bg-gradient-to-b from-accent/60 to-transparent" />
                  </div>
                </div>

                <motion.div variants={itemVariants} className="w-full relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 shadow-[0_0_20px_rgba(var(--color-accent),0.2)]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                    </span>
                    <span className="text-[10px] font-bold tracking-widest text-accent uppercase mt-0.5">Announcement</span>
                  </div>

                  {/* Accent rule — anchors the badge to the headline */}
                  <div className="flex items-center gap-3 my-5">
                    <div className="h-px w-14 bg-gradient-to-r from-accent/80 to-transparent" />
                    <div className="h-px w-5 bg-gradient-to-r from-accent/30 to-transparent" />
                  </div>

                  <h2 className="text-3xl md:text-[2.6rem] font-black font-display uppercase tracking-tight leading-[1.05] bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-100 to-zinc-300 [filter:drop-shadow(0_0_28px_rgba(255,255,255,0.18))]">
                    {poster.title}
                  </h2>
                </motion.div>
                
                {poster.description && (
                  <motion.div variants={itemVariants} className="w-full mt-6">
                    <div className="pl-4 border-l-2 border-accent/40 relative">
                      {/* Soft glow behind the border line */}
                      <div className="absolute -left-px top-0 bottom-0 w-px bg-accent/20 blur-[3px]" />
                      <p className="text-[0.95rem] md:text-[1.05rem] text-zinc-200 leading-[1.8] tracking-wide font-normal">
                        {poster.description}
                      </p>
                    </div>
                  </motion.div>
                )}

                {poster.link && (
                  <motion.div variants={itemVariants} className="w-full mt-8">
                    {/* Decorative dot trail — visual breath before the CTA */}
                    <div className="flex items-center gap-1.5 mb-7">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent/70" />
                      <div className="w-1 h-1 rounded-full bg-accent/40" />
                      <div className="w-0.5 h-0.5 rounded-full bg-accent/20" />
                    </div>
                    <Link
                      href={poster.link}
                      onClick={handleActionClick}
                      className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-black font-bold py-4 px-10 rounded-full transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(255,255,255,0.28),0_0_80px_rgba(var(--color-accent),0.15)] overflow-hidden"
                    >
                      {/* Moving shimmer — sweeps left to right on hover */}
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      <span className="relative z-10 text-sm uppercase tracking-widest">{poster.linkText || "Learn More"}</span>
                      <ArrowRight className="w-4 h-4 relative z-10 transform group-hover:translate-x-1.5 transition-transform duration-300" />
                    </Link>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
