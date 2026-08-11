import { Container } from "@/app/components/ui/Container";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Share2, Bookmark, CheckCircle2 } from "lucide-react";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import Chapter from "@/models/Chapter";
import Note from "@/models/Note";
import { notFound } from "next/navigation";

export const revalidate = 60;

async function getNoteData(subjectSlug: string, noteSlug: string) {
  await dbConnect();

  const subject = await Subject.findOne({ slug: subjectSlug }).lean();
  if (!subject) return null;

  const currentNote = await Note.findOne({ 
      subject: subject._id, 
      slug: noteSlug 
  }).populate("chapter").lean();

  if (!currentNote) return null;

  // Find previous and next notes based on order
  // This logic is simplified: it looks for notes in the same subject, ordered by chapter order then note order.
  // A robust implementation would require a complex aggregation, but we'll fetch all notes and find neighbors.
  const allNotes = await Note.find({ subject: subject._id })
    .populate("chapter")
    .lean();

  // Sort notes: First by Chapter order (if exists), then by Note order
  allNotes.sort((a: any, b: any) => {
      const chapterOrderA = a.chapter?.order ?? 9999;
      const chapterOrderB = b.chapter?.order ?? 9999;
      if (chapterOrderA !== chapterOrderB) return chapterOrderA - chapterOrderB;
      return (a.order ?? 9999) - (b.order ?? 9999);
  });

  const currentIndex = allNotes.findIndex((n: any) => n._id.toString() === currentNote._id.toString());
  
  const prevNote = currentIndex > 0 ? allNotes[currentIndex - 1] : null;
  const nextNote = currentIndex < allNotes.length - 1 ? allNotes[currentIndex + 1] : null;

  return {
      subject,
      currentNote,
      prevNote,
      nextNote
  };
}

export default async function LessonPage({ params }: { params: Promise<{ courseSlug: string, lessonSlug: string }> }) {
  const { courseSlug, lessonSlug } = await params;
  
  const data = await getNoteData(courseSlug, lessonSlug);
  
  if (!data) {
      notFound();
  }

  const { subject, currentNote, prevNote, nextNote } = data;

  return (
    <div className="py-10 md:py-16">
      <Container className="max-w-4xl mx-auto">
        {/* Top Breadcrumbs & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
            <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/courses/${courseSlug}`} className="hover:text-white transition-colors">{subject.name}</Link>
            {currentNote.chapter && (
                <>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-zinc-400">Chapter {currentNote.chapter.order}</span>
                </>
            )}
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
               <Bookmark className="w-4 h-4" /> Save
             </button>
             <button className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
               <Share2 className="w-4 h-4" /> Share
             </button>
          </div>
        </div>

        {/* Lesson Title */}
        <h1 className="text-4xl md:text-5xl font-black text-white leading-tight font-display tracking-tight mb-10">
          {currentNote.title}
        </h1>

        {/* Lesson Content Rendered from HTML */}
        <div 
          className="prose prose-invert prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-accent hover:prose-a:text-accent/80 prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: currentNote.content || "" }}
        />

        {/* Completion & Navigation */}
        <div className="mt-20 pt-10 border-t border-white/10">
          
          <div className="flex items-center justify-center mb-12">
            <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-white font-medium hover:bg-white/10 hover:border-accent/50 hover:text-accent transition-all group">
              <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Mark as Completed
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {prevNote ? (
                <Link href={`/courses/${courseSlug}/${prevNote.slug}`} className="flex flex-col gap-1 p-4 md:p-6 border border-white/10 rounded-2xl hover:bg-white/5 transition-colors group text-left">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider flex items-center gap-1 group-hover:text-white transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Previous Lesson
                </span>
                <span className="text-sm md:text-lg font-bold text-white truncate">{prevNote.title}</span>
                </Link>
            ) : (
                <div></div>
            )}
            
            {nextNote ? (
                <Link href={`/courses/${courseSlug}/${nextNote.slug}`} className="flex flex-col gap-1 p-4 md:p-6 border border-white/10 rounded-2xl hover:bg-white/5 transition-colors group text-right">
                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider flex items-center justify-end gap-1 group-hover:text-white transition-colors">
                    Next Lesson <ChevronRight className="w-4 h-4" />
                </span>
                <span className="text-sm md:text-lg font-bold text-white truncate">{nextNote.title}</span>
                </Link>
            ) : (
                <div></div>
            )}
          </div>

        </div>
      </Container>
    </div>
  );
}
