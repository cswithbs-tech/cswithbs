import Link from "next/link";
import { BookOpen, Bell, Bookmark, Zap, MessageSquare, Target } from "lucide-react";

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 py-20 px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Header section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500">CSWITHBS</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
            Your definitive academic hub for mastering Computer Science. Here is everything you need to know to get the most out of our platform.
          </p>
        </div>

        {/* Current Features */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4">What you can do right now</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111] border border-white/10 p-6 rounded-2xl hover:border-accent/50 transition-colors">
              <BookOpen className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Structured Curriculum</h3>
              <p className="text-sm text-zinc-400">Dive into carefully curated Subjects, broken down into manageable Chapters and detailed Notes designed for deep understanding.</p>
            </div>

            <div className="bg-[#111] border border-white/10 p-6 rounded-2xl hover:border-accent/50 transition-colors">
              <MessageSquare className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Tech Blog & Insights</h3>
              <p className="text-sm text-zinc-400">Stay updated with the latest in technology, programming paradigms, and industry standards through our dedicated Writers Hub.</p>
            </div>

            <div className="bg-[#111] border border-white/10 p-6 rounded-2xl hover:border-accent/50 transition-colors">
              <Bell className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Real-Time Alerts</h3>
              <p className="text-sm text-zinc-400">Never miss a beat. Our notification system alerts you instantly when new notes, courses, or critical announcements drop.</p>
            </div>

            <div className="bg-[#111] border border-white/10 p-6 rounded-2xl hover:border-accent/50 transition-colors">
              <Bookmark className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Personalized Tracking</h3>
              <p className="text-sm text-zinc-400">Bookmark important articles, track your reading history, and manage your custom profile directly from your dashboard.</p>
            </div>
          </div>
        </div>

        {/* Future Roadmap */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4">What's coming next</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black border border-white/5 p-6 rounded-2xl">
              <Zap className="w-8 h-8 text-zinc-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Interactive Quizzes</h3>
              <p className="text-sm text-zinc-500">Test your knowledge at the end of every chapter with automated grading and instant feedback.</p>
            </div>

            <div className="bg-black border border-white/5 p-6 rounded-2xl">
              <Target className="w-8 h-8 text-zinc-600 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Structured Study Paths</h3>
              <p className="text-sm text-zinc-500">Carefully designed roadmaps created by our faculty to guide you step-by-step through complex computer science topics.</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center pt-8">
          <Link href="/" className="inline-flex items-center justify-center px-8 py-4 bg-accent text-white font-bold rounded-full hover:bg-accent/90 transition-all shadow-[0_0_20px_rgba(var(--color-accent),0.3)] mb-12">
            Explore the Platform
          </Link>
        </div>

        {/* Support Section */}
        <div className="text-center pt-8 border-t border-white/10 pb-8">
          <p className="text-zinc-400 mb-4 text-lg">
            Have questions, feedback, or facing any issues? We are always here to help you succeed.
          </p>
          <Link href="/contact" className="text-accent hover:text-white transition-colors underline underline-offset-4 font-medium text-lg">
            Contact us freely
          </Link>
        </div>

      </div>
    </div>
  );
}
