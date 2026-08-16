"use client";

import { Bookmark, Share2 } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";

export function LessonActions() {
  const { showToast } = useToast();
  const notify = () => showToast("Coming soon!", "info");

  return (
    <div className="flex items-center gap-3 ml-auto">
      <button onClick={notify} className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5">
        <Bookmark className="w-3.5 h-3.5" />
        Save
      </button>
      <button onClick={notify} className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5">
        <Share2 className="w-3.5 h-3.5" />
        Share
      </button>
    </div>
  );
}
