import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import Subject from '@/models/Subject';
import Chapter from '@/models/Chapter';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

// GET - list notes (writers see only their own, admins see all)
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as any;
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const page = Number(searchParams.get('page') || 1);
        const limit = Number(searchParams.get('limit') || 10);
        const query = searchParams.get('query') || '';
        const subject = searchParams.get('subject') || '';
        const skip = (page - 1) * limit;

        await dbConnect();

        const dbQuery: any = {};

        const isSuperOrAdmin = user?.roles?.some((r: string) =>
            ['ADMIN', 'SUPER_ADMIN'].includes(r)
        );

        // Writers can only see their own notes
        if (!isSuperOrAdmin) {
            dbQuery.author = user.id;
        }

        if (query) {
            const searchRegex = new RegExp(query, 'i');
            dbQuery.$and = dbQuery.$and || [];
            dbQuery.$and.push({
                $or: [{ title: searchRegex }, { tags: searchRegex }],
            });
        }

        if (subject) {
            dbQuery.subject = subject;
        }

        const total = await Note.countDocuments(dbQuery);
        const notes = await Note.find(dbQuery)
            .sort({ createdAt: -1 })
            .populate({ path: 'subject', model: Subject, select: 'name slug' })
            .populate({ path: 'chapter', model: Chapter, select: 'name slug order' })
            .populate({ path: 'author', model: User, select: 'name image email' })
            .skip(skip)
            .limit(limit)
            .lean();

        return NextResponse.json({
            notes: notes.map((n: any) => ({
                ...n,
                _id: n._id.toString(),
                createdAt: n.createdAt.toISOString(),
                subject: n.subject ? { _id: n.subject._id.toString(), name: n.subject.name, slug: n.subject.slug } : null,
                chapter: n.chapter ? { _id: n.chapter._id.toString(), name: n.chapter.name, slug: n.chapter.slug, order: n.chapter.order } : null,
                author: n.author ? { _id: n.author._id.toString(), name: n.author.name, image: n.author.image, email: n.author.email } : null,
            })),
            total,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - create a new note
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as any;

        if (!session || !user?.roles?.some((r: string) => ['ADMIN', 'SUPER_ADMIN', 'WRITER'].includes(r))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        if (!body.title || !body.slug || !body.subject) {
            return NextResponse.json({ error: 'Title, Slug, and Subject are required.' }, { status: 400 });
        }

        // Content and excerpt are not required for drafts
        if (!body.content) body.content = '';
        if (!body.excerpt) body.excerpt = '';

        // Calculate read time
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
        const readTimeVal = words > 0 ? `${Math.ceil(words / 200)} min read` : '1 min read';

        await dbConnect();

        // Allow admins to assign authors
        const isSuperOrAdmin = user?.roles?.some((r: string) => ['ADMIN', 'SUPER_ADMIN'].includes(r));
        const authorId = (isSuperOrAdmin && body.author) ? body.author : user.id;

        const note = await Note.create({ ...body, author: authorId, readTime: readTimeVal });

        revalidatePath('/writers-hub/notes');
        return NextResponse.json(note, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Slug must be unique.' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
