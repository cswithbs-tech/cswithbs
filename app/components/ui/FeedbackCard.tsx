"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquarePlus, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function FeedbackCard() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if user has already dismissed the card
    const hasDismissed = localStorage.getItem("cswithbs_feedback_dismissed");
    
    // Don't show on contact page itself or if dismissed
    if (pathname === "/contact" || hasDismissed) {
      setIsVisible(false);
      return;
    }

    // Show after 3 seconds to not overwhelm the user immediately
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("cswithbs_feedback_dismissed", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="fixed bottom-6 right-6 z-50 w-full max-w-[340px] md:max-w-[380px]"
        >
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/80 overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-24 bg-accent/10 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-700 pointer-events-none" />

            {/* Header / Status */}
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-bold">
                  Site in Beta
                </span>
              </div>
              <button
                onClick={handleDismiss}
                className="text-zinc-500 hover:text-white transition-colors p-1 bg-white/5 rounded-md hover:bg-white/10"
                aria-label="Dismiss feedback card"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content */}
            <div className="relative z-10 mb-4">
              <h4 className="text-white font-bold mb-1.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Help Us Improve
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                CSWITHBS is actively being built! Your feedback, bug reports, and suggestions are incredibly valuable to us.
              </p>
            </div>

            {/* Action */}
            <div className="relative z-10">
              <Link
                href="/contact"
                onClick={() => setIsVisible(false)} // Hide when they click it
                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium py-2.5 rounded-xl transition-all hover:border-white/20"
              >
                <MessageSquarePlus className="w-4 h-4 text-accent" />
                Share Feedback
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
