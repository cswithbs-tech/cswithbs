"use client";

import { useState } from "react";
import { Quote } from "lucide-react";

export default function CitationButton({ title, author, event }: { title: string, author: string, event: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCitation = () => {
    const citation = `${author}. "${title}." Presented at ${event}.`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopyCitation}
      className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-white font-bold text-sm transition-all"
    >
      {copied ? <span className="text-emerald-400">Citation Copied!</span> : <><Quote size={18} /> Copy Citation</>}
    </button>
  );
}
