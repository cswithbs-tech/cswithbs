"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";

interface Note {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  readTime: string;
  views: number;
  createdAt: string;
  subject: { _id: string; name: string; slug: string } | null;
  author: { _id: string; name: string; image?: string; email: string } | null;
}

interface Subject {
  _id: string;
  name: string;
  slug: string;
}

export default function NotesPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const user = session?.user as any;
  const isSuperOrAdmin = user?.roles?.some((r: string) =>
    ["ADMIN", "SUPER_ADMIN"].includes(r)
  );

  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        query,
        subject: selectedSubject,
      });
      const res = await fetch(`/api/writers-hub/notes?${params}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } else {
        showToast("Failed to load notes", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Network error while loading notes", "error");
    } finally {
      setLoading(false);
    }
  }, [page, query, selectedSubject, showToast]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    fetch("/api/writers-hub/subjects")
      .then((r) => r.json())
      .then(setSubjects)
      .catch(console.error);
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/writers-hub/notes/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n._id !== id));
        setTotal((prev) => prev - 1);
        showToast("Note deleted successfully", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to delete note", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Something went wrong", "error");
    } finally {
      setDeleting(null);
      setConfirmId(null);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "published":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "draft":
        return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      case "archived":
        return "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";
      default:
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-accent" />
            Academic Notes
          </h1>
          <p className="text-zinc-400 mt-1.5 text-sm">
            {isSuperOrAdmin
              ? `All notes across all writers — ${total} total`
              : `Your notes — ${total} total`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSuperOrAdmin && (
            <Link
              href="/writers-hub/subjects"
              className="flex items-center gap-2 text-sm text-zinc-400 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors"
            >
              <Filter className="w-4 h-4" />
              Manage Subjects
            </Link>
          )}
          <Link
            href="/writers-hub/editor?type=note"
            className="flex items-center gap-2 bg-accent text-black px-5 py-2.5 rounded-lg font-semibold hover:bg-accent/90 transition-colors shadow-[0_0_15px_rgba(0,255,157,0.25)] text-sm"
          >
            <Plus className="w-4 h-4" />
            New Note
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-zinc-900/40 border border-white/5 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search notes..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-full bg-black/40 border border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => {
            setSelectedSubject(e.target.value);
            setPage(1);
          }}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-accent/50 transition-colors cursor-pointer"
          style={{ colorScheme: 'dark' }}
        >
          <option value="" className="bg-zinc-900 text-zinc-300">All Subjects</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id} className="bg-zinc-900 text-zinc-200">
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500 gap-4">
            <FileText className="w-12 h-12 opacity-20" />
            <p className="font-medium">No notes found</p>
            <Link
              href="/writers-hub/editor?type=note"
              className="text-sm text-accent hover:underline"
            >
              Create your first note
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Note
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Subject
                  </th>
                  {isSuperOrAdmin && (
                    <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Author
                    </th>
                  )}
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-center">
                    Stats
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {notes.map((note) => {
                  const canEdit =
                    isSuperOrAdmin || note.author?._id === user?.id;
                  return (
                    <tr
                      key={note._id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="max-w-sm">
                          <div className="font-medium text-white group-hover:text-accent transition-colors line-clamp-1">
                            {note.title}
                          </div>
                          <div className="text-xs text-zinc-500 mt-1 line-clamp-1">
                            {note.excerpt}
                          </div>
                          <div className="text-[10px] text-zinc-600 font-mono mt-1">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-zinc-300 bg-white/5">
                          {note.subject?.name || "—"}
                        </span>
                      </td>
                      {isSuperOrAdmin && (
                        <td className="px-6 py-4">
                          <span className="text-sm text-zinc-400">
                            {note.author?.name || "Unknown"}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${statusColor(note.status)}`}
                        >
                          {note.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-4 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {note.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {note.readTime}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <Link
                              href={`/writers-hub/editor?id=${note._id}&type=note`}
                              className="p-2 text-zinc-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                              title="Edit Note"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                          )}
                          {canEdit && (
                            <button
                              onClick={() => setConfirmId(note._id)}
                              disabled={deleting === note._id}
                              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all disabled:opacity-50"
                              title="Delete Note"
                            >
                              {deleting === note._id ? (
                                <div className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => confirmId && handleDelete(confirmId)}
        title="Delete Note"
        description="Are you sure you want to permanently delete this note? This action cannot be undone."
        variant="danger"
        confirmText="Delete"
        isLoading={!!deleting}
      />
    </div>
  );
}
