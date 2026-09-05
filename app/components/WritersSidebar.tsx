"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  BookOpen,
  FileText,
  UserCog,
  LogOut,
  LayoutDashboard,
  Crown,
  FolderOpen,
  ListTree,
  Image as ImageIcon,
  Library,
  ClipboardCheck,
} from "lucide-react";

const sidebarLinks = [
  {
    header: "Overview",
    label: "Dashboard",
    href: "/writers-hub/dashboard",
    exact: true,
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    header: "Content",
    label: "Write",
    href: "/writers-hub/write",
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
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
    ),
  },

  {
    label: "Blog Posts",
    href: "/writers-hub/posts",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: "Media Library",
    href: "/writers-hub/media",
    icon: <ImageIcon className="w-5 h-5" />,
  },
];

const adminOnlyLinks = [
  {
    header: "Admin",
    label: "Approvals Queue",
    href: "/writers-hub/approvals",
    icon: <ClipboardCheck className="w-5 h-5" />,
  },
  {
    label: "Curriculum",
    href: "/writers-hub/curriculum",
    icon: <Library className="w-5 h-5" />,
  },
  {
    label: "Academic Notes",
    href: "/writers-hub/notes",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    label: "Collaborations",
    href: "/writers-hub/collaborations",
    icon: <UserCog className="w-5 h-5" />,
  }
];

interface WritersSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const WritersSidebar = ({
  isOpen = false,
  onClose,
}: WritersSidebarProps) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const roles = (session?.user as any)?.roles || [];
  const userRole = roles.includes("SUPER_ADMIN") ? "SUPER ADMIN" : roles.includes("ADMIN") ? "ADMIN" : roles.includes("WRITER") ? "WRITER" : roles[0] || "WRITER";
  const isSuperOrAdmin = (session?.user as any)?.roles?.some((r: string) =>
    ["ADMIN", "SUPER_ADMIN"].includes(r),
  );
  const isSuperAdmin = (session?.user as any)?.roles?.includes("SUPER_ADMIN");

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A0A0A] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo/Brand */}
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <Link
            href="/writers-hub/dashboard"
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center font-bold text-black">
              W
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Writers Hub
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 no-scrollbar">
          {[...sidebarLinks, ...(isSuperOrAdmin ? adminOnlyLinks : [])].map(
            (item, idx) => {
              const isActive = (item as any).exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <div key={idx}>
                  {item.header && (
                    <div className="px-3 mb-2 mt-5 first:mt-0 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      {item.header}
                    </div>
                  )}
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? "bg-accent/10 text-accent font-medium"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                    onClick={() => onClose && onClose()}
                  >
                    <div
                      className={`${
                        isActive
                          ? "text-accent"
                          : "text-zinc-500 group-hover:text-white transition-colors"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </Link>
                </div>
              );
            },
          )}
        </nav>

        {/* Premium Footer Structure */}
        <div className="border-t border-white/5 mt-auto bg-[#0A0A0A]">
          <div className="flex flex-col">
            {/* View Live Site Link */}
            <Link
              href="/"
              className="flex items-center justify-between px-6 py-3 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.02] transition-colors group"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent/50 group-hover:bg-accent group-hover:shadow-[0_0_8px_rgba(0,255,157,0.5)] transition-all"></div>
                <span>Return to Live Site</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>

            {/* Separator */}
            <div className="h-px bg-white/5 w-full"></div>

            {/* User Profile Block */}
            <div className="flex items-center gap-3 px-6 py-4">
              {/* Avatar */}
              <Link
                href={`/profile/${(session?.user as any)?.id}`}
                className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-medium text-white overflow-hidden shrink-0"
              >
                {session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>WH</span>
                )}
              </Link>

              {/* User Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/profile/${(session?.user as any)?.id}`}
                    className="text-sm font-semibold text-white truncate max-w-[120px]"
                  >
                    {session?.user?.name || "Writer"}
                  </Link>
                  {isSuperAdmin ? (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                      <Crown className="w-3 h-3 text-amber-500" />
                    </div>
                  ) : userRole === "ADMIN" ? (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-accent/10 border border-accent/20">
                      <UserCog className="w-3 h-3 text-accent" />
                    </div>
                  ) : null}
                </div>
                <div className="text-xs text-zinc-500 font-medium tracking-wide flex items-center gap-2">
                  <span className="truncate">{userRole.replace("_", " ")}</span>
                </div>
              </div>

              {/* Logout Button (Fixed) */}
              <button
                onClick={() => signOut({ callbackUrl: "/writers-hub/login" })}
                className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
