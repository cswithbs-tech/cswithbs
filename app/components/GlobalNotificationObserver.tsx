"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";
import { X, Info, AlertTriangle, CheckCircle, BellRing } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface NotificationSetting {
  active: boolean;
  message: string;
  type: "info" | "warning" | "success" | "error";
  id: string; // Unique ID to track dismissal
}

export function GlobalNotificationObserver() {
  // Poll for notifications every 60 seconds
  const { data } = useSWR("/api/settings/notification", fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: false,
  });

  const [isVisible, setIsVisible] = useState(false);
  const [notification, setNotification] = useState<NotificationSetting | null>(null);

  useEffect(() => {
    if (data && data.active) {
      // Check if user has already dismissed this specific notification
      const dismissedId = sessionStorage.getItem("dismissed_notification_id");
      if (dismissedId !== data.id) {
        setNotification(data);
        setIsVisible(true);
      }
    } else {
      setIsVisible(false);
    }
  }, [data]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (notification?.id) {
      sessionStorage.setItem("dismissed_notification_id", notification.id);
    }
  };

  if (!isVisible || !notification) return null;

  const typeConfig = {
    info: {
      border: "border-blue-500/50",
      bg: "bg-blue-500/10",
      icon: <Info size={16} className="text-blue-400" />,
      dot: "bg-blue-400"
    },
    warning: {
      border: "border-amber-500/50",
      bg: "bg-amber-500/10",
      icon: <AlertTriangle size={16} className="text-amber-400" />,
      dot: "bg-amber-400"
    },
    success: {
      border: "border-emerald-500/50",
      bg: "bg-emerald-500/10",
      icon: <CheckCircle size={16} className="text-emerald-400" />,
      dot: "bg-emerald-400"
    },
    error: {
      border: "border-rose-500/50",
      bg: "bg-rose-500/10",
      icon: <AlertTriangle size={16} className="text-rose-400" />,
      dot: "bg-rose-400"
    },
  };

  const config = typeConfig[notification.type] || typeConfig.info;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed top-4 left-0 right-0 z-[100] flex justify-center pointer-events-none px-4">
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-full border shadow-2xl backdrop-blur-xl ${config.border} ${config.bg} max-w-2xl w-auto overflow-hidden relative group`}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
            
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/20 shrink-0 relative">
               <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-ping ${config.dot}`} />
               <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${config.dot}`} />
               <BellRing size={14} className="text-white/80" />
            </div>
            
            <p className="text-sm font-medium text-white/90 truncate max-w-xs md:max-w-md">
              {notification.message}
            </p>
            
            <div className="w-px h-6 bg-white/10 mx-1" />
            
            <button
              onClick={handleDismiss}
              className="text-white/50 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all flex-shrink-0"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
