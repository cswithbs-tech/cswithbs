import Link from "next/link";
import { Button } from "@/app/components/ui/Button";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Category from "@/models/Category";
import User from "@/models/User";
import { DeletePostButton } from "@/app/admin/components/DeletePostButton";
import { AdminSearch } from "@/app/admin/components/AdminSearch";
import { AdminFilter } from "@/app/admin/components/AdminFilter";
import { Pagination } from "@/app/components/ui/Pagination";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Image from "next/image";
import { QuickStatusToggle } from "@/app/components/QuickStatusToggle";
import { FeaturedToggle } from "@/app/components/FeaturedToggle";
import { FormattedDate } from "@/app/components/ui/FormattedDate";

export const revalidate = 0; // Always fresh for admin

async function getPosts(
  page: number,
  limit: number,
  query: string,
  category?: string,
  sort: string = "newest",
  authorId?: string,
) {
  await dbConnect();
  const skip = (page - 1) * limit;

  const dbQuery: any = {};

  if (query) {
    const searchRegex = new RegExp(query, "i");

    // Find users who match the search query
    const matchingAuthors = await User.find({
      $or: [{ name: searchRegex }, { email: searchRegex }],
    }).distinct("_id");

    // Find categories that match the search query
    const matchingCategories = await Category.find({
      name: searchRegex,
    }).distinct("_id");

    dbQuery.$or = [
      { title: searchRegex },
      { status: searchRegex },
      { author: { $in: matchingAuthors } },
      { category: { $in: matchingCategories } },
    ];
  }

  if (category) {
    dbQuery.category = category;
  }

  if (authorId) {
    dbQuery.author = authorId;
  }

  let sortOptions: any = { createdAt: -1 };
  if (sort === "oldest") sortOptions = { createdAt: 1 };
  if (sort === "views_desc") sortOptions = { views: -1 };
  if (sort === "views_asc") sortOptions = { views: 1 };

  // Total count
  const totalPosts = await Post.countDocuments(dbQuery);
  const totalPages = Math.ceil(totalPosts / limit);

  const posts = await Post.find(dbQuery)
    .sort(sortOptions)
    .populate({ path: "category", model: Category, select: "name" })
    .populate({ path: "author", model: User, select: "name image email" })
    .skip(skip)
    .limit(limit)
    .lean();

  // Convert _id to string and sanitize
  return {
    posts: posts.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      createdAt: p.createdAt.toISOString(),
      category: p.category
        ? { _id: p.category._id.toString(), name: p.category.name }
        : null,
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

export default async function PostsPage(props: {
  searchParams: Promise<{
    page?: string;
    query?: string;
    category?: string;
    sort?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const query = searchParams.query || "";
  const category = searchParams.category || "";
  const sort = searchParams.sort || "newest";
  const limit = 10;

  const session = await getServerSession(authOptions);
  const currentUser = session?.user as any;
  const isSuperOrAdmin =
    currentUser?.roles?.includes('ADMIN') || currentUser?.roles?.includes('SUPER_ADMIN');

  const { posts, totalPages } = await getPosts(
    page,
    limit,
    query,
    category,
    sort,
    !isSuperOrAdmin ? currentUser?.id : undefined
  );

  // Fetch categories for filter
  const categoriesRaw = await Category.find().select("name").lean();
  const categories = categoriesRaw.map((c: any) => ({
    _id: c._id.toString(),
    name: c.name,
  }));

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-8 font-sans selection:bg-accent/30">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="bg-gradient-to-r from-accent to-accent bg-clip-text text-transparent">
              Posts Manager
            </span>
          </h1>
          <p className="text-zinc-400 mt-2 text-sm flex items-center gap-2 font-medium">
            Manage your blog content, status, and categories.
          </p>
        </div>
        <Link href="/writers-hub/editor?type=post">
          <Button
            variant="primary"
            className="gap-2 bg-accent hover:bg-accent text-black border-0 shadow-[0_0_15px_rgba(0,255,157,0.3)] font-semibold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Create New Post
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Search Bar Container */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <AdminSearch placeholder="Search title, author, category..." />
            <AdminFilter categories={categories} />
          </div>
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-zinc-500 whitespace-nowrap">
            <span>Showing {posts.length} posts</span>
          </div>
        </div>

        {/* Modern List View */}
        <div className="flex flex-col space-y-3 w-full">
          {posts.map((post: any) => {
            const isAuthor = currentUser?.id === post.author?._id;
            const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN');
            const canEdit = isSuperAdmin || isAuthor;

            return (
              <div 
                key={post._id}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-zinc-900/40 border border-white/5 hover:border-white/10 rounded-xl transition-all"
              >
                {/* Left side: Content */}
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="text-[15px] font-semibold text-zinc-100 group-hover:text-accent transition-colors line-clamp-1 max-w-[400px]"
                      title={post.title}
                    >
                      {post.title}
                    </Link>
                    {post.featured && (
                      <span className="text-[9px] font-extrabold text-amber-500 tracking-wider uppercase px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/20 whitespace-nowrap">
                        Featured
                      </span>
                    )}
                    {post.status === "scheduled" && post.scheduledPublishDate && (
                      <span className="text-[9px] font-extrabold text-blue-400 tracking-wider uppercase px-1.5 py-0.5 bg-blue-500/10 rounded border border-blue-500/20 whitespace-nowrap">
                        Scheduled
                      </span>
                    )}
                    {post.status === "draft" && (
                      <span className="text-[9px] font-extrabold text-zinc-400 tracking-wider uppercase px-1.5 py-0.5 bg-zinc-500/10 rounded border border-zinc-500/20 whitespace-nowrap">
                        Draft
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-zinc-500">
                    {/* Date */}
                    <div className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 opacity-70">
                        <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                      </svg>
                      {post.status === "scheduled" && post.scheduledPublishDate ? (
                        <span className="text-amber-500"><FormattedDate date={post.scheduledPublishDate} /></span>
                      ) : (
                        <span>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      )}
                    </div>

                    <div className="w-1 h-1 rounded-full bg-zinc-700"></div>

                    {/* Author */}
                    <div className="flex items-center gap-1.5">
                      {post.author?.image ? (
                        <div className="relative w-4 h-4 rounded-full overflow-hidden">
                          <Image src={post.author.image} alt={post.author.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-zinc-400">?</div>
                      )}
                      <span>{post.author?.name || "Unknown"}</span>
                    </div>

                    <div className="w-1 h-1 rounded-full bg-zinc-700"></div>

                    {/* Category */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-400">{post.category?.name || "Uncategorized"}</span>
                    </div>

                    <div className="w-1 h-1 rounded-full bg-zinc-700"></div>

                    {/* Engagement */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1" title="Views">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 opacity-70">
                          <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                          <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
                        </svg>
                        <span className="tabular-nums">{post.views?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Likes">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 opacity-70 text-rose-500/80">
                          <path d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 0 1-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 0 1-.69.001l-.002-.001Z" />
                        </svg>
                        <span className="tabular-nums">{post.likes?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Actions & Status */}
                <div className="flex items-center gap-4 mt-4 md:mt-0 md:border-l md:border-white/5 md:pl-6">
                  {canEdit ? (
                    <div className="flex items-center gap-2">
                       <FeaturedToggle id={post._id} initialFeatured={post.featured} />
                       <QuickStatusToggle id={post._id} initialStatus={post.status} />
                    </div>
                  ) : (
                    <div className="w-[100px]" /> /* spacer */
                  )}
                  
                  <div className="flex items-center gap-1">
                    {canEdit ? (
                      <Link
                        href={`/writers-hub/editor?id=${post._id}&type=post`}
                        className="p-2 text-zinc-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                        title="Edit Post"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </Link>
                    ) : (
                      <span className="p-2 text-zinc-700 cursor-not-allowed" title="You cannot edit this post">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                      </span>
                    )}
                    <DeletePostButton id={post._id} disabled={!canEdit} />
                  </div>
                </div>
              </div>
            );
          })}
          {posts.length === 0 && (
            <div className="py-12 text-center text-zinc-500 font-medium bg-zinc-900/40 border border-white/5 rounded-xl">
              No posts found. Create your first post!
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
