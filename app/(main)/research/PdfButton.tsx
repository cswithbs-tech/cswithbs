"use client";

import { Download } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";

export function PdfButton() {
  const { showToast } = useToast();

  return (
    <button 
      className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 text-xs font-bold transition-colors"
      onClick={() => showToast("PDF download coming soon!", "info")}
    >
      <Download className="w-3.5 h-3.5" />
      PDF
    </button>
  );
}
