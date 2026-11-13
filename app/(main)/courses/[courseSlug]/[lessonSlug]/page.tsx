import type { Metadata } from "next";
import Link from "next/link";
import { NOTE_PROSE_STYLES } from "@/app/components/notes/noteStyles";
import { NoteContent } from "@/app/components/notes/NoteContent";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Bookmark,
  Clock,
  Eye,
  Tag,
  CheckCircle2,
  BookOpen,
  Download,
  ExternalLink,
  Lock,
  FileText,
} from "lucide-react";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import Chapter from "@/models/Chapter";
import Note from "@/models/Note";
import { notFound } from "next/navigation";
import { Container } from "@/app/components/ui/Container";
import { LessonActions } from "./LessonActions";
import { NoteTracker } from "../../components/NoteTracker";
import User from "@/models/User";
import { AuthWallOverlay } from "@/app/components/ui/AuthWallOverlay";
import { DataWall } from "@/app/components/DataWall";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  
  await dbConnect();
  const subject = await Subject.findOne({ slug: courseSlug }).lean();
  if (!subject) return { title: "Lesson Not Found" };

  const currentNote = await Note.findOne({
    subject: subject._id,
    slug: lessonSlug,
  }).lean();

  if (!currentNote) return { title: "Lesson Not Found" };

  const title = `${currentNote.title} | ${subject.name} | CSWITHBS`;
  const description = currentNote.excerpt || `Study ${currentNote.title} in the ${subject.name} course on CSWITHBS.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

async function getNoteData(subjectSlug: string, noteSlug: string) {
  await dbConnect();

  const subject = await Subject.findOne({ slug: subjectSlug }).lean();
  if (!subject) return null;

  const currentNote = await Note.findOne({
    subject: subject._id,
    slug: noteSlug,
  })
    .populate("chapter")
    .lean();

  if (!currentNote) return null;

  // Fetch all published notes sorted by chapter order then note order
  const allNotes = await Note.find({
    subject: subject._id,
    $or: [
      { status: "published" },
      { status: "scheduled", scheduledPublishDate: { $lte: new Date() } },
    ],
  })
    .populate("chapter")
    .lean();

  allNotes.sort((a: any, b: any) => {
    const chA = a.chapter?.order ?? 9999;
    const chB = b.chapter?.order ?? 9999;
    if (chA !== chB) return chA - chB;
    return (a.order ?? 9999) - (b.order ?? 9999);
  });

  const currentIndex = allNotes.findIndex(
    (n: any) => n._id.toString() === (currentNote as any)._id.toString()
  );

  return JSON.parse(
    JSON.stringify({
      subject,
      currentNote,
      prevNote: currentIndex > 0 ? allNotes[currentIndex - 1] : null,
      nextNote: currentIndex < allNotes.length - 1 ? allNotes[currentIndex + 1] : null,
      totalNotes: allNotes.length,
      currentIndex,
    })
  );
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, lessonSlug } = await params;
  const data = await getNoteData(courseSlug, lessonSlug);
  const session = await getServerSession(authOptions);

  if (!data) notFound();

  const { subject, currentNote, prevNote, nextNote, totalNotes, currentIndex } = data;
  const accentColor = subject.color || "#E2C6B9";

  // Inherit parent course's strictness so DataWall can block direct-link bypasses
  if (subject) {
    if (!currentNote.level && subject.level) {
      currentNote.level = subject.level;
    }
    if (subject.isRestricted === true) {
      currentNote.isRestricted = true;
    }
  }

  let initialBookmarked = false;
  let isRestrictedForUser = false;
  
  if (!session?.user) {
    if (subject?.status === "draft") {
      notFound();
    }
    isRestrictedForUser = true;
  } else {
    const user = session.user as any;
    const hasCompleteProfile = user.university && user.semester && user.year && user.degree;
    const roles = user.roles || [];
    const isPrivileged = roles.some((r: string) => 
      ["ADMIN", "SUPER_ADMIN", "WRITER", "admin", "super_admin", "writer"].includes(r)
    );

    if (subject?.status === "draft" && !isPrivileged) {
      notFound();
    }

    if (user.isCourseRestricted) {
      isRestrictedForUser = true;
    } else if (!hasCompleteProfile && !isPrivileged) {
      const isAdvanced = currentNote.tags?.some((tag: string) => 
        tag.toLowerCase().includes('advanced') || tag.toLowerCase().includes('intermediate')
      ) || (currentNote.level && (
        currentNote.level.toLowerCase().includes('advanced') || 
        currentNote.level.toLowerCase().includes('intermediate')
      )) || currentNote.isRestricted === true;

      if (isAdvanced) {
        isRestrictedForUser = true;
      }
    }
  }

  if (session?.user) {
    const userId = (session.user as any).id;
    const user = await User.findById(userId).select('bookmarkedNotes').lean();
    if (user?.bookmarkedNotes?.some((id: any) => id.toString() === currentNote._id.toString())) {
      initialBookmarked = true;
    }
  }

  return (
    <div className="min-h-screen pt-4 pb-32 md:pt-6 md:pb-48">
      <Container className="max-w-4xl mx-auto">
        <NoteTracker noteId={currentNote._id} isRestricted={isRestrictedForUser} />

        {/* ── Top bar: actions only ───────────────────── */}
        <div className="flex flex-wrap items-center justify-end gap-4 mb-6 pb-4 border-b border-white/10">
          <LessonActions noteId={currentNote._id} initialBookmarked={initialBookmarked} />
        </div>

        {/* ── Metadata bar ─────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Chapter badge */}
          {currentNote.chapter && (
            <span
              className="px-3 py-1 rounded-full text-xs font-bold border"
              style={{
                backgroundColor: `${accentColor}12`,
                borderColor: `${accentColor}25`,
                color: accentColor,
              }}
            >
              {currentNote.chapter.name}
            </span>
          )}
          {/* Last Updated */}
          <span className="flex items-center gap-1.5 text-xs font-mono text-zinc-600">
            <Clock className="w-3.5 h-3.5" />
            Last Updated: {new Date(currentNote.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
          {/* Tags */}
          {currentNote.tags && currentNote.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {currentNote.tags.slice(0, 4).map((tag: string, i: number) => (
                <span
                  key={i}
                  className="flex items-center gap-1 px-2.5 py-0.5 bg-white/5 border border-white/10 text-zinc-400 text-xs rounded-full"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white leading-[1.15] md:leading-tight font-display tracking-wide mb-10">
          {currentNote.title}
        </h1>

        {/* ── Note image (if available) ─────────────────────────── */}
        {currentNote.image && (
          <div className="w-full rounded-2xl overflow-hidden border border-white/10 mb-10">
            <img
              src={currentNote.image}
              alt={currentNote.title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* ── Main Content ─────────────────────────────────────── */}
        {!currentNote.isFreePreview && !session ? (
          <div className="relative">
            <div className="max-h-[300px] overflow-hidden relative">
              <NoteContent
                content="" // Don't pass full HTML to avoid unclosed tags
                contentJson={
                  currentNote.contentJson?.content
                    ? {
                        ...currentNote.contentJson,
                        content: currentNote.contentJson.content.slice(0, 3), // First 3 blocks
                      }
                    : { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: currentNote.excerpt || "Unlock the full lesson to read more." }] }] }
                }
                showHeadingAnchors={false}
                pageTitle={currentNote.title}
              />
              <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </div>
            <div className="-mt-16 relative z-10">
              <AuthWallOverlay 
                title="Unlock Full Lesson"
                message="Join CSWITHBS for free to unlock this full lesson, track your progress, and access premium resources."
              />
            </div>
          </div>
        ) : (
          <DataWall article={currentNote} session={session}>
            <NoteContent
              content={currentNote.content || ""}
              contentJson={currentNote.contentJson}
              showHeadingAnchors={false}
              pageTitle={currentNote.title}
            />
          </DataWall>
        )}

        {/* ── Attached Study Materials (PDF & Downloads) ─────────────── */}
        {currentNote.resources && currentNote.resources.length > 0 && (
          <div className="mt-14 mb-4 p-6 md:p-8 rounded-2xl bg-zinc-950/80 border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Subtle ambient accent glow */}
            <div 
              className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-20"
              style={{ backgroundColor: accentColor }}
            />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: `${accentColor}15`,
                    borderColor: `${accentColor}30`,
                    color: accentColor,
                  }}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Study Materials & Downloads
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-semibold border border-white/10">
                      {currentNote.resources.length} {currentNote.resources.length === 1 ? "file" : "files"}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Download lesson notes, questions & answers, and revision guides for this topic
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-3">
              {currentNote.resources.map((res: any, idx: number) => {
                const isLocked = res.isPremium && !session;

                return (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition-all group"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate flex items-center gap-2">
                          {res.title}
                          {res.isPremium && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30 uppercase font-bold tracking-wider">
                              Premium
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono mt-0.5">
                          <span className="text-red-400/90 font-bold uppercase">{res.type || "PDF"}</span>
                          <span>•</span>
                          <span>Offline Revision Document</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                      {isLocked ? (
                        <Link
                          href="/login"
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 flex items-center gap-1.5 transition-all"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Login to Download
                        </Link>
                      ) : (
                        <>
                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-all"
                            title="Preview in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Preview</span>
                          </a>
                          <a
                            href={res.url}
                            download={res.title || "Study-Material"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-accent hover:bg-accent/90 shadow-md shadow-accent/10 flex items-center gap-1.5 transition-all"
                            title="Direct Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Bottom section ────────────────────────────────────── */}
        <div className="mt-20 pt-12 border-t border-white/10">



          {/* Prev / Next navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prevNote ? (
              <Link
                href={`/courses/${courseSlug}/${prevNote.slug}`}
                className="flex flex-col gap-1.5 p-5 border border-white/10 rounded-2xl hover:bg-white/[0.03] hover:border-white/20 transition-all group text-left"
              >
                <span className="flex items-center gap-1.5 text-xs text-zinc-600 font-medium uppercase tracking-wider group-hover:text-zinc-400 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </span>
                <span className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                  {prevNote.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextNote ? (
              <Link
                href={`/courses/${courseSlug}/${nextNote.slug}`}
                className="flex flex-col gap-1.5 p-5 border border-white/10 rounded-2xl hover:bg-white/[0.03] hover:border-white/20 transition-all group text-right"
              >
                <span className="flex items-center justify-end gap-1.5 text-xs text-zinc-600 font-medium uppercase tracking-wider group-hover:text-zinc-400 transition-colors">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </span>
                <span className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                  {nextNote.title}
                </span>
              </Link>
            ) : (
              <div className="flex flex-col gap-1.5 p-5 border border-white/5 rounded-2xl text-right opacity-50">
                <span className="flex items-center justify-end gap-1.5 text-xs text-zinc-600 font-medium uppercase tracking-wider">
                  You&apos;re done!
                  <BookOpen className="w-4 h-4" />
                </span>
                <span className="text-sm text-zinc-600">End of course</span>
              </div>
            )}
          </div>

        </div>
      </Container>
    </div>
  );
}
