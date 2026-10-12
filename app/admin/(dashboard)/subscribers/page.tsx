"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  Download,
  Trash2,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  UserPlus,
  RefreshCw,
  X,
  Globe,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  ShieldCheck,
  Filter,
} from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import { Button } from "@/app/components/ui/Button";

interface Subscriber {
  _id: string;
  email: string;
  active?: boolean;
  source?: string;
  createdAt: string;
}

interface StatsData {
  total: number;
  active: number;
  inactive: number;
  registeredUsers: number;
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiltered, setTotalFiltered] = useState(0);

  const [stats, setStats] = useState<StatsData>({
    total: 0,
    active: 0,
    inactive: 0,
    registeredUsers: 0,
  });

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newSource, setNewSource] = useState("admin-manual");
  const [isAdding, setIsAdding] = useState(false);

  const [confirmSyncOpen, setConfirmSyncOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [confirmData, setConfirmData] = useState<{
    id: string;
    email: string;
  } | null>(null);

  const { showToast } = useToast() || { showToast: console.log };

  // Fetch Subscribers with pagination, search, and status filters
  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchTerm.trim()) {
        params.append("q", searchTerm.trim());
      }
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (sourceFilter !== "all") {
        params.append("source", sourceFilter);
      }

      const res = await fetch(`/api/admin/subscribers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        // Support both paginated structure and legacy array fallback
        if (data.subscribers) {
          setSubscribers(data.subscribers);
          setTotalPages(data.pagination.totalPages || 1);
          setTotalFiltered(data.pagination.total || 0);
          if (data.stats) {
            setStats(data.stats);
          }
        } else if (Array.isArray(data)) {
          setSubscribers(data);
          setTotalFiltered(data.length);
          setTotalPages(Math.ceil(data.length / limit) || 1);
        }
      } else {
        showToast("Failed to load subscribers", "error");
      }
    } catch (error) {
      console.error("Failed to fetch subscribers", error);
      showToast("Network error loading subscribers", "error");
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, statusFilter, sourceFilter, showToast]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  // Debounced search reset to page 1
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, sourceFilter, limit]);

  // Handle Sync Registered Users into Subscriber DB
  const handleSyncUsers = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/admin/subscribers/sync", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message || "Registered users synced successfully!", "success");
        setConfirmSyncOpen(false);
        fetchSubscribers();
      } else {
        showToast(data.error || "Failed to sync registered users", "error");
      }
    } catch (e) {
      showToast("Network error syncing users", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle Active/Inactive state
  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentActive }),
      });

      if (res.ok) {
        setSubscribers((prev) =>
          prev.map((s) => (s._id === id ? { ...s, active: !currentActive } : s))
        );
        setStats((prev) => ({
          ...prev,
          active: !currentActive ? prev.active + 1 : prev.active - 1,
          inactive: !currentActive ? prev.inactive - 1 : prev.inactive + 1,
        }));
        showToast(
          `Subscriber marked as ${!currentActive ? "Active" : "Inactive"}`,
          "success"
        );
      } else {
        showToast("Failed to update status", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  };

  // Manually Add Subscriber
  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail.trim(),
          source: newSource || "admin-manual",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Subscriber added to audience!", "success");
        setNewEmail("");
        setShowAddModal(false);
        fetchSubscribers();
      } else {
        showToast(data.error || "Failed to add subscriber", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setIsAdding(false);
    }
  };

  // Delete Subscriber
  const handleDelete = (id: string, email: string) => {
    setConfirmData({ id, email });
  };

  const executeDelete = async () => {
    if (!confirmData) return;

    try {
      const res = await fetch(`/api/admin/subscribers?id=${confirmData.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Subscriber removed", "success");
        fetchSubscribers();
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      showToast("Failed to remove subscriber", "error");
    } finally {
      setConfirmData(null);
    }
  };

  // Export full CSV (fetches all without pagination)
  const exportCSV = async () => {
    try {
      showToast("Preparing CSV export...", "info");
      const res = await fetch("/api/admin/subscribers?export=true");
      if (!res.ok) throw new Error("Failed to export");

      const allData: Subscriber[] = await res.json();

      const headers = ["ID,Email,Source,Status,Joined Date"];
      const rows = allData.map(
        (s) =>
          `"${s._id}","${s.email}","${s.source || "homepage"}","${
            s.active !== false ? "Active" : "Unsubscribed"
          }","${new Date(s.createdAt).toISOString()}"`
      );

      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `cswithbs_subscribers_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Exported ${allData.length} subscribers!`, "success");
    } catch {
      showToast("Failed to export CSV", "error");
    }
  };

  // Source Badge Helper
  const renderSourceBadge = (source = "homepage") => {
    switch (source) {
      case "registered-user":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <UserCheck size={12} className="text-indigo-400" />
            Registered User
          </span>
        );
      case "blog":
      case "blog-post":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileText size={12} className="text-emerald-400" />
            Blog Post
          </span>
        );
      case "courses":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BookOpen size={12} className="text-amber-400" />
            Courses Page
          </span>
        );
      case "admin-manual":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldCheck size={12} className="text-purple-400" />
            Admin Added
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
            <Globe size={12} className="text-zinc-400" />
            Homepage
          </span>
        );
    }
  };

  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalFiltered);

  return (
    <div className="p-6 md:p-8 w-full space-y-6 animate-fade-in font-sans min-h-screen max-w-7xl mx-auto">
      {/* 1. Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1.5 flex items-center gap-3">
            <Mail size={32} className="text-amber-500" />
            Subscribers & Audience
          </h1>
          <p className="text-zinc-400 text-sm">
            Manage your newsletter audience (
            <span className="text-amber-400 font-semibold">{stats.active} active</span> /{" "}
            {stats.total} total)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sync Registered Users Button */}
          <button
            onClick={() => setConfirmSyncOpen(true)}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-500/30 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 shadow-sm hover:border-amber-500/50"
            title="Import registered user accounts into subscribers without duplicates"
          >
            {isSyncing ? (
              <Loader2 size={16} className="animate-spin text-amber-400" />
            ) : (
              <RefreshCw size={16} className="text-amber-400" />
            )}
            Sync Registered Users
          </button>

          {/* Add Subscriber Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm px-4 py-2 rounded-xl transition-all active:scale-95 shadow-md shadow-amber-500/10"
          >
            <UserPlus size={16} /> Add Subscriber
          </button>

          {/* Export CSV Button */}
          <button
            onClick={exportCSV}
            disabled={loading || stats.total === 0}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-3.5 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Audience */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4.5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono text-zinc-500">Total Audience</span>
            <Users size={16} className="text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats.total}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Total email subscribers</p>
        </div>

        {/* Active Subscribers */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4.5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono text-emerald-400/80">Active</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{stats.active}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Ready to receive newsletters</p>
        </div>

        {/* Inactive Subscribers */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4.5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono text-zinc-400">Unsubscribed</span>
            <XCircle size={16} className="text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-400 font-mono">{stats.inactive}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Opted out from emails</p>
        </div>

        {/* Registered Users in DB */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4.5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono text-indigo-400/80">Registered Users</span>
            <UserCheck size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 font-mono">
            {stats.registeredUsers}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Platform account holders</p>
        </div>
      </div>

      {/* 3. Search, Filters, and Per-Page Controls Row */}
      <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
            size={16}
          />
          <input
            type="text"
            placeholder="Search subscriber emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-sm text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-amber-500/50 w-full transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right: Filters & Page Size Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Tabs */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === "active"
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === "inactive"
                  ? "bg-zinc-800 text-zinc-300"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Inactive ({stats.inactive})
            </button>
          </div>

          {/* Rows per page selector (10, 20, 50, 100) */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg">
            <span>Show:</span>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="10" className="bg-zinc-900 text-white">10</option>
              <option value="20" className="bg-zinc-900 text-white">20</option>
              <option value="50" className="bg-zinc-900 text-white">50</option>
              <option value="100" className="bg-zinc-900 text-white">100</option>
            </select>
            <span>per page</span>
          </div>
        </div>
      </div>

      {/* 4. Subscribers Table */}
      <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-950/70 text-zinc-400 text-xs uppercase tracking-wider font-mono">
            <tr>
              <th className="px-6 py-4 font-medium">Email Address</th>
              <th className="px-6 py-4 font-medium">Source</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Joined Date</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-16 text-center">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
                  <p className="text-zinc-400 text-sm">Loading subscribers...</p>
                </td>
              </tr>
            ) : subscribers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-16 text-center">
                  <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-300 text-lg font-medium">
                    No subscribers found
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">
                    {searchTerm
                      ? `No subscribers matched "${searchTerm}".`
                      : "Click 'Sync Registered Users' or 'Add Subscriber' to grow your audience!"}
                  </p>
                </td>
              </tr>
            ) : (
              subscribers.map((sub) => {
                const isActive = sub.active !== false;
                return (
                  <tr
                    key={sub._id}
                    className="group hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold uppercase text-xs shrink-0">
                          {sub.email.substring(0, 2)}
                        </div>
                        <span className="text-zinc-200 font-medium font-mono text-sm truncate max-w-xs md:max-w-md">
                          {sub.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderSourceBadge(sub.source)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(sub._id, isActive)}
                        title="Click to toggle Active / Inactive"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
                        }`}
                      >
                        {isActive ? (
                          <>
                            <CheckCircle2 size={12} />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle size={12} />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-zinc-500" />
                        {new Date(sub.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(sub._id, sub.email)}
                        className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                        title="Remove Subscriber"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* 5. Pagination Controls Footer */}
        {!loading && totalFiltered > 0 && (
          <div className="bg-zinc-950/50 border-t border-zinc-800/80 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
            <div>
              Showing <span className="text-white font-mono">{startIndex}</span> to{" "}
              <span className="text-white font-mono">{endIndex}</span> of{" "}
              <span className="text-white font-mono">{totalFiltered}</span> subscribers
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1 font-mono">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-zinc-600">...</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                          page === p
                            ? "bg-amber-500 text-black"
                            : "hover:bg-zinc-900 text-zinc-300"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-300"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Sync Registered Users Modal */}
      <ConfirmDialog
        isOpen={confirmSyncOpen}
        onClose={() => setConfirmSyncOpen(false)}
        onConfirm={handleSyncUsers}
        title="Sync Registered Users into Subscribers?"
        description={`This will scan all ${stats.registeredUsers} registered user accounts in the database and automatically add any missing users into your newsletter audience. Existing subscribers will NOT be duplicated.`}
        variant="info"
        confirmText={isSyncing ? "Syncing..." : "Sync All Users Now"}
      />

      {/* 7. Add Subscriber Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Add Subscriber</h3>
                  <p className="text-xs text-zinc-400">
                    Manually add an email to the newsletter audience.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddSubscriber} className="space-y-4 my-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                    Source Tag
                  </label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="admin-manual">Admin Manual</option>
                    <option value="registered-user">Registered User</option>
                    <option value="homepage">Homepage</option>
                    <option value="blog">Blog</option>
                    <option value="courses">Courses</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowAddModal(false)}
                    disabled={isAdding}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isAdding || !newEmail.trim()}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-semibold"
                  >
                    {isAdding ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin" /> Adding...
                      </span>
                    ) : (
                      "Add to Audience"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirmData}
        onClose={() => setConfirmData(null)}
        onConfirm={executeDelete}
        title="Remove Subscriber?"
        description={`Are you sure you want to remove ${confirmData?.email} from the audience?`}
        variant="danger"
        confirmText="Remove"
      />
    </div>
  );
}
