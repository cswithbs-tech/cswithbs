"use client";

import { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Upload, Trash2, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { Button } from "@/app/components/ui/Button";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import Image from "next/image";

export default function AdminGalleryPage() {
  const { showToast } = useToast();
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/gallery?admin=true");
      if (res.ok) {
        const data = await res.json();
        setGallery(data);
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to load gallery items", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image must be less than 5MB", "error");
        return;
      }
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
      setIsModalOpen(true);
    }
    if (e.target.value) e.target.value = "";
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    
    try {
      setIsUploading(true);
      
      // 1. Upload to Cloudinary via our API
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("folder", "gallery"); // Put it in the gallery folder!
      
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");
      
      // 2. Save to Gallery Model
      const galleryRes = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: uploadData.url,
          publicId: uploadData.public_id,
          title: title.trim(),
          description: description.trim(),
        }),
      });
      
      const galleryData = await galleryRes.json();
      if (!galleryRes.ok) throw new Error(galleryData.error || "Failed to save to gallery");
      
      showToast("Image added to gallery!", "success");
      setGallery([galleryData, ...gallery]);
      closeModal();
      
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/gallery/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      showToast("Image removed from gallery", "success");
      setGallery(gallery.filter((item) => item._id !== deleteId));
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setPreviewImage(null);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-8 font-sans">
      <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white font-display flex items-center gap-3">
            <ImageIcon className="text-accent w-8 h-8" />
            Gallery Manager
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">Upload and manage images for the public gallery page.</p>
        </div>
        
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="image/*" 
            className="hidden" 
        />
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4 mr-2" /> Upload Image
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-zinc-500">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : gallery.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/10 rounded-2xl bg-white/5">
          <ImageIcon className="w-12 h-12 text-zinc-600 mb-4" />
          <p className="text-zinc-400 font-medium mb-4">No images in the gallery yet.</p>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline">
            Upload your first image
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {gallery.map((item) => (
            <div key={item._id} className="group relative bg-[#111111] rounded-2xl overflow-hidden border border-white/10 shadow-lg">
              <div className="aspect-square relative w-full overflow-hidden">
                <Image 
                  src={item.imageUrl} 
                  alt={item.title || "Gallery image"} 
                  fill 
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white text-sm truncate">{item.title || "Untitled"}</h3>
                <p className="text-xs text-zinc-500 truncate mt-1">{item.description || "No description"}</p>
              </div>
              <button
                onClick={() => setDeleteId(item._id)}
                className="absolute top-3 right-3 p-2 bg-red-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={!isUploading ? closeModal : undefined} />
          <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold text-white mb-6">Add to Gallery</h2>
            
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black mb-6 border border-white/10">
              {previewImage && (
                <Image src={previewImage} alt="Preview" fill className="object-contain" />
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Title / Subject (Optional)</label>
                <input 
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Annual Hackathon 2026"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent focus:outline-none"
                  disabled={isUploading}
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Small Description (Optional)</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="A few words about this moment..."
                  rows={3}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-accent focus:outline-none resize-none"
                  disabled={isUploading}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={closeModal} variant="outline" className="flex-1" disabled={isUploading}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="flex-1" disabled={isUploading}>
                {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Image"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => !isDeleting && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Image"
        description="Are you sure you want to remove this image from the gallery? This action cannot be undone."
        confirmText="Yes, delete it"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
