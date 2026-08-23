import Link from "next/link";
import {
  ChevronRight,
  FileText,
  BookOpen,
  ChevronDown,
  Clock,
  Layers,
  GraduationCap,
  Tag,
  Lock,
} from "lucide-react";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import Chapter from "@/models/Chapter";
import Note from "@/models/Note";
import { notFound } from "next/navigation";
import { Container } from "@/app/components/ui/Container";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DataWall } from "@/app/components/DataWall";

export const revalidate = 60;
export const dynamicParams = true; // Allow new courses to be accessed dynamically

import type { Metadata } from "next";

export async function generateStaticParams() {
  await dbConnect();
  const subjects = await Subject.find({}).select("slug").lean();
  return subjects.map((subject: any) => ({
    courseSlug: subject.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug } = await params;
  await dbConnect();
  const subject = await Subject.findOne({ slug: courseSlug }).lean();

  if (!subject) {
    return {
      title: "Course Not Found",
      description: "The requested course could not be found.",
    };
  }

  const title = `${subject.name} Course | CSWITHBS`;
  const description = subject.description || `Master ${subject.name} with structured chapters and comprehensive notes.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: subject.coverImage ? [subject.coverImage] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: subject.coverImage ? [subject.coverImage] : [],
    },
  };
}

async function getCourseData(courseSlug: string) {
  await dbConnect();

  const subject = await Subject.findOne({ slug: courseSlug }).lean();
  if (!subject) return null;

  const chapters = await Chapter.find({ subject: subject._id })
    .sort({ order: 1 })
    .lean();

  const now = new Date();
  const notes = await Note.find({
    subject: subject._id,
    $or: [
      { status: "published" },
      { status: "scheduled", scheduledPublishDate: { $lte: now } },
    ],
  })
    .sort({ order: 1 })
    .lean();

  const chaptersWithNotes = chapters.map((chap) => ({
    ...chap,
    _id: chap._id.toString(),
    subject: chap.subject.toString(),
    notes: notes
      .filter((n) => n.chapter?.toString() === chap._id.toString())
      .map((n) => ({
        ...n,
        _id: n._id.toString(),
        subject: n.subject.toString(),
        chapter: n.chapter?.toString() || null,
      })),
  }));

  return JSON.parse(
    JSON.stringify({
      subject: { ...subject, _id: subject._id.toString() },
      chapters: chaptersWithNotes,
      totalNotes: notes.length,
    }),
  );
}

export default async function CourseIndexPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const courseData = await getCourseData(courseSlug);
  const session = await getServerSession(authOptions);

  if (!courseData) notFound();

  const { subject, chapters, totalNotes } = courseData;
  const accentColor = subject.color || "#E2C6B9";

  // First note for "Start Learning" button
  const firstNote = chapters.find((c: any) => c.notes?.length > 0)?.notes?.[0];

  // Determine if this course is restricted for the current user
  const user = session?.user as any;
  const hasCompleteProfile = user?.university && user?.semester && user?.year;
  let isRestricted = false;

  if (!user || user.isCourseRestricted) {
    isRestricted = true;
  } else if (!hasCompleteProfile) {
    const roles = user.roles || [];
    const isPrivileged = roles.some((r: string) => 
      ["ADMIN", "SUPER_ADMIN", "WRITER", "admin", "super_admin", "writer"].includes(r)
    );
    
    if (!isPrivileged) {
      if (subject.isRestricted === true) {
        isRestricted = true;
      } else if (subject.isRestricted !== false) {
        const isAdvancedOrIntermediateTag = subject.tags?.some((tag: string) => 
          tag.toLowerCase().includes('advanced') || tag.toLowerCase().includes('intermediate')
        );
        const isAdvancedOrIntermediateLevel = subject.level && (
          subject.level.toLowerCase().includes('advanced') || 
          subject.level.toLowerCase().includes('intermediate')
        );
        if (isAdvancedOrIntermediateTag || isAdvancedOrIntermediateLevel) {
          isRestricted = true;
        }
      }
    }
  }

  return (
    <div className="py-10 md:py-14">
      <Container className="max-w-5xl mx-auto">
        {/* Subject Header Banner */}
        <div className="relative bg-[#0d0d0d] border border-white/10 rounded-3xl overflow-hidden mb-14 shadow-2xl shadow-black/50">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/90 to-transparent z-10" />
          {subject.coverImage && (
            <img
              src={subject.coverImage}
              alt={subject.name}
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
          )}
          
          <div className="relative z-20 p-8 md:p-12 lg:p-16 flex flex-col gap-6 justify-between items-start">
            <div className="max-w-3xl w-full">
              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 leading-tight tracking-tighter mb-4 font-display">
                {subject.name}
              </h1>
              
              {/* Description */}
              <p className="text-zinc-400 leading-relaxed mb-8 text-base md:text-lg max-w-2xl font-medium">
                {subject.description ||
                  `Explore ${chapters.length} chapters and ${totalNotes} notes in this comprehensive course.`}
              </p>

              {/* Bottom Meta: Stats, Level, Tags */}
              <div className="flex flex-wrap items-center gap-3 mb-10">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-lg text-xs font-mono">
                  <Layers className="w-3.5 h-3.5 text-accent" />
                  <span className="text-white font-bold">{chapters.length}</span>
                  <span className="text-zinc-500">Chapters</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-lg text-xs font-mono">
                  <FileText className="w-3.5 h-3.5 text-accent" />
                  <span className="text-white font-bold">{totalNotes}</span>
                  <span className="text-zinc-500">Notes</span>
                </div>
                
                {subject.level && subject.level !== "All Levels" && (
                  <span
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold border uppercase tracking-widest"
                    style={{
                      backgroundColor: `${accentColor}12`,
                      borderColor: `${accentColor}25`,
                      color: accentColor,
                    }}
                  >
                    {subject.level}
                  </span>
                )}
                
                {subject.alignments?.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white/[0.03] text-zinc-300 border border-white/10 uppercase tracking-widest flex items-center gap-1.5"
                  >
                    <Tag className="w-3 h-3 text-zinc-500" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              {firstNote && (
                <Link
                  href={isRestricted ? "#curriculum-data-wall" : `/courses/${courseSlug}/${firstNote.slug}`}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-black text-sm transition-all hover:opacity-90 active:scale-95 hover:gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                  style={{ backgroundColor: accentColor }}
                >
                  Start Learning
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>

          {/* ── Chapter Accordion ─────────────────────────────────── */}
          <div id="curriculum-data-wall" className="scroll-mt-24">
            <DataWall article={subject} session={session}>
              <div>
              <div className="flex items-baseline gap-4 mb-8">
              <h2 className="text-2xl font-black text-white font-display">
                Curriculum
              </h2>
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-xs font-mono text-zinc-600">
                {chapters.length} chapters
              </span>
            </div>

            {chapters.length > 0 ? (
              <div className="space-y-4">
                {chapters.map((chapter: any, idx: number) => {
                  const isLockedTeaser = !session && idx >= 2;
                  
                  return (
                    <details
                      key={chapter._id}
                      className={`group border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden transition-all ${
                        isLockedTeaser ? "opacity-40 grayscale pointer-events-none select-none blur-[1px]" : "open:border-white/20"
                      }`}
                      open={idx === 0}
                    >
                    {/* Chapter summary (toggle) */}
                    <summary className="flex items-center justify-between px-6 py-5 cursor-pointer select-none list-none">
                      <div className="flex items-center gap-4">
                        {/* Chapter number */}
                        <div
                          className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-sm font-black border"
                          style={{
                            backgroundColor: `${accentColor}10`,
                            borderColor: `${accentColor}20`,
                            color: accentColor,
                          }}
                        >
                          {chapter.order}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white font-display">
                            {chapter.name}
                          </h3>
                          {chapter.description && (
                            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                              {chapter.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-zinc-600">
                          <FileText className="w-3.5 h-3.5" />
                          {chapter.notes?.length || 0} notes
                        </span>
                        <ChevronDown className="w-4 h-4 text-zinc-500 transition-transform duration-200 group-open:rotate-180" />
                      </div>
                    </summary>

                    {/* Notes inside chapter */}
                    <div className="px-6 pb-6 border-t border-white/5">
                      {chapter.notes && chapter.notes.length > 0 ? (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {chapter.notes.map((note: any) => (
                            <Link
                              key={note._id}
                              href={`/courses/${courseSlug}/${note.slug}`}
                              className="group/note flex items-start gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/15 transition-all"
                            >
                              <div
                                className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border mt-0.5 transition-transform group-hover/note:scale-110"
                                style={{
                                  backgroundColor: `${accentColor}10`,
                                  borderColor: `${accentColor}20`,
                                }}
                              >
                                <FileText
                                  className="w-4 h-4"
                                  style={{ color: accentColor }}
                                />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-white group-hover/note:text-accent transition-colors leading-tight mb-1">
                                  {note.order ? `${note.order}. ` : ""}
                                  {note.title}
                                </h4>
                                {note.excerpt && (
                                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                                    {note.excerpt}
                                  </p>
                                )}
                                {note.readTime && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-700">
                                      <Clock className="w-3 h-3" />
                                      {note.readTime}
                                    </div>
                                    {!session && !note.isFreePreview && (
                                      <Lock className="w-3 h-3 text-zinc-600" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-zinc-600 italic mt-4 text-center py-6 border border-dashed border-white/5 rounded-xl">
                          No notes added to this chapter yet.
                        </p>
                      )}
                    </div>
                  </details>
                );
                })}
              </div>
            ) : (
              <div className="py-24 text-center border border-dashed border-white/10 rounded-2xl flex flex-col items-center gap-4">
                <BookOpen className="w-12 h-12 text-zinc-700" />
                <p className="text-zinc-500 text-sm">
                  This course is currently empty. Chapters will appear here
                  soon.
                </p>
              </div>
            )}
          </div>
        </DataWall>
        </div>
      </Container>
    </div>
  );
}
