"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";

interface Subject {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  level?: string;
  alignments?: string[];
  coverImage?: string;
  createdAt: string;
}

export default function SubjectsPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const { showToast } = useToast();

  const isSuperOrAdmin = user?.roles?.some((r: string) =>
    ["ADMIN", "SUPER_ADMIN"].includes(r)
  );

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", description: "", level: "All Levels", alignments: "", coverImage: "" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/writers-hub/subjects")
      .then((r) => r.json())
      .then(setSubjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast("Name is required", "error");
      return;
    }
    setCreating(true);
    try {
      const alignmentsArray = form.alignments.split(",").map(s => s.trim()).filter(Boolean);
      
      const res = await fetch("/api/writers-hub/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, alignments: alignmentsArray }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to create subject", "error");
        return;
      }
      setSubjects((prev) => [...prev, data]);
      setForm({ name: "", description: "", level: "All Levels", alignments: "", coverImage: "" });
      setShowForm(false);
      showToast("Subject created!", "success");
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/writers-hub/subjects/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSubjects((prev) => prev.filter((s) => s._id !== id));
        showToast("Subject deleted", "success");
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
            <BookOpen className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-zinc-400 text-sm">Only admins can manage subjects.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Subjects</h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Organize academic notes by subject. Admins only.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-accent text-black px-5 py-2.5 rounded-lg font-semibold hover:bg-accent/90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          New Subject
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-zinc-900/60 border border-accent/20 rounded-xl p-6 space-y-4"
        >
          <h3 className="text-sm font-semibold text-accent">Create New Subject</h3>
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Subject Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Data Structures & Algorithms"
              className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Brief description (optional)"
              rows={2}
              className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 transition-colors resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 block mb-1.5">Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
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
                value={form.alignments}
                onChange={(e) => setForm((p) => ({ ...p, alignments: e.target.value }))}
                placeholder="e.g. VU 1st Sem, CU 4th Sem"
                className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1.5">Cover Image URL</label>
            <input
              type="text"
              value={form.coverImage}
              onChange={(e) => setForm((p) => ({ ...p, coverImage: e.target.value }))}
              placeholder="https://..."
              className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
          <div className="flex justify-end gap-3">
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

      {/* Subjects List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <BookOpen className="w-12 h-12 opacity-20 mx-auto mb-4" />
          <p>No subjects yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject._id}
              className="bg-zinc-900/40 border border-white/5 rounded-xl p-5 flex items-start justify-between gap-4 hover:border-accent/20 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-16 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  {subject.coverImage ? (
                    <img src={subject.coverImage} alt={subject.name} className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-accent" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-white truncate">{subject.name}</div>
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
              <button
                onClick={() => setConfirmDeleteId(subject._id)}
                disabled={deleting === subject._id}
                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all shrink-0 disabled:opacity-40"
                title="Delete subject"
              >
                {deleting === subject._id ? (
                  <div className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        title="Delete Subject?"
        description="Are you sure you want to delete this subject? Notes using it will lose their subject reference."
        variant="danger"
        confirmText="Delete Subject"
      />
    </div>
  );
}
