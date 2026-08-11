import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

// GET single note
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const note = await Note.findById(id);
        if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });
        return NextResponse.json(note);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - edit note
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as any;
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        await dbConnect();

        const note = await Note.findById(id);
        if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

        const isSuperOrAdmin = user?.roles?.some((r: string) => ['ADMIN', 'SUPER_ADMIN'].includes(r));
        const isAuthor = note.author.toString() === user.id;

        if (!isSuperOrAdmin && !isAuthor) {
            return NextResponse.json({ error: 'Unauthorized: You can only edit your own notes.' }, { status: 403 });
        }

        const body = await request.json();

        // Recalculate read time if content changes
        if (body.content || body.contentJson) {
            let plainText = '';
            if (body.contentJson) {
                const getText = (node: any): string => {
                    if (node.type === 'text') return node.text || '';
                    if (node.content && Array.isArray(node.content)) {
                        return node.content.map(getText).join(' ');
                    }
                    return '';
                };
                plainText = getText(body.contentJson);
            } else if (body.content) {
                plainText = body.content.replace(/<[^>]*>/g, ' ');
            }
            const words = plainText.trim().split(/\s+/).length;
            body.readTime = `${Math.ceil(words / 200)} min read`;
        }

        const finalNote = await Note.findByIdAndUpdate(id, body, { new: true });

        revalidatePath('/writers-hub/notes');
        return NextResponse.json(finalNote);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE note
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as any;
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        await dbConnect();

        const note = await Note.findById(id);
        if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

        const isSuperOrAdmin = user?.roles?.some((r: string) => ['ADMIN', 'SUPER_ADMIN'].includes(r));
        const isAuthor = note.author.toString() === user.id;

        if (!isSuperOrAdmin && !isAuthor) {
            return NextResponse.json({ error: 'Unauthorized: You can only delete your own notes.' }, { status: 403 });
        }

        await Note.findByIdAndDelete(id);

        revalidatePath('/writers-hub/notes');
        return NextResponse.json({ message: 'Note deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
