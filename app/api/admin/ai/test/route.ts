import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { testGeminiConnection } from "@/lib/ai";

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

    // Key is read exclusively from GEMINI_API_KEY env variable — never from request body
    const result = await testGeminiConnection();
    if (result.ok) {
      return NextResponse.json({
        success: true,
        model: result.model,
        latencyMs: result.latencyMs,
        message: `Connected to Google Gemini (${result.model}) in ${result.latencyMs}ms.`,
      });
    }

    return NextResponse.json(
      { success: false, error: result.error || "Connection test failed." },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
