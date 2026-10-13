import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { resend } from "@/lib/email";
import dbConnect from "@/lib/db";
import User from "@/models/User";

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

    await dbConnect();

    // Fetch all admin/super admin team members
    const adminUsers = await User.find(
      { roles: { $in: ["ADMIN", "SUPER_ADMIN"] } },
      "name email roles"
    ).lean();

    const adminTeam = adminUsers.map((u: any) => ({
      name: u.name || "Admin Member",
      email: (u.email || "").toLowerCase().trim(),
      role: Array.isArray(u.roles) && u.roles.some((r: string) => ["SUPER_ADMIN", "super_admin"].includes(r))
        ? "SUPER_ADMIN"
        : "ADMIN",
    })).filter((u: any) => Boolean(u.email));

    // Fetch both sent and received emails from Resend in parallel
    const [sentRes, receivedRes] = await Promise.allSettled([
      resend.emails.list(),
      (resend.emails as any).receiving?.list
        ? (resend.emails as any).receiving.list()
        : Promise.resolve({ data: [] }),
    ]);

    const emailItems =
      sentRes.status === "fulfilled"
        ? (sentRes.value as any)?.data?.data || (sentRes.value as any)?.data || []
        : [];

    const receivedItems =
      receivedRes.status === "fulfilled"
        ? (receivedRes.value as any)?.data?.data || (receivedRes.value as any)?.data || []
        : [];

    // Resend free tier resets daily at 00:00:00 UTC (5:30 AM IST)
    const now = new Date();
    const todayUTCString = now.toISOString().split("T")[0]; // e.g. "2026-10-13"

    // Filter emails dispatched and received today (UTC)
    const emailsSentToday = emailItems.filter((item: any) => {
      if (!item.created_at) return false;
      return item.created_at.startsWith(todayUTCString);
    });

    const emailsReceivedToday = receivedItems.filter((item: any) => {
      if (!item.created_at) return false;
      return item.created_at.startsWith(todayUTCString);
    });

    const DAILY_LIMIT = 100;
    const sentTodayCount = emailsSentToday.length;
    const receivedTodayCount = emailsReceivedToday.length;
    const totalUsedToday = sentTodayCount + receivedTodayCount;
    const remainingTodayCount = Math.max(0, DAILY_LIMIT - totalUsedToday);

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
      receivedToday: receivedTodayCount,
      totalUsedToday,
      remainingToday: remainingTodayCount,
      percentUsed: Math.min(100, Math.round((totalUsedToday / DAILY_LIMIT) * 100)),
      resetTime: "00:00 UTC (5:30 AM IST)",
      hoursUntilReset,
      recentActivity,
      adminTeam,
    });
  } catch (error: any) {
    console.error("Error fetching Resend quota:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
