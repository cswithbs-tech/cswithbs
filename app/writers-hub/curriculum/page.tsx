"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Subject {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  level?: string;
  alignments?: string[];
  coverImage?: string;
}

export default function CurriculumPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const { showToast } = useToast();

  const isSuperOrAdmin = user?.roles?.some((r: string) =>
    ["ADMIN", "SUPER_ADMIN"].includes(r)
  );

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Subject Creation State
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: "", description: "", level: "All Levels", alignments: "", coverImage: "" });
  const [creatingSubject, setCreatingSubject] = useState(false);

  // Deletion States
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteSubject, setConfirmDeleteSubject] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/writers-hub/subjects")
      .then((r) => r.json())
      .then((data) => {
        setSubjects(data.subjects || data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) {
      showToast("Name is required", "error");
      return;
    }
    setCreatingSubject(true);
    try {
      const alignmentsArray = subjectForm.alignments.split(",").map(s => s.trim()).filter(Boolean);
      const res = await fetch("/api/writers-hub/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...subjectForm, alignments: alignmentsArray }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create subject");
      
      setSubjects((prev) => [...prev, data]);
      setSubjectForm({ name: "", description: "", level: "All Levels", alignments: "", coverImage: "" });
      setShowSubjectForm(false);
      showToast("Subject created!", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setCreatingSubject(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/writers-hub/subjects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSubjects((prev) => prev.filter((s) => s._id !== id));
        showToast("Subject deleted", "success");
      }
    } catch {
      showToast("Failed to delete", "error");
    } finally {
      setDeletingId(null);
      setConfirmDeleteSubject(null);
    }
  };

  if (!isSuperOrAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-zinc-400 text-sm">Only admins can manage curriculum.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex justify-between items-end border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Curriculum</h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Manage your courses, modules, and lessons. Admins only.
          </p>
        </div>
        <button
          onClick={() => setShowSubjectForm(!showSubjectForm)}
          className="flex items-center gap-2 bg-accent text-black px-5 py-2.5 rounded-lg font-semibold hover:bg-accent/90 transition-colors text-sm shadow-[0_0_15px_rgba(0,255,157,0.2)]"
        >
          <Plus className="w-4 h-4" />
          New Course
        </button>
      </div>

      {/* Create Subject Form */}
      <AnimatePresence>
        {showSubjectForm && (
          <motion.form
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 48 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
            onSubmit={handleCreateSubject}
          >
            <div className="bg-zinc-900/60 border border-accent/20 rounded-xl p-8 space-y-6">
              <h3 className="text-base font-semibold text-accent">Create New Course (Subject)</h3>
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Course Name *</label>
                <input
                  type="text"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Description</label>
                <textarea
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description (optional)"
                  rows={2}
                  className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 transition-colors resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1.5">Level</label>
                  <select
                    value={subjectForm.level}
                    onChange={(e) => setSubjectForm((p) => ({ ...p, level: e.target.value }))}
                    className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors"
                  >
                    <option value="All Levels">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1.5">Alignments (Tags)</label>
                  <input
                    type="text"
                    value={subjectForm.alignments}
                    onChange={(e) => setSubjectForm((p) => ({ ...p, alignments: e.target.value }))}
                    placeholder="e.g. VU 1st Sem, CU 4th Sem"
                    className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Cover Image URL</label>
                <input
                  type="text"
                  value={subjectForm.coverImage}
                  onChange={(e) => setSubjectForm((p) => ({ ...p, coverImage: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubjectForm(false)}
                  className="text-sm text-zinc-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingSubject}
                  className="flex items-center gap-2 bg-accent text-black px-5 py-2 rounded-lg font-semibold text-sm hover:bg-accent/90 disabled:opacity-50 transition-colors"
                >
                  {creatingSubject ? "Creating..." : "Create Course"}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Curriculum List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-white/5">
          <BookOpen className="w-12 h-12 opacity-20 mx-auto mb-4" />
          <p>Your curriculum is empty. Create a course to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subjects.map((subject) => (
            <div key={subject._id} className="relative group">
              <Link
                href={`/writers-hub/curriculum/${subject._id}`}
                className="bg-zinc-900/40 border border-white/5 rounded-xl p-5 flex items-start justify-between gap-4 hover:border-accent/30 transition-colors hover:bg-zinc-900/80 block w-full h-full"
              >
                <div className="flex items-start gap-3 min-w-0 pr-10">
                  <div className="w-16 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {subject.coverImage ? (
                      <img src={subject.coverImage} alt={subject.name} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-5 h-5 text-accent" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-bold text-white truncate mb-1">{subject.name}</div>
                    {subject.description && (
                      <div className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                        {subject.description}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {subject.level && subject.level !== "All Levels" && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent/10 text-accent border border-accent/20">
                          {subject.level}
                        </span>
                      )}
                      {subject.alignments?.map((tag, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="text-[10px] text-zinc-600 font-mono mt-1.5">
                      /{subject.slug}
                    </div>
                  </div>
                </div>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setConfirmDeleteSubject(subject._id);
                }}
                disabled={deletingId === subject._id}
                className="absolute top-5 right-5 p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all shrink-0 disabled:opacity-40 z-10"
                title="Delete course"
              >
                {deletingId === subject._id ? (
                  <div className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={!!confirmDeleteSubject}
        onClose={() => setConfirmDeleteSubject(null)}
        onConfirm={() => confirmDeleteSubject && handleDeleteSubject(confirmDeleteSubject)}
        title="Delete Course?"
        description="Are you sure you want to delete this course? All associated modules and lessons will lose their course reference."
        variant="danger"
        confirmText="Delete Course"
      />
    </div>
  );
}
