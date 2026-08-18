"use client";

import { useEffect, useRef } from "react";
import * as katex from "katex";
import "katex/dist/katex.min.css";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import * as mermaid from "mermaid";

// Initialize mermaid for frontend
if (typeof window !== "undefined") {
  const m = (mermaid as any).default || mermaid;
  if (typeof m.initialize === "function") {
    m.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
      fontFamily: "Inter, system-ui, sans-serif",
    });
  }
}

interface NoteHtmlRendererProps {
  content: string;
  className?: string;
  onImageClick?: (src: string) => void;
  showHeadingAnchors?: boolean;
}

export const NoteHtmlRenderer = ({
  content,
  className,
  onImageClick,
  showHeadingAnchors = true,
}: NoteHtmlRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // 1. Syntax Highlighting
      const codeBlocks = containerRef.current.querySelectorAll("pre code");
      codeBlocks.forEach((block) => {
        if (!block.classList.contains("hljs")) {
          try {
            hljs.highlightElement(block as HTMLElement);
          } catch (e) {
            console.error("Highlighting error:", e);
          }
        }
      });

      // 2. Wrap code blocks for terminal UI
      const pres = containerRef.current.querySelectorAll("pre");
      pres.forEach((pre) => {
        // Prevent double processing
        if (pre.getAttribute("data-terminal-ui") === "true") return;
        pre.setAttribute("data-terminal-ui", "true");

        const wrapper = document.createElement("div");
        wrapper.className = "relative group/code mb-8 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl";
        pre.parentNode?.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        // Strip default pre styles so the wrapper handles it
        pre.style.backgroundColor = "transparent";
        pre.style.border = "none";
        pre.style.margin = "0";
        pre.style.borderRadius = "0";
        
        const codeElement = pre.querySelector("code");
        if (codeElement) {
          codeElement.style.display = "block";
          codeElement.style.padding = "1rem 1.25rem"; // Normal padding
          codeElement.style.backgroundColor = "transparent"; // Prevent inline background bleeding
        }

        const lang = Array.from(codeElement?.classList || [])
            .find((c) => c.startsWith("language-"))
            ?.replace("language-", "") || "text";

        // Create Top Bar
        const topBar = document.createElement("div");
        topBar.className = "top-bar h-11 bg-[#0d0d0d] border-b border-white/5 flex items-center px-4 justify-between select-none";

        // Left Side: Dots + Language
        const leftSide = document.createElement("div");
        leftSide.className = "flex items-center gap-4";

        const dots = document.createElement("div");
        dots.className = "flex items-center gap-2";
        dots.innerHTML = `
          <div class="w-3 h-3 rounded-full bg-[#ff5f56] border border-black/20"></div>
          <div class="w-3 h-3 rounded-full bg-[#ffbd2e] border border-black/20"></div>
          <div class="w-3 h-3 rounded-full bg-[#27c93f] border border-black/20"></div>
        `;

        const label = document.createElement("span");
        label.className = "text-xs font-semibold text-zinc-500 uppercase tracking-wider";
        label.textContent = lang;

        leftSide.appendChild(dots);
        leftSide.appendChild(label);
        topBar.appendChild(leftSide);

        // Right Side: Copy Button
        const btn = document.createElement("button");
        btn.className = "copy-btn py-1 text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-medium bg-transparent border-none cursor-pointer";

        btn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          <span>Copy</span>
        `;

        btn.onclick = () => {
          const text = codeElement?.innerText || "";
          navigator.clipboard.writeText(text).then(() => {
            btn.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span class="text-green-400">Copied!</span>
            `;
            setTimeout(() => {
              btn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>Copy</span>
              `;
            }, 2000);
          });
        };

        topBar.appendChild(btn);
        wrapper.insertBefore(topBar, pre);
      });

      // 3. Heading Anchors
      if (showHeadingAnchors) {
        const headings = containerRef.current.querySelectorAll("h2, h3");
        headings.forEach((h) => {
          if (h.querySelector(".anchor-link")) return;
          const anchor = document.createElement("a");
          anchor.className =
            "anchor-link ml-2 opacity-0 focus:opacity-100 group-hover:opacity-100 transition-opacity text-accent no-underline";
          anchor.href = `#${h.id}`;
          anchor.innerHTML = "#";
          h.classList.add("group", "flex", "items-center");
          h.appendChild(anchor);
        });
      }

      // 4. Math Rendering
      const mathNodes = containerRef.current.querySelectorAll(
        'span[data-type="math-equation"]',
      );
      mathNodes.forEach((node) => {
        const latex = (node as HTMLElement).getAttribute("data-latex");
        const isBlock =
          (node as HTMLElement).getAttribute("data-is-block") === "true";

        if (latex) {
          try {
            const k = (katex as any).default || katex;
            if (typeof k.render === "function") {
              k.render(latex, node as HTMLElement, {
                throwOnError: false,
                displayMode: isBlock,
                errorColor: "#cc0000",
              });
              if (isBlock) {
                (node as HTMLElement).style.display = "flex";
                (node as HTMLElement).style.justifyContent = "center";
                (node as HTMLElement).style.margin = "2.5rem 0";
                (node as HTMLElement).style.overflowX = "auto";
                (node as HTMLElement).style.overflowY = "hidden";
              }
            }
          } catch (e) {
            console.error("Katex rendering error:", e);
          }
        }
      });

      // 5. Mermaid Diagrams
      const mermaidNodes = containerRef.current.querySelectorAll(
        'div[data-type="mermaid"]',
      );
      mermaidNodes.forEach(async (node, index) => {
        const code = (node as HTMLElement).getAttribute("data-code");
        if (code && !node.querySelector("svg")) {
          try {
            const id = `mermaid-render-${index}`;
            const m = (mermaid as any).default || mermaid;
            if (typeof m.render === "function") {
              const { svg } = await m.render(id, code);
              node.innerHTML = `<div class="mermaid-svg-container w-full flex justify-center py-4 [&>svg]:max-w-full [&>svg]:h-auto">${svg}</div>`;
            } else {
              console.error("Mermaid render function not found");
            }
          } catch (e) {
            console.error("Mermaid Render Error:", e);
            node.innerHTML = `<div class="text-red-500/50 text-[10px] uppercase tracking-widest font-mono p-4 border border-red-500/20 rounded-lg">Diagram Rendering Error</div>`;
          }
        }
      });
    }
  }, [content]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onImageClick) return;
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG" && !target.closest("a")) {
      onImageClick((target as HTMLImageElement).src);
    }
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={className}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
