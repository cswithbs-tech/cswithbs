import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET - list all subjects
export async function GET() {
    try {
        await dbConnect();
        const subjects = await Subject.find().sort({ name: 1 }).lean();
        return NextResponse.json(
            subjects.map((s: any) => ({ ...s, _id: s._id.toString() }))
        );
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - create new subject (admin/super_admin only)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as any;
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const isSuperOrAdmin = user?.roles?.some((r: string) =>
            ['ADMIN', 'SUPER_ADMIN'].includes(r)
        );
        if (!isSuperOrAdmin) {
            return NextResponse.json({ error: 'Only admins can create subjects.' }, { status: 403 });
        }

        const body = await request.json();
        if (!body.name) {
            return NextResponse.json({ error: 'Subject name is required.' }, { status: 400 });
        }

        // Auto-generate slug from name
        const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        await dbConnect();
        const subject = await Subject.create({ ...body, slug });

        return NextResponse.json({ ...subject.toObject(), _id: subject._id.toString() }, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Subject name must be unique.' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
