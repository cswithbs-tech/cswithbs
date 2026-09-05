"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from "lucide-react";

export default function AddCollaborationPage() {
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [type, setType] = useState<"Poster" | "Abstract">("Poster");
  const [abstract, setAbstract] = useState("");
  const [image, setImage] = useState("");
  const [student, setStudent] = useState("");
  const [event, setEvent] = useState("");
  const [mentor, setMentor] = useState("");
  
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Auto-generate slug from title
    if (title && !slug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
  }, [title]);

  useEffect(() => {
    // Fetch users for dropdown
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users/list");
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        title,
        slug,
        type,
        abstract,
        image: type === "Poster" ? image : undefined,
        student,
        event,
        mentor,
        status: "published"
      };

      const res = await fetch("/api/collaborations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create collaboration");
      }

      router.push("/writers-hub/collaborations");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/writers-hub/collaborations" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft size={16} />
        Back to Collaborations
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Add New Work</h1>
        <p className="text-zinc-400 text-sm">Add a new student poster or abstract to the research gallery.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-[#0A0A0A] p-6 md:p-8 rounded-2xl border border-white/5">
        
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-zinc-300">Title</label>
            <input 
              required 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="e.g. Smart Grid Optimization Using Reinforcement Learning"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-300">URL Slug</label>
            <input 
              required 
              type="text" 
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="e.g. smart-grid-optimization"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-300">Type</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors appearance-none"
            >
              <option value="Poster">Poster (Image + Text)</option>
              <option value="Abstract">Abstract (Text Only)</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-zinc-300">Assign Student</label>
            {isLoadingUsers ? (
              <div className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-zinc-500 flex items-center gap-2">
                 <Loader2 size={16} className="animate-spin" /> Loading users...
              </div>
            ) : (
              <select 
                required
                value={student}
                onChange={(e) => setStudent(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
              >
                <option value="">-- Select a User --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            )}
            <p className="text-xs text-zinc-500 mt-1">This links the work directly to their public profile.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-300">Event / Conference Name</label>
            <input 
              required 
              type="text" 
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="e.g. AAISSC 2026"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-300">Mentor Name</label>
            <input 
              required 
              type="text" 
              value={mentor}
              onChange={(e) => setMentor(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
              placeholder="e.g. Dr. B. Singh"
            />
          </div>

          {type === "Poster" && (
            <div className="space-y-2 md:col-span-2 p-5 bg-white/[0.02] border border-white/5 rounded-xl border-dashed">
              <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <ImageIcon size={16} className="text-accent" />
                Poster Image URL
              </label>
              <input 
                required={type === "Poster"}
                type="url" 
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors mt-2"
                placeholder="https://..."
              />
              <p className="text-xs text-zinc-500 mt-2">Paste the URL of the uploaded image here. You can use Unsplash or your Media Library.</p>
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-bold text-zinc-300">Abstract Details</label>
            <textarea 
              required 
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              rows={8}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors resize-y"
              placeholder="Enter the full abstract or description here..."
            />
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-black font-bold rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSubmitting ? "Saving..." : "Save Collaboration"}
          </button>
        </div>

      </form>
    </div>
  );
}
