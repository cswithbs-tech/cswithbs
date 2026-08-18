import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    
    // Increment the views by 1
    const note = await Note.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, views: note.views });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
