import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Gallery from '@/models/Gallery';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

// UPDATE gallery item
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as any;
        if (!session || !user?.roles?.some((r: string) => ['ADMIN', 'SUPER_ADMIN'].includes(r))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        
        await dbConnect();
        const updatedItem = await Gallery.findByIdAndUpdate(id, body, { new: true });
        
        if (!updatedItem) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        revalidatePath('/gallery');
        return NextResponse.json(updatedItem);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE gallery item
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as any;
        if (!session || !user?.roles?.some((r: string) => ['ADMIN', 'SUPER_ADMIN'].includes(r))) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        
        await dbConnect();
        const deletedItem = await Gallery.findByIdAndDelete(id);
        
        if (!deletedItem) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        revalidatePath('/gallery');
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
