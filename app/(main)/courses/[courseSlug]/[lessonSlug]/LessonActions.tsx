"use client";

import { Bookmark, Share2, Loader2 } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { useState } from "react";

export function LessonActions({ noteId, initialBookmarked }: { noteId: string, initialBookmarked: boolean }) {
  const { showToast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/notes/${noteId}/bookmark`, {
        method: "POST",
      });

      if (!res.ok) {
        if (res.status === 401) {
          showToast("Please log in to save notes.", "error");
        } else {
          showToast("Failed to save note.", "error");
        }
        return;
      }

      const data = await res.json();
      setIsBookmarked(data.isBookmarked);
      showToast(data.message, "success");
    } catch (error) {
      showToast("Something went wrong.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Link copied to clipboard!", "success");
      }
    } catch (error) {
      console.error("Error sharing", error);
    }
  };

  return (
    <div className="flex items-center gap-3 ml-auto">
      <button 
        onClick={handleSave} 
        disabled={isSaving}
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors px-3 py-1.5 rounded-lg border ${
          isBookmarked 
            ? "text-accent border-accent/20 bg-accent/10 hover:bg-accent/20" 
            : "text-zinc-500 border-transparent hover:border-white/10 hover:bg-white/5 hover:text-white"
        }`}
      >
        {isSaving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-accent" : ""}`} />
        )}
        {isBookmarked ? "Saved" : "Save"}
      </button>
      <button 
        onClick={handleShare} 
        className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5"
      >
        <Share2 className="w-3.5 h-3.5" />
        Share
      </button>
    </div>
  );
}
