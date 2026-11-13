import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateAiDraft } from "@/lib/ai";
import dbConnect from "@/lib/db";
import AiLog from "@/models/AiLog";

export async function POST(req: Request) {
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
  const {
    topic,
    contentType = "post",
    categoryOrSubject,
    targetLevel,
    language,
    customInstructions,
    generateImage = true,
    selectedModel = "auto",
  } = body;

  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return NextResponse.json(
      { error: "Please provide a topic or outline." },
      { status: 400 }
    );
  }

  const userId = (session.user as any)?.id;
  const userName = session.user?.name || "Writer";
  const userEmail = session.user?.email || "";

  try {
    const draft = await generateAiDraft({
      topic: topic.trim(),
      contentType: contentType === "note" ? "note" : "post",
      categoryOrSubject,
      targetLevel,
      language,
      customInstructions,
      generateImage,
      userId,
      selectedModel,
    });

    // Save successful log asynchronously
    try {
      await dbConnect();
      await AiLog.create({
        userId,
        userName,
        userEmail,
        topic: topic.trim(),
        contentType: contentType === "note" ? "note" : "post",
        categoryOrSubject: categoryOrSubject || "",
        targetLevel: targetLevel || "",
        modelUsed: draft.modelUsed || "gemini-flash-lite-latest",
        hasCoverImage: !!draft.image,
        coverImageUrl: draft.image || "",
        title: draft.title,
        slug: draft.slug,
        charactersCount: draft.contentHtml?.length || 0,
        status: "success",
      });
    } catch (logErr) {
      console.error("Failed to save AiLog entry:", logErr);
    }

    return NextResponse.json({
      success: true,
      draft,
    });
  } catch (err: any) {
    console.error("AI Draft Generation Error:", err);

    // Save failure log
    try {
      await dbConnect();
      await AiLog.create({
        userId,
        userName,
        userEmail,
        topic: topic.trim(),
        contentType: contentType === "note" ? "note" : "post",
        categoryOrSubject: categoryOrSubject || "",
        targetLevel: targetLevel || "",
        status: "failed",
        error: err.message || "Failed to generate draft",
      });
    } catch (logErr) {
      console.error("Failed to save failed AiLog entry:", logErr);
    }

    return NextResponse.json(
      { error: err.message || "Failed to generate AI draft" },
      { status: 500 }
    );
  }
}
