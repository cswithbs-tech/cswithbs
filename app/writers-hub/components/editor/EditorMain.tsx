"use client";

interface EditorMainProps {
  formData: any;
  handleChange: (e: any) => void;
  generateSlug: () => void;
  contentType?: 'post' | 'note';
}

export function EditorMain({
  formData,
  handleChange,
  generateSlug,
  contentType = 'post',
}: EditorMainProps) {
  return (
    <div className="space-y-6">
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder={contentType === 'note' ? "Lesson Title" : "Post Title"}
        className="w-full bg-transparent border-none px-0 py-2 font-black tracking-tight text-white placeholder:text-zinc-800 focus:outline-none focus:ring-0 focus:placeholder:text-zinc-700 transition-all font-sans text-4xl md:text-5xl"
      />
      <div className="flex flex-col gap-4 pl-1">
        {/* Slug Section */}
        <div className="flex items-center gap-3 text-zinc-500 text-sm font-mono group">
          <span className="text-accent/50 group-hover:text-accent transition-colors">
            GET
          </span>
          <span>{contentType === 'note' ? '/courses/[course]/' : '/blog/'}</span>
          <div className="relative flex-1 max-w-md flex items-center gap-2">
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="url-slug-goes-here"
              className="flex-1 bg-white/5 border border-white/5 rounded-md px-3 py-1.5 text-zinc-300 focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-colors"
            />
            <button
              onClick={generateSlug}
              title="Auto-generate from Title"
              className="p-2 bg-white/5 hover:bg-accent/20 text-zinc-400 hover:text-accent rounded-md transition-colors"
            >
              <span className="sr-only">Generate Slug</span>✨
            </button>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Short Description / Excerpt
          </label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={2}
            placeholder="Enter a compelling summary for search results and social cards..."
            className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-4 text-zinc-300 text-sm leading-relaxed focus:outline-none focus:border-accent/50 resize-none font-sans"
          />
        </div>
      </div>
    </div>
  );
}
