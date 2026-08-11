import { Container } from "@/app/components/ui/Container";
import Link from "next/link";
import { BookOpen, Code, Database, Server, Terminal, Lock, Network, Cpu, FileText, ChevronRight } from "lucide-react";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import Chapter from "@/models/Chapter";
import Note from "@/models/Note";

// Map string icons to Lucide components
const iconMap: Record<string, any> = {
  Database,
  Server,
  Code,
  Terminal,
  Network,
  Cpu,
  BookOpen,
  FileText
};

export const revalidate = 60; // Revalidate every minute

async function getSubjectsData() {
  await dbConnect();
  
  // 1. Fetch all subjects
  const subjects = await Subject.find().sort({ name: 1 }).lean();
  
  // 2. Fetch chapter and note counts, plus first 3 chapters for each subject
  let totalChapters = 0;
  let totalNotes = 0;

  const subjectsData = await Promise.all(
    subjects.map(async (subject) => {
      const chaptersCount = await Chapter.countDocuments({ subject: subject._id });
      const notesCount = await Note.countDocuments({ subject: subject._id });
      
      totalChapters += chaptersCount;
      totalNotes += notesCount;

      // Fetch first 3 chapters for preview
      const previewChapters = await Chapter.find({ subject: subject._id })
        .sort({ order: 1 })
        .limit(3)
        .lean();

      return {
        ...subject,
        _id: subject._id.toString(),
        chapterCount: chaptersCount,
        noteCount: notesCount,
        previewChapters: previewChapters.map((c: any) => ({
            ...c,
            _id: c._id.toString(),
            subject: c.subject.toString()
        })),
        iconComponent: subject.icon && iconMap[subject.icon as string] ? iconMap[subject.icon as string] : BookOpen,
      };
    })
  );

  return { 
      subjects: subjectsData, 
      stats: {
          subjects: subjects.length,
          chapters: totalChapters,
          notes: totalNotes
      }
  };
}

export default async function CoursesLandingPage() {
  const { subjects, stats } = await getSubjectsData();

  return (
    <div className="min-h-screen bg-black pt-32 pb-20">
      <Container>
        {/* 1. Slim Hero Section */}
        <section className="mb-24 flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
            <div className="flex-1">
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight font-display tracking-tight mb-4">
                    Structured CS Notes,<br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-white">One Chapter at a Time.</span>
                </h1>
                <p className="text-lg md:text-xl text-zinc-400 leading-relaxed mb-8">
                    Every topic broken down by chapter, meticulously organized and written for clarity. Skip the fluff, master the core concepts.
                </p>
                
                {/* Stats Strip */}
                <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-zinc-400 mb-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                        <BookOpen className="w-4 h-4 text-accent" />
                        <span className="text-white font-bold">{stats.subjects}</span> Subjects
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                        <FileText className="w-4 h-4 text-accent" />
                        <span className="text-white font-bold">{stats.chapters}</span> Chapters
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                        <Code className="w-4 h-4 text-accent" />
                        <span className="text-white font-bold">{stats.notes}</span> Topics
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                    href="#course-grid"
                    className="px-8 py-4 bg-accent text-black font-bold rounded-full hover:bg-accent/90 transition-transform active:scale-95 shadow-[0_0_20px_rgba(226,198,185,0.2)]"
                    >
                    Explore Courses
                    </Link>
                </div>
            </div>
            
            {/* Decorative Right Side - Code / Terminal Card */}
            <div className="hidden lg:flex flex-1 justify-end">
                <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-accent/10 transition-colors duration-700"></div>
                    <div className="flex items-center px-4 py-3 border-b border-white/10 bg-[#0d0d0d]">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
                            <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
                            <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
                        </div>
                        <div className="mx-auto text-xs font-mono text-zinc-500">cswithbs/curriculum.ts</div>
                    </div>
                    <div className="p-6 text-sm font-mono text-zinc-400">
                        <div className="text-purple-400 mb-2">import <span className="text-white">{`{ Subject }`}</span> from <span className="text-green-400">'@/db'</span>;</div>
                        <br/>
                        <div className="text-blue-400 mb-2">async function <span className="text-yellow-200">masterCS</span>() {`{`}</div>
                        <div className="pl-4 mb-2">const course = <span className="text-purple-400">await</span> Subject.<span className="text-yellow-200">start</span>();</div>
                        <div className="pl-4 mb-2"><span className="text-purple-400">while</span> (course.hasChapters) {`{`}</div>
                        <div className="pl-8 mb-2">course.<span className="text-yellow-200">learn</span>();</div>
                        <div className="pl-8 mb-2">course.<span className="text-yellow-200">practice</span>();</div>
                        <div className="pl-4 mb-2">{`}`}</div>
                        <div className="pl-4 text-green-400">// Returns: "Offer Accepted"</div>
                        <div>{`}`}</div>
                    </div>
                </div>
            </div>
        </section>

        {/* 2. Course Grid Section */}
        <section id="course-grid" className="mb-24 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10 border-b border-white/10 pb-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-accent" />
              All Subjects
            </h2>
            <div className="flex items-center gap-2">
                {/* Filter Tabs - UI only for now, could be active later */}
                <span className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-full text-sm font-medium cursor-pointer">All</span>
                <span className="px-4 py-2 bg-transparent text-zinc-500 hover:text-white rounded-full text-sm font-medium cursor-pointer transition-colors hidden sm:block">Core CS</span>
                <span className="px-4 py-2 bg-transparent text-zinc-500 hover:text-white rounded-full text-sm font-medium cursor-pointer transition-colors hidden sm:block">Math</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {subjects.length > 0 ? (
                subjects.map((course: any) => {
                const Icon = course.iconComponent;
                const accentColor = course.color || "#E2C6B9"; // Default to accent if no color
                
                return (
                    <Link key={course._id} href={`/courses/${course.slug}`} className="group block h-full">
                        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 h-full hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300 flex flex-col relative overflow-hidden">
                            
                            {/* Left color accent bar */}
                            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: accentColor }}></div>
                            
                            {/* Hover Glow */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ backgroundColor: accentColor }}></div>

                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 bg-[#0a0a0a] group-hover:scale-110 transition-transform duration-300">
                                        <Icon className="w-6 h-6" style={{ color: accentColor }} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white group-hover:text-white transition-colors font-display">
                                            {course.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mt-1">
                                            <span>{course.chapterCount} Ch.</span>
                                            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                                            <span>{course.noteCount} Notes</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 group-hover:border-white/30 group-hover:text-white transition-all">
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </div>
                            
                            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                                {course.description || "Explore comprehensive notes and chapters for this subject."}
                            </p>
                            
                            {/* Chapter Preview List */}
                            <div className="mt-auto bg-[#0a0a0a] border border-white/5 rounded-xl p-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 font-mono">Syllabus Preview</h4>
                                {course.previewChapters && course.previewChapters.length > 0 ? (
                                    <ul className="space-y-2">
                                        {course.previewChapters.map((chap: any, idx: number) => (
                                            <li key={chap._id} className="text-sm text-zinc-300 flex items-center gap-2">
                                                <span className="text-accent/50 text-xs">▸</span>
                                                <span className="truncate">{chap.order}. {chap.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-zinc-600 italic">No chapters added yet.</p>
                                )}
                                
                                {course.chapterCount > 3 && (
                                    <div className="mt-3 text-xs font-medium text-accent hover:underline">
                                        + {course.chapterCount - 3} more {course.chapterCount - 3 === 1 ? 'chapter' : 'chapters'} &rarr;
                                    </div>
                                )}
                            </div>

                        </div>
                    </Link>
                );
                })
            ) : (
                <div className="col-span-full py-20 text-center text-zinc-500 border border-dashed border-white/10 rounded-2xl">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No subjects found. Admins can create subjects in the Writers Hub.</p>
                </div>
            )}
          </div>
        </section>

        {/* 3. Slim PRO Banner */}
        <section className="bg-gradient-to-r from-[#1a1400] to-[#0a0a0a] border border-amber-500/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
          
          <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Lock className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                      Unlock CSwithBS <span className="text-amber-500">PRO</span>
                  </h3>
                  <p className="text-sm text-zinc-400">
                      Get unrestricted access to all premium exam solutions, advanced tutorials, and exclusive interview prep.
                  </p>
              </div>
          </div>
          
          <button className="shrink-0 px-6 py-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold rounded-xl hover:bg-amber-500/20 transition-colors">
            Upgrade to PRO
          </button>
        </section>

      </Container>
    </div>
  );
}
