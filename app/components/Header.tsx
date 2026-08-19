"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Crown,
  UserCog,
  Gem,
  PenTool,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  Star,
} from "lucide-react";
import { Container } from "./ui/Container";
import { Button } from "./ui/Button";
import { useSession, signOut } from "next-auth/react";

export const Header = () => {
  const { data: session } = useSession();
  const [userImage, setUserImage] = useState<string | null | undefined>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (session?.user?.image) {
      setUserImage(session.user.image);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/profile/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.image) {
            setUserImage(data.image);
          }
        })
        .catch((err) => console.error("Header image sync error", err));
    }
  }, [session]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const [siteTitle, setSiteTitle] = useState("CSwithBS");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const siteTitle = data.site_title?.value;
        if (siteTitle && siteTitle !== "CSWITHBS") {
          setSiteTitle(siteTitle);
        }
      })
      .catch((err) => console.error("Header site title fetch error", err));
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Courses", href: "/courses" },
    { label: "Research", href: "/research" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <Container>
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="z-50 relative flex items-center"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Image src="/images/logo.svg" alt="CSWITHBS Logo" width={160} height={40} className="h-10 w-auto object-contain" priority />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted hover:text-foreground transition-colors uppercase tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA / User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 pl-4 border-l border-white/10 group cursor-pointer focus:outline-none"
                >
                  <div className="h-9 w-9 rounded-full bg-zinc-800 border border-white/10 overflow-hidden relative group-hover:border-accent transition-colors">
                    {userImage ? (
                      <img
                        src={userImage}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-sm text-white font-bold uppercase">
                        {session.user?.name?.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white leading-none transition-all duration-300 group-hover:text-accent group-hover:drop-shadow-[0_0_12px_rgba(var(--color-accent),1)]">
                      {session.user?.name}
                    </span>

                    {/* Minimalist Badges (Priority: Super Admin > Admin > Writer > Premium) */}
                    {(session.user as any).roles?.includes("SUPER_ADMIN") ? (
                      <Crown className="w-4 h-4 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.6)]" />
                    ) : (session.user as any).roles?.includes("ADMIN") ? (
                      <UserCog className="w-4 h-4 text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.6)]" />
                    ) : (session.user as any).roles?.includes("WRITER") ? (
                      <PenTool className="w-4 h-4 text-accent drop-shadow-[0_0_5px_rgba(var(--color-accent),0.6)]" />
                    ) : (session.user as any).isPremium ? (
                      <Gem className="w-4 h-4 text-fuchsia-400 drop-shadow-[0_0_5px_rgba(232,121,249,0.6)]" />
                    ) : null}

                    <ChevronDown
                      className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute md:right-[-30px] right-0 mt-5 w-56 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl py-2 flex flex-col z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 mb-2">
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">
                        Signed in as
                      </p>
                      <p className="text-sm text-white font-bold truncate">
                        {session.user?.email}
                      </p>
                    </div>

                    {(session.user as any).roles?.some((r: string) =>
                      ["ADMIN", "SUPER_ADMIN"].includes(r),
                    ) && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                        Admin Dashboard
                      </Link>
                    )}

                    {(session.user as any).roles?.some((r: string) =>
                      ["ADMIN", "SUPER_ADMIN", "WRITER"].includes(r),
                    ) && (
                      <Link
                        href="/writers-hub/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <PenTool className="w-4 h-4 text-zinc-400" />
                        Writers Hub
                      </Link>
                    )}

                    <Link
                      href={`/profile/${(session.user as any).id}`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4 text-zinc-400" />
                      View Profile
                    </Link>

                    <div className="h-px bg-white/5 my-2 w-full"></div>

                    <button
                      onClick={() => signOut()}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-sm font-medium text-white hover:text-accent transition-colors border border-white/10 px-4 py-2 rounded-full hover:border-accent/50 hover:bg-accent/10"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden z-50 relative text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </Container>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-0 left-0 w-full h-screen bg-black/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center opacity-100 transition-all duration-300">
          <nav className="flex flex-col items-center gap-8 mb-12">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-3xl font-bold text-white hover:text-accent transition-colors tracking-tight"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col items-center gap-6 p-8 border-t border-white/10 w-full max-w-xs">
            {session ? (
              <div className="w-full flex flex-col">
                <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0">
                    {userImage ? (
                      <img
                        src={userImage}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-lg font-bold text-white uppercase">
                        {session.user?.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col text-left overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white truncate">
                        {session.user?.name}
                      </h4>
                      {/* Mobile Minimalist Badges */}
                      {(session.user as any).roles?.includes("SUPER_ADMIN") && (
                        <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                      {(session.user as any).roles?.includes("ADMIN") &&
                        !(session.user as any).roles?.includes(
                          "SUPER_ADMIN",
                        ) && (
                          <UserCog className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        )}
                      {(session.user as any).roles?.includes("WRITER") &&
                        !(session.user as any).roles?.some((r: string) =>
                          ["SUPER_ADMIN", "ADMIN"].includes(r),
                        ) && (
                          <PenTool className="w-3.5 h-3.5 text-accent shrink-0" />
                        )}
                      {(session.user as any).isPremium && (
                        <Star className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  {(session.user as any).roles?.some((r: string) =>
                    ["ADMIN", "SUPER_ADMIN"].includes(r),
                  ) && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors text-zinc-300 hover:text-white"
                    >
                      <LayoutDashboard className="w-5 h-5 text-zinc-400" />
                      <span className="font-medium">Admin Dashboard</span>
                    </Link>
                  )}

                  {(session.user as any).roles?.some((r: string) =>
                    ["ADMIN", "SUPER_ADMIN", "WRITER"].includes(r),
                  ) && (
                    <Link
                      href="/writers-hub/posts/create"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors text-zinc-300 hover:text-white"
                    >
                      <PenTool className="w-5 h-5 text-zinc-400" />
                      <span className="font-medium">Write New Post</span>
                    </Link>
                  )}

                  <Link
                    href={`/profile/${(session.user as any).id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors text-zinc-300 hover:text-white"
                  >
                    <User className="w-5 h-5 text-zinc-400" />
                    <span className="font-medium">View Profile</span>
                  </Link>

                  <div className="h-px bg-white/10 my-2 w-full"></div>

                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-red-500/10 transition-colors text-red-400 w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full justify-center h-12 text-lg flex items-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
