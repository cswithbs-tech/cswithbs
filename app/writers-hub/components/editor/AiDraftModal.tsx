"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Loader2, Image as ImageIcon, BookOpen, FileText, CheckCircle2, AlertTriangle, Wand2, Cpu } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";

interface AiDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: "post" | "note";
  categories: any[];
  subjects: any[];
  onDraftGenerated: (draft: {
    title: string;
    slug: string;
    excerpt: string;
    tags: string[];
    contentHtml: string;
    image?: string;
    seoTitle?: string;
    seoDescription?: string;
    categoryId?: string;
    subjectId?: string;
  }) => void;
}

const GENERATION_STEPS = [
  "Structuring curriculum syllabus & headings...",
  "Writing comprehensive explanations & code examples...",
  "Formatting comparison tables & academic takeaways...",
  "Generating 3D cover illustration & uploading to Cloudinary...",
  "Finalizing draft and loading into editor...",
];

export function AiDraftModal({
  isOpen,
  onClose,
  contentType,
  categories,
  subjects,
  onDraftGenerated,
}: AiDraftModalProps) {
  const { showToast } = useToast();

  const [topic, setTopic] = useState("");
  const [selectedType, setSelectedType] = useState<"post" | "note">(contentType);
  const [selectedModel, setSelectedModel] = useState<string>("auto");
  const [categoryOrSubjectId, setCategoryOrSubjectId] = useState("");
  const [targetLevel, setTargetLevel] = useState("Intermediate (BTech / MCA)");
  const [language, setLanguage] = useState("English");
  const [customInstructions, setCustomInstructions] = useState("");
  const [generateImage, setGenerateImage] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setSelectedType(contentType);
    // Suggest heavy reasoning model for academic notes by default
    if (contentType === "note") {
      setSelectedModel("gemini-3-flash-preview");
    } else {
      setSelectedModel("auto");
    }
  }, [contentType]);

  // Step ticker during generation
  useEffect(() => {
    if (!isGenerating) {
      setCurrentStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 2800);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      showToast("Please enter a topic or lesson title.", "error");
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");

    try {
      // Find selected name
      let categoryOrSubjectName = "";
      if (selectedType === "post") {
        const cat = categories.find((c) => c._id === categoryOrSubjectId);
        categoryOrSubjectName = cat ? cat.name : "Computer Science & Technology";
      } else {
        const sub = subjects.find((s) => s._id === categoryOrSubjectId);
        categoryOrSubjectName = sub ? sub.title || sub.slug : "Computer Science";
      }

      const res = await fetch("/api/admin/ai/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          contentType: selectedType,
          categoryOrSubject: categoryOrSubjectName,
          targetLevel,
          language,
          customInstructions: customInstructions.trim(),
          generateImage,
          selectedModel,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Generation failed");
      }

      const { draft } = data;
      onDraftGenerated({
        title: draft.title,
        slug: draft.slug,
        excerpt: draft.excerpt,
        tags: draft.tags || [],
        contentHtml: draft.contentHtml,
        image: draft.image,
        seoTitle: draft.seoTitle,
        seoDescription: draft.seoDescription,
        categoryId: selectedType === "post" ? categoryOrSubjectId : undefined,
        subjectId: selectedType === "note" ? categoryOrSubjectId : undefined,
      });

      showToast("✨ AI draft and cover image loaded into editor!", "success");
      onClose();
    } catch (err: any) {
      console.error("AI Generation failed:", err);
      setErrorMessage(err.message || "Failed to generate AI draft. Please check your Gemini API key.");
      showToast(err.message || "Generation failed", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  AI Draft Assistant
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-normal">
                    Gemini 2.0 Flash
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Generate a complete lesson or post with code, tables, and cover image.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isGenerating}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-5">
            {isGenerating ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
                  <Sparkles size={24} className="absolute text-accent animate-pulse" />
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h4 className="text-base font-bold text-white">Writing Content & Generating Assets</h4>
                  <p className="text-xs font-mono text-accent transition-all duration-300">
                    {GENERATION_STEPS[currentStepIndex]}
                  </p>
                  <p className="text-[11px] text-zinc-500 pt-2">
                    Everything will be loaded directly into your editor so you can review and edit before publishing.
                  </p>
                </div>
              </div>
            ) : (
              <form id="ai-draft-form" onSubmit={handleGenerate} className="space-y-4">
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-start gap-2.5">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-400" />
                    <div>
                      <p className="font-semibold">Generation Failed</p>
                      <p className="text-zinc-400 mt-0.5">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Topic / Title Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Topic / Lesson Title <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. B+ Trees in DBMS: Operations, Indexing, and Search Algorithm"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-zinc-600"
                    autoFocus
                    required
                  />
                </div>

                {/* Content Type & Category Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Type Toggle */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Content Type
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setSelectedType("post")}
                        className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedType === "post"
                            ? "bg-accent text-black font-bold shadow"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <FileText size={13} />
                        Blog Post
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedType("note")}
                        className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedType === "note"
                            ? "bg-accent text-black font-bold shadow"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <BookOpen size={13} />
                        Academic Note
                      </button>
                    </div>
                  </div>

                  {/* Category / Subject Select */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      {selectedType === "note" ? "Subject Curriculum" : "Category"}
                    </label>
                    <select
                      value={categoryOrSubjectId}
                      onChange={(e) => setCategoryOrSubjectId(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-accent/50 transition-all h-[38px]"
                    >
                      <option value="">
                        {selectedType === "note" ? "-- Auto-detect Subject --" : "-- Auto-detect Category --"}
                      </option>
                      {selectedType === "note"
                        ? subjects.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.title || s.slug}
                            </option>
                          ))
                        : categories.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>

                {/* Target Level & Language */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Target Audience / Level
                    </label>
                    <select
                      value={targetLevel}
                      onChange={(e) => setTargetLevel(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-accent/50 transition-all"
                    >
                      <option value="Beginner (BCA / Diploma)">Beginner (BCA / Diploma)</option>
                      <option value="Intermediate (BTech / MCA)">Intermediate (BTech / MCA)</option>
                      <option value="Advanced / GATE / University Exam">Advanced / GATE / University Exam</option>
                      <option value="Research & Academic Paper">Research & Academic Paper</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Language
                    </label>
                    <input
                      type="text"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      placeholder="English"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-accent/50 transition-all"
                    />
                  </div>
                </div>

                {/* AI Model & Workload Mode */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu size={14} className="text-accent" />
                      Model & Reasoning Depth
                    </label>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {selectedModel === "gemini-3-flash-preview"
                        ? "Deep Reasoning"
                        : selectedModel === "gemini-flash-lite-latest"
                        ? "Ultra-Fast"
                        : selectedModel === "gemini-3.5-flash-lite"
                        ? "Detailed Code"
                        : selectedModel === "gemini-3.8-flash"
                        ? "High Density"
                        : "Auto Cascade"}
                    </span>
                  </div>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-accent/50 transition-all font-sans"
                  >
                    <option value="auto">⚡ Auto Cascade (Recommended) — Fastest available with auto-failover</option>
                    <option value="gemini-flash-lite-latest">🚀 Fast / Blog Guide (gemini-flash-lite) — Best for blog posts, news & quick guides (~1-2s)</option>
                    <option value="gemini-3.5-flash-lite">📚 In-Depth Tutorial (gemini-3.5-flash) — Best for programming tutorials & DSA code (~3-4s)</option>
                    <option value="gemini-3-flash-preview">🧠 Complex Academic & Proofs (gemini-3-flash) — Heavy reasoning for deep notes, math & GATE (~5-7s)</option>
                    <option value="gemini-3.8-flash">🏗️ System Architecture (gemini-3.8-flash) — Distributed systems & high-density curriculum (~6-8s)</option>
                  </select>
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    {selectedModel === "gemini-3-flash-preview"
                      ? "💡 Tip: Gemini 3 Flash features deep academic reasoning, ideal for rigorous university notes, mathematical derivations, and complex system logic."
                      : selectedModel === "gemini-flash-lite-latest"
                      ? "💡 Tip: Flash Lite is lightning-fast, perfect for rapid drafting, summaries, and everyday blog posts."
                      : selectedModel === "gemini-3.5-flash-lite"
                      ? "💡 Tip: Balanced model excellent for syntax explanations, comparative tables, and programming tutorials."
                      : selectedModel === "gemini-3.8-flash"
                      ? "💡 Tip: Advanced flash model built for high-density curriculum syllabus and distributed systems."
                      : "💡 Tip: Auto mode starts with the fastest healthy model and automatically falls back if there is high demand."}
                  </p>
                </div>

                {/* Additional Instructions */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Custom Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="e.g. Include full C++ implementation, an ASCII/Mermaid diagram, time complexity table, and 3 viva questions."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-accent/50 transition-all placeholder:text-zinc-600 resize-none"
                  />
                </div>

                {/* Image Checkbox */}
                <div className="pt-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generateImage}
                      onChange={(e) => setGenerateImage(e.target.checked)}
                      className="w-4 h-4 rounded text-accent bg-zinc-900 border-zinc-700 focus:ring-accent"
                    />
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <ImageIcon size={14} className="text-accent" />
                      <span>
                        <strong>Auto-generate Cover Illustration</strong> & upload directly to Cloudinary
                      </span>
                    </div>
                  </label>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          {!isGenerating && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02]">
              <p className="text-[11px] text-zinc-500">
                Draft will populate into the editor. You can edit everything before saving.
              </p>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="ai-draft-form"
                  disabled={!topic.trim()}
                  className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-black text-xs font-bold shadow-lg shadow-accent/20 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Wand2 size={14} />
                  Generate & Populate Editor
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
