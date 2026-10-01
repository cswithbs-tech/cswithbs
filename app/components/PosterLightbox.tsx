"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, Maximize, MousePointer2 } from "lucide-react";

export function PosterLightbox({ src, alt }: { src: string; alt: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleZoomIn = (e?: React.MouseEvent) => { e?.stopPropagation(); setScale(s => Math.min(s + 0.25, 4)); };
  const handleZoomOut = (e?: React.MouseEvent) => { e?.stopPropagation(); setScale(s => Math.max(s - 0.25, 0.5)); };
  const handleReset = (e?: React.MouseEvent) => { e?.stopPropagation(); setScale(1); setPos({ x: 0, y: 0 }); };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  return (
    <>
      <div 
        className="relative group cursor-pointer w-full flex items-center justify-center rounded-[2rem] border border-white/5 bg-white/[0.02] p-2 md:p-4 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        onClick={() => setIsOpen(true)}
      >
        <img 
          src={src} 
          alt={alt}
          className="w-full h-auto max-h-[70vh] object-contain rounded-[1.5rem] transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2rem] flex items-center justify-center pointer-events-none">
          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-white font-bold flex items-center gap-2 border border-white/20 shadow-xl">
             <ZoomIn size={18} />
             View Full Poster
          </div>
        </div>
      </div>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex flex-col bg-[#050505] animate-in fade-in duration-200">
          
          {/* Header Controls */}
          <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-[99999] bg-gradient-to-b from-[#050505] to-transparent">
             <div className="text-white/50 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
                <MousePointer2 size={14} /> Drag to pan &bull; Scroll to zoom
             </div>
             <button 
               onClick={() => { setIsOpen(false); handleReset(); }}
               className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white transition-all shadow-xl"
             >
               <X size={24} />
             </button>
          </div>
          
          {/* Main Image Area */}
          <div 
            className="flex-1 w-full overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={(e) => {
               if(e.deltaY < 0) {
                 setScale(s => Math.min(s + 0.1, 4));
               } else {
                 setScale(s => Math.max(s - 0.1, 0.5));
               }
            }}
          >
            <img 
              src={src} 
              alt={alt}
              draggable={false}
              className="max-w-[90vw] max-h-[85vh] object-contain shadow-2xl"
              style={{
                 transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                 transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
            />
          </div>

          {/* Floating Toolbar */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[99999] flex items-center gap-2 bg-[#111] border border-white/10 p-2 rounded-2xl shadow-2xl backdrop-blur-xl">
             <button onClick={handleZoomOut} className="p-3 hover:bg-white/10 rounded-xl text-white transition-colors"><ZoomOut size={20} /></button>
             <div className="px-4 text-sm font-bold text-zinc-400 min-w-[4rem] text-center">{Math.round(scale * 100)}%</div>
             <button onClick={handleZoomIn} className="p-3 hover:bg-white/10 rounded-xl text-white transition-colors"><ZoomIn size={20} /></button>
             <div className="w-[1px] h-8 bg-white/10 mx-2"></div>
             <button onClick={handleReset} className="p-3 hover:bg-white/10 rounded-xl text-white transition-colors"><Maximize size={20} /></button>
          </div>

        </div>,
        document.body
      )}
    </>
  );
}
