"use client";

import { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Send,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ThumbsUp,
  X,
} from "lucide-react";
import { useToast } from "@/app/context/ToastContext";

interface PostItem {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: string;
  author?: {
    name?: string;
    email?: string;
  } | null;
}

interface ReviewResult {
  score: number;
  verdict: "APPROVE" | "NEEDS_REVISION" | "REJECT";
  summary: string;
  strengths: string[];
  issues: string[];
  suggestions: string[];
  seoScore: number;
  readability: string;
  technicalDepth: string;
  modelUsed: string;
}

export function AiPostReviewButton({ post }: { post: PostItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [editorialMessage, setEditorialMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const runReview = async () => {
    setReviewing(true);
    try {
      const res = await fetch("/api/admin/ai/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review failed");

      setReview(data.review);

      // Auto-draft a constructive editorial message for the writer
      const authorName = post.author?.name || "Writer";
      const verdict = data.review.verdict;
      let msg = "";

      if (verdict === "APPROVE") {
        msg = `Hi ${authorName},\n\nGreat work on "${post.title}"! Your submission has passed editorial review with a score of ${data.review.score}/100.\n\nHighlights:\n${data.review.strengths.map((s: string) => `• ${s}`).join("\n")}\n\nYour post is approved and being published!`;
      } else {
        msg = `Hi ${authorName},\n\nThank you for submitting "${post.title}". The editorial review identified a few areas to strengthen before we publish (Quality Score: ${data.review.score}/100):\n\nKey Suggestions:\n${data.review.suggestions.map((s: string) => `• ${s}`).join("\n")}\n\nPlease update your draft in the Writers Hub and resubmit for approval.`;
      }

      setEditorialMessage(msg);
      showToast("AI Review completed!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to inspect post", "error");
    } finally {
      setReviewing(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!review) {
      runReview();
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/ai/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post._id, action: "approve" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to approve post");
      showToast("Post approved and published!", "success");
      setIsOpen(false);
      window.location.reload();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestRevision = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/ai/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post._id, action: "reject" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send revision");
      showToast("Post moved to draft for revision", "info");
      setIsOpen(false);
      window.location.reload();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const copyFeedback = () => {
    navigator.clipboard.writeText(editorialMessage);
    setCopied(true);
    showToast("Feedback copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        type="button"
        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-500/10 via-accent/10 to-blue-500/10 border border-purple-500/30 hover:border-accent text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 shadow-sm group"
      >
        <Sparkles size={13} className="text-purple-400 group-hover:text-accent transition-colors" />
        <span>AI Review</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    AI Post Inspector
                    {review && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                        {review.modelUsed}
                      </span>
                    )}
                  </h3>
                  <p className="text-zinc-400 text-xs line-clamp-1 max-w-md">
                    Reviewing: <span className="text-zinc-200 font-medium">{post.title}</span>
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
              {reviewing && (
                <div className="py-16 text-center space-y-4">
                  <RefreshCw size={28} className="animate-spin text-accent mx-auto" />
                  <p className="text-sm font-medium text-zinc-300">
                    Inspecting technical depth, code quality, readability, and originality...
                  </p>
                  <p className="text-xs text-zinc-500">
                    Evaluating against academic CS standards using Gemini reasoning engine
                  </p>
                </div>
              )}

              {!reviewing && review && (
                <>
                  {/* Top Score Banner */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                      <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        Quality Score
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-2xl font-black ${
                            review.score >= 80
                              ? "text-emerald-400"
                              : review.score >= 60
                              ? "text-amber-400"
                              : "text-red-400"
                          }`}
                        >
                          {review.score}
                        </span>
                        <span className="text-xs text-zinc-500">/ 100</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                      <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        Verdict
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {review.verdict === "APPROVE" && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 size={12} /> Ready to Publish
                          </span>
                        )}
                        {review.verdict === "NEEDS_REVISION" && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                            <AlertTriangle size={12} /> Needs Revision
                          </span>
                        )}
                        {review.verdict === "REJECT" && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                            <XCircle size={12} /> Major Changes
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                      <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        Readability
                      </div>
                      <div className="text-xs font-semibold text-zinc-200 mt-1 truncate">
                        {review.readability}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs text-purple-200 leading-relaxed">
                    <span className="font-bold text-purple-300">Executive Summary: </span>
                    {review.summary}
                  </div>

                  {/* Strengths & Issues */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 size={13} /> Strengths
                      </div>
                      <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                        {review.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                      <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle size={13} /> Areas to Polish
                      </div>
                      <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                        {review.issues.length > 0 ? (
                          review.issues.map((issue, i) => <li key={i}>{issue}</li>)
                        ) : (
                          <li className="text-zinc-500 italic">No critical issues detected</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Editorial Response Composer */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Editorial Feedback for Author ({post.author?.name || "Writer"})
                      </label>
                      <button
                        type="button"
                        onClick={copyFeedback}
                        className="text-xs text-accent hover:underline flex items-center gap-1 font-medium"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? "Copied" : "Copy Message"}
                      </button>
                    </div>
                    <textarea
                      value={editorialMessage}
                      onChange={(e) => setEditorialMessage(e.target.value)}
                      rows={5}
                      className="w-full bg-black/60 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-accent font-sans leading-relaxed"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={runReview}
                disabled={reviewing}
                className="px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw size={13} className={reviewing ? "animate-spin" : ""} />
                Re-inspect
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRequestRevision}
                  disabled={actionLoading || reviewing}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all disabled:opacity-50"
                >
                  Move to Draft & Send Feedback
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={actionLoading || reviewing}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-black bg-accent hover:bg-accent-hover transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-accent/20"
                >
                  <ThumbsUp size={13} />
                  Approve & Publish Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
