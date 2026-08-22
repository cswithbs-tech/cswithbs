"use client";

import { useState } from "react";
import { Lock, GraduationCap, Building2, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";

interface DataWallProps {
  article: any;
  session: any;
  children: React.ReactNode;
}

export const DataWall = ({ article, session, children }: DataWallProps) => {
  const router = useRouter();
  const { showToast } = useToast();
  
  // Check if user has complete profile
  const user = session?.user;
  
  // We assume user data is attached to session. If not, they might need to log in first.
  const hasCompleteProfile = user?.university && user?.semester && user?.year;

  const shouldRestrict = () => {
    if (!user) return true; // Not logged in? Hit the wall
    if (user.isCourseRestricted) return true; // Explicitly restricted by admin
    if (hasCompleteProfile) return false;

    // Check if user is Admin, Super Admin, or Writer. They should always bypass the wall.
    const roles = (user as any).roles || [];
    const isPrivileged = roles.some((r: string) => 
      ["ADMIN", "SUPER_ADMIN", "WRITER", "admin", "super_admin", "writer"].includes(r)
    );
    if (isPrivileged) return false;

    // Manual override check
    if (article.isRestricted === true) return true;
    if (article.isRestricted === false) return false;

    // Fallback to tags or level logic
    const isAdvancedOrIntermediateTag = article.tags?.some((tag: string) => 
      tag.toLowerCase().includes('advanced') || tag.toLowerCase().includes('intermediate')
    );
    const isAdvancedOrIntermediateLevel = article.level && (
      article.level.toLowerCase().includes('advanced') || 
      article.level.toLowerCase().includes('intermediate')
    );

    if (isAdvancedOrIntermediateTag || isAdvancedOrIntermediateLevel) return true;

    // Default to free
    return false;
  };

  const isRestricted = shouldRestrict();

  if (!isRestricted) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Blurred Content */}
      <div className="select-none pointer-events-none blur-md opacity-20 transition-all duration-1000">
        {children}
      </div>

      {/* The Glassmorphism Wall Card */}
      <div className="absolute inset-0 z-10 flex items-start justify-center pt-24 px-4">
        <div className="w-full max-w-md bg-[#111111]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-8 text-center relative overflow-hidden">
          
          {/* Decorative Glow */}
          <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] pointer-events-none ${user?.isCourseRestricted ? 'bg-red-500/20' : 'bg-accent/20'}`}></div>
          
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative z-10">
            <Lock className={`w-8 h-8 ${user?.isCourseRestricted ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-accent drop-shadow-[0_0_8px_rgba(var(--color-accent),0.8)]'}`} />
          </div>
          
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3 relative z-10">
            {user?.isCourseRestricted ? "Access Restricted 🛑" : "Advanced Territory 🚀"}
          </h2>
          
          <p className="text-sm text-zinc-400 mb-8 leading-relaxed relative z-10">
            {user?.isCourseRestricted ? (
              "Your account has been temporarily restricted by an administrator from accessing courses. Please contact support to resolve this issue."
            ) : (
              <>You are about to access intermediate and advanced materials. Please complete your academic profile <strong className="text-white"> (Required) </strong> in your Account Settings to unlock this content.</>
            )}
          </p>

          {!user ? (
            <button 
              onClick={() => router.push('/login')}
              className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Log in to continue
            </button>
          ) : user?.isCourseRestricted ? (
            <div className="relative z-10">
              <button
                onClick={() => router.push('/contact')}
                className="w-full bg-red-500 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              >
                Contact Support
              </button>
            </div>
          ) : (
            <div className="relative z-10 space-y-6">
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 text-left">
                <p className="text-xs text-accent/90 leading-relaxed font-medium">
                  <strong className="text-accent">Privacy Note:</strong> We securely keep your data private. This information is collected solely for future use to provide you with tailored academic resources and opportunities.
                </p>
              </div>

              <button
                onClick={() => router.push('/profile')}
                className="w-full bg-accent text-black font-bold py-3.5 px-4 rounded-xl hover:bg-accent/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(var(--color-accent),0.3)]"
              >
                Complete Profile to Unlock
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
