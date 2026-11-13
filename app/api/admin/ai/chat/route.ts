import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import AiConversation from "@/models/AiConversation";
import AiMessage from "@/models/AiMessage";
import Subject from "@/models/Subject";
import Chapter from "@/models/Chapter";
import Note from "@/models/Note";
import Post from "@/models/Post";
import { callGeminiChat, GeminiChatMessage } from "@/lib/ai";

export async function GET(req: Request) {
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
    const conversationId = searchParams.get("conversationId");
    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
    }

    await dbConnect();
    const messages = await AiMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Error fetching AI messages:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch messages" }, { status: 500 });
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
    let { conversationId, message, selectedModel } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    await dbConnect();

    // Find or create conversation
    let conv = null;
    if (conversationId) {
      conv = await AiConversation.findOne({ _id: conversationId, userId });
    }

    if (!conv) {
      const generatedTitle = message.slice(0, 45).replace(/\n/g, " ") + (message.length > 45 ? "..." : "");
      conv = await AiConversation.create({
        userId,
        title: generatedTitle,
        aiModel: selectedModel || "gemini-3-flash-preview",
        lastMessageAt: new Date(),
      });
      conversationId = conv._id.toString();
    }

    // Save user message
    const userMsgDoc = await AiMessage.create({
      conversationId: conv._id,
      role: "user",
      content: message.trim(),
    });

    // Gather high-level site context for the AI Brain
    const [subjects, chaptersCount, notesCount, pendingPostsCount] = await Promise.all([
      Subject.find().select("name slug level").limit(15).lean(),
      Chapter.countDocuments(),
      Note.countDocuments(),
      Post.countDocuments({ status: "pending_approval" }),
    ]);

    const subjectsSummary = subjects.map((s: any) => s.name).join(", ") || "None yet";

    const systemInstruction = `You are "Antigravity AI Co-Pilot" for CSWITHBS (Computer Science with BS), a premier educational platform for Computer Science university students, GATE aspirants, and software engineers.
You are directly speaking with the Administrator / Super Admin of CSWITHBS.

CURRENT PLATFORM KNOWLEDGE BASE:
- Total Subjects in Syllabus: ${subjects.length} (${subjectsSummary})
- Total Chapters: ${chaptersCount}
- Total Published Academic Notes: ${notesCount}
- Writers' Blog Submissions Pending Admin Review: ${pendingPostsCount}

YOUR CORE RESPONSIBILITIES:
1. INTERACTIVE CURRICULUM ARCHITECT: When asked to plan or write notes, do not just blindly generate text. Ask clarifying questions first (target audience, exam focus like GATE vs university semester, programming language for examples, whether ASCII diagrams or theorem proofs are needed).
2. EDITORIAL ADVISOR: Help review post topics, evaluate writer submissions, and suggest missing curriculum gaps.
3. WRITING STANDARDS:
   - For Academic Notes: Formal definitions, mathematical formulations/derivations, time/space complexity analysis, edge cases, step-by-step algorithms, and clean code examples.
   - For Blog Posts: Catchy title, engaging real-world analogies, clean syntax, modern tech practices.

SPECIAL ACTION - DRAFT EXPORTING:
If the user asks you to write, draft, or finalize a full blog post or academic note, provide the full structured markdown.
Additionally, at the VERY END of your response, append a JSON block formatted exactly as:
\`\`\`cswithbs_draft
{
  "title": "Title Here",
  "slug": "url-friendly-slug",
  "excerpt": "Compelling 1-2 sentence excerpt",
  "contentType": "note" | "post",
  "tags": ["Tag1", "Tag2"],
  "subjectName": "Operating Systems (optional)",
  "chapterName": "Chapter Name (optional)"
}
\`\`\`
This lets the admin load your draft straight into the live editor with 1 click!`;

    // Fetch conversation history (last 12 messages for memory)
    const recentMessages = await AiMessage.find({ conversationId: conv._id })
      .sort({ createdAt: 1 })
      .limit(16)
      .lean();

    const history: GeminiChatMessage[] = recentMessages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Call Gemini
    const { text: replyText, modelUsed } = await callGeminiChat(
      history,
      systemInstruction,
      selectedModel || conv.aiModel
    );

    // Parse draft metadata if present
    let metadata: any = { type: "chat" };
    let cleanReply = replyText;

    const draftMatch = replyText.match(/```cswithbs_draft\s*([\s\S]*?)\s*```/);
    if (draftMatch && draftMatch[1]) {
      try {
        const draftMeta = JSON.parse(draftMatch[1]);
        cleanReply = replyText.replace(/```cswithbs_draft[\s\S]*?```/, "").trim();
        metadata = {
          type: draftMeta.contentType === "note" ? "draft_note" : "draft_post",
          draftData: {
            title: draftMeta.title || "Untitled Draft",
            slug: draftMeta.slug || "untitled-draft",
            excerpt: draftMeta.excerpt || "",
            contentType: draftMeta.contentType || "post",
            tags: Array.isArray(draftMeta.tags) ? draftMeta.tags : ["Computer Science"],
            content: cleanReply,
            subjectName: draftMeta.subjectName || "",
            chapterName: draftMeta.chapterName || "",
          },
        };
      } catch (pErr) {
        console.warn("Failed to parse cswithbs_draft metadata", pErr);
      }
    }

    // Save assistant response
    const assistantMsgDoc = await AiMessage.create({
      conversationId: conv._id,
      role: "assistant",
      content: cleanReply,
      metadata,
    });

    // Update conversation timestamp & model
    await AiConversation.findByIdAndUpdate(conv._id, {
      lastMessageAt: new Date(),
      aiModel: modelUsed,
    });

    return NextResponse.json({
      conversationId: conv._id.toString(),
      message: assistantMsgDoc,
      modelUsed,
    });
  } catch (error: any) {
    console.error("Error in AI chat route:", error);
    return NextResponse.json({ error: error.message || "Failed to process chat" }, { status: 500 });
  }
}
