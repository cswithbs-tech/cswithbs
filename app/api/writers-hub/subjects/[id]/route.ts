import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as any;
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const isSuperOrAdmin = user?.roles?.some((r: string) =>
            ['ADMIN', 'SUPER_ADMIN'].includes(r)
        );
        if (!isSuperOrAdmin) {
            return NextResponse.json({ error: 'Only admins can update subjects.' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        
        if (body.name) {
            body.slug = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }

        await dbConnect();
        const subject = await Subject.findByIdAndUpdate(id, body, { new: true }).lean();
        
        if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });

        return NextResponse.json({ ...subject, _id: subject._id.toString() });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Subject name must be unique.' }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as any;
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const isSuperOrAdmin = user?.roles?.some((r: string) =>
            ['ADMIN', 'SUPER_ADMIN'].includes(r)
        );
        if (!isSuperOrAdmin) {
            return NextResponse.json({ error: 'Only admins can delete subjects.' }, { status: 403 });
        }

        const { id } = await params;
        await dbConnect();
        await Subject.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Subject deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
