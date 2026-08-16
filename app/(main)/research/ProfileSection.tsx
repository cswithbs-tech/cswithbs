import { ExternalLink, BookOpen, Quote, Target } from "lucide-react";
import { ExternalLinkButton } from "./ExternalLinkButton";

export function ProfileSection() {
  return (
    <section className="mb-24 mt-16 max-w-6xl mx-auto px-4 md:px-0">
      <div className="relative z-10 flex flex-col gap-10">
        {/* Header Row: Title & Action Links */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-white font-display tracking-tight mb-2">
              Research Impact & Metrics
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="px-3 py-1 bg-[#E2C6B9]/10 border border-[#E2C6B9]/20 rounded-md text-xs text-[#E2C6B9] font-medium tracking-wide uppercase">
                Metaheuristic Algorithms
              </span>
              <span className="px-3 py-1 bg-[#E2C6B9]/10 border border-[#E2C6B9]/20 rounded-md text-xs text-[#E2C6B9] font-medium tracking-wide uppercase">
                Deep Learning
              </span>
              <span className="px-3 py-1 bg-[#E2C6B9]/10 border border-[#E2C6B9]/20 rounded-md text-xs text-[#E2C6B9] font-medium tracking-wide uppercase">
                Image Processing
              </span>
              <span className="px-3 py-1 bg-[#E2C6B9]/10 border border-[#E2C6B9]/20 rounded-md text-xs text-[#E2C6B9] font-medium tracking-wide uppercase">
                Precision Agricuture
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <ExternalLinkButton
              href="https://scholar.google.com/citations?user=qE2uisoAAAAJ&hl=en"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-bold rounded-xl border border-blue-500/20 transition-all"
            >
              Google Scholar
              <ExternalLink className="w-3.5 h-3.5" />
            </ExternalLinkButton>
            <ExternalLinkButton
              href="https://www.researchgate.net/profile/Buddhadev-Sasmal"
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-bold rounded-xl border border-emerald-500/20 transition-all"
            >
              ResearchGate
              <ExternalLink className="w-3.5 h-3.5" />
            </ExternalLinkButton>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex flex-wrap items-center gap-6 md:gap-12 mt-4">
          <div className="flex flex-col items-start">
            <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-1">
              Publications
            </span>
            <span className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#E2C6B9] opacity-70" />
              20+
            </span>
          </div>

          <div className="w-px h-12 bg-white/10 hidden md:block" />

          <div className="flex flex-col items-start">
            <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-1">
              Citations
            </span>
            <span className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Quote className="w-5 h-5 text-blue-400 opacity-70" />
              495+
            </span>
          </div>

          <div className="w-px h-12 bg-white/10 hidden md:block" />

          <div className="flex flex-col items-start">
            <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-1">
              h-index
            </span>
            <span className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400 opacity-70" />
              12
            </span>
          </div>

          <div className="w-px h-12 bg-white/10 hidden md:block" />

          <div className="flex flex-col items-start">
            <span className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-1">
              i10-index
            </span>
            <span className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400 opacity-70" />
              12
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
