"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Lock, BookOpen } from "lucide-react";
import { useState } from "react";

export function SidebarClient({ 
  courseSlug, 
  subject, 
  chapters 
}: { 
  courseSlug: string;
  subject: any;
  chapters: any[];
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden p-4 border-b border-white/10 flex items-center justify-between bg-zinc-950 sticky top-20 z-30">
        <div className="flex items-center gap-2 font-bold text-white">
          <BookOpen className="w-5 h-5 text-accent" />
          {subject?.name || courseSlug}
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-xs bg-white/10 px-3 py-1.5 rounded-full text-white"
        >
          {isMobileMenuOpen ? "Close Index" : "Menu"}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        ${isMobileMenuOpen ? "block" : "hidden"} 
        md:block w-full md:w-80 shrink-0 border-r border-white/10 bg-zinc-950 md:h-[calc(100vh-80px)] md:sticky md:top-20 overflow-y-auto custom-scrollbar
      `}>
        <div className="p-6">
          <Link href="/courses" className="text-xs text-zinc-500 hover:text-white uppercase tracking-wider font-bold flex items-center gap-1 mb-6">
            &larr; Back to Courses
          </Link>
          <h2 className="text-xl font-bold text-white mb-8 font-display">
            {subject?.name || "Course Not Found"}
          </h2>

          <div className="space-y-6">
            {chapters.length > 0 ? (
                chapters.map((chapter: any, mIndex: number) => (
                <div key={mIndex}>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                    {chapter.order}. {chapter.name}
                    </h3>
                    {chapter.notes && chapter.notes.length > 0 ? (
                        <ul className="space-y-1">
                        {chapter.notes.map((lesson: any, lIndex: number) => {
                            // Check if current lesson is active
                            const isActive = pathname.includes(`/courses/${courseSlug}/${lesson.slug}`);
                            
                            return (
                            <li key={lIndex}>
                                <Link 
                                href={`/courses/${courseSlug}/${lesson.slug}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`
                                    flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
                                    ${isActive 
                                    ? "bg-accent/10 text-accent font-medium border border-accent/20" 
                                    : "text-zinc-300 hover:bg-white/5 hover:text-white"}
                                `}
                                >
                                <span className="truncate pr-2">{lesson.title}</span>
                                </Link>
                            </li>
                            );
                        })}
                        </ul>
                    ) : (
                        <p className="text-xs text-zinc-600 px-3 italic">No notes in this chapter yet.</p>
                    )}
                </div>
                ))
            ) : (
                <p className="text-sm text-zinc-500">No syllabus available for this course yet.</p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
