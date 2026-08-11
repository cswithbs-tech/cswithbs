import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Chapter from "@/models/Chapter";
import Note from "@/models/Note";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const chapter = await Chapter.findById(id).populate("subject", "name slug").lean();
    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }
    return NextResponse.json(chapter);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!session || !user?.roles?.some((r: string) => ["ADMIN", "SUPER_ADMIN"].includes(r))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    await dbConnect();

    // Check if updating name, then update slug as well
    if (body.name) {
       body.slug = body.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    const chapter = await Chapter.findByIdAndUpdate(id, body, { new: true })
        .populate("subject", "name slug")
        .lean();

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json(chapter);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Slug must be unique" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!session || !user?.roles?.some((r: string) => ["ADMIN", "SUPER_ADMIN"].includes(r))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    // Check if any notes belong to this chapter before deleting
    const notesUsingChapter = await Note.countDocuments({ chapter: id });
    if (notesUsingChapter > 0) {
        return NextResponse.json({ error: `Cannot delete chapter because ${notesUsingChapter} notes are assigned to it.` }, { status: 400 });
    }

    const chapter = await Chapter.findByIdAndDelete(id);
    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Chapter deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
