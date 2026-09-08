"use client";

import { useToast } from "@/app/context/ToastContext";
import { Download, Lock, FileText, Link as LinkIcon } from "lucide-react";

interface ResourceLinkProps {
  resource: {
    title: string;
    type: string;
    url: string;
    isPremium: boolean;
  };
  accentColor: string;
}

export const ResourceLink = ({ resource, accentColor }: ResourceLinkProps) => {
  const { showToast } = useToast();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (resource.isPremium) {
      e.preventDefault();
      showToast("This is a Premium resource. Premium features are coming soon!", "error");
    }
  };

  return (
    <a
      href={resource.isPremium ? "#" : resource.url}
      target={resource.isPremium ? "_self" : "_blank"}
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group/res flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/15 transition-all"
    >
      <div className="flex items-center gap-3">
        <div 
          className="p-2 rounded-lg transition-transform group-hover/res:scale-110 border"
          style={resource.isPremium ? { backgroundColor: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' } : { backgroundColor: `${accentColor}10`, borderColor: `${accentColor}20`, color: accentColor }}
        >
          {resource.isPremium ? <Lock className="w-4 h-4" /> : (resource.type === 'PDF' || resource.type === 'Document' ? <FileText className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />)}
        </div>
        <div>
          <div className="text-sm font-bold text-white group-hover/res:text-accent transition-colors flex items-center gap-2">
            {resource.title}
            {resource.isPremium && <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30 uppercase font-bold tracking-wider">Premium</span>}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{resource.type}</div>
        </div>
      </div>
      {!resource.isPremium && (
        <Download className="w-4 h-4 text-zinc-600 opacity-0 group-hover/res:opacity-100 transition-all" />
      )}
    </a>
  );
};
