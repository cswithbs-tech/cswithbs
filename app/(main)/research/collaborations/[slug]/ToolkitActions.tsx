"use client";

import { Linkedin, Download, Quote } from "lucide-react";
import { useState, useEffect } from "react";

export default function ToolkitActions({ title, author, event, image }: { title: string, author: string, event: string, image?: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const handleCopyCitation = () => {
    const citation = `${author}. "${title}." Presented at ${event}.`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (url) {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=600');
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-[#0077b5] hover:bg-[#006396] text-white font-bold text-sm transition-all shadow-lg">
          <Linkedin size={18} />
          Share on LinkedIn
        </button>
        
        <button onClick={handleCopyCitation} className="flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl border border-white/10 hover:bg-white/5 text-white font-bold text-sm transition-all shadow-lg">
          {copied ? <span className="text-emerald-400">Citation Copied!</span> : <><Quote size={18} /> Copy Citation</>}
        </button>
      </div>
      
      {image && (
        <div className="pt-4 mt-2">
          <a href={image} download target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-sm transition-all shadow-lg">
            <Download size={18} />
            Download Original Artifact
          </a>
        </div>
      )}
    </>
  );
}
