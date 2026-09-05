"use client";

import { X } from "lucide-react";
import { useState, useEffect } from "react";

interface AnnouncementBarProps {
  message: string;
}

export default function AnnouncementBar({ message }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Hide if user has already dismissed it in this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem("announcement-dismissed");
    if (dismissed === message) {
      setIsVisible(false);
    }
  }, [message]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("announcement-dismissed", message);
  };

  if (!isVisible || !message) return null;

  return (
    <div className="relative bg-gradient-to-r from-[#0A0A0A] via-[#121212] to-[#0A0A0A] text-zinc-300 py-3 px-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-[90] border-b border-zinc-800/80 overflow-hidden">
      {/* Subtle Animated Shimmer Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.03)_50%,transparent_100%)] animate-[shimmer_3s_infinite] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 pr-10 relative">
        
        {/* Pulsing Live Dot */}
        <div className="relative flex items-center justify-center shrink-0">
           <div className="absolute w-2.5 h-2.5 rounded-full bg-accent animate-ping opacity-75" />
           <div className="relative w-1.5 h-1.5 rounded-full bg-accent" />
        </div>
        
        {/* Message */}
        <p className="text-xs md:text-sm font-semibold tracking-wide text-center leading-tight max-w-4xl text-zinc-200">
          {message}
        </p>
      </div>

      <button
        onClick={handleDismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
        aria-label="Close Announcement"
      >
        <X size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
