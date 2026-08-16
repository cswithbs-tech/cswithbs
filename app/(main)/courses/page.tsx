import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Code,
  FileText,
  Sparkles,
  GraduationCap,
  Users,
  ChevronRight,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";
import Chapter from "@/models/Chapter";
import Note from "@/models/Note";
import Subscriber from "@/models/Subscriber";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Container } from "@/app/components/ui/Container";
import { CarouselClient } from "./CarouselClient";
import { FilteredCoursesGrid } from "./FilteredCoursesGrid";
import { NewsletterForm } from "@/app/components/NewsletterForm";
import { ProBanner } from "./ProBanner";

export const revalidate = 60;

async function getCoursesPageData() {
  await dbConnect();

  const subjects = await Subject.find().sort({ name: 1 }).lean();

  let totalChapters = 0;
  let totalNotes = 0;

  const subjectsData = await Promise.all(
    subjects.map(async (subject) => {
      const chaptersCount = await Chapter.countDocuments({
        subject: subject._id,
      });
      const notesCount = await Note.countDocuments({ subject: subject._id });

      totalChapters += chaptersCount;
      totalNotes += notesCount;

      return {
        ...subject,
        _id: subject._id.toString(),
        chapterCount: chaptersCount,
        noteCount: notesCount,
      };
    }),
  );

  // Fetch 3 most recently published notes
  const now = new Date();
  const recentNotesRaw = await Note.find({
    $or: [
      { status: "published" },
      { status: "scheduled", scheduledPublishDate: { $lte: now } },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate("subject", "name slug color icon")
    .lean();

  const recentNotes = recentNotesRaw.map((note: any) => ({
    ...note,
    _id: note._id.toString(),
    subject: {
      ...note.subject,
      _id: note.subject._id.toString(),
    },
    createdAt: note.createdAt.toISOString(),
  }));

  // Session check for newsletter
  const session = await getServerSession(authOptions);
  let initialEmail = "";
  let isSubscribed = false;

  if (session?.user?.email) {
    initialEmail = session.user.email;
    const sub = await Subscriber.findOne({ email: initialEmail });
    if (sub) {
      isSubscribed = true;
    }
  }

  return {
    subjects: JSON.parse(JSON.stringify(subjectsData)),
    stats: {
      subjects: subjects.length,
      chapters: totalChapters,
      notes: totalNotes,
    },
    recentNotes,
    newsletter: {
      initialEmail,
      isSubscribed,
    },
  };
}

const PLATFORM_FEATURES = [
  {
    icon: GraduationCap,
    title: "Structured Curriculum",
    desc: "Every subject is broken into ordered chapters and notes — no jumping around.",
  },
  {
    icon: Users,
    title: "Professor-Curated",
    desc: "Written and organized by Buddhadev Sasmal, Assistant Professor at Midnapore City College.",
  },
  {
    icon: Sparkles,
    title: "Research-Backed",
    desc: "Notes on AI, ML, and optimization are backed by real peer-reviewed research.",
  },
];

const FAQS = [
  {
    q: "Are these notes suitable for university exams?",
    a: "Absolutely. The curriculum is designed keeping standard university syllabi in mind (including B.Tech, BCA, MCA, and M.Sc). They cover fundamental concepts required for academic excellence.",
  },
  {
    q: "Can I access courses without signing in?",
    a: "Guest users have limited access. To access the full courses and track your learning progress, you must create a free account and sign in.",
  },
  {
    q: "Do I need prior programming experience?",
    a: "It depends on the course. We have 'Beginner' level courses that start from scratch, as well as 'Advanced' tracks that assume foundational knowledge. Check the level badge on each course card.",
  },
  {
    q: "What do I get with premium features?",
    a: "All study notes and core course materials are completely free. However, premium features like comprehensive Q&A sets, quizzes, and exclusive exam prep materials require a paid subscription.",
  },
  {
    q: "How often is new material added?",
    a: "New chapters and notes are added regularly. As a working Assistant Professor, I continuously update the material based on the latest academic standards and research findings.",
  },
];

export default async function CoursesLandingPage() {
  const { subjects, stats, recentNotes, newsletter } =
    await getCoursesPageData();

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* ── SECTION 1: Immersive Hero Carousel ──────────────────────────── */}
      <section className="relative w-full pt-32 md:pt-35">
        <Container className="max-w-7xl mx-auto">
          <CarouselClient />
        </Container>
      </section>

      {/* ── Ambient background orbs ─────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#E2C6B9]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px]" />
      </div>

      <Container className="max-w-7xl mx-auto pt-28 pb-24">
        {/* ── SECTION 2: Hero Text ─────────────────────────────── */}
        <section className="mb-24 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white leading-[1.2] tracking-tight mb-4">
            Start Your Learning Journey
          </h1>

          <p className="text-sm md:text-base text-zinc-400 font-light leading-relaxed mb-6">
            Dive into a meticulously curated library of computer science notes.
            From foundational Data Structures to advanced Machine Learning,
            master complex concepts with absolute clarity.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <span className="px-3 py-1 bg-white/[0.03] border border-white/10 rounded-md text-xs text-zinc-400 font-medium">
              Data Structures
            </span>
            <span className="px-3 py-1 bg-white/[0.03] border border-white/10 rounded-md text-xs text-zinc-400 font-medium">
              System Design
            </span>
            <span className="px-3 py-1 bg-white/[0.03] border border-white/10 rounded-md text-xs text-zinc-400 font-medium">
              Algorithms
            </span>
            <span className="px-3 py-1 bg-white/[0.03] border border-white/10 rounded-md text-xs text-zinc-400 font-medium">
              Machine Learning
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#subjects"
              className="px-6 py-2.5 bg-accent text-black text-sm font-medium rounded-full hover:bg-accent-hover transition-colors shadow-[0_0_20px_rgba(226,198,185,0.15)]"
            >
              Explore Subjects
            </a>
            <Link
              href="/blog"
              className="px-6 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-medium rounded-full hover:bg-white/10 transition-colors"
            >
              Read Articles
            </Link>
          </div>
        </section>

        {/* ── SECTION 3: Platform Features ─────────────────────────────── */}
        <section className="mb-28">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLATFORM_FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-4 p-6 bg-white/[0.02] border border-white/10 rounded-3xl"
              >
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 4: Subjects Grid (with filter) ───────────────────── */}
        <section id="subjects" className="mb-28 scroll-mt-28">
          <div className="flex items-baseline justify-between gap-4 mb-10">
            <div className="flex items-baseline gap-4">
              <h2 className="text-3xl md:text-4xl font-black text-white font-display">
                Courses
              </h2>
            </div>
            <div className="flex-1 h-px bg-white/5 mx-4 hidden md:block" />
            <Link
              href="/courses/all"
              className="group flex items-center gap-2 text-sm font-bold text-accent hover:text-white transition-colors"
            >
              View All
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {subjects.length > 0 ? (
            <FilteredCoursesGrid courses={subjects} hideFilters={true} limit={6} />
          ) : (
            <div className="py-24 text-center border border-dashed border-white/10 rounded-2xl flex flex-col items-center gap-4">
              <BookOpen className="w-12 h-12 text-zinc-700" />
              <p className="text-zinc-500">
                No subjects yet. Admins can create subjects in the Writers Hub.
              </p>
            </div>
          )}
        </section>

        {/* ── SECTION 5: Recently Added Notes ──────────────────────────── */}
        {recentNotes.length > 0 && (
          <section className="mb-28 border-t border-white/5 pt-16">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
              <div>
                <h2 className="text-sm font-mono text-accent uppercase tracking-widest mb-2">
                  // Platform Activity
                </h2>
                <h3 className="text-3xl font-black text-white font-display">
                  Recently Added Notes
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentNotes.map((note: any) => (
                <Link
                  key={note._id}
                  href={`/courses/${note.subject.slug}/${note.slug}`}
                  className="group flex flex-col p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all hover:-translate-y-1 hover:border-white/20"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider"
                      style={{
                        backgroundColor: `${note.subject.color || "#E2C6B9"}15`,
                        borderColor: `${note.subject.color || "#E2C6B9"}30`,
                        color: note.subject.color || "#E2C6B9",
                      }}
                    >
                      {note.subject.name}
                    </div>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-accent transition-colors">
                    {note.title}
                  </h4>
                  <p className="text-sm text-zinc-500 line-clamp-2 mb-4 flex-1">
                    {note.excerpt}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <span className="text-xs text-zinc-600 font-mono">
                      {new Date(note.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <ProBanner />

        {/* ── SECTION 8: FAQ ───────────────────────────────────────────── */}
        <section className="mb-28 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <HelpCircle className="w-10 h-10 text-accent/50 mx-auto mb-4" />
            <h2 className="text-3xl font-black text-white font-display mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-400">
              Everything you need to know about the courses.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden open:border-white/20 transition-all"
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer select-none list-none text-white font-bold hover:bg-white/[0.02] transition-colors">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 text-zinc-500 transition-transform duration-200 group-open:rotate-180 shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-6 text-zinc-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── SECTION 9: Newsletter ────────────────────────────────────── */}
        <section className="relative overflow-hidden mb-20 max-w-4xl mx-auto bg-gradient-to-br from-[#111] to-[#050505] border border-white/10 rounded-3xl p-10 md:p-14 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px]" />
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white font-display mb-4">
              Never Miss an Update
            </h2>
            <p className="text-zinc-400 mb-8 leading-relaxed">
              Subscribe to receive notifications when new course materials,
              lecture notes, or exclusive Q&A sets are published. No spam, ever.
            </p>
            <div className="max-w-md mx-auto bg-black/40 p-2 rounded-xl border border-white/5 backdrop-blur-md">
              <NewsletterForm
                initialEmail={newsletter.initialEmail}
                isSubscribed={newsletter.isSubscribed}
              />
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
