"use client";

import { useState, useEffect } from "react";
import { Megaphone, Users, Search, Send, Clock, User as UserIcon, Link as LinkIcon, Trash2 } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { Button } from "@/app/components/ui/Button";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import Image from "next/image";
import { useSession } from "next-auth/react";

type Audience = "ALL" | "SPECIFIC";
type NotificationType = "GENERAL" | "PERSONAL" | "NEW_BLOG" | "NEW_COURSE";

export default function AnnouncementsPage() {
  const { data: session } = useSession();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"COMPOSE" | "HISTORY">("COMPOSE");
  
  // Compose State
  const [audience, setAudience] = useState<Audience>("ALL");
  const [type, setType] = useState<NotificationType>("GENERAL");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  
  // User Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // History State
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch History
  useEffect(() => {
    if (activeTab === "HISTORY") {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      if (res.ok) setHistory(data.notifications || []);
    } catch (error) {
      console.error(error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // User Search Debounce
  useEffect(() => {
    if (audience !== "SPECIFIC" || searchQuery.length < 2) return;
    
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (res.ok) setSearchResults(data.users || []);
      } catch (error) {
        console.error(error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, audience]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/announcements/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      
      showToast(data.message, "success");
      setHistory(prev => prev.filter(n => n._id !== deleteId));
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  const handleSend = async () => {
    if (audience === "SPECIFIC" && !selectedUser) {
      showToast("Please select a user first", "error");
      setShowConfirm(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          recipientId: audience === "ALL" ? "ALL" : selectedUser._id,
          title,
          message,
          link
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to broadcast");

      showToast(data.message, "success");
      
      // Reset form
      setTitle("");
      setMessage("");
      setLink("");
      setSelectedUser(null);
      setSearchQuery("");
      setShowConfirm(false);
      setActiveTab("HISTORY");
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-8 font-sans selection:bg-accent/30">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-white/10 pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-white font-display tracking-tight flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-accent" />
            Broadcasts
          </h1>
          <p className="text-sm text-zinc-400">
            Send system-wide notices, target specific users, or announce new content.
          </p>
        </div>

        <div className="flex bg-[#111111] p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setActiveTab("COMPOSE")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "COMPOSE" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            Compose
          </button>
          <button
            onClick={() => setActiveTab("HISTORY")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "HISTORY" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            History
          </button>
        </div>
      </div>

      {activeTab === "COMPOSE" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Audience Section */}
            <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative z-30">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" /> Audience
              </h3>
              
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => { setAudience("ALL"); setType("GENERAL"); }}
                  className={`flex-1 py-3 px-4 rounded-xl border font-medium transition-all ${audience === "ALL" ? "bg-accent/10 border-accent text-accent shadow-[0_0_15px_rgba(var(--color-accent),0.2)]" : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"}`}
                >
                  Global Broadcast
                </button>
                <button
                  onClick={() => { setAudience("SPECIFIC"); setType("PERSONAL"); }}
                  className={`flex-1 py-3 px-4 rounded-xl border font-medium transition-all ${audience === "SPECIFIC" ? "bg-accent/10 border-accent text-accent shadow-[0_0_15px_rgba(var(--color-accent),0.2)]" : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"}`}
                >
                  Specific User
                </button>
              </div>

              {audience === "SPECIFIC" && (
                <div className="relative">
                  {selectedUser ? (
                    <div className="flex items-center justify-between bg-black/50 border border-accent/50 rounded-xl p-3 shadow-[0_0_15px_rgba(var(--color-accent),0.1)]">
                      <div className="flex items-center gap-3">
                        <Image src={selectedUser.image || "/placeholder.jpg"} alt={selectedUser.name} width={40} height={40} className="rounded-full bg-zinc-800" />
                        <div>
                          <p className="text-sm font-bold text-white">{selectedUser.name}</p>
                          <p className="text-xs text-zinc-400">{selectedUser.email}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedUser(null)} 
                        className="text-zinc-500 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Change User"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Search user by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                  )}
                  
                  {/* Search Results Dropdown */}
                  {!selectedUser && searchResults.length > 0 && searchQuery.length >= 2 && (
                    <div className="absolute top-full mt-2 w-full bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20 max-h-60 overflow-y-auto">
                      {searchResults.map(u => (
                        <div 
                          key={u._id} 
                          onClick={() => {
                            setSelectedUser(u);
                            setSearchResults([]);
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
                        >
                          <Image src={u.image || "/placeholder.jpg"} alt={u.name} width={32} height={32} className="rounded-full bg-zinc-800" />
                          <div>
                            <p className="text-sm font-medium text-white">{u.name}</p>
                            <p className="text-xs text-zinc-500">{u.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Notification Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as NotificationType)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent appearance-none"
                >
                  <option value="GENERAL">General Alert</option>
                  <option value="PERSONAL" disabled={audience === "ALL"}>Personal Message</option>
                  <option value="NEW_BLOG">New Blog Post</option>
                  <option value="NEW_COURSE">New Course</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Subject / Title</label>
                <input
                  type="text"
                  list="title-presets"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. New Chapter Unlocked!"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                />
                
                {(type === "GENERAL" || type === "PERSONAL") && (
                  <>
                    <datalist id="title-presets">
                      <option value="System Maintenance Scheduled" />
                      <option value="Welcome to CSWITHBS!" />
                      <option value="Important Account Update" />
                      <option value="Action Required: Verification" />
                      <option value="New Feature Alert!" />
                    </datalist>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {["System Maintenance Scheduled", "Welcome to CSWITHBS!", "Important Account Update", "Action Required: Verification", "New Feature Alert!"].map(preset => (
                        <button
                          key={preset}
                          onClick={() => setTitle(preset)}
                          className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Message Body</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Action Link (Optional)</label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://cswithbs.com/..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

            <Button
              className="w-full py-4 text-base shadow-[0_0_20px_rgba(var(--color-accent),0.3)]"
              disabled={!title || !message || (audience === "SPECIFIC" && !selectedUser) || loading}
              onClick={() => setShowConfirm(true)}
            >
              <Send className="w-5 h-5 mr-2" />
              Review & Broadcast
            </Button>
          </div>

          {/* Right Column: Live Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-8">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Live Preview</h3>
              
              {/* Simulated Bell Dropdown Container */}
              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-xl p-4 relative z-10">
                  <div className="flex gap-3">
                    <div className="mt-1">
                      {type === "NEW_BLOG" ? (
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">B</div>
                      ) : type === "NEW_COURSE" ? (
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">C</div>
                      ) : type === "PERSONAL" ? (
                        <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                          <UserIcon className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                          <Megaphone className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm">
                        {title || "Notification Title"}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-3 leading-relaxed">
                        {message || "The body of your message will appear here. It supports multiple lines and looks clean."}
                      </p>
                      
                      <span className="text-[10px] text-zinc-600 block mt-2">Just now</span>

                      {link && (
                        <div className="mt-3 inline-block bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white px-3 py-1.5 rounded-lg transition-colors">
                          View details →
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "HISTORY" && (
        <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          {historyLoading ? (
            <div className="p-8 text-center text-zinc-500">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <Clock className="w-12 h-12 text-zinc-700 mb-4" />
              <p className="text-zinc-400">No broadcasts have been sent yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40">
                    <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date</th>
                    <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Type</th>
                    <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Recipient</th>
                    <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Title</th>
                    <th className="p-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.map((notif: any) => (
                    <tr key={notif._id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-sm text-zinc-400 whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full border ${
                          notif.type === "GENERAL" ? "bg-zinc-500/10 text-zinc-300 border-zinc-500/20" :
                          notif.type === "PERSONAL" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                          "bg-accent/10 text-accent border-accent/20"
                        }`}>
                          {notif.type}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        {notif.recipient ? (
                          <div className="flex items-center gap-2">
                            <Image src={notif.recipient.image || "/placeholder.jpg"} alt="" width={24} height={24} className="rounded-full" />
                            <span className="text-white">{notif.recipient.name}</span>
                          </div>
                        ) : (
                          <span className="text-accent font-medium flex items-center gap-1">
                            <Users className="w-3 h-3" /> All Users
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-white font-medium max-w-xs truncate">
                        {notif.title}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setDeleteId(notif._id)}
                          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Retract Broadcast"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleSend}
        title="Confirm Broadcast"
        description={`You are about to send this ${type.toLowerCase()} notification to ${audience === "ALL" ? "ALL registered users" : selectedUser?.name}. This action cannot be undone.`}
        confirmText="Yes, Broadcast Now"
        variant="warning"
        isLoading={loading}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Retract Broadcast"
        description="Are you sure you want to retract this notification? It will be instantly deleted from all users' notification menus."
        confirmText="Yes, Retract It"
        variant="danger"
        isLoading={loading}
      />
    </div>
  );
}
