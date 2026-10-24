import { useState, useEffect, useRef } from "react";
import { X, Link2 } from "lucide-react";
import { Editor } from "@tiptap/react";

interface ImageUrlModalProps {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageUrlModal = ({
  editor,
  isOpen,
  onClose,
}: ImageUrlModalProps) => {
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen || !editor) return null;

  const handleSave = () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    let finalUrl = trimmed;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = "https://" + finalUrl;
    }

    editor.chain().focus().setImage({ src: finalUrl }).run();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-white/10 p-6 rounded-2xl w-[440px] max-w-[90vw] shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
            <Link2 size={18} />
          </span>
          Insert Image from URL
        </h3>
        <p className="text-xs text-zinc-400 mb-5">
          Paste the direct web link to any image (JPEG, PNG, WebP, GIF, SVG).
        </p>

        <div className="space-y-4">
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              } else if (e.key === "Escape") {
                onClose();
              }
            }}
            placeholder="https://example.com/photo.jpg"
            className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!url.trim()}
              className="px-5 py-2 text-sm bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-600/20"
            >
              Insert Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
