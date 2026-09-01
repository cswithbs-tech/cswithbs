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

          {/* Modal Container */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`relative w-full ${isImageOnly ? 'max-w-2xl' : 'max-w-4xl'} bg-[#0f0f11]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(var(--color-accent),0.15)] flex flex-col ${!isImageOnly && 'md:flex-row'} max-h-[90vh]`}
          >
            {/* Ambient Background Glow */}
            <div className="absolute -inset-24 bg-accent/5 opacity-100 blur-3xl transition-opacity duration-700 pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full text-zinc-400 hover:text-white transition-all border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Section with Ken Burns Zoom Effect */}
            <div className={`relative shrink-0 overflow-hidden ${isImageOnly ? 'w-full aspect-[4/3] sm:aspect-[16/10]' : 'w-full md:w-1/2 aspect-[4/3] md:aspect-auto'}`}>
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
                  <div className="md:hidden absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0f0f11]/90 to-transparent pointer-events-none" />
               )}
            </div>

            {/* Content Section (Only if not Image-Only) */}
            {!isImageOnly && (
              <div className="p-8 md:p-12 w-full md:w-1/2 flex flex-col justify-center items-start text-left overflow-y-auto z-10">
                <motion.div variants={itemVariants} className="w-full">
                  <h2 className="text-3xl md:text-4xl font-black text-white font-display uppercase tracking-tight leading-[1.1]">
                    {poster.title}
                  </h2>
                </motion.div>
                
                {poster.description && (
                  <motion.div variants={itemVariants} className="w-full mt-4">
                    <p className="text-base md:text-lg text-zinc-400 leading-relaxed">
                      {poster.description}
                    </p>
                  </motion.div>
                )}

                {poster.link && (
                  <motion.div variants={itemVariants} className="w-full mt-8 md:mt-10">
                    <Link
                      href={poster.link}
                      onClick={handleActionClick}
                      className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-black font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(var(--color-accent),0.2)] hover:shadow-[0_0_35px_rgba(var(--color-accent),0.4)] overflow-hidden"
                    >
                      {/* Shimmer Effect */}
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                      
                      <span className="relative z-10 text-base uppercase tracking-wide">Learn More</span>
                      <ArrowRight className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform" />
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
