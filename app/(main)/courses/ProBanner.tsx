"use client";

import { useToast } from "@/app/context/ToastContext";
import { Lock } from "lucide-react";

export function ProBanner() {
  const { showToast } = useToast();

  return (
    <section className="mb-28 relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[#1a1200] via-[#0d0d0d] to-[#0d0d0d] p-8 md:p-12">
      {/* Glow */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-amber-400 to-amber-600 rounded-l-3xl" />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Lock className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-amber-500/70 mb-1">
              Coming Soon
            </div>
            <h3 className="text-2xl font-black text-white font-display mb-1">
              Unlock CSwithBS{" "}
              <span className="text-amber-500">PRO</span>
            </h3>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
              Get unrestricted access to all premium exam solutions, advanced
              tutorials, and exclusive research insights.
            </p>
          </div>
        </div>
        <button
          onClick={() => showToast("PRO is coming soon! Stay tuned.", "info")}
          className="shrink-0 px-8 py-3.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold rounded-full hover:bg-amber-500/20 transition-colors text-sm"
        >
          Upgrade to PRO
        </button>
      </div>
    </section>
  );
}
