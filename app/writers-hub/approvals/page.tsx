import Link from "next/link";
import { Button } from "@/app/components/ui/Button";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import { Pagination } from "@/app/components/ui/Pagination";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Image from "next/image";
import { QuickStatusToggle } from "@/app/components/QuickStatusToggle";
import { redirect } from "next/navigation";

export const revalidate = 0; // Always fresh for admin

async function getPendingPosts(page: number, limit: number) {
  await dbConnect();
  const skip = (page - 1) * limit;

  const dbQuery: any = { status: "pending_approval" };

  // Total count
  const totalPosts = await Post.countDocuments(dbQuery);
  const totalPages = Math.ceil(totalPosts / limit);

  const posts = await Post.find(dbQuery)
    .sort({ updatedAt: -1 })
    .populate({ path: "author", model: User, select: "name image email" })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    posts: posts.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      author: p.author
        ? {
            _id: p.author._id.toString(),
            name: p.author.name,
            image: p.author.image,
            email: p.author.email,
          }
        : null,
    })),
    totalPages,
  };
}

export default async function ApprovalsPage(props: {
  searchParams: Promise<{
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const limit = 20;

  const session = await getServerSession(authOptions);
  const currentUser = session?.user as any;
  const isSuperOrAdmin =
    currentUser?.roles?.includes('ADMIN') || currentUser?.roles?.includes('SUPER_ADMIN');

  if (!isSuperOrAdmin) {
    redirect("/writers-hub/posts");
  }

  const { posts, totalPages } = await getPendingPosts(page, limit);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-8 font-sans selection:bg-accent/30">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="bg-gradient-to-r from-accent to-accent bg-clip-text text-transparent">
              Approvals Queue
            </span>
            <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full border border-orange-500/30">
              {posts.length} Pending
            </span>
          </h1>
          <p className="text-zinc-400 mt-2 text-sm flex items-center gap-2 font-medium">
            Review and approve posts submitted by writers.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col space-y-3 w-full">
          {posts.map((post: any) => (
            <div 
              key={post._id}
              className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-zinc-900/40 border border-orange-500/20 rounded-xl transition-all hover:border-orange-500/40"
            >
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="text-[15px] font-semibold text-zinc-100 hover:text-accent transition-colors line-clamp-1 max-w-[400px]"
                  >
                    {post.title}
                  </Link>
                  <span className="text-[9px] font-extrabold text-orange-400 tracking-wider uppercase px-1.5 py-0.5 bg-orange-500/10 rounded border border-orange-500/20 whitespace-nowrap">
                    Requires Review
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <span>Submitted: {new Date(post.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>

                  <div className="w-1 h-1 rounded-full bg-zinc-700"></div>

                  <div className="flex items-center gap-1.5">
                    {post.author?.image ? (
                      <div className="relative w-4 h-4 rounded-full overflow-hidden">
                        <Image src={post.author.image} alt={post.author.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-zinc-400">?</div>
                    )}
                    <span className="text-zinc-300">{post.author?.name || "Unknown"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 md:mt-0 md:border-l md:border-white/5 md:pl-6">
                <div className="flex items-center gap-2">
                   <QuickStatusToggle id={post._id} initialStatus={post.status} />
                </div>
                <Link
                  href={`/writers-hub/editor?id=${post._id}&type=post`}
                  className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Review & Edit
                </Link>
              </div>
            </div>
          ))}
          
          {posts.length === 0 && (
            <div className="py-12 text-center text-zinc-500 font-medium bg-zinc-900/40 border border-white/5 rounded-xl">
              <span className="text-4xl block mb-2">🎉</span>
              No pending posts! The queue is empty.
            </div>
          )}

          {totalPages > 1 && (
            <div className="pt-4">
              <Pagination totalPages={totalPages} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
