"use client";

import { useState } from "react";
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Plus,
  X,
  Layers,
  ArrowRight,
  Shield,
  GraduationCap,
} from "lucide-react";
import { useToast } from "@/app/context/ToastContext";

interface SuggestedChapter {
  name: string;
  description: string;
  order: number;
  sampleNotes?: string[];
}

interface PlanResult {
  name: string;
  slug: string;
  description: string;
  level: string;
  alignments: string[];
  suggestedChapters: SuggestedChapter[];
  modelUsed: string;
}

export function AiCurriculumPlannerModal({ onSubjectCreated }: { onSubjectCreated: (newSubject: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("All Levels");
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const handleGeneratePlan = async () => {
    if (!topic.trim()) {
      showToast("Please enter a subject topic", "error");
      return;
    }
    setGenerating(true);
    setPlan(null);
    try {
      const res = await fetch("/api/admin/ai/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_subject_plan",
          topic: topic.trim(),
          level,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate curriculum plan");
      setPlan(data.plan);
      showToast("Curriculum plan generated!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to generate plan", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleCommitSubject = async () => {
    if (!plan) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/ai/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_subject_with_chapters",
          plan,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create subject");
      showToast(`Subject "${plan.name}" created with ${data.chaptersCount} chapters!`, "success");
      onSubjectCreated(data.subject);
      setIsOpen(false);
      setPlan(null);
      setTopic("");
    } catch (err: any) {
      showToast(err.message || "Failed to commit subject", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-accent to-blue-600 text-black px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-95 transition-all shadow-md shadow-accent/20"
      >
        <Sparkles size={16} />
        <span>AI Curriculum Architect</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    AI Curriculum Architect
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent">
                      Academic Syllabus Planner
                    </span>
                  </h3>
                  <p className="text-zinc-400 text-xs">
                    Design a university-grade syllabus with sequential chapters and learning milestones.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Input Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Subject / Domain Topic
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Distributed Systems, Compiler Design, Cryptography..."
                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-accent"
                    onKeyDown={(e) => e.key === "Enter" && handleGeneratePlan()}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Target Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-black/50 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-accent"
                  >
                    <option value="Beginner">Beginner (1st/2nd Yr)</option>
                    <option value="Intermediate">Intermediate (Core UG)</option>
                    <option value="Advanced">Advanced (GATE / PG)</option>
                    <option value="All Levels">All Levels (Comprehensive)</option>
                  </select>
                </div>

                <div className="md:col-span-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleGeneratePlan}
                    disabled={generating || !topic.trim()}
                    className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-black text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 shadow-md shadow-accent/20"
                  >
                    <Sparkles size={14} className={generating ? "animate-spin" : ""} />
                    {generating ? "Synthesizing Curriculum..." : "Generate Complete Syllabus"}
                  </button>
                </div>
              </div>

              {generating && (
                <div className="py-16 text-center space-y-3">
                  <RefreshCw size={32} className="animate-spin text-accent mx-auto" />
                  <p className="text-sm font-semibold text-zinc-200">
                    Constructing university-grade syllabus according to standard CS guidelines...
                  </p>
                  <p className="text-xs text-zinc-500">
                    Sequencing prerequisites, chapter objectives, and core competencies.
                  </p>
                </div>
              )}

              {!generating && plan && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  {/* Generated Subject Summary */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-accent/30 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">{plan.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
                            {plan.level}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          {plan.description}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                        {plan.suggestedChapters.length} Chapters
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800/80">
                      <span className="text-[11px] font-bold text-zinc-500 uppercase mr-1">Alignments:</span>
                      {plan.alignments.map((a, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300 font-medium"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Chapters List */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                      <Layers size={14} className="text-accent" />
                      Sequential Chapters Breakdown
                    </h4>

                    <div className="space-y-2">
                      {plan.suggestedChapters.map((chap, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/70 hover:border-zinc-700 transition-colors flex items-start gap-3"
                        >
                          <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {chap.order || idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-semibold text-zinc-100">{chap.name}</h5>
                            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                              {chap.description}
                            </p>
                            {chap.sampleNotes && chap.sampleNotes.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 mt-2">
                                <span className="text-[10px] text-zinc-500 mr-1">Lessons:</span>
                                {chap.sampleNotes.map((note, nIdx) => (
                                  <span
                                    key={nIdx}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/50"
                                  >
                                    {note}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {plan ? "Review syllabus above before saving to database." : "Enter a topic to generate syllabus."}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                {plan && (
                  <button
                    type="button"
                    onClick={handleCommitSubject}
                    disabled={saving}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-accent hover:bg-accent-hover transition-all flex items-center gap-2 disabled:opacity-50 shadow-md shadow-accent/20"
                  >
                    <CheckCircle2 size={14} className={saving ? "animate-spin" : ""} />
                    {saving ? "Creating Subject & Seeding Chapters..." : "Create Subject & Seed Chapters"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
