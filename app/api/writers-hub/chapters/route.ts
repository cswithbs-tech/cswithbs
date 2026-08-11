import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Chapter from "@/models/Chapter";
import Subject from "@/models/Subject";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!session || !user?.roles?.some((r: string) => ["ADMIN", "SUPER_ADMIN", "WRITER"].includes(r))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subject");

    await dbConnect();
    
    const query: any = {};
    if (subjectId) {
      query.subject = subjectId;
    }

    const chapters = await Chapter.find(query)
      .populate({ path: "subject", model: Subject, select: "name slug" })
      .sort({ subject: 1, order: 1 })
      .lean();

    return NextResponse.json({ chapters });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!session || !user?.roles?.some((r: string) => ["ADMIN", "SUPER_ADMIN"].includes(r))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    if (!body.name || !body.subject) {
      return NextResponse.json({ error: "Name and Subject are required" }, { status: 400 });
    }

    const slug = body.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    await dbConnect();

    // Check if slug exists in this subject context
    const existing = await Chapter.findOne({ slug, subject: body.subject });
    if (existing) {
       return NextResponse.json({ error: "A chapter with this name already exists in this subject" }, { status: 409 });
    }

    const newChapter = await Chapter.create({
        name: body.name,
        slug,
        subject: body.subject,
        description: body.description || "",
        order: body.order || 0
    });

    const populatedChapter = await Chapter.findById(newChapter._id)
      .populate({ path: "subject", model: Subject, select: "name slug" })
      .lean();

    return NextResponse.json(populatedChapter, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Slug must be unique" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
