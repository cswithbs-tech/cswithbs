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
} from "lucide-react";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import Chapter from "@/models/Chapter";
import Note from "@/models/Note";
import { notFound } from "next/navigation";
import { Container } from "@/app/components/ui/Container";

export const revalidate = 60;

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
    })
  );
}

export default async function CourseIndexPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const courseData = await getCourseData(courseSlug);

  if (!courseData) notFound();

  const { subject, chapters, totalNotes } = courseData;
  const accentColor = subject.color || "#E2C6B9";

  // First note for "Start Learning" button
  const firstNote = chapters.find((c: any) => c.notes?.length > 0)?.notes?.[0];

  return (
    <div className="py-10 md:py-14">
      <Container className="max-w-5xl mx-auto">

        {/* ── Course Header ─────────────────────────────────────── */}
        <div className="mb-14">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-600 mb-6">
            <Link href="/courses" className="hover:text-accent transition-colors">
              Courses
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-zinc-400">{subject.name}</span>
          </div>

          {/* Cover image */}
          {subject.coverImage && (
            <div className="w-full h-52 md:h-72 rounded-2xl overflow-hidden mb-8 relative border border-white/10">
              <img
                src={subject.coverImage}
                alt={subject.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />
              {/* Color accent overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{ background: `radial-gradient(ellipse at top left, ${accentColor}, transparent 60%)` }}
              />
            </div>
          )}

          {/* Title row */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight font-display tracking-tight mb-4">
                {subject.name}
              </h1>
              <p className="text-zinc-400 leading-relaxed max-w-2xl">
                {subject.description ||
                  `Explore ${chapters.length} chapters and ${totalNotes} notes in this comprehensive course.`}
              </p>
            </div>

            {firstNote && (
              <div className="shrink-0">
                <Link
                  href={`/courses/${courseSlug}/${firstNote.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-black text-sm transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: accentColor }}
                >
                  Start Learning
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Stats chips */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-sm font-mono">
              <Layers className="w-4 h-4 text-accent" />
              <span className="text-white font-bold">{chapters.length}</span>
              <span className="text-zinc-500">Chapters</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-sm font-mono">
              <FileText className="w-4 h-4 text-accent" />
              <span className="text-white font-bold">{totalNotes}</span>
              <span className="text-zinc-500">Notes</span>
            </div>
            {subject.level && subject.level !== "All Levels" && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border"
                style={{
                  backgroundColor: `${accentColor}12`,
                  borderColor: `${accentColor}25`,
                  color: accentColor,
                }}
              >
                <GraduationCap className="w-4 h-4" />
                {subject.level}
              </div>
            )}
            {subject.alignments?.map((alignment: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.03] border border-white/10 text-zinc-400 rounded-xl text-xs font-mono"
              >
                <Tag className="w-3 h-3" />
                {alignment}
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 mb-14" />

        {/* ── Chapter Accordion ─────────────────────────────────── */}
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
              {chapters.map((chapter: any, idx: number) => (
                <details
                  key={chapter._id}
                  className="group border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden open:border-white/20 transition-all"
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
                                {note.order ? `${note.order}. ` : ""}{note.title}
                              </h4>
                              {note.excerpt && (
                                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                                  {note.excerpt}
                                </p>
                              )}
                              {note.readTime && (
                                <div className="flex items-center gap-1 mt-2 text-[10px] font-mono text-zinc-700">
                                  <Clock className="w-3 h-3" />
                                  {note.readTime}
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
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border border-dashed border-white/10 rounded-2xl flex flex-col items-center gap-4">
              <BookOpen className="w-12 h-12 text-zinc-700" />
              <p className="text-zinc-500 text-sm">
                This course is currently empty. Chapters will appear here soon.
              </p>
            </div>
          )}
        </div>

      </Container>
    </div>
  );
}
