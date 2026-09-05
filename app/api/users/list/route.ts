import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // Check if user is Admin, Super Admin, or Writer
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser || (!currentUser.roles.includes("ADMIN") && !currentUser.roles.includes("SUPER_ADMIN") && !currentUser.roles.includes("WRITER"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch simplified users for mapping dropdowns
    const users = await User.find({})
      .select("_id name email username image")
      .sort({ name: 1 })
      .lean();
      
    // NextAuth uses id or _id inconsistently on the frontend sometimes, so we ensure both exist
    const formattedUsers = users.map(user => ({
      ...user,
      id: user._id.toString(),
    }));

    return NextResponse.json(formattedUsers, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching users list:", error);
    return NextResponse.json(
      { error: "Failed to fetch users list" },
      { status: 500 }
    );
  }
}
