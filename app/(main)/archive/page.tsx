import { Container } from "@/app/components/ui/Container";
import Link from "next/link";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Archive | CSwithBS",
  description: "A chronological timeline of all published articles and essays.",
};

export const revalidate = 3600; // Cache for 1 hour, revalidate on demand

export default async function ArchivePage() {
  await dbConnect();
  
  const now = new Date();
  const publishedFilter = {
    $or: [
      { status: "published" },
      { status: "scheduled", scheduledPublishDate: { $lte: now } },
    ],
  };

  // Fetch all published posts, sorted by newest first
  const posts = await Post.find(publishedFilter)
    .select("title slug createdAt scheduledPublishDate status readTime views")
    .sort({ createdAt: -1 })
    .lean();

  // Group posts by Year
  const groupedPosts = posts.reduce((acc: any, post: any) => {
    const dateToUse = post.status === "scheduled" && post.scheduledPublishDate 
      ? new Date(post.scheduledPublishDate) 
      : new Date(post.createdAt);
      
    const year = dateToUse.getFullYear().toString();
    
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(post);
    return acc;
  }, {});

  // Sort years descending
  const sortedYears = Object.keys(groupedPosts).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 selection:bg-accent/30">
      <Container className="max-w-3xl">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-100 tracking-tight mb-4">
            The Archive
          </h1>
          <p className="text-lg text-zinc-400">
            A complete chronological timeline of {posts.length} articles and essays written over the years.
          </p>
        </div>

        <div className="space-y-20">
          {sortedYears.map((year) => (
            <div key={year} className="relative">
              {/* Year Heading */}
              <h2 className="text-2xl font-bold text-zinc-100 mb-8 flex items-center gap-4">
                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-md text-accent">
                  {year}
                </span>
                <div className="h-px bg-white/10 flex-1"></div>
              </h2>

              {/* Posts List */}
              <div className="space-y-8 pl-4 md:pl-8 border-l border-white/5">
                {groupedPosts[year].map((post: any) => {
                  const date = post.status === "scheduled" && post.scheduledPublishDate 
                    ? new Date(post.scheduledPublishDate) 
                    : new Date(post.createdAt);
                    
                  return (
                    <article key={post._id.toString()} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[21px] md:-left-[37px] top-2.5 w-2 h-2 rounded-full bg-zinc-700 group-hover:bg-accent transition-colors ring-4 ring-black"></div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                        <time className="text-sm font-mono text-zinc-500 w-24 shrink-0">
                          {date.toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
                        </time>
                        <div className="flex-1">
                          <Link 
                            href={`/blog/${post.slug}`}
                            className="text-lg font-medium text-zinc-200 group-hover:text-accent transition-colors block mb-1"
                          >
                            {post.title}
                          </Link>
                          <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium mt-1">
                            <span>{post.readTime}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                            <span className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 opacity-70">
                                <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                                <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                              </svg>
                              {post.views?.toLocaleString() || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
          
          {posts.length === 0 && (
            <div className="text-center py-20 text-zinc-500 border border-white/5 rounded-2xl bg-white/[0.02]">
              No posts found.
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
