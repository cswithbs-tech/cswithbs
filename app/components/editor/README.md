# CSwithBS Core Content Editor (`app/components/editor`)

> [!WARNING]
> **CRITICAL ARCHITECTURAL BOUNDARY: DO NOT MODIFY OR REUSE FOR EMAILS / NEWSLETTERS**

This directory contains the primary CMS rich-text editor for:
1. **Academic Notes & Course Lessons** (`/writers-hub/editor?type=note`)
2. **Blog Posts & Publications** (`/writers-hub/editor?type=post`)

### Rules for Developers & AI Agents
1. **Never import `@/app/components/editor/Editor` into the Newsletter or Email tools.**
   Emails operate under strict email-client HTML constraints (inline CSS, table layouts, dynamic merge tags) and must live in an isolated email composer under:
   `app/admin/(dashboard)/newsletter/components/EmailEditor/`

2. **Never add raw `<div>` or email-preset nodes into `editor.config.ts`.**
   The core editor relies on structured semantic nodes (paragraphs, headings, callout blockquotes, code blocks, math equations, tables, images). Adding arbitrary containers breaks semantic markdown parsing and harms existing notes.

3. **Never register duplicate Tiptap extensions.**
   In `@tiptap/starter-kit` v3, `link` and `underline` are built-in. If configuring custom `Link` or `Underline`, ensure they are disabled in `StarterKit.configure({ link: false, underline: false })` to avoid duplicate extension runtime warnings.
