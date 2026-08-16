"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Trash2, ListTree } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";

interface Subject {
  _id: string;
  name: string;
}

interface Chapter {
  _id: string;
  name: string;
  slug: string;
  subject: Subject;
  order: number;
  description?: string;
  createdAt: string;
}

export default function ChaptersPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const { showToast } = useToast();

  const isSuperOrAdmin = user?.roles?.some((r: string) =>
    ["ADMIN", "SUPER_ADMIN"].includes(r)
  );

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", description: "", subject: "", order: 0 });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    Promise.all([
        fetch("/api/writers-hub/chapters").then((r) => r.json()),
        fetch("/api/writers-hub/subjects").then((r) => r.json())
    ])
    .then(([chaptersData, subjectsData]) => {
        setChapters(chaptersData.chapters || []);
        setSubjects(subjectsData.subjects || subjectsData || []);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.subject) {
      showToast("Name and Subject are required", "error");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/writers-hub/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, order: Number(form.order) }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to create chapter", "error");
        return;
      }
      setChapters((prev) => [...prev, data].sort((a, b) => a.order - b.order));
      setForm({ name: "", description: "", subject: "", order: 0 });
      setShowForm(false);
      showToast("Chapter created!", "success");
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/writers-hub/chapters/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setChapters((prev) => prev.filter((s) => s._id !== id));
        showToast("Chapter deleted", "success");
      } else {
        showToast(data.error || "Failed to delete", "error");
      }
    } catch {
      showToast("Failed to delete", "error");
    } finally {
      setDeleting(null);
      setConfirmDeleteId(null);
    }
  };

  if (!isSuperOrAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ListTree className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-zinc-400 text-sm">Only admins can manage chapters.</p>
        </div>
      </div>
    );
  }

  // Group chapters by subject for display
  const chaptersBySubject = chapters.reduce((acc, chapter) => {
      const subjectName = chapter.subject?.name || "Unassigned";
      if (!acc[subjectName]) acc[subjectName] = [];
      acc[subjectName].push(chapter);
      return acc;
  }, {} as Record<string, Chapter[]>);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Chapters</h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Organize subjects into chapters. Admins only.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-accent text-black px-5 py-2.5 rounded-lg font-semibold hover:bg-accent/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New Chapter
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-zinc-900/60 border border-accent/20 rounded-xl p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-accent">Create New Chapter</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Chapter Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. 1. Introduction to DBMS"
                  className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Subject *</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50 transition-colors"
                >
                    <option value="" disabled>Select Subject</option>
                    {subjects.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                </select>
              </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Order (Position) *</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description (optional)"
                  className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-zinc-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 bg-accent text-black px-5 py-2 rounded-lg font-semibold text-sm hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {creating ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create
            </button>
          </div>
        </form>
      )}

      {/* Chapters List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : chapters.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <ListTree className="w-12 h-12 opacity-20 mx-auto mb-4" />
          <p>No chapters yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-8">
            {Object.entries(chaptersBySubject).map(([subjectName, subjChapters]) => (
                <div key={subjectName}>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        {subjectName}
                        <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-zinc-400 font-normal">
                            {subjChapters.length} {subjChapters.length === 1 ? 'chapter' : 'chapters'}
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                    {subjChapters.map((chapter) => (
                        <div
                        key={chapter._id}
                        className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-accent/20 transition-colors"
                        >
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0 text-zinc-400 font-mono text-xs font-bold border border-white/5">
                                #{chapter.order}
                            </div>
                            <div className="min-w-0">
                            <div className="font-semibold text-white truncate text-sm">{chapter.name}</div>
                            {chapter.description && (
                                <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1">
                                {chapter.description}
                                </div>
                            )}
                            </div>
                        </div>
                        <button
                            onClick={() => setConfirmDeleteId(chapter._id)}
                            disabled={deleting === chapter._id}
                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all shrink-0 disabled:opacity-40"
                            title="Delete chapter"
                        >
                            {deleting === chapter._id ? (
                            <div className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                            <Trash2 className="w-4 h-4" />
                            )}
                        </button>
                        </div>
                    ))}
                    </div>
                </div>
            ))}
        </div>
      )}
      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        title="Delete Chapter?"
        description="Are you sure you want to delete this chapter? Notes using it will lose their chapter reference."
        variant="danger"
        confirmText="Delete Chapter"
      />
    </div>
  );
}
