import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { resend } from "@/lib/email";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRoles = (session?.user as any)?.roles || [];
    const hasAdminRole = Array.isArray(userRoles)
      ? userRoles.some((r) => ["ADMIN", "SUPER_ADMIN", "admin", "super_admin"].includes(r))
      : ["admin", "super_admin"].includes(userRoles);

    if (!session || !hasAdminRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!resend) {
      return NextResponse.json(
        { error: "Resend is not configured (RESEND_API_KEY missing)" },
        { status: 500 }
      );
    }

    // Fetch recent emails from Resend (up to 100)
    const { data: resendList, error } = await resend.emails.list();

    if (error) {
      console.error("Resend quota list error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to query Resend" },
        { status: 502 }
      );
    }

    const emailItems = (resendList as any)?.data || [];

    // Resend free tier resets daily at 00:00:00 UTC (5:30 AM IST)
    const now = new Date();
    const todayUTCString = now.toISOString().split("T")[0]; // e.g. "2026-10-13"

    // Filter emails dispatched today (UTC)
    const emailsSentToday = emailItems.filter((item: any) => {
      if (!item.created_at) return false;
      // Resend timestamp format: "2026-10-13 02:37:45..." or ISO
      return item.created_at.startsWith(todayUTCString);
    });

    const DAILY_LIMIT = 100;
    const sentTodayCount = emailsSentToday.length;
    const remainingTodayCount = Math.max(0, DAILY_LIMIT - sentTodayCount);

    // Calculate time until next 00:00 UTC reset
    const nextResetUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0
    ));
    const hoursUntilReset = Math.max(0, Math.round((nextResetUTC.getTime() - now.getTime()) / (1000 * 60 * 60)));

    // Cleaned recent email list for display
    const recentActivity = emailItems.slice(0, 15).map((item: any) => ({
      id: item.id,
      to: Array.isArray(item.to) ? item.to.join(", ") : item.to,
      from: item.from,
      subject: item.subject || "(No Subject)",
      createdAt: item.created_at,
      status: item.last_event || "sent",
      isTest: (item.subject || "").toLowerCase().includes("[test"),
    }));

    return NextResponse.json({
      dailyLimit: DAILY_LIMIT,
      sentToday: sentTodayCount,
      remainingToday: remainingTodayCount,
      percentUsed: Math.min(100, Math.round((sentTodayCount / DAILY_LIMIT) * 100)),
      resetTime: "00:00 UTC (5:30 AM IST)",
      hoursUntilReset,
      recentActivity,
    });
  } catch (error: any) {
    console.error("Error fetching Resend quota:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
