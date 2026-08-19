"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { BookOpen, FileText, ArrowRight, PenTool } from "lucide-react";

export default function WritersHubDashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const userName = session?.user?.name || "Writer";
  const userRole = (session?.user as any)?.roles?.[0] || "WRITER";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-zinc-900/40 p-8 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            Welcome back, <span className="text-accent">{userName}</span>
          </h1>
          <p className="text-zinc-400">
            Ready to create some amazing content today?
          </p>
        </div>
        <div className="relative z-10 flex gap-4">
          <Link
            href="/writers-hub/write"
            className="flex items-center gap-2 bg-accent text-black px-5 py-2.5 rounded-lg font-medium hover:bg-accent/90 transition-colors shadow-[0_0_15px_rgba(0,255,157,0.3)]"
          >
            <PenTool className="w-4 h-4" />
            Write Content
          </Link>
        </div>
      </div>

      <div className={`grid grid-cols-1 ${["ADMIN", "SUPER_ADMIN"].some(r => (session?.user as any)?.roles?.includes(r)) ? "md:grid-cols-2" : ""} gap-6`}>

        {/* Quick Access: Academic Notes (Admins Only) */}
        {["ADMIN", "SUPER_ADMIN"].some(r => (session?.user as any)?.roles?.includes(r)) && (
          <div className="group bg-[#0A0A0A] border border-white/5 rounded-xl p-6 hover:border-accent/30 hover:bg-zinc-900/50 transition-all">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Academic Notes</h2>
            <p className="text-sm text-zinc-400 mb-6 line-clamp-2">
              Create structured, chapter-based educational content. Used for the main curriculum and study materials.
            </p>
            <Link
              href="/writers-hub/notes"
              className="flex items-center gap-2 text-sm font-medium text-accent group-hover:gap-3 transition-all"
            >
              Manage Notes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Quick Access: Blog Posts */}
        <div className="group bg-[#0A0A0A] border border-white/5 rounded-xl p-6 hover:border-amber-500/30 hover:bg-zinc-900/50 transition-all">
          <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Blog Posts</h2>
          <p className="text-sm text-zinc-400 mb-6 line-clamp-2">
            Write technical articles, news, or general knowledge posts for the CSWITHBS blog.
          </p>
          <Link
            href="/writers-hub/posts"
            className="flex items-center gap-2 text-sm font-medium text-amber-500 group-hover:gap-3 transition-all"
          >
            Manage Posts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Access Control Notice */}
      {userRole === "WRITER" && (
        <div className="bg-blue-900/10 border border-blue-900/30 rounded-xl p-4 flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-blue-400 mb-1">Writer Access Active</h3>
            <p className="text-xs text-blue-200/60">
              You currently have Writer access. You can create new content and edit your own posts and notes. You cannot edit content authored by other users.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
