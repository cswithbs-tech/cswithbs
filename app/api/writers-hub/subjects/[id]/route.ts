import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
