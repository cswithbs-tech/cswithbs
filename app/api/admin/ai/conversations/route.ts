import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import AiConversation from "@/models/AiConversation";
import AiMessage from "@/models/AiMessage";

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

    const userId = (session.user as any)?.id;
    await dbConnect();

    const conversations = await AiConversation.find({ userId })
      .sort({ pinned: -1, lastMessageAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error("Error fetching AI conversations:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch conversations" }, { status: 500 });
  }
}

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

    const userId = (session.user as any)?.id;
    const body = await req.json().catch(() => ({}));
    const title = body.title?.trim() || "New AI Studio Session";
    const model = body.model || "gemini-3-flash-preview";

    await dbConnect();

    const conversation = await AiConversation.create({
      userId,
      title,
      aiModel: model,
      lastMessageAt: new Date(),
    });

    // Optionally create an initial greeting if requested
    if (body.initialPrompt) {
      await AiMessage.create({
        conversationId: conversation._id,
        role: "user",
        content: body.initialPrompt,
      });
    }

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating AI conversation:", error);
    return NextResponse.json({ error: error.message || "Failed to create conversation" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
    }

    const userId = (session.user as any)?.id;
    await dbConnect();

    await AiConversation.findOneAndDelete({ _id: id, userId });
    await AiMessage.deleteMany({ conversationId: id });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting AI conversation:", error);
    return NextResponse.json({ error: error.message || "Failed to delete conversation" }, { status: 500 });
  }
}
