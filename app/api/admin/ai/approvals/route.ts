import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import Category from "@/models/Category";
import Notification from "@/models/Notification";
import { reviewPostWithAi } from "@/lib/ai";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRoles = (session.user as any)?.roles || [];
    const isAuthorized = Array.isArray(userRoles)
      ? userRoles.some((r: string) => ["ADMIN", "SUPER_ADMIN", "admin", "super_admin"].includes(r))
      : ["ADMIN", "SUPER_ADMIN", "admin", "super_admin"].includes(userRoles);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    await dbConnect();

    const pendingPosts = await Post.find({ status: "pending_approval" })
      .sort({ updatedAt: -1 })
      .populate({ path: "author", model: User, select: "name email image" })
      .populate({ path: "category", model: Category, select: "name" })
      .lean();

    const formatted = pendingPosts.map((p: any) => ({
      id: p._id.toString(),
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      categoryName: p.category?.name || "General",
      authorName: p.author?.name || "Unknown Author",
      authorEmail: p.author?.email || "",
      authorImage: p.author?.image || null,
      tags: p.tags || [],
      wordCount: p.content ? p.content.split(/\s+/).length : 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      image: p.image,
    }));

    return NextResponse.json({ pendingPosts: formatted, totalCount: formatted.length });
  } catch (error: any) {
    console.error("Error fetching approvals queue for AI:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch approvals" }, { status: 500 });
  }
}

// POST: Trigger AI Review & Inspection of a pending post
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRoles = (session.user as any)?.roles || [];
    const isAuthorized = Array.isArray(userRoles)
      ? userRoles.some((r: string) => ["ADMIN", "SUPER_ADMIN", "admin", "super_admin"].includes(r))
      : ["ADMIN", "SUPER_ADMIN", "admin", "super_admin"].includes(userRoles);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { postId, selectedModel } = body;

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    await dbConnect();

    const post = await Post.findById(postId)
      .populate({ path: "author", model: User, select: "name email" })
      .populate({ path: "category", model: Category, select: "name" })
      .lean();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const review = await reviewPostWithAi({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content || "",
      tags: post.tags,
      categoryName: (post.category as any)?.name,
      authorName: (post.author as any)?.name,
      selectedModel,
    });

    return NextResponse.json({
      postId,
      postTitle: post.title,
      review,
    });
  } catch (error: any) {
    console.error("Error in AI post review route:", error);
    return NextResponse.json({ error: error.message || "Failed to review post" }, { status: 500 });
  }
}

// PATCH: 1-Click Approve Post from AI Studio
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRoles = (session.user as any)?.roles || [];
    const isAuthorized = Array.isArray(userRoles)
      ? userRoles.some((r: string) => ["ADMIN", "SUPER_ADMIN", "admin", "super_admin"].includes(r))
      : ["ADMIN", "SUPER_ADMIN", "admin", "super_admin"].includes(userRoles);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const currentUserId = (session.user as any)?.id;
    const body = await req.json().catch(() => ({}));
    const { postId, action } = body; // action: 'approve' | 'reject'

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    await dbConnect();

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (action === "approve") {
      post.status = "published";
      await post.save();

      // Notifications
      try {
        await Notification.create({
          type: "NEW_BLOG",
          recipient: null,
          title: `New Post: ${post.title}`,
          message: post.excerpt || "Check out our latest blog post!",
          link: `/blog/${post.slug}`,
        });

        if (String(post.author) !== String(currentUserId)) {
          await Notification.create({
            type: "PERSONAL",
            recipient: post.author,
            title: "Your post was approved! 🎉",
            message: `Your article "${post.title}" has been reviewed and published.`,
            link: `/blog/${post.slug}`,
          });
        }
      } catch (notifErr) {
        console.error("Notification creation error in AI approval:", notifErr);
      }

      revalidatePath("/writers-hub/posts");
      revalidatePath("/writers-hub/approvals");
      revalidatePath(`/blog/${post.slug}`);
      revalidatePath("/");

      return NextResponse.json({ success: true, status: "published" });
    } else if (action === "reject") {
      post.status = "draft";
      await post.save();

      if (String(post.author) !== String(currentUserId)) {
        await Notification.create({
          type: "PERSONAL",
          recipient: post.author,
          title: "Update needed on your post 📝",
          message: `The admin team reviewed "${post.title}" and moved it back to Drafts for revision.`,
          link: `/writers-hub/editor?id=${post._id}&type=post`,
        });
      }

      revalidatePath("/writers-hub/posts");
      revalidatePath("/writers-hub/approvals");

      return NextResponse.json({ success: true, status: "draft" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in AI approval action:", error);
    return NextResponse.json({ error: error.message || "Failed to update post status" }, { status: 500 });
  }
}
