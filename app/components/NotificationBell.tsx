"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import useSWR from "swr";
import { Bell, Check, ExternalLink, Info, BellRing, BookOpen, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

// SWR fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Notification {
  _id: string;
  type: "GENERAL" | "PERSONAL" | "NEW_BLOG" | "NEW_COURSE";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const NotificationBell = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Poll every 60 seconds
  const { data, mutate, isLoading } = useSWR("/api/notifications", fetcher, {
    refreshInterval: 60000,
  });

  const notifications: Notification[] = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      // Optimistic update
      mutate(
        {
          ...data,
          notifications: notifications.map((n) =>
            n._id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, unreadCount - 1),
        },
        false
      );

      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });

      // Revalidate
      mutate();
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleDismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Optimistic update
      const notificationToDismiss = notifications.find(n => n._id === id);
      const wasUnread = notificationToDismiss && !notificationToDismiss.isRead;
      
      mutate(
        {
          ...data,
          notifications: notifications.filter((n) => n._id !== id),
          unreadCount: wasUnread ? Math.max(0, unreadCount - 1) : unreadCount,
        },
        false
      );

      await fetch("/api/notifications/dismiss", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });

      mutate();
    } catch (error) {
      console.error("Failed to dismiss notification", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      mutate(
        {
          ...data,
          notifications: notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        },
        false
      );

      await fetch("/api/notifications/mark-all", { method: "POST" });
      mutate();
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }
    if (notification.link) {
      setIsOpen(false);
      router.push(notification.link);
    } else {
      setSelectedNotification(notification);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "NEW_BLOG":
      case "NEW_COURSE":
        return <BookOpen className="w-4 h-4 text-accent" />;
      case "PERSONAL":
        return <BellRing className="w-4 h-4 text-purple-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-400 hover:text-white transition-colors focus:outline-none rounded-full hover:bg-white/5"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-black animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Invisible overlay for mobile to click out easily */}
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setIsOpen(false)} />
          
          <div className="fixed inset-x-4 top-[90px] sm:inset-auto sm:absolute sm:right-0 sm:top-[calc(100%+20px)] w-auto sm:w-[420px] bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-4 sm:slide-in-from-top-2 duration-300">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <h3 className="text-[15px] font-bold text-white flex items-center gap-2 tracking-wide">
                Notifications
              {unreadCount > 0 && (
                <span className="bg-accent/20 text-accent text-[10px] px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[10px] font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-8 text-center text-zinc-500 text-xs">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <Bell className="w-8 h-8 text-zinc-700 mb-3" />
                <p className="text-zinc-400 text-sm">No notifications yet</p>
                <p className="text-zinc-600 text-xs mt-1">We'll let you know when something comes up!</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 rounded-2xl hover:bg-white/[0.06] transition-all duration-200 relative group/item ${
                      notification.link ? "cursor-pointer group" : ""
                    } ${!notification.isRead ? "bg-accent/[0.03]" : ""}`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1 shrink-0">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-semibold ${!notification.isRead ? "text-white" : "text-zinc-300"} flex-1 pr-2 line-clamp-2 leading-snug`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-zinc-500 mt-0.5">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                            <button
                              onClick={(e) => handleDismiss(notification._id, e)}
                              className="text-zinc-600 hover:text-red-400 opacity-100 md:opacity-0 md:group-hover/item:opacity-100 transition-opacity bg-white/5 hover:bg-white/10 rounded-md p-1"
                              title="Dismiss"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                            </button>
                          </div>
                        </div>
                        {/* We use line-clamp-2 so very long messages don't break the layout, but give enough context */}
                        <p className={`text-xs leading-relaxed ${!notification.isRead ? "text-zinc-300" : "text-zinc-500"} line-clamp-2 mt-1`}>
                          {notification.message}
                        </p>
                        
                        {notification.link && (
                          <div className="flex items-center gap-1 text-[10px] text-accent mt-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            View details <ExternalLink className="w-3 h-3" />
                          </div>
                        )}
                        
                        {!notification.isRead && !notification.link && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification._id); }}
                             className="text-[10px] text-zinc-500 hover:text-white transition-colors mt-2"
                           >
                             Dismiss
                           </button>
                        )}
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1.5 shadow-[0_0_8px_rgba(var(--color-accent),0.6)]"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </>
      )}

      {/* Modal for full message */}
      {mounted && selectedNotification && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
              <h3 className="font-bold text-white flex items-center gap-2">
                {getIcon(selectedNotification.type)}
                {selectedNotification.title}
              </h3>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {selectedNotification.message}
              </p>
            </div>
            <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-between items-center text-xs text-zinc-500">
              <span>{formatDistanceToNow(new Date(selectedNotification.createdAt), { addSuffix: true })}</span>
              <button 
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
