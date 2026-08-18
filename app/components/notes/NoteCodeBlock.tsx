import React, { useState } from "react";
import hljs from "highlight.js/lib/core";
// Import only common languages to keep bundle size low
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml"; // handles HTML
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import bash from "highlight.js/lib/languages/bash";
import sql from "highlight.js/lib/languages/sql";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import { Check, Clipboard, Copy } from "lucide-react";

// Register languages
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("json", json);
hljs.registerLanguage("python", python);
hljs.registerLanguage("java", java);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("c", c);
hljs.registerLanguage("cpp", cpp);

// Theme (Dracula/One Dark Hybrid)
// We'll embed strict theme CSS here to ensure it overrides everything
const HIGHLIGHT_STYLES = `
  .hljs-comment, .hljs-quote { color: #5c6370; font-style: italic; }
  .hljs-doctag, .hljs-keyword, .hljs-formula { color: #c678dd; }
  .hljs-section, .hljs-name, .hljs-selector-tag, .hljs-delete, .hljs-subst { color: #e06c75; }
  .hljs-literal { color: #56b6c2; }
  .hljs-string, .hljs-regexp, .hljs-addition, .hljs-attribute, .hljs-meta .hljs-string { color: #98c379; }
  .hljs-attr, .hljs-variable, .hljs-template-variable, .hljs-type, .hljs-selector-class, .hljs-selector-attr, .hljs-selector-pseudo, .hljs-number { color: #d19a66; }
  .hljs-symbol, .hljs-bullet, .hljs-link, .hljs-meta, .hljs-selector-id, .hljs-title { color: #61aeee; }
  .hljs-built_in, .hljs-title.class_, .hljs-class .hljs-title { color: #e6c07b; }
  .hljs-emphasis { font-style: italic; }
  .hljs-strong { font-weight: bold; }
  .hljs-link { text-decoration: underline; }
`;

interface CodeBlockProps {
  language?: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  language = "text",
  code,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  // Normalize language for highlight.js
  const lang = language.toLowerCase();

  // Highlight code safely
  const highlightedCode = (() => {
    try {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch (e) {
      return code; // Fallback to plain text
    }
  })();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative group/code mb-8 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <style>{HIGHLIGHT_STYLES}</style>

      {/* Header Bar */}
      <div className="top-bar h-11 bg-[#0d0d0d] border-b border-white/5 flex items-center px-4 justify-between select-none">
        
        {/* Left Side: Dots + Language */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-black/20"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-black/20"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-black/20"></div>
          </div>
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            {lang || "CODE"}
          </span>
        </div>

        {/* Right Side: Copy Button */}
        <button
          onClick={copyToClipboard}
          className="copy-btn py-1 text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-xs font-medium bg-transparent border-none cursor-pointer"
          title="Copy code"
        >
          {isCopied ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <pre 
        style={{ backgroundColor: 'transparent', border: 'none', margin: 0, borderRadius: 0 }}
      >
        <code
          className={`hljs language-${lang} font-mono`}
          style={{ display: 'block', padding: '1rem 1.25rem', backgroundColor: 'transparent' }}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </pre>
    </div>
  );
};
