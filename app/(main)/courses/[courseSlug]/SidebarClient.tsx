"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  FileText,
  LayoutList,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function SidebarClient({
  courseSlug,
  subject,
  chapters,
  hasSession,
}: {
  courseSlug: string;
  subject: any;
  chapters: any[];
  hasSession: boolean;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Find which chapter the current lesson belongs to, default expand it
  const activeChapterIndex = chapters.findIndex((ch) =>
    ch.notes?.some((n: any) => pathname.includes(`/courses/${courseSlug}/${n.slug}`))
  );
  const [openChapters, setOpenChapters] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    // Default: open the active chapter, or the first chapter
    const defaultOpen = activeChapterIndex >= 0 ? activeChapterIndex : 0;
    init[defaultOpen] = true;
    return init;
  });

  const toggleChapter = (idx: number) => {
    setOpenChapters((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const totalNotes = chapters.reduce((acc, ch) => acc + (ch.notes?.length || 0), 0);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-white/10 shrink-0">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-accent transition-colors mb-4"
        >
          <ChevronRight className="w-3.5 h-3.5 rotate-180" />
          All Subjects
        </Link>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-display leading-tight">
              {subject?.name}
            </h2>
            <p className="text-xs text-zinc-600 font-mono mt-0.5">
              {chapters.length} chapters · {totalNotes} notes
            </p>
          </div>
        </div>
      </div>

      {/* Chapter nav — scrollable */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 pb-32 custom-scrollbar">
        {chapters.length > 0 ? (
          chapters.map((chapter: any, idx: number) => {
            const isOpen = !!openChapters[idx];
            const hasActiveNote = chapter.notes?.some((n: any) =>
              pathname.includes(`/courses/${courseSlug}/${n.slug}`)
            );

            const isLockedTeaser = !hasSession && idx >= 2;

            return (
              <div key={chapter._id} className={isLockedTeaser ? "opacity-40 grayscale pointer-events-none select-none blur-[1px]" : ""}>
                {/* Chapter header button */}
                <button
                  onClick={() => toggleChapter(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                    hasActiveNote
                      ? "bg-accent/10 text-accent"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <LayoutList className="w-3.5 h-3.5 shrink-0 opacity-60" />
                    <span className="text-xs font-bold uppercase tracking-wide truncate">
                      Ch {chapter.order}. {chapter.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {chapter.notes?.length > 0 && (
                      <span className="text-[10px] font-mono opacity-50">
                        {chapter.notes.length}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Notes list — animated collapse */}
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? `${(chapter.notes?.length || 0) * 52}px` : "0px" }}
                >
                  {chapter.notes && chapter.notes.length > 0 ? (
                    <ul className="mt-1 ml-3 pl-3 border-l border-white/10 space-y-0.5 pb-2">
                      {chapter.notes.map((note: any, nIdx: number) => {
                        const isActive = pathname.includes(
                          `/courses/${courseSlug}/${note.slug}`
                        );
                        return (
                          <li key={note._id}>
                            <Link
                              href={`/courses/${courseSlug}/${note.slug}`}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                                isActive
                                  ? "bg-accent/10 text-accent font-medium border border-accent/20"
                                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              <FileText
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isActive ? "text-accent" : "text-zinc-600"
                                }`}
                              />
                              <span className="truncate leading-tight">{note.title}</span>
                              {isActive && (
                                <ChevronRight className="w-3 h-3 ml-auto shrink-0 text-accent" />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-xs text-zinc-700 px-6 py-2 italic">
                      No notes yet.
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-zinc-500 text-center py-10">
            No syllabus available yet.
          </p>
        )}
      </nav>

    </div>
  );

  return (
    <>
      {/* ── Mobile top bar ─────────────────────────────────────── */}
      <div className="md:hidden sticky top-20 z-30 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <span className="font-bold text-white text-sm truncate max-w-[200px]">
            {subject?.name}
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="text-xs font-bold bg-white/10 border border-white/10 px-4 py-1.5 rounded-full text-white hover:bg-white/20 transition-all active:scale-95"
        >
          Contents
        </button>
      </div>

      {/* ── Premium Mobile Bottom Sheet ───────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 bottom-0 top-20 z-50 flex flex-col justify-end overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full h-[85vh] bg-[#0d0d0d] rounded-t-3xl border-t border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drag Handle & Header */}
              <div className="flex flex-col items-center pt-3 pb-2 border-b border-white/10 shrink-0 bg-black/40">
                <div className="w-12 h-1.5 bg-white/20 rounded-full mb-3" />
                <div className="w-full flex justify-between items-center px-5">
                  <span className="font-bold text-white">Table of Contents</span>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="text-xs font-bold text-zinc-400 bg-white/5 px-3 py-1.5 rounded-full hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <SidebarContent />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-72 xl:w-80 shrink-0 border-r border-white/10 bg-[#0a0a0a] h-[calc(100vh-80px)] sticky top-20">
        <SidebarContent />
      </aside>
    </>
  );
}
