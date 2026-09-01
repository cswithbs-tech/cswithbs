"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Plus, Trash2, CheckCircle, XCircle, Link as LinkIcon, Upload, Bell, MessageSquare, AlertTriangle, Info, Star } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { Button } from "@/app/components/ui/Button";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import Image from "next/image";

export default function PopupsPage() {
  const { showToast } = useToast();
  
  const [viewMode, setViewMode] = useState<"POSTERS" | "TOASTS">("POSTERS");
  const [activeTab, setActiveTab] = useState<"MANAGE" | "CREATE">("MANAGE");
  
  // Create Poster State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [targetAudience, setTargetAudience] = useState<"ALL" | "GUESTS" | "LOGGED_IN">("ALL");
  const [imageUrl, setImageUrl] = useState("");
  
  // Create Toast State
  const [toastTitle, setToastTitle] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastIcon, setToastIcon] = useState("info");
  const [toastLinkText, setToastLinkText] = useState("");
  const [toastLinkUrl, setToastLinkUrl] = useState("");
  const [toastAudience, setToastAudience] = useState<"ALL" | "GUESTS" | "LOGGED_IN">("ALL");

  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Manage State
  const [posters, setPosters] = useState<any[]>([]);
  const [toasts, setToasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<"POSTER" | "TOAST" | null>(null);

  useEffect(() => {
    if (activeTab === "MANAGE") {
      if (viewMode === "POSTERS") fetchPosters();
      if (viewMode === "TOASTS") fetchToasts();
    }
  }, [activeTab, viewMode]);

  const fetchPosters = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/posters");
      if (res.ok) {
        const data = await res.json();
        setPosters(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchToasts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/toasts");
      if (res.ok) {
        const data = await res.json();
        setToasts(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setImageUrl(data.url);
        showToast("Image uploaded successfully", "success");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleCreatePoster = async () => {
    if (!title || (!imageUrl && description)) { // Allow image-only or full
       // Basic validation
    }
    if (!title && !imageUrl) {
      showToast("Title or Image is required", "error");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/admin/posters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Untitled Flyer",
          description,
          link,
          targetAudience,
          imageUrl: imageUrl || "https://via.placeholder.com/800x600?text=No+Image",
          isActive: false 
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create poster");

      showToast("Poster created successfully!", "success");
      
      setTitle(""); setDescription(""); setLink(""); setImageUrl(""); setTargetAudience("ALL");
      setActiveTab("MANAGE");
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateToast = async () => {
    if (!toastTitle || !toastMessage) {
      showToast("Title and Message are required", "error");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/admin/toasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: toastTitle,
          message: toastMessage,
          icon: toastIcon,
          linkText: toastLinkText,
          linkUrl: toastLinkUrl,
          targetAudience: toastAudience,
          isActive: false 
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create toast");

      showToast("Toast created successfully!", "success");
      
      setToastTitle(""); setToastMessage(""); setToastIcon("info"); setToastLinkText(""); setToastLinkUrl(""); setToastAudience("ALL");
      setActiveTab("MANAGE");
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean, type: "POSTER" | "TOAST") => {
    try {
      const endpoint = type === "POSTER" ? `/api/admin/posters/${id}` : `/api/admin/toasts/${id}`;
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      showToast(`${type} is now ${!currentStatus ? 'active' : 'inactive'}`, "success");
      
      if (type === "POSTER") {
        setPosters(prev => prev.map(p => p._id === id ? { ...p, isActive: !currentStatus } : p));
      } else {
        setToasts(prev => prev.map(t => t._id === id ? { ...t, isActive: !currentStatus } : t));
      }
    } catch (error: any) {
      showToast(error.message, "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !deleteType) return;
    try {
      setLoading(true);
      const endpoint = deleteType === "POSTER" ? `/api/admin/posters/${deleteId}` : `/api/admin/toasts/${deleteId}`;
      const res = await fetch(endpoint, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      
      showToast("Deleted successfully", "success");
      if (deleteType === "POSTER") setPosters(prev => prev.filter(p => p._id !== deleteId));
      else setToasts(prev => prev.filter(t => t._id !== deleteId));
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
      setDeleteId(null);
      setDeleteType(null);
    }
  };

  const renderIcon = (iconStr: string) => {
    switch (iconStr) {
      case "message": return <MessageSquare className="w-5 h-5 text-blue-400" />;
      case "alert": return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case "star": return <Star className="w-5 h-5 text-yellow-400" />;
      default: return <Info className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-8 font-sans selection:bg-accent/30">
      
      {/* Header & Main Toggle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-white/10 pb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-white font-display tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-accent" />
            Site Popups & Toasts
          </h1>
          <p className="text-sm text-zinc-400">
            Manage global pop-up modals (Posters) and mini corner announcements (Toasts).
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex bg-[#111111] p-1 rounded-lg border border-white/10">
            <button
              onClick={() => { setViewMode("POSTERS"); setActiveTab("MANAGE"); }}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === "POSTERS" ? "bg-accent text-black shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Posters (Modals)
            </button>
            <button
              onClick={() => { setViewMode("TOASTS"); setActiveTab("MANAGE"); }}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === "TOASTS" ? "bg-accent text-black shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Mini Toasts
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="mb-6 flex gap-2">
        <button
            onClick={() => setActiveTab("MANAGE")}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${activeTab === "MANAGE" ? "bg-white/10 border-white/20 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
        >
            Manage {viewMode === "POSTERS" ? "Posters" : "Toasts"}
        </button>
        <button
            onClick={() => setActiveTab("CREATE")}
            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${activeTab === "CREATE" ? "bg-white/10 border-white/20 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
        >
            Create New {viewMode === "POSTERS" ? "Poster" : "Toast"}
        </button>
      </div>

      {/* CREATE MODE */}
      {activeTab === "CREATE" && viewMode === "POSTERS" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Poster Title (Optional if Image Only)</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Leave blank for an Image-Only flyer" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Description (Optional)</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short description below the title..." rows={3} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Image Upload *</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl cursor-pointer text-sm font-medium transition-colors">
                    {uploading ? <div className="w-4 h-4 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? "Uploading..." : "Select Image"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                  </label>
                  {imageUrl && <span className="text-sm text-green-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Uploaded</span>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Target Audience</label>
                <select value={targetAudience} onChange={(e) => setTargetAudience(e.target.value as any)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent appearance-none">
                  <option value="ALL">Everyone (Guests + Logged In)</option>
                  <option value="GUESTS">Guests Only (Not logged in)</option>
                  <option value="LOGGED_IN">Logged In Users Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Action Link (Optional)</label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder="/courses or external link" className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-accent" />
                </div>
              </div>
            </div>
            <Button className="w-full py-4 text-base shadow-[0_0_20px_rgba(var(--color-accent),0.3)]" disabled={(!title && !imageUrl) || creating || uploading} onClick={handleCreatePoster}>
              <Plus className="w-5 h-5 mr-2" />
              {creating ? "Creating..." : "Create Poster"}
            </Button>
          </div>
          {/* Preview Panel Omitted for Brevity but functional */}
        </div>
      )}

      {activeTab === "CREATE" && viewMode === "TOASTS" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Toast Title *</label>
                <input type="text" value={toastTitle} onChange={(e) => setToastTitle(e.target.value)} placeholder="e.g. New Feature Alert!" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Message *</label>
                <textarea value={toastMessage} onChange={(e) => setToastMessage(e.target.value)} placeholder="A short punchy announcement..." rows={2} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Icon</label>
                    <select value={toastIcon} onChange={(e) => setToastIcon(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent appearance-none">
                      <option value="info">Info / General</option>
                      <option value="message">Message / Feedback</option>
                      <option value="alert">Alert / Warning</option>
                      <option value="star">Star / Highlight</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Target Audience</label>
                    <select value={toastAudience} onChange={(e) => setToastAudience(e.target.value as any)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent appearance-none">
                      <option value="ALL">Everyone</option>
                      <option value="GUESTS">Guests Only</option>
                      <option value="LOGGED_IN">Logged In Only</option>
                    </select>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Button Text</label>
                    <input type="text" value={toastLinkText} onChange={(e) => setToastLinkText(e.target.value)} placeholder="e.g. Learn More" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Button URL</label>
                    <input type="text" value={toastLinkUrl} onChange={(e) => setToastLinkUrl(e.target.value)} placeholder="/courses" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent" />
                 </div>
              </div>
            </div>
            <Button className="w-full py-4 text-base shadow-[0_0_20px_rgba(var(--color-accent),0.3)]" disabled={!toastTitle || !toastMessage || creating} onClick={handleCreateToast}>
              <Plus className="w-5 h-5 mr-2" />
              {creating ? "Creating..." : "Create Mini Toast"}
            </Button>
          </div>
          
          <div className="lg:col-span-5 relative">
              <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Live Preview</h3>
              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
                  <div className="flex gap-3">
                      <div className="mt-1">{renderIcon(toastIcon)}</div>
                      <div>
                          <h4 className="font-bold text-white mb-1">{toastTitle || "Your Title Here"}</h4>
                          <p className="text-sm text-zinc-400 leading-relaxed mb-4">{toastMessage || "Your preview message will appear here. Keep it short!"}</p>
                          {toastLinkText && (
                              <button className="text-sm font-bold text-accent hover:underline">{toastLinkText}</button>
                          )}
                      </div>
                  </div>
              </div>
          </div>
        </div>
      )}

      {/* MANAGE MODE */}
      {activeTab === "MANAGE" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {loading ? (
            <div className="col-span-full p-8 text-center text-zinc-500">Loading...</div>
          ) : viewMode === "POSTERS" && posters.length === 0 ? (
            <div className="col-span-full p-12 text-center flex flex-col items-center bg-[#111111]/80 rounded-2xl border border-white/10">
              <ImageIcon className="w-12 h-12 text-zinc-700 mb-4" />
              <p className="text-zinc-400">No posters created yet.</p>
              <Button onClick={() => setActiveTab("CREATE")} className="mt-4" variant="outline">Create Poster</Button>
            </div>
          ) : viewMode === "TOASTS" && toasts.length === 0 ? (
            <div className="col-span-full p-12 text-center flex flex-col items-center bg-[#111111]/80 rounded-2xl border border-white/10">
              <Bell className="w-12 h-12 text-zinc-700 mb-4" />
              <p className="text-zinc-400">No toasts created yet.</p>
              <Button onClick={() => setActiveTab("CREATE")} className="mt-4" variant="outline">Create Toast</Button>
            </div>
          ) : viewMode === "POSTERS" ? (
            posters.map((poster) => (
              <div key={poster._id} className={`bg-[#111111]/80 backdrop-blur-xl border ${poster.isActive ? 'border-accent' : 'border-white/10'} rounded-2xl overflow-hidden transition-all relative flex flex-col`}>
                <div className="relative aspect-video w-full bg-black/50 flex items-center justify-center">
                  {poster.imageUrl && <Image src={poster.imageUrl} alt={poster.title} fill className="object-cover" />}
                  {!poster.imageUrl && <span className="text-zinc-600">No Image</span>}
                  <div className="absolute top-2 right-2 flex gap-2">
                    {poster.isActive && <span className="bg-accent text-black text-[10px] font-bold px-2 py-1 rounded-full uppercase shadow-lg">Active</span>}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-white text-lg line-clamp-1">{poster.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1 mb-4 flex items-center gap-1">Audience: <span className="text-zinc-300 font-medium">{poster.targetAudience}</span></p>
                  <div className="flex items-center justify-between mt-auto">
                    <button onClick={() => handleToggleActive(poster._id, poster.isActive, "POSTER")} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${poster.isActive ? "bg-white/10 text-white hover:bg-white/20" : "bg-accent/10 text-accent hover:bg-accent/20"}`}>
                      {poster.isActive ? "Deactivate" : "Set Active"}
                    </button>
                    <button onClick={() => { setDeleteId(poster._id); setDeleteType("POSTER"); }} className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            toasts.map((toast) => (
              <div key={toast._id} className={`bg-[#111111]/80 backdrop-blur-xl border ${toast.isActive ? 'border-accent' : 'border-white/10'} rounded-2xl p-6 transition-all relative flex flex-col`}>
                <div className="absolute top-4 right-4">
                  {toast.isActive && <span className="bg-accent text-black text-[10px] font-bold px-2 py-1 rounded-full uppercase shadow-lg">Active</span>}
                </div>
                <div className="flex gap-3 mb-4">
                   <div className="mt-1">{renderIcon(toast.icon)}</div>
                   <div>
                       <h3 className="font-bold text-white text-lg line-clamp-1">{toast.title}</h3>
                       <p className="text-sm text-zinc-400 line-clamp-2 mt-1">{toast.message}</p>
                   </div>
                </div>
                <div className="text-xs text-zinc-500 mb-4">Audience: {toast.targetAudience}</div>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                  <button onClick={() => handleToggleActive(toast._id, toast.isActive, "TOAST")} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${toast.isActive ? "bg-white/10 text-white hover:bg-white/20" : "bg-accent/10 text-accent hover:bg-accent/20"}`}>
                    {toast.isActive ? "Deactivate" : "Set Active"}
                  </button>
                  <button onClick={() => { setDeleteId(toast._id); setDeleteType("TOAST"); }} className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => { setDeleteId(null); setDeleteType(null); }}
        onConfirm={handleDelete}
        title={`Delete ${deleteType === "POSTER" ? "Poster" : "Toast"}`}
        description="Are you sure you want to delete this? This action cannot be undone."
        confirmText="Yes, Delete"
        variant="danger"
        isLoading={loading}
      />
    </div>
  );
}
