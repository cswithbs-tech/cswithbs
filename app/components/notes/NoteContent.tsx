"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { NoteHtmlRenderer } from "./NoteHtmlRenderer";
import { NoteJsonRenderer } from "./NoteJsonRenderer";
import { NOTE_PROSE_STYLES } from "./noteStyles";
import "./note.css"; // Isolated styles for notes

interface NoteContentProps {
  content: string; // HTML Fallback
  contentJson?: any; // Kept for compatibility but ignored for rendering
  showHeadingAnchors?: boolean;
}

export const NoteContent = ({
  content,
  contentJson,
  showHeadingAnchors = true,
}: NoteContentProps) => {
  /* ---------------------------------------------------------------------------
   * TYPOGRAPHY SYSTEM (Medium-Style Editorial Theme)
   * Now handled centrally via NOTE_PROSE_STYLES and editor.css
   * --------------------------------------------------------------------------- */
  const PROSE_STYLES = NOTE_PROSE_STYLES;

  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const handleImageClick = (src: string) => {
    setZoomImage(src);
  };

  /* --------------------------------------------------------------------------------
   * UNIFIED RENDER
   * -------------------------------------------------------------------------------- */
  return (
    <>
      <div className={PROSE_STYLES}>
        {contentJson ? (
          <div className="cswithbs-components outline-none">
            <NoteJsonRenderer 
              content={contentJson} 
              onImageClick={handleImageClick} 
            />
          </div>
        ) : (
          <NoteHtmlRenderer
            content={content}
            className="cswithbs-components outline-none"
            onImageClick={handleImageClick}
            showHeadingAnchors={showHeadingAnchors}
          />
        )}
      </div>

      {/* Shared Image Zoom Modal */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomImage(null)}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          >
            <button
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              onClick={() => setZoomImage(null)}
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={zoomImage ?? undefined}
              alt="Zoomed"
              className="max-w-full max-h-full rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
