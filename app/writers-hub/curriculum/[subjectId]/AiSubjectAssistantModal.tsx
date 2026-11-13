"use client";

import { useState } from "react";
import {
  Sparkles,
  BookOpen,
  Layers,
  CheckCircle2,
  RefreshCw,
  Plus,
  X,
  ArrowRight,
  ExternalLink,
  PenTool,
  Check,
} from "lucide-react";
import { useToast } from "@/app/context/ToastContext";

interface ChapterItem {
  _id: string;
  name: string;
  order: number;
}

interface MissingChapter {
  name: string;
  description: string;
  order: number;
  sampleNotes?: string[];
  priority?: "High" | "Medium" | "Optional";
}

interface NoteOutline {
  title: string;
  slug: string;
  brief: string;
  tags: string[];
}

export function AiSubjectAssistantModal({
  subjectId,
  subjectName,
  subjectLevel,
  chapters,
  onChaptersAdded,
}: {
  subjectId: string;
  subjectName: string;
  subjectLevel?: string;
  chapters: ChapterItem[];
  onChaptersAdded: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chapters" | "notes">("chapters");
  const { showToast } = useToast();

  // Missing chapters state
  const [loadingMissing, setLoadingMissing] = useState(false);
  const [missingChapters, setMissingChapters] = useState<MissingChapter[]>([]);
  const [selectedMissing, setSelectedMissing] = useState<Record<number, boolean>>({});
  const [addingChapters, setAddingChapters] = useState(false);

  // Notes outline state
  const [selectedChapterId, setSelectedChapterId] = useState(chapters[0]?._id || "");
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notesOutline, setNotesOutline] = useState<NoteOutline[]>([]);

  const handleAuditMissingChapters = async () => {
    setLoadingMissing(true);
    setMissingChapters([]);
    try {
      const res = await fetch("/api/admin/ai/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suggest_chapters",
          subjectName,
          existingChapters: chapters.map((c) => c.name),
          level: subjectLevel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to audit missing chapters");

      const incoming: MissingChapter[] = data.missingChapters || [];
      setMissingChapters(incoming);

      // Select all by default
      const initialMap: Record<number, boolean> = {};
      incoming.forEach((_, idx) => {
        initialMap[idx] = true;
      });
      setSelectedMissing(initialMap);

      showToast(`Identified ${incoming.length} potential syllabus gaps`, "info");
    } catch (err: any) {
      showToast(err.message || "Audit failed", "error");
    } finally {
      setLoadingMissing(false);
    }
  };

  const handleAddSelectedChapters = async () => {
    const toAdd = missingChapters.filter((_, idx) => selectedMissing[idx]);
    if (toAdd.length === 0) {
      showToast("Please select at least one chapter to add", "error");
      return;
    }

    setAddingChapters(true);
    try {
      const res = await fetch("/api/admin/ai/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "seed_chapters",
          subjectId,
          chapters: toAdd.map((c, i) => ({
            name: c.name,
            description: c.description,
            order: (chapters.length > 0 ? Math.max(...chapters.map((x) => x.order)) : 0) + i + 1,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to seed chapters");

      showToast(`Added ${data.count} chapters to ${subjectName}!`, "success");
      onChaptersAdded();
      setIsOpen(false);
      setMissingChapters([]);
    } catch (err: any) {
      showToast(err.message || "Failed to add chapters", "error");
    } finally {
      setAddingChapters(false);
    }
  };

  const handleGenerateNotesPlan = async () => {
    const targetChapter = chapters.find((c) => c._id === selectedChapterId);
    if (!targetChapter) {
      showToast("Please choose a chapter", "error");
      return;
    }

    setLoadingNotes(true);
    setNotesOutline([]);
    try {
      const res = await fetch("/api/admin/ai/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "suggest_notes",
          subjectName,
          chapterName: targetChapter.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate notes plan");
      setNotesOutline(data.notes || []);
      showToast(`Generated lesson outline for "${targetChapter.name}"`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to generate notes plan", "error");
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (missingChapters.length === 0 && activeTab === "chapters") {
      handleAuditMissingChapters();
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        type="button"
        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-accent to-blue-600 text-black px-4 py-2 rounded-xl text-xs font-bold hover:opacity-95 transition-all shadow-md shadow-accent/20"
      >
        <Sparkles size={14} />
        <span>AI Chapter Assistant</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    Subject AI Copilot: <span className="text-accent">{subjectName}</span>
                  </h3>
                  <p className="text-zinc-400 text-xs">
                    Audit syllabus completeness, detect gaps, and plan chapter lessons.
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

            {/* Tab navigation */}
            <div className="flex items-center border-b border-zinc-800 bg-zinc-900/40 px-5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("chapters");
                  if (missingChapters.length === 0) handleAuditMissingChapters();
                }}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "chapters"
                    ? "border-accent text-accent"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Layers size={14} />
                Missing Chapters Gap Audit
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("notes")}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "notes"
                    ? "border-accent text-accent"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <PenTool size={14} />
                Chapter Lesson Outliner
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {activeTab === "chapters" && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        Current Chapters: {chapters.length}
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Evaluated against GATE CS & premier university syllabi.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAuditMissingChapters}
                      disabled={loadingMissing}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw size={12} className={loadingMissing ? "animate-spin" : ""} />
                      Re-audit Gaps
                    </button>
                  </div>

                  {loadingMissing && (
                    <div className="py-14 text-center space-y-3">
                      <RefreshCw size={26} className="animate-spin text-accent mx-auto" />
                      <p className="text-xs font-medium text-zinc-300">
                        Scanning syllabus completeness for {subjectName}...
                      </p>
                    </div>
                  )}

                  {!loadingMissing && missingChapters.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Suggested Missing Chapters ({missingChapters.length})
                      </div>
                      <div className="space-y-2">
                        {missingChapters.map((chap, idx) => (
                          <label
                            key={idx}
                            className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                              selectedMissing[idx]
                                ? "bg-accent/5 border-accent/40"
                                : "bg-zinc-900/40 border-zinc-800 opacity-70"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={!!selectedMissing[idx]}
                              onChange={(e) =>
                                setSelectedMissing((prev) => ({
                                  ...prev,
                                  [idx]: e.target.checked,
                                }))
                              }
                              className="mt-1 rounded bg-black/50 border-zinc-700 text-accent focus:ring-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-white">{chap.name}</span>
                                {chap.priority && (
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                      chap.priority === "High"
                                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                    }`}
                                  >
                                    {chap.priority} Priority
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                                {chap.description}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {!loadingMissing && missingChapters.length === 0 && (
                    <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-2">
                      <CheckCircle2 size={28} className="text-emerald-400 mx-auto" />
                      <p className="text-sm font-semibold text-zinc-200">
                        Excellent! Your curriculum is comprehensive.
                      </p>
                      <p className="text-xs text-zinc-500">
                        No major canonical subject gaps detected for {subjectName}.
                      </p>
                    </div>
                  )}
                </>
              )}

              {activeTab === "notes" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Select Chapter to Outline
                      </label>
                      <select
                        value={selectedChapterId}
                        onChange={(e) => setSelectedChapterId(e.target.value)}
                        className="w-full bg-black/50 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-accent"
                      >
                        {chapters.map((c) => (
                          <option key={c._id} value={c._id}>
                            Ch {c.order}: {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateNotesPlan}
                      disabled={loadingNotes || !selectedChapterId}
                      className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-black text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Sparkles size={13} className={loadingNotes ? "animate-spin" : ""} />
                      {loadingNotes ? "Outlining..." : "Generate Lesson Sequence"}
                    </button>
                  </div>

                  {loadingNotes && (
                    <div className="py-12 text-center space-y-3">
                      <RefreshCw size={24} className="animate-spin text-accent mx-auto" />
                      <p className="text-xs font-medium text-zinc-300">
                        Sequencing tutorial and note objectives...
                      </p>
                    </div>
                  )}

                  {!loadingNotes && notesOutline.length > 0 && (
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Recommended Lesson Sequence ({notesOutline.length} Notes)
                      </span>
                      <div className="space-y-2">
                        {notesOutline.map((note, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-start justify-between gap-3"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <div>
                                <h5 className="text-xs font-bold text-zinc-100">{note.title}</h5>
                                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                                  {note.brief}
                                </p>
                                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                  {note.tags?.map((t, ti) => (
                                    <span
                                      key={ti}
                                      className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-zinc-400 font-mono"
                                    >
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <a
                              href={`/writers-hub/editor?type=note&subjectId=${subjectId}&chapterId=${selectedChapterId}&title=${encodeURIComponent(
                                note.title
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 text-accent text-[11px] font-semibold transition-all shrink-0 flex items-center gap-1"
                            >
                              <span>Draft Note</span>
                              <ExternalLink size={11} />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {activeTab === "chapters" && missingChapters.length > 0 && (
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  {Object.values(selectedMissing).filter(Boolean).length} of {missingChapters.length}{" "}
                  selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddSelectedChapters}
                    disabled={addingChapters || Object.values(selectedMissing).filter(Boolean).length === 0}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-accent hover:bg-accent-hover transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-accent/20"
                  >
                    <Plus size={14} className={addingChapters ? "animate-spin" : ""} />
                    {addingChapters ? "Adding Chapters..." : "Add Selected Chapters to Subject"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
