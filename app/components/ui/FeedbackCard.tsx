"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, AlertTriangle, Info, Star, ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function FeedbackCard() {
  const [toasts, setToasts] = useState<any[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    fetchActiveToasts();
  }, []);

  const fetchActiveToasts = async () => {
    try {
      const res = await fetch("/api/toasts/active");
      if (res.ok) {
        let activeToasts = await res.json();
        
        // Filter out those the user has already dismissed
        activeToasts = activeToasts.filter((t: any) => {
          return !localStorage.getItem(`cswithbs_toast_dismissed_${t._id}`);
        });

        setToasts(activeToasts);
      }
    } catch (error) {
      console.error("Failed to fetch toasts", error);
    }
  };

  const handleDismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t._id !== id));
    localStorage.setItem(`cswithbs_toast_dismissed_${id}`, "true");
  };

  const renderIcon = (iconStr: string) => {
    switch (iconStr) {
      case "message": return <MessageSquare className="w-4 h-4 text-accent" />;
      case "alert": return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "star": return <Star className="w-4 h-4 text-yellow-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  // Don't show anything on admin routes
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 w-full max-w-[340px] md:max-w-[380px] pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast._id}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/80 overflow-hidden group pointer-events-auto"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -inset-24 bg-accent/5 opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-700 pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between mb-2 relative z-10">
              <h4 className="text-white font-bold flex items-center gap-2">
                {renderIcon(toast.icon)}
                {toast.title}
              </h4>
              <button
                onClick={() => handleDismiss(toast._id)}
                className="text-zinc-500 hover:text-white transition-colors p-1 bg-white/5 rounded-md hover:bg-white/10 -mt-1 -mr-1"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content */}
            <div className="relative z-10 mb-4">
              <p className="text-sm text-zinc-400 leading-relaxed">
                {toast.message}
              </p>
            </div>

            {/* Action */}
            {toast.linkText && toast.linkUrl && (
              <div className="relative z-10">
                <Link
                  href={toast.linkUrl}
                  onClick={() => handleDismiss(toast._id)} 
                  className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium py-2.5 rounded-xl transition-all hover:border-white/20"
                >
                  {toast.linkText}
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                </Link>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
