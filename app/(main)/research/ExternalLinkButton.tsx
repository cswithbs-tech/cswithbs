"use client";

import { useToast } from "@/app/context/ToastContext";
import { ReactNode } from "react";

interface ExternalLinkButtonProps {
  href: string;
  className?: string;
  children: ReactNode;
}

export function ExternalLinkButton({ href, className, children }: ExternalLinkButtonProps) {
  const { showToast } = useToast();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    showToast("Redirecting to external site...", "info");
    
    // Slight delay to let the user read the toast before the browser potentially switches focus
    setTimeout(() => {
      window.open(href, "_blank", "noopener,noreferrer");
    }, 500);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
