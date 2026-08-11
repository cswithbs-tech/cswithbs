import { Container } from "@/app/components/ui/Container";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import Chapter from "@/models/Chapter";
import Note from "@/models/Note";
import { notFound } from "next/navigation";

export const revalidate = 60; // Revalidate every minute

async function getCourseData(courseSlug: string) {
  await dbConnect();

  // 1. Fetch Subject
  const subject = await Subject.findOne({ slug: courseSlug }).lean();
  if (!subject) return null;

  // 2. Fetch Chapters
  const chapters = await Chapter.find({ subject: subject._id })
    .sort({ order: 1 })
    .lean();

  // 3. Fetch all Notes (published/scheduled only)
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

  // 4. Group
  const chaptersWithNotes = chapters.map(chap => {
    return {
      ...chap,
      _id: chap._id.toString(),
      subject: chap.subject.toString(),
      notes: notes
        .filter(n => n.chapter?.toString() === chap._id.toString())
        .map(n => ({
            ...n,
            _id: n._id.toString(),
            subject: n.subject.toString(),
            chapter: n.chapter?.toString() || null,
        }))
    };
  });

  return { 
      subject: { ...subject, _id: subject._id.toString() }, 
      chapters: chaptersWithNotes,
      totalNotes: notes.length
  };
}

export default async function CourseIndexPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const courseData = await getCourseData(courseSlug);

  if (!courseData) {
    notFound();
  }

  const { subject, chapters, totalNotes } = courseData;

  return (
    <div className="py-10 md:py-16 bg-black">
      <Container className="max-w-5xl mx-auto">
        {/* Course Header */}
        <div className="mb-12 border-b border-white/10 pb-10">
          <div className="flex items-center gap-3 text-sm text-zinc-500 font-medium mb-6">
            <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-accent uppercase tracking-wider">{subject.name}</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight font-display tracking-tight mb-6">
            {subject.name}
          </h1>
          <p className="text-lg text-zinc-400 max-w-3xl mb-8">
            {subject.description || `Explore ${chapters.length} chapters and ${totalNotes} notes in this comprehensive course.`}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-zinc-500">
             <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                <span className="text-white font-bold">{chapters.length}</span> Chapters
             </div>
             <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                <span className="text-white font-bold">{totalNotes}</span> Topics
             </div>
          </div>
        </div>

        {/* Chapters Grid */}
        {chapters.length > 0 ? (
            <div className="space-y-12">
            {chapters.map((chapter: any, idx: number) => (
                <div key={chapter._id} className="scroll-mt-24" id={`chapter-${chapter.order}`}>
                <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-white font-display">
                        <span className="text-zinc-600 mr-3">Chapter {chapter.order}:</span>
                        {chapter.name}
                    </h2>
                    <div className="h-[1px] flex-1 bg-white/10 hidden md:block mt-6"></div>
                </div>
                
                {chapter.description && (
                    <p className="text-zinc-400 mb-6">{chapter.description}</p>
                )}
                
                {chapter.notes && chapter.notes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {chapter.notes.map((note: any, noteIdx: number) => (
                            <Link 
                                key={note._id} 
                                href={`/courses/${courseSlug}/${note.slug}`}
                                className="group flex items-start gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/20 transition-all"
                            >
                                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 text-accent group-hover:scale-110 transition-transform">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-accent transition-colors">
                                        {note.order}. {note.title}
                                    </h3>
                                    {note.excerpt && (
                                        <p className="text-sm text-zinc-500 line-clamp-2">{note.excerpt}</p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-zinc-600 border border-dashed border-white/10 rounded-2xl">
                        No notes added to this chapter yet.
                    </div>
                )}
                </div>
            ))}
            </div>
        ) : (
            <div className="py-20 text-center text-zinc-500 border border-dashed border-white/10 rounded-2xl">
                <p>This course is currently empty. Chapters will appear here soon.</p>
            </div>
        )}

      </Container>
    </div>
  );
}
