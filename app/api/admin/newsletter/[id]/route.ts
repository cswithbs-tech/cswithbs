import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Newsletter from "@/models/Newsletter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const userRoles = (session?.user as any)?.roles || [];
    const hasSuperAdminRole = Array.isArray(userRoles) ? userRoles.some((r) => ['SUPER_ADMIN', 'super_admin'].includes(r)) : userRoles === 'super_admin';
    if (!session || !hasSuperAdminRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    await dbConnect();

    const newsletter = await Newsletter.findByIdAndUpdate(
      id,
      { ...body },
      { new: true },
    );

    if (!newsletter) {
      return NextResponse.json(
        { error: "Newsletter not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(newsletter);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const userRoles = (session?.user as any)?.roles || [];
    const hasSuperAdminRole = Array.isArray(userRoles) ? userRoles.some((r) => ['SUPER_ADMIN', 'super_admin'].includes(r)) : userRoles === 'super_admin';
    if (!session || !hasSuperAdminRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    await dbConnect();
    await Newsletter.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
