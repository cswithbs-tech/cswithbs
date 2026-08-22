"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  ArrowLeft, 
  BookOpen, 
  Plus, 
  Trash2, 
  GripVertical, 
  FileText, 
  Settings, 
  Edit3,
  X
} from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";

export default function SubjectCurriculumPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params?.subjectId as string;
  const { showToast } = useToast();
  const { data: session } = useSession();

  const [subject, setSubject] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for Subject Settings (Update)
  const [showSubjectSettings, setShowSubjectSettings] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: "", description: "", level: "All Levels", alignments: "", coverImage: "", isRestricted: undefined as boolean | undefined });
  const [updatingSubject, setUpdatingSubject] = useState(false);

  // States for Chapter Creation
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [chapterForm, setChapterForm] = useState({ name: "", order: 1, description: "" });
  const [creatingChapter, setCreatingChapter] = useState(false);

  // States for Chapter Editing
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editChapterForm, setEditChapterForm] = useState({ name: "", order: 1, description: "" });
  const [updatingChapter, setUpdatingChapter] = useState(false);

  // States for Deletion
  const [confirmDeleteChapter, setConfirmDeleteChapter] = useState<string | null>(null);

  useEffect(() => {
    if (!subjectId) return;

    Promise.all([
      fetch("/api/writers-hub/subjects").then(res => res.json()),
      fetch(`/api/writers-hub/chapters?subject=${subjectId}`).then(res => res.json()),
      fetch(`/api/writers-hub/notes?subject=${subjectId}&limit=1000`).then(res => res.json())
    ])
    .then(([subjectsData, chaptersData, notesData]) => {
      const allSubjects = subjectsData.subjects || subjectsData || [];
      const foundSubject = allSubjects.find((s: any) => s._id === subjectId);
      
      if (!foundSubject) {
        showToast("Subject not found", "error");
        router.push("/writers-hub/curriculum");
        return;
      }
      setSubject(foundSubject);
      
      setChapters(chaptersData.chapters || chaptersData || []);
      setNotes(notesData.notes || []);
    })
    .catch(err => {
      console.error(err);
      showToast("Error loading curriculum", "error");
    })
    .finally(() => setLoading(false));
  }, [subjectId, router, showToast]);

  const openSubjectSettings = () => {
    setSubjectForm({
      name: subject.name || "",
      description: subject.description || "",
      level: subject.level || "All Levels",
      alignments: subject.alignments ? subject.alignments.join(", ") : "",
      coverImage: subject.coverImage || "",
      isRestricted: subject.isRestricted
    });
    setShowSubjectSettings(true);
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) return;
    setUpdatingSubject(true);
    try {
      const alignmentsArray = subjectForm.alignments.split(",").map(s => s.trim()).filter(Boolean);
      const res = await fetch(`/api/writers-hub/subjects/${subjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...subjectForm, alignments: alignmentsArray })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update");
      }
      const updated = await res.json();
      setSubject(updated);
      setShowSubjectSettings(false);
      showToast("Course settings updated", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setUpdatingSubject(false);
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterForm.name.trim()) return;
    setCreatingChapter(true);
    try {
      const res = await fetch("/api/writers-hub/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...chapterForm, subject: subjectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setChapters(prev => [...prev, data].sort((a, b) => a.order - b.order));
      setChapterForm({ name: "", order: chapters.length + 2, description: "" });
      setShowChapterForm(false);
      showToast("Module created", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setCreatingChapter(false);
    }
  };

  const openEditChapter = (chapter: any) => {
    setEditChapterForm({
      name: chapter.name,
      order: chapter.order,
      description: chapter.description || ""
    });
    setEditingChapterId(chapter._id);
  };

  const handleUpdateChapter = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editChapterForm.name.trim()) return;
    setUpdatingChapter(true);
    try {
      const res = await fetch(`/api/writers-hub/chapters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editChapterForm)
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setChapters(prev => prev.map(c => c._id === id ? updated : c).sort((a,b) => a.order - b.order));
      setEditingChapterId(null);
      showToast("Module updated", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setUpdatingChapter(false);
    }
  };

  const handleDeleteChapter = async (id: string) => {
    try {
      const res = await fetch(`/api/writers-hub/chapters/${id}`, { method: "DELETE" });
      if (res.ok) {
        setChapters(prev => prev.filter(c => c._id !== id));
        showToast("Module deleted", "success");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setConfirmDeleteChapter(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!subject) return null;

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in space-y-8">
      {/* Back button */}
      <Link 
        href="/writers-hub/curriculum"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Curriculum
      </Link>

      {/* Subject Header Banner */}
      <div className="relative bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-transparent z-10" />
        {subject.coverImage && (
          <img 
            src={subject.coverImage} 
            alt={subject.name} 
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="relative z-20 p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
          <div className="max-w-2xl">
            <div className="flex flex-wrap gap-2 mb-3">
              {subject.level && subject.level !== "All Levels" && (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-accent/20 text-accent border border-accent/30 uppercase tracking-wider">
                  {subject.level}
                </span>
              )}
              {subject.alignments?.map((tag: string, i: number) => (
                <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/80 uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">{subject.name}</h1>
            {subject.description && (
              <p className="text-zinc-300 text-sm leading-relaxed">{subject.description}</p>
            )}
          </div>
          <button 
            onClick={openSubjectSettings}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-md"
          >
            <Settings className="w-4 h-4" />
            Course Settings
          </button>
        </div>
      </div>

      {/* Modules (Chapters) List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Course Structure
            <span className="text-xs bg-white/10 text-zinc-400 px-2 py-1 rounded-full font-normal">
              {chapters.length} Modules
            </span>
          </h2>
        </div>

        <div className="space-y-4">
          {chapters.length === 0 ? (
            <div className="bg-zinc-900/40 border border-white/5 border-dashed rounded-xl p-12 text-center text-zinc-500">
              <p>No modules created yet. Add your first module below.</p>
            </div>
          ) : (
            chapters.map(chapter => {
              // Get notes belonging to this chapter
              const chapterNotes = notes.filter(n => 
                (n.chapter?._id === chapter._id || n.chapter === chapter._id)
              );

              return (
                <div key={chapter._id} className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden shadow-lg">
                  {/* Module Header / Settings Form */}
                  {editingChapterId === chapter._id ? (
                    <form onSubmit={(e) => handleUpdateChapter(e, chapter._id)} className="bg-zinc-950 p-4 border-b border-white/5">
                      <div className="flex gap-4 items-start">
                        <div>
                          <label className="text-[10px] text-zinc-500 block mb-1">Order</label>
                          <input
                            type="number"
                            value={editChapterForm.order}
                            onChange={e => setEditChapterForm(p => ({ ...p, order: parseInt(e.target.value) || 1 }))}
                            className="w-16 bg-black/40 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white focus:border-accent/50 outline-none"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-zinc-500 block mb-1">Module Name</label>
                          <input
                            type="text"
                            value={editChapterForm.name}
                            onChange={e => setEditChapterForm(p => ({ ...p, name: e.target.value }))}
                            className="w-full bg-black/40 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:border-accent/50 outline-none"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex-1 pr-4">
                           <label className="text-[10px] text-zinc-500 block mb-1">Description</label>
                           <input
                              type="text"
                              value={editChapterForm.description}
                              onChange={e => setEditChapterForm(p => ({ ...p, description: e.target.value }))}
                              className="w-full bg-black/40 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:border-accent/50 outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 mt-4 shrink-0">
                          <button
                            type="submit"
                            disabled={updatingChapter}
                            className="bg-accent text-black px-3 py-1.5 rounded text-xs font-semibold hover:bg-accent/90"
                          >
                            {updatingChapter ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingChapterId(null)}
                            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-zinc-950 p-4 border-b border-white/5 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 text-sm border border-white/5">
                          {chapter.order}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-base">{chapter.name}</h3>
                          {chapter.description && (
                            <p className="text-xs text-zinc-500 mt-0.5">{chapter.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => openEditChapter(chapter)}
                          className="p-2 text-zinc-400 hover:text-accent rounded-lg hover:bg-accent/10"
                          title="Module Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteChapter(chapter._id)}
                          className="p-2 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-red-400/10"
                          title="Delete Module"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lessons List */}
                  <div className="p-2 space-y-1">
                    {chapterNotes.length === 0 ? (
                      <div className="p-4 text-xs text-zinc-500 italic text-center">
                        No lessons in this module.
                      </div>
                    ) : (
                      chapterNotes.map(note => (
                        <div key={note._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors group/note border border-transparent hover:border-white/5">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-zinc-500 group-hover/note:text-accent transition-colors" />
                            <div>
                              <div className="text-sm text-zinc-200 group-hover/note:text-white font-medium">{note.title}</div>
                              <div className="text-[10px] text-zinc-500 flex items-center gap-2 mt-0.5">
                                <span className={`capitalize ${note.status === 'published' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                  {note.status}
                                </span>
                                <span>•</span>
                                <span>{note.author?.name || 'Unknown Author'}</span>
                              </div>
                            </div>
                          </div>
                          <Link
                            href={`/writers-hub/editor?id=${note._id}&type=note`}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white opacity-0 group-hover/note:opacity-100 transition-all rounded-lg hover:bg-white/10"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Edit Lesson
                          </Link>
                        </div>
                      ))
                    )}

                    {/* Add Lesson Button */}
                    <div className="p-2 border-t border-white/5 mt-2 pt-3">
                      <Link
                        href={`/writers-hub/editor?type=note&subject=${subject._id}&chapter=${chapter._id}`}
                        className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-accent px-3 py-2 rounded-lg hover:bg-accent/10 transition-colors w-max"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Lesson
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Add Module Form */}
          {showChapterForm ? (
            <form onSubmit={handleCreateChapter} className="bg-zinc-900 border border-accent/20 rounded-xl p-5 mt-6 shadow-[0_0_20px_rgba(0,255,157,0.05)]">
              <h3 className="text-sm font-semibold text-accent mb-4">Create New Module</h3>
              <div className="flex gap-4 items-start">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1.5">Order</label>
                  <input
                    type="number"
                    value={chapterForm.order}
                    onChange={e => setChapterForm(p => ({ ...p, order: parseInt(e.target.value) || 1 }))}
                    className="w-20 bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:border-accent/50 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-zinc-500 block mb-1.5">Module Name *</label>
                  <input
                    type="text"
                    value={chapterForm.name}
                    onChange={e => setChapterForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Introduction to Variables"
                    className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:border-accent/50 outline-none"
                    autoFocus
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="text-xs text-zinc-500 block mb-1.5">Description (Optional)</label>
                <input
                  type="text"
                  value={chapterForm.description}
                  onChange={e => setChapterForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Briefly describe what this module covers"
                  className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-white focus:border-accent/50 outline-none"
                />
              </div>
              <div className="flex items-center gap-3 mt-5">
                <button
                  type="submit"
                  disabled={creatingChapter}
                  className="bg-accent text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors"
                >
                  {creatingChapter ? "Saving..." : "Save Module"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowChapterForm(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => {
                setChapterForm({ name: "", order: chapters.length + 1, description: "" });
                setShowChapterForm(true);
              }}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900/50 border border-white/5 border-dashed rounded-xl p-4 text-zinc-400 hover:text-white hover:border-white/20 transition-colors mt-6"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium text-sm">Add New Module</span>
            </button>
          )}
        </div>
      </div>

      {/* Subject Settings Modal Overlay */}
      {showSubjectSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Course Settings</h2>
              <button 
                onClick={() => setShowSubjectSettings(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateSubject} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Course Name *</label>
                <input
                  type="text"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Description</label>
                <textarea
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-500 block mb-1.5">Level</label>
                  <select
                    value={subjectForm.level}
                    onChange={(e) => setSubjectForm((p) => ({ ...p, level: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50"
                  >
                    <option value="All Levels">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1.5">Course Access</label>
                  <select
                    value={subjectForm.isRestricted === undefined ? "default" : subjectForm.isRestricted ? "restricted" : "open"}
                    onChange={(e) => {
                      const val = e.target.value;
                      let isRestricted = undefined;
                      if (val === "restricted") isRestricted = true;
                      if (val === "open") isRestricted = false;
                      setSubjectForm(p => ({ ...p, isRestricted }));
                    }}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50"
                  >
                    <option value="default">Use Default Rules (Based on Level)</option>
                    <option value="open">Open to All (No Lock)</option>
                    <option value="restricted">Restricted (Require Profile)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Tags / Alignments</label>
                <input
                  type="text"
                  value={subjectForm.alignments}
                  onChange={(e) => setSubjectForm((p) => ({ ...p, alignments: e.target.value }))}
                  placeholder="Comma separated"
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Cover Image URL</label>
                <input
                  type="text"
                  value={subjectForm.coverImage}
                  onChange={(e) => setSubjectForm((p) => ({ ...p, coverImage: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSubjectSettings(false)}
                  className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingSubject}
                  className="bg-accent text-black px-6 py-2 rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {updatingSubject ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!confirmDeleteChapter}
        onClose={() => setConfirmDeleteChapter(null)}
        onConfirm={() => confirmDeleteChapter && handleDeleteChapter(confirmDeleteChapter)}
        title="Delete Module?"
        description="Are you sure you want to delete this module? This action cannot be undone."
        variant="danger"
        confirmText="Delete Module"
      />
    </div>
  );
}
