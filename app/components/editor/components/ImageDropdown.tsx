"use client";

import React, { useState, useRef, useEffect } from "react";
import { Editor } from "@tiptap/react";
import { Image as ImageIcon, Images, Upload, Link2 } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { ImageUrlModal } from "./ImageUrlModal";

interface ImageDropdownProps {
  editor: Editor | null;
  onImageUpload?: (file: File) => Promise<string>;
  size?: number;
  className?: string;
}

export const ImageDropdown = ({
  editor,
  onImageUpload,
  size = 20,
  className,
}: ImageDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!editor) return null;

  const handleMediaLibraryClick = () => {
    setIsOpen(false);
    window.dispatchEvent(new Event("open-media-modal"));
  };

  const handleUploadClick = () => {
    setIsOpen(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      await onImageUpload(file);
    }
    if (e.target.value) e.target.value = "";
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Image Options"
        className={twMerge(
          "p-2 rounded-lg transition-all text-gray-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-sm active:scale-95",
          (isOpen || editor.isActive("image")) &&
            "bg-yellow-400 text-black shadow-glow font-semibold",
          className,
        )}
      >
        <ImageIcon size={size} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 min-w-[280px] flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* 1. Media Library */}
          <button
            type="button"
            onClick={handleMediaLibraryClick}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all text-left w-full group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Images size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-100 group-hover:text-white">
                Media Library
              </span>
              <span className="text-[11px] text-zinc-400 group-hover:text-zinc-300 font-normal leading-tight">
                Reuse uploaded or select existing
              </span>
            </div>
          </button>

          {/* 2. Upload from Computer */}
          <button
            type="button"
            onClick={handleUploadClick}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all text-left w-full group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Upload size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-100 group-hover:text-white">
                Upload from Computer
              </span>
              <span className="text-[11px] text-zinc-400 group-hover:text-zinc-300 font-normal leading-tight">
                Upload image file from device
              </span>
            </div>
          </button>

          {/* 3. Insert from URL */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsUrlModalOpen(true);
            }}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all text-left w-full group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Link2 size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-100 group-hover:text-white">
                Insert from URL
              </span>
              <span className="text-[11px] text-zinc-400 group-hover:text-zinc-300 font-normal leading-tight">
                Paste an external image link
              </span>
            </div>
          </button>
        </div>
      )}

      {/* URL Input Modal */}
      <ImageUrlModal
        editor={editor}
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
      />
    </div>
  );
};
