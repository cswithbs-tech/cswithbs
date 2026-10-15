"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Node, mergeAttributes } from "@tiptap/core";
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  Minus,
  Undo,
  Redo,
  Sparkles,
  Tag,
  X,
  Check,
} from "lucide-react";

/**
 * Custom Div node exclusively for email preset cards & containers.
 * Isolated completely inside EmailEditor.
 */
const EmailDivBlock = Node.create({
  name: "emailDiv",
  group: "block",
  content: "block*",
  defining: true,
  isolating: false,
  parseHTML() {
    return [{ tag: "div" }];
  },
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("style"),
        renderHTML: (attributes) => (attributes.style ? { style: attributes.style } : {}),
      },
      class: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("class"),
        renderHTML: (attributes) => (attributes.class ? { class: attributes.class } : {}),
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes), 0];
  },
});

const EmailParagraph = Paragraph.extend({
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("style"),
        renderHTML: (attributes) => (attributes.style ? { style: attributes.style } : {}),
      },
      class: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("class"),
        renderHTML: (attributes) => (attributes.class ? { class: attributes.class } : {}),
      },
    };
  },
});

const EmailHeading = Heading.configure({
  levels: [1, 2, 3, 4],
}).extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("style"),
        renderHTML: (attributes) => (attributes.style ? { style: attributes.style } : {}),
      },
      class: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("class"),
        renderHTML: (attributes) => (attributes.class ? { class: attributes.class } : {}),
      },
    };
  },
});

interface EmailEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function EmailEditor({
  value,
  onChange,
  placeholder = "Write your email content here...",
  className = "",
}: EmailEditorProps) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        paragraph: false,
        link: false,
        underline: false,
        dropcursor: { color: "#f59e0b", width: 2 },
      }),
      EmailParagraph,
      EmailHeading,
      EmailDivBlock,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-amber-500 underline hover:text-amber-400",
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full rounded-lg my-3 inline-block",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "email-prose outline-none min-h-[420px] p-6 text-zinc-200 text-sm md:text-base leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external changes (e.g. when loading templates or switching from HTML tab)
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (value !== currentHtml) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="h-[420px] flex items-center justify-center bg-zinc-950 text-zinc-500 font-mono text-xs">
        Loading Email Editor...
      </div>
    );
  }

  const insertDynamicTag = (tag: string) => {
    editor.chain().focus().insertContent(tag).run();
  };

  const applyLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl.trim(), target: "_blank" })
        .run();
    }
    setLinkModalOpen(false);
    setLinkUrl("");
  };

  const applyImage = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
    }
    setImageModalOpen(false);
    setImageUrl("");
  };

  return (
    <div className={`flex flex-col bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden ${className}`}>
      {/* ── Toolbar Header ────────────────────────────────────── */}
      <div className="bg-zinc-900/90 border-b border-white/10 p-2 flex flex-wrap items-center gap-1.5 select-none text-zinc-400">
        {/* History */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
          title="Undo (Ctrl+Z)"
        >
          <Undo size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
          title="Redo (Ctrl+Y)"
        >
          <Redo size={15} />
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Headings */}
        <select
          onChange={(e) => {
            const val = e.target.value;
            if (val === "p") {
              editor.chain().focus().setParagraph().run();
            } else if (val === "h1") {
              editor.chain().focus().toggleHeading({ level: 1 }).run();
            } else if (val === "h2") {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            } else if (val === "h3") {
              editor.chain().focus().toggleHeading({ level: 3 }).run();
            }
          }}
          value={
            editor.isActive("heading", { level: 1 })
              ? "h1"
              : editor.isActive("heading", { level: 2 })
              ? "h2"
              : editor.isActive("heading", { level: 3 })
              ? "h3"
              : "p"
          }
          className="bg-zinc-950 border border-white/10 text-zinc-300 text-xs rounded-lg px-2 py-1 outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="p">Normal Text</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Inline Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("bold") ? "bg-amber-500/20 text-amber-400 font-bold" : "hover:bg-white/10 hover:text-white"
          }`}
          title="Bold"
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("italic") ? "bg-amber-500/20 text-amber-400 font-bold" : "hover:bg-white/10 hover:text-white"
          }`}
          title="Italic"
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("underline") ? "bg-amber-500/20 text-amber-400 font-bold" : "hover:bg-white/10 hover:text-white"
          }`}
          title="Underline"
        >
          <UnderlineIcon size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("strike") ? "bg-amber-500/20 text-amber-400 font-bold" : "hover:bg-white/10 hover:text-white"
          }`}
          title="Strikethrough"
        >
          <Strikethrough size={15} />
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive({ textAlign: "left" }) ? "bg-amber-500/20 text-amber-400" : "hover:bg-white/10 hover:text-white"
          }`}
          title="Align Left"
        >
          <AlignLeft size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive({ textAlign: "center" }) ? "bg-amber-500/20 text-amber-400" : "hover:bg-white/10 hover:text-white"
          }`}
          title="Align Center"
        >
          <AlignCenter size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive({ textAlign: "right" }) ? "bg-amber-500/20 text-amber-400" : "hover:bg-white/10 hover:text-white"
          }`}
          title="Align Right"
        >
          <AlignRight size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive({ textAlign: "justify" }) ? "bg-amber-500/20 text-amber-400" : "hover:bg-white/10 hover:text-white"
          }`}
          title="Justify"
        >
          <AlignJustify size={15} />
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("bulletList") ? "bg-amber-500/20 text-amber-400" : "hover:bg-white/10 hover:text-white"
          }`}
          title="Bullet List"
        >
          <List size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("orderedList") ? "bg-amber-500/20 text-amber-400" : "hover:bg-white/10 hover:text-white"
          }`}
          title="Numbered List"
        >
          <ListOrdered size={15} />
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Elements */}
        <button
          type="button"
          onClick={() => {
            const currentHref = editor.getAttributes("link").href || "";
            setLinkUrl(currentHref);
            setLinkModalOpen(true);
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("link") ? "bg-amber-500/20 text-amber-400" : "hover:bg-white/10 hover:text-white"
          }`}
          title="Insert / Edit Link"
        >
          <LinkIcon size={15} />
        </button>
        <button
          type="button"
          onClick={() => setImageModalOpen(true)}
          className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          title="Insert Image"
        >
          <ImageIcon size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-lg transition-colors ${
            editor.isActive("blockquote") ? "bg-amber-500/20 text-amber-400" : "hover:bg-white/10 hover:text-white"
          }`}
          title="Quote Block"
        >
          <Quote size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          title="Divider Line"
        >
          <Minus size={15} />
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Dynamic Merge Tags */}
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 flex items-center gap-1">
            <Tag size={11} /> Tags:
          </span>
          <button
            type="button"
            onClick={() => insertDynamicTag("{{name}}")}
            className="px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 text-zinc-300 hover:text-amber-300 text-[11px] font-mono transition-colors"
            title="Insert Subscriber's Name"
          >
            &#123;&#123;name&#125;&#125;
          </button>
          <button
            type="button"
            onClick={() => insertDynamicTag("{{unsubscribe_url}}")}
            className="px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 text-zinc-300 hover:text-amber-300 text-[11px] font-mono transition-colors"
            title="Insert Unsubscribe Link"
          >
            &#123;&#123;unsubscribe_url&#125;&#125;
          </button>
        </div>
      </div>

      {/* ── Link Modal ────────────────────────────────────────── */}
      {linkModalOpen && (
        <div className="p-3 bg-zinc-900 border-b border-white/10 flex items-center gap-2 text-xs">
          <span className="text-zinc-400 font-mono">Link URL:</span>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://cswithbs.com/..."
            className="flex-1 bg-black border border-white/10 text-white rounded-lg px-3 py-1.5 outline-none focus:border-amber-500"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && applyLink()}
          />
          <button
            type="button"
            onClick={applyLink}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors flex items-center gap-1"
          >
            <Check size={13} /> Apply
          </button>
          <button
            type="button"
            onClick={() => setLinkModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── Image Modal ───────────────────────────────────────── */}
      {imageModalOpen && (
        <div className="p-3 bg-zinc-900 border-b border-white/10 flex items-center gap-2 text-xs">
          <span className="text-zinc-400 font-mono">Image URL:</span>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://.../image.png"
            className="flex-1 bg-black border border-white/10 text-white rounded-lg px-3 py-1.5 outline-none focus:border-amber-500"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && applyImage()}
          />
          <button
            type="button"
            onClick={applyImage}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors flex items-center gap-1"
          >
            <Check size={13} /> Insert
          </button>
          <button
            type="button"
            onClick={() => setImageModalOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── Email Canvas / Document Area ─────────────────────── */}
      <div className="p-4 md:p-8 bg-[#070709] overflow-y-auto">
        <div className="max-w-[620px] mx-auto bg-[#0f1115] border border-white/10 rounded-xl shadow-2xl p-4 md:p-6 transition-all">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
