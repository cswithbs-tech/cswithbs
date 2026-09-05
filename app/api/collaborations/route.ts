import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Collaboration from "@/models/Collaboration";
import User from "@/models/User";

// GET all collaborations
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const collaborations = await Collaboration.find({})
      .populate("student", "name email image username")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(collaborations, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching collaborations:", error);
    return NextResponse.json(
      { error: "Failed to fetch collaborations" },
      { status: 500 }
    );
  }
}

// POST a new collaboration (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // Check if user is Admin or Super Admin
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser || (!currentUser.roles.includes("ADMIN") && !currentUser.roles.includes("SUPER_ADMIN"))) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    const body = await req.json();
    const { title, slug, type, abstract, image, student, event, mentor, status } = body;

    if (!title || !slug || !type || !abstract || !student || !event || !mentor) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if slug exists
    const existing = await Collaboration.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists. Please provide a unique slug." },
        { status: 409 }
      );
    }

    const newCollaboration = await Collaboration.create({
      title,
      slug,
      type,
      abstract,
      image: type === 'Poster' ? image : undefined,
      student,
      event,
      mentor,
      status: status || 'published',
    });

    return NextResponse.json(newCollaboration, { status: 201 });
  } catch (error: any) {
    console.error("Error creating collaboration:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
