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
} from "lucide-react";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import Chapter from "@/models/Chapter";
import Note from "@/models/Note";
import { notFound } from "next/navigation";
import { Container } from "@/app/components/ui/Container";
import { LessonActions } from "./LessonActions";
import { NoteTracker } from "../../components/NoteTracker";
import { AuthWallOverlay } from "@/app/components/ui/AuthWallOverlay";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const revalidate = 60;

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

  return (
    <div className="min-h-screen pt-4 pb-32 md:pt-6 md:pb-48">
      <Container className="max-w-4xl mx-auto">
        <NoteTracker noteId={currentNote._id} />

        {/* ── Top bar: actions only ───────────────────── */}
        <div className="flex flex-wrap items-center justify-end gap-4 mb-6 pb-4 border-b border-white/10">
          <LessonActions />
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
          <NoteContent
            content={currentNote.content || ""}
            contentJson={currentNote.contentJson}
            showHeadingAnchors={false}
            pageTitle={currentNote.title}
          />
        )}

        {/* ── Bottom section ────────────────────────────────────── */}
        <div className="mt-32 pt-12 border-t border-white/10">

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
