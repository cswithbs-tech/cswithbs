"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  ExternalLink,
  Lock,
  Loader2,
  BookOpen,
  Sparkles,
  Check,
} from "lucide-react";

interface ResourceItem {
  _id?: string;
  title: string;
  type?: string;
  url: string;
  isPremium?: boolean;
}

interface NoteResourcesProps {
  resources: ResourceItem[];
  isLoggedIn: boolean;
  isPremiumUser: boolean;
  accentColor?: string;
}

export function NoteResources({
  resources,
  isLoggedIn,
  isPremiumUser,
  accentColor = "#E2C6B9",
}: NoteResourcesProps) {
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);
  const [downloadSuccessUrl, setDownloadSuccessUrl] = useState<string | null>(null);

  if (!resources || resources.length === 0) return null;

  const handleDownload = async (url: string, title: string) => {
    if (downloadingUrl) return;
    setDownloadingUrl(url);

    try {
      // Method 1: Cloudinary fl_attachment transformation
      // Inserts fl_attachment:<filename> to instruct Cloudinary to send Content-Disposition: attachment header
      if (url.includes("cloudinary.com") && url.includes("/upload/")) {
        const cleanName = encodeURIComponent(
          title.replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_{2,}/g, "_")
        );
        const downloadUrl = url.replace("/upload/", `/upload/fl_attachment:${cleanName}/`);
        
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", `${title}.pdf`);
        link.setAttribute("target", "_self");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadSuccessUrl(url);
        setTimeout(() => setDownloadSuccessUrl(null), 2500);
        return;
      }

      // Method 2: Fetch binary blob and force native browser download
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network response was not ok");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      const filename = title.toLowerCase().endsWith(".pdf") ? title : `${title}.pdf`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setDownloadSuccessUrl(url);
      setTimeout(() => setDownloadSuccessUrl(null), 2500);
    } catch (err) {
      console.warn("Direct download fallback to new window", err);
      // Fallback: open directly
      window.open(url, "_blank");
    } finally {
      setTimeout(() => setDownloadingUrl(null), 800);
    }
  };

  return (
    <div className="mt-12 mb-6">
      {/* Sleek section label */}
      <div className="flex items-center justify-between gap-3 mb-3 px-1">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-semibold tracking-wider uppercase text-zinc-300">
            Study Material {resources.length > 1 ? `(${resources.length})` : ""}
          </span>
        </div>
        <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
          Official Lesson PDF
        </span>
      </div>

      {/* Resource Strip(s) */}
      <div className="space-y-2.5">
        {resources.map((res, idx) => {
          const isDownloading = downloadingUrl === res.url;
          const isDownloaded = downloadSuccessUrl === res.url;
          const isLockedByAuth = !isLoggedIn;
          const isLockedByPremium = isLoggedIn && res.isPremium && !isPremiumUser;

          return (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 px-4 py-3 sm:py-3.5 rounded-xl bg-zinc-900/50 hover:bg-zinc-900/90 border border-white/10 hover:border-white/20 transition-all duration-200 group"
            >
              {/* Left File Metadata */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[13px] sm:text-sm font-semibold text-white truncate group-hover:text-zinc-100">
                      {res.title}
                    </h4>
                    {res.isPremium && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <Sparkles className="w-2.5 h-2.5" />
                        Premium
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                    <span className="text-red-400 font-mono font-bold uppercase text-[10px]">
                      {res.type || "PDF"}
                    </span>
                    <span>•</span>
                    <span>Download for offline exam revision</span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-1 sm:pt-0">
                {isLockedByAuth ? (
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "")}`}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-zinc-200 hover:text-white border border-white/10 flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Login to Download</span>
                  </Link>
                ) : isLockedByPremium ? (
                  <div className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Premium Only</span>
                  </div>
                ) : (
                  <>
                    {/* Preview Button (Opens in new tab) */}
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-all"
                      title="Preview PDF in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Preview</span>
                    </a>

                    {/* Download Button (Forces real file download) */}
                    <button
                      type="button"
                      onClick={() => handleDownload(res.url, res.title)}
                      disabled={isDownloading}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-black bg-accent hover:bg-accent/90 disabled:opacity-60 shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                      title="Download PDF file"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Downloading...</span>
                        </>
                      ) : isDownloaded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Downloaded</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

