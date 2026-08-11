import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import Chapter from "@/models/Chapter";
import Note from "@/models/Note";
import { SidebarClient } from "./SidebarClient";
import { notFound } from "next/navigation";

export const revalidate = 60; // Revalidate every minute

async function getCourseData(courseSlug: string) {
  await dbConnect();

  // 1. Fetch Subject
  const subject = await Subject.findOne({ slug: courseSlug }).lean();
  if (!subject) return null;

  // 2. Fetch Chapters for this subject
  const chapters = await Chapter.find({ subject: subject._id })
    .sort({ order: 1 })
    .lean();

  // 3. Fetch all Notes for this subject (only published/scheduled)
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

  // 4. Attach notes to their respective chapters
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

  return JSON.parse(JSON.stringify({ 
      subject: { ...subject, _id: subject._id.toString() }, 
      chapters: chaptersWithNotes 
  }));
}

export default async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const courseData = await getCourseData(courseSlug);

  if (!courseData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black pt-20 flex flex-col md:flex-row">
      <SidebarClient 
        courseSlug={courseSlug} 
        subject={courseData.subject} 
        chapters={courseData.chapters} 
      />

      {/* Main Content Area */}
      <main className="flex-1 bg-black overflow-x-hidden min-h-screen">
        {children}
      </main>
    </div>
  );
}
