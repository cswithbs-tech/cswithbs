import React, { useState, useEffect, useRef } from "react";
import { X, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { twMerge } from "tailwind-merge";
import Image from "next/image";

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  onUpload: (file: File) => void;
}

export const MediaLibraryModal = ({
  isOpen,
  onClose,
  onSelect,
  onUpload,
}: MediaLibraryModalProps) => {
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        setMedia(data);
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      onClose();
    }
    if (e.target.value) e.target.value = "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="text-cyan-400" /> Media Library
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <Loader2 className="animate-spin mb-2" size={24} />
              <p>Loading media...</p>
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <p>No media found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {media.map((item) => (
                <div
                  key={item._id}
                  onClick={() => {
                    onSelect(item.url);
                    onClose();
                  }}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer hover:border-cyan-500/50 hover:shadow-glow transition-all"
                >
                  <Image
                    src={item.url}
                    alt={item.filename}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-[10px] text-white truncate w-full">
                      {item.filename}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 flex justify-end">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all shadow-lg active:scale-95"
          >
            <Upload size={18} /> Upload New Image
          </button>
        </div>
      </div>
    </div>
  );
};
