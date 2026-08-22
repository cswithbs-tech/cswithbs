"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Crown, UserCog } from "lucide-react";

// Updated sidebar links with new Users and Profile sections
const sidebarLinks = [
  // --- OVERVIEW ---
  {
    header: "Overview",
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
        />
      </svg>
    ),
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
        />
      </svg>
    ),
  },

  // --- AUDIENCE ---
  {
    header: "Audience",
    label: "Users",
    href: "/admin/users",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
        />
      </svg>
    ),
  },
  {
    label: "User Records",
    href: "/admin/users/records",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
        />
      </svg>
    ),
  },
  {
    label: "Messages",
    href: "/admin/messages",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
        />
      </svg>
    ),
  },
  {
    label: "Announcements",
    href: "/admin/announcements",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46"
        />
      </svg>
    ),
  },
  {
    label: "Subscribers",
    href: "/admin/subscribers",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
        />
      </svg>
    ),
  },
  {
    label: "Newsletter",
    href: "/admin/newsletter",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
        />
      </svg>
    ),
  },

  // --- SYSTEM ---
  {
    header: "System",
    label: "Settings",
    href: "/admin/settings",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.581-.495.644-.869l.214-1.281Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    ),
  },
];

// ... (sidebarLinks array remains same)

// Add props for Mobile Control
interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminSidebar = ({
  isOpen = false,
  onClose,
}: AdminSidebarProps) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  const roles = (session?.user as any)?.roles || [];
  const isSuperOrAdmin = Array.isArray(roles)
    ? roles.some((r) =>
        ["ADMIN", "SUPER_ADMIN", "admin", "super_admin"].includes(r),
      )
    : roles === "admin" || roles === "super_admin";

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadMessages || 0);
        }
      } catch (error) {
        console.error("Failed to fetch notifs", error);
      }
    };

    fetchUnread();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#0A0A0A] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
          <Link
            href={
              isSuperOrAdmin ? "/admin/dashboard" : "/writers-hub/dashboard"
            }
            className="text-xl font-bold tracking-tight text-white flex items-center gap-2"
          >
            <span className="text-xl font-bold text-white tracking-tight">
              CSwithBS
            </span>
            <span className="text-accent">
              {isSuperOrAdmin ? "Admin" : "Writer"}
            </span>
            Panel
          </Link>

          {/* Close Button Mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-zinc-400 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto pb-6 pt-1 px-4 space-y-1">
          {sidebarLinks
            .filter((link) => {
              if (
                link.label === "Dashboard" ||
                link.label === "Users" ||
                link.label === "Settings" ||
                link.label === "Analytics" ||
                link.label === "Messages" ||
                link.label === "Insights" ||
                link.label === "Subscribers" ||
                link.label === "Newsletter"
              ) {
                return isSuperOrAdmin;
              }

              // Editors can see: Posts, Create Post, Media, Comments
              return true;
            })
            .map((link) => {
              const isActive = pathname === link.href;
              const isMessages = link.label === "Messages";
              const showNotification = isMessages && unreadCount > 0;

              return (
                <div key={link.href}>
                  {(link as any).header && (
                    <div className="px-4 mt-6 mb-2 text-[10px] uppercase font-bold text-zinc-600 tracking-wider">
                      {(link as any).header}
                    </div>
                  )}
                  <Link
                    href={link.href}
                    target={(link as any).target}
                    onClick={onClose} // Auto-close on mobile nav
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all relative group ${
                      isActive
                        ? "bg-gradient-to-r from-accent/20 to-transparent text-accent border-l-2 border-accent"
                        : "text-zinc-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                    }`}
                  >
                    <span
                      className={
                        isActive
                          ? "text-accent"
                          : "group-hover:text-white transition-colors"
                      }
                    >
                      {link.icon}
                    </span>
                    {link.label}

                    {/* Blinking Notification Dot */}
                    {showNotification && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
        </nav>

        {/* Premium Footer Structure */}
        <div className="border-t border-white/5 mt-auto bg-[#0A0A0A]">
          <div className="flex flex-col">
            {/* View Live Site Link */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-6 py-3.5 text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.02] border-b border-white/[0.02] transition-colors group"
            >
              <span className="uppercase tracking-widest flex items-center gap-2.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
                </span>
                View Live Site
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
                />
              </svg>
            </Link>

            {/* User Profile Block */}
            <div className="flex items-center gap-3 px-6 py-4">
              {/* Avatar */}
              <Link
                href={`/profile/${(session?.user as any)?.id}`}
                className="h-10 w-10 rounded-full bg-zinc-900 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white overflow-hidden relative shadow-sm ring-1 ring-white/10"
              >
                {session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>AD</span>
                )}
              </Link>

              {/* User Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <Link
                  href={`/profile/${(session?.user as any)?.id}`}
                  className="block truncate text-sm font-bold text-zinc-200 hover:text-white transition-colors"
                >
                  {session?.user?.name || "Admin"}
                </Link>
                <div className="flex items-center gap-1 mt-0.5">
                  {(() => {
                    const roles = (session?.user as any)?.roles || [];
                    const isSuper =
                      roles.includes("SUPER_ADMIN") ||
                      roles.includes("super_admin");
                    const isAdmin =
                      roles.includes("ADMIN") || roles.includes("admin");

                    if (isSuper) {
                      return (
                        <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold text-amber-500">
                          <Crown className="w-3 h-3 drop-shadow-[0_0_2px_rgba(251,191,36,0.5)]" />
                          Super Admin
                        </span>
                      );
                    }
                    if (isAdmin) {
                      return (
                        <span className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold text-blue-400">
                          <UserCog className="w-3 h-3 drop-shadow-[0_0_2px_rgba(96,165,250,0.5)]" />
                          Admin
                        </span>
                      );
                    }
                    return (
                      <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-500">
                        Writer
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Sign Out"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
