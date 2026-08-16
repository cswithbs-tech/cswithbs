import { FilteredCoursesGrid } from "../FilteredCoursesGrid";
import { Container } from "@/app/components/ui/Container";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import Chapter from "@/models/Chapter";
import Note from "@/models/Note";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const revalidate = 60;

async function getAllSubjects() {
  await dbConnect();
  const subjects = await Subject.find().sort({ name: 1 }).lean();

  const subjectsData = await Promise.all(
    subjects.map(async (subject) => {
      const chaptersCount = await Chapter.countDocuments({ subject: subject._id });
      const notesCount = await Note.countDocuments({ subject: subject._id });

      return {
        ...subject,
        _id: subject._id.toString(),
        chapterCount: chaptersCount,
        noteCount: notesCount,
      };
    })
  );

  return JSON.parse(JSON.stringify(subjectsData));
}

export default async function AllCoursesPage() {
  const subjects = await getAllSubjects();

  return (
    <div className="min-h-screen bg-[#0d0d0d] pt-32 pb-24">
      {/* ── Ambient background orbs ─────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#E2C6B9]/5 rounded-full blur-[120px]" />
      </div>

      <Container className="max-w-7xl mx-auto">
        <div className="mb-10">
           <Link href="/courses" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm mb-6 font-medium">
             <ChevronLeft className="w-4 h-4" />
             Back to Overview
           </Link>
           <h1 className="text-4xl md:text-5xl font-black text-white font-display mb-4">
             All Courses
           </h1>
           <p className="text-zinc-400 text-lg">
             Explore our complete library of computer science subjects. Use the filters to find what you need.
           </p>
        </div>

        <FilteredCoursesGrid courses={subjects} />
      </Container>
    </div>
  );
}
