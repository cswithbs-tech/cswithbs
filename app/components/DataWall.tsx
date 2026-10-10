"use client";

import { useState } from "react";
import {
  Lock,
  GraduationCap,
  X
} from "lucide-react";
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
  const hasCompleteProfile =
    user?.university && user?.semester && user?.year && user?.degree;

  const [isDismissed, setIsDismissed] = useState(false);

  // Hard restriction: Not logged in (and not free preview) or explicitly banned
  const isHardRestricted = !user ? !article.isFreePreview : user?.isCourseRestricted;

  // Privileged check
  const isPrivileged = user && ((user as any).roles || []).some((r: string) =>
    ["ADMIN", "SUPER_ADMIN", "admin", "super_admin"].includes(r)
  );

  const shouldSoftRestrict = () => {
    if (isHardRestricted) return false;
    if (isPrivileged) return false;
    if (hasCompleteProfile) return false;

    // Manual override check
    if (article.isRestricted === true) return true;
    if (article.isRestricted === false) return false;

    // Fallback to tags or level logic
    const isAdvancedOrIntermediateTag = article.tags?.some(
      (tag: string) =>
        tag.toLowerCase().includes("advanced") ||
        tag.toLowerCase().includes("intermediate"),
    );
    const isAdvancedOrIntermediateLevel =
      article.level &&
      (article.level.toLowerCase().includes("advanced") ||
        article.level.toLowerCase().includes("intermediate"));

    if (isAdvancedOrIntermediateTag || isAdvancedOrIntermediateLevel)
      return true;

    // Default to free
    return false;
  };

  const isSoftRestricted = shouldSoftRestrict();

  // If there's NO restriction, just render children
  if (!isHardRestricted && !isSoftRestricted) {
    return <>{children}</>;
  }

  // Soft restriction: show content, but display a capsule notification
  if (isSoftRestricted) {
    return (
      <>
        {children}
        {!isDismissed && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm md:left-auto md:right-8 md:translate-x-0 md:bottom-8 md:w-[400px] z-50 animate-in slide-in-from-bottom-8 fade-in duration-500">
            <div className="group relative bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden transition-all hover:border-accent/30 hover:shadow-[0_10px_50px_rgba(var(--color-accent),0.15)]">
              {/* Animated Glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/20 rounded-full blur-[50px] pointer-events-none group-hover:bg-accent/30 transition-all duration-700" />
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDismissed(true);
                }} 
                className="absolute top-4 right-4 text-zinc-500 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all z-[100] cursor-pointer"
                aria-label="Close"
              >
                 <X className="w-4 h-4" />
              </button>
              
              <div className="flex gap-4 relative z-10">
                 <div className="bg-gradient-to-br from-accent/20 to-accent/5 p-3 rounded-xl border border-accent/20 shrink-0 self-start shadow-inner">
                    <GraduationCap className="w-6 h-6 text-accent drop-shadow-[0_0_8px_rgba(var(--color-accent),0.8)]" />
                 </div>
                 <div className="flex-1 pr-6 pt-0.5">
                   <h3 className="text-base font-bold text-white mb-1.5">Unlock Your Potential</h3>
                   <p className="text-xs text-zinc-400 leading-relaxed mb-4">Complete your academic profile to let us personalize your learning path and recommend the best courses.</p>
                   
                   <button 
                     onClick={() => router.push("/profile")} 
                     className="w-full py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md flex justify-center items-center gap-2"
                   >
                     Complete Profile Now
                   </button>
                 </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Hard restriction: show the blurred wall
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
          <div
            className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] pointer-events-none ${user?.isCourseRestricted ? "bg-red-500/20" : "bg-accent/20"}`}
          ></div>

          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative z-10">
            <Lock
              className={`w-8 h-8 ${user?.isCourseRestricted ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "text-accent drop-shadow-[0_0_8px_rgba(var(--color-accent),0.8)]"}`}
            />
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-white mb-3 relative z-10">
            {user?.isCourseRestricted
              ? "Access Restricted 🛑"
              : "Advanced Territory 🚀"}
          </h2>

          <p className="text-sm text-zinc-400 mb-8 leading-relaxed relative z-10">
            {user?.isCourseRestricted ? (
              "Your account has been temporarily restricted by an administrator from accessing courses. Please contact support to resolve this issue."
            ) : (
              "Log in or create a free account to unlock this full lesson, track your progress, and access premium resources."
            )}
          </p>

          {!user ? (
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Log in to continue
            </button>
          ) : user?.isCourseRestricted ? (
            <div className="relative z-10">
              <button
                onClick={() => router.push("/contact")}
                className="w-full bg-red-500 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              >
                Contact Support
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
