import { NextResponse } from "next/server";
import { wrapInEmailTemplate } from "@/lib/emailTemplate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRoles = (session?.user as any)?.roles || [];
    const hasAdminRole = Array.isArray(userRoles)
      ? userRoles.some((r: string) => ["ADMIN", "SUPER_ADMIN", "admin", "super_admin"].includes(r))
      : ["admin", "super_admin"].includes(userRoles);

    if (!session || !hasAdminRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { subject, content } = await req.json();

    const html = wrapInEmailTemplate({
      title: subject?.trim() || "Your Subject Line",
      preheader: "Preview of your CSwithBS Newsletter Campaign",
      recipientName: (session?.user as any)?.name || "Student",
      contentHtml:
        content?.trim() ||
        "<p style='color: #6b7280; font-style: italic;'>Your newsletter body content will appear here...</p>",
      unsubscribeEmail: "subscriber@example.com",
      showUnsubscribe: true,
      isNewsletter: true,
    });

    return NextResponse.json({ html });
  } catch (error: any) {
    console.error("Preview generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate preview" },
      { status: 500 }
    );
  }
}
