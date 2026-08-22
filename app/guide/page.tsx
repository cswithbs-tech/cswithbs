"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BookOpen, Bell, Bookmark, Zap, MessageSquare, Target, User,
  CheckCircle, XCircle, AlertTriangle, ChevronRight, Mail,
  ArrowRight, Sparkles, Shield, Clock, Star, Layers, GraduationCap,
  LifeBuoy, Info
} from "lucide-react";

const sections = [
  { id: "welcome", label: "Welcome" },
  { id: "getting-started", label: "Getting Started" },
  { id: "dos-donts", label: "Do's & Don'ts" },
  { id: "features", label: "Current Features" },
  { id: "profile", label: "Complete Your Profile" },
  { id: "coming-soon", label: "Coming Soon" },
  { id: "contact", label: "Contact & Support" },
];

function SectionAnchor({ id }: { id: string }) {
  return <div id={id} className="scroll-mt-28" />;
}

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState("welcome");

  return (
    <div className="min-h-screen bg-[#090909] text-zinc-300 antialiased">

      {/* Hero Header */}
      <div className="relative border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-purple-900/10 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Info className="w-3 h-3" />
            Platform Guide & Documentation
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight max-w-3xl">
            Everything you need to know about{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent/80 to-purple-400">
              CSWITHBS
            </span>
          </h1>
          <p className="mt-5 text-lg text-zinc-400 max-w-2xl">
            A personal academic platform built to help you master Computer Science — structured, clear, and always growing.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="#getting-started"
              className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-6 py-3 rounded-xl hover:bg-accent/90 transition-all shadow-[0_0_25px_rgba(var(--color-accent-rgb,99,102,241),0.3)]"
            >
              Start Here <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-all"
            >
              Get Help <LifeBuoy className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Layout: Sidebar + Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex gap-12 items-start">

        {/* Sticky Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0 sticky top-28">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-4 px-3">
            On this page
          </p>
          <nav className="space-y-0.5">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  activeSection === s.id
                    ? "bg-accent/10 text-accent font-medium border-l-2 border-accent"
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                }`}
              >
                <ChevronRight className="w-3 h-3 shrink-0" />
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 space-y-20 pb-24">

          {/* ── WELCOME ── */}
          <section>
            <SectionAnchor id="welcome" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Star className="w-4 h-4 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-white">Welcome</h2>
            </div>
            <div className="prose-custom bg-[#111]/80 border border-white/5 rounded-2xl p-6 md:p-8 space-y-4">
              <p className="text-zinc-300 leading-relaxed text-[15px]">
                Welcome to <strong className="text-white">CSWITHBS</strong>! I am genuinely glad you are here.
                This is my personal academic platform — a space I built from the ground up to give my students a clean, distraction-free place to learn, reference course material, and stay updated on everything happening in the world of Computer Science.
              </p>
              <p className="text-zinc-400 leading-relaxed text-[15px]">
                Whether you are accessing lecture notes, reading through my blog posts, or setting up your profile, this guide will walk you through everything. Read it once and you will know this platform inside out.
              </p>
              <div className="mt-4 bg-accent/5 border border-accent/20 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <p className="text-sm text-zinc-300">
                  This guide will be updated as the platform grows. Bookmark it and revisit anytime you need a reference!
                </p>
              </div>
            </div>
          </section>

          {/* ── GETTING STARTED ── */}
          <section>
            <SectionAnchor id="getting-started" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Getting Started</h2>
            </div>
            <div className="space-y-4">
              {[
                {
                  step: "1",
                  title: "Create Your Account",
                  desc: "Sign up using your Google account or your registered email. It takes under 30 seconds.",
                },
                {
                  step: "2",
                  title: "Complete Your Profile",
                  desc: "Add your name, a profile photo, and your batch/year. This helps personalize your experience and lets me identify you easily.",
                },
                {
                  step: "3",
                  title: "Explore the Curriculum",
                  desc: "Head to the Notes section, pick your subject, and start reading through the structured chapters and notes.",
                },
                {
                  step: "4",
                  title: "Turn On Notifications",
                  desc: "Allow the notification bell to keep you updated whenever new notes, blog posts, or announcements are published.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-5 bg-[#111]/80 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── DO'S & DON'TS ── */}
          <section>
            <SectionAnchor id="dos-donts" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Do's & Don'ts</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {/* DO's */}
              <div className="bg-green-950/20 border border-green-500/15 rounded-2xl p-6 space-y-4">
                <h3 className="text-green-400 font-bold flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5" /> Do's
                </h3>
                {[
                  "Use your real name on your profile so I can recognize you",
                  "Read the notes sequentially — they are designed to build on each other",
                  "Use the Comment or Contact section if you have genuine academic questions",
                  "Share the blog posts if you find them helpful for your peers",
                  "Bookmark important pages for quick access later",
                  "Check notifications regularly so you never miss a new upload",
                ].map((t) => (
                  <div key={t} className="flex gap-2.5 text-sm text-zinc-300">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>

              {/* DON'Ts */}
              <div className="bg-red-950/20 border border-red-500/15 rounded-2xl p-6 space-y-4">
                <h3 className="text-red-400 font-bold flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5" /> Don'ts
                </h3>
                {[
                  "Do not copy and reproduce the content without permission",
                  "Do not use a fake name or misleading information on your profile",
                  "Do not spam the contact or feedback form",
                  "Do not share your login credentials with anyone else",
                  "Do not expect 24/7 live support — response time may vary",
                  "Do not rely only on these notes — use them alongside textbooks",
                ].map((t) => (
                  <div key={t} className="flex gap-2.5 text-sm text-zinc-300">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CURRENT FEATURES ── */}
          <section>
            <SectionAnchor id="features" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Layers className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">What's Available Right Now</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: <BookOpen className="w-5 h-5 text-accent" />,
                  color: "accent",
                  title: "Structured Course Notes",
                  desc: "All subjects are broken into chapters. Each chapter has detailed notes written to help you actually understand the topic, not just memorize it.",
                },
                {
                  icon: <MessageSquare className="w-5 h-5 text-purple-400" />,
                  color: "purple",
                  title: "Tech Blog",
                  desc: "Regularly published blog posts covering programming concepts, industry news, and insights useful for CS students and developers.",
                },
                {
                  icon: <Bell className="w-5 h-5 text-yellow-400" />,
                  color: "yellow",
                  title: "Real-Time Notifications",
                  desc: "Get instant alerts when new notes, a new course, or a new blog post is published. You will never miss an update.",
                },
                {
                  icon: <Bookmark className="w-5 h-5 text-green-400" />,
                  color: "green",
                  title: "Bookmarks",
                  desc: "Save any blog post or note for quick reference. Access all your bookmarks from your user profile dashboard.",
                },
                {
                  icon: <User className="w-5 h-5 text-pink-400" />,
                  color: "pink",
                  title: "User Profile & Dashboard",
                  desc: "A personalized space for you — manage your name, photo, and see your activity history on the platform.",
                },
                {
                  icon: <Clock className="w-5 h-5 text-orange-400" />,
                  color: "orange",
                  title: "Reading Time Estimates",
                  desc: "Every note and blog post shows an estimated reading time, so you can plan your study sessions accordingly.",
                },
              ].map((f) => (
                <div key={f.title} className="bg-[#111]/80 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors group">
                  <div className="mb-3">{f.icon}</div>
                  <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── PROFILE COMPLETION ── */}
          <section>
            <SectionAnchor id="profile" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                <User className="w-4 h-4 text-pink-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Complete Your Profile</h2>
            </div>
            <div className="bg-[#111]/80 border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
              <p className="text-zinc-400 text-[15px] leading-relaxed">
                A completed profile makes your experience on CSWITHBS significantly smoother. Here is what you should fill out and why it matters:
              </p>
              <div className="space-y-3">
                {[
                  {
                    field: "Full Name",
                    why: "Required so I can identify you as a student. Use your real name.",
                    status: "Required",
                    statusColor: "red",
                  },
                  {
                    field: "Profile Photo",
                    why: "Adds a personal touch to your account and comments.",
                    status: "Recommended",
                    statusColor: "yellow",
                  },
                  {
                    field: "Email Address",
                    why: "Used for login and receiving important account notifications.",
                    status: "Required",
                    statusColor: "red",
                  },
                  {
                    field: "Batch / Year",
                    why: "Helps me personalize announcements and course materials for your year.",
                    status: "Recommended",
                    statusColor: "yellow",
                  },
                ].map((item) => (
                  <div key={item.field} className="flex items-start justify-between gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{item.field}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">{item.why}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-md shrink-0 ${
                      item.statusColor === "red"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
                >
                  Go to Your Profile <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* ── COMING SOON ── */}
          <section>
            <SectionAnchor id="coming-soon" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">What's Coming</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: <Zap className="w-5 h-5 text-yellow-400" />,
                  title: "Interactive Chapter Quizzes",
                  desc: "Self-assessment quizzes at the end of each chapter. Test your understanding and get instant feedback.",
                  tag: "Planned",
                },
                {
                  icon: <Target className="w-5 h-5 text-orange-400" />,
                  title: "Structured Study Paths",
                  desc: "Curated learning paths crafted by our faculty to guide you through complex CS topics step by step.",
                  tag: "Planned",
                },
                {
                  icon: <Star className="w-5 h-5 text-blue-400" />,
                  title: "Progress Tracking",
                  desc: "Track which notes and chapters you have completed, and visualize your learning progress over time.",
                  tag: "In Design",
                },
                {
                  icon: <MessageSquare className="w-5 h-5 text-green-400" />,
                  title: "Discussion Threads",
                  desc: "Ask questions directly under any note or blog post. A community learning space for students.",
                  tag: "In Design",
                },
              ].map((f) => (
                <div key={f.title} className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-bold text-zinc-500 bg-white/5 border border-white/10 px-2 py-1 rounded-full uppercase tracking-wider">
                      {f.tag}
                    </span>
                  </div>
                  <div className="mb-3 opacity-60">{f.icon}</div>
                  <h3 className="text-zinc-300 font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── CONTACT ── */}
          <section>
            <SectionAnchor id="contact" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <LifeBuoy className="w-4 h-4 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Contact & Support</h2>
            </div>
            <div className="bg-[#111]/80 border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-6 md:p-8 space-y-4">
                <p className="text-zinc-300 text-[15px] leading-relaxed">
                  If you face any issue, have a question, or just want to share feedback — please do not hesitate to reach out. This platform is built for you, and your experience matters.
                </p>
                <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-xl p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-200 text-sm font-medium mb-1">Before contacting us, please check:</p>
                    <ul className="text-zinc-400 text-sm space-y-1">
                      <li>→ Are you logged in with the correct account?</li>
                      <li>→ Have you refreshed the page?</li>
                      <li>→ Is the issue happening on all browsers or just one?</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <Mail className="w-5 h-5 text-accent shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-white">Contact Form</p>
                      <p className="text-xs text-zinc-500">Use our contact page for any query — we read every message.</p>
                    </div>
                    <Link
                      href="/contact"
                      className="ml-auto shrink-0 text-xs text-accent font-medium hover:underline flex items-center gap-1"
                    >
                      Open <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="border-t border-white/5 px-6 md:px-8 py-5 bg-white/[0.01] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-sm text-zinc-500">
                  We try to respond within <strong className="text-zinc-400">1–2 business days</strong>. Please be patient!
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-accent/90 transition-all whitespace-nowrap"
                >
                  Contact Us <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
