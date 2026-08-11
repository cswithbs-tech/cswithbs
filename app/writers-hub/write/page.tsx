"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { BookOpen, FileText, ArrowRight } from "lucide-react";
import GlobalLoading from "@/app/loading";

export default function WriteSelectionPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <GlobalLoading />;
  }

  const userRoles = (session?.user as any)?.roles || [];
  const isSuperOrAdmin = userRoles.some((r: string) =>
    ["ADMIN", "SUPER_ADMIN"].includes(r)
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">What would you like to write?</h1>
        <p className="text-zinc-400">Choose the type of content you want to create today.</p>
      </div>

      <div className={`grid grid-cols-1 ${isSuperOrAdmin ? 'md:grid-cols-2' : 'max-w-md mx-auto'} gap-6`}>
        {/* Blog Post Option - Available to all writers */}
        <Link 
          href="/writers-hub/editor?type=post"
          className="group relative bg-zinc-900/40 border border-white/5 rounded-2xl p-8 hover:border-accent/30 hover:bg-zinc-900/80 transition-all overflow-hidden block"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[50px] group-hover:bg-accent/10 transition-colors pointer-events-none"></div>
          
          <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FileText className="w-7 h-7 text-accent" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">Blog Post</h2>
          <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
            Write an article, tutorial, or news update for the main blog. Blog posts are public-facing and appear in the standard feed.
          </p>
          
          <div className="flex items-center text-accent text-sm font-medium gap-2 group-hover:gap-3 transition-all">
            Start Writing <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Academic Note Option - Available to admins only */}
        {isSuperOrAdmin && (
          <Link 
            href="/writers-hub/editor?type=note"
            className="group relative bg-zinc-900/40 border border-white/5 rounded-2xl p-8 hover:border-accent/30 hover:bg-zinc-900/80 transition-all overflow-hidden block"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[50px] group-hover:bg-accent/10 transition-colors pointer-events-none"></div>
            
            <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7 text-accent" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">Academic Note</h2>
            <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
              Create a structured study material or curriculum chapter. Notes belong to specific subjects and form the core learning paths.
            </p>
            
            <div className="flex items-center text-accent text-sm font-medium gap-2 group-hover:gap-3 transition-all">
              Start Writing <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
