import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import AiLog from "@/models/AiLog";
import { testGeminiConnection, GEMINI_MODELS } from "@/lib/ai";

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

    const userId = (session.user as any)?.id;

    await dbConnect();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const [todayTotal, todayUser, weekTotal, allTimeTotal, recentLogs] = await Promise.all([
      AiLog.countDocuments({ createdAt: { $gte: startOfToday }, status: "success" }),
      userId ? AiLog.countDocuments({ userId, createdAt: { $gte: startOfToday }, status: "success" }) : 0,
      AiLog.countDocuments({ createdAt: { $gte: startOfWeek }, status: "success" }),
      AiLog.countDocuments({ status: "success" }),
      AiLog.find().sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    // Check quick health ping
    const health = await testGeminiConnection().catch((err) => ({
      ok: false,
      error: err.message,
    }));

    const RPD_LIMIT = 1500;
    const RPM_LIMIT = 15;
    const remainingToday = Math.max(0, RPD_LIMIT - todayTotal);
    const percentUsed = Math.min(100, Number(((todayTotal / RPD_LIMIT) * 100).toFixed(1)));

    return NextResponse.json({
      success: true,
      stats: {
        todayTotal,
        todayUser,
        weekTotal,
        allTimeTotal,
        remainingToday,
        percentUsed,
        rpdLimit: RPD_LIMIT,
        rpmLimit: RPM_LIMIT,
      },
      health: {
        ok: health.ok,
        activeModel: (health as any).model || "gemini-flash-lite-latest",
        latencyMs: (health as any).latencyMs || 0,
        error: health.error,
        configuredModels: GEMINI_MODELS,
      },
      recentLogs: recentLogs.map((log: any) => ({
        id: log._id.toString(),
        topic: log.topic,
        title: log.title,
        slug: log.slug,
        contentType: log.contentType,
        categoryOrSubject: log.categoryOrSubject,
        targetLevel: log.targetLevel,
        modelUsed: log.modelUsed,
        hasCoverImage: log.hasCoverImage,
        coverImageUrl: log.coverImageUrl,
        charactersCount: log.charactersCount,
        status: log.status,
        author: log.userName || "Writer",
        createdAt: log.createdAt,
      })),
    });
  } catch (err: any) {
    console.error("Error fetching AI stats:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch AI usage statistics" },
      { status: 500 }
    );
  }
}
