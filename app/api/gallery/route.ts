import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Gallery from '@/models/Gallery';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

// GET all active gallery items for the public
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const adminView = searchParams.get('admin') === 'true';

        await dbConnect();
        
        let query = {};
        if (!adminView) {
            query = { isActive: true };
        }

        const galleryItems = await Gallery.find(query).sort({ order: 1, createdAt: -1 }).populate('uploadedBy', 'name image');
        
        return NextResponse.json(galleryItems);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST new gallery item (Admins only)
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const user = session?.user as any;

        if (!session || !user?.roles?.some((r: string) => ['ADMIN', 'SUPER_ADMIN'].includes(r))) {
            return NextResponse.json({ error: 'Unauthorized: Only admins can manage the gallery' }, { status: 403 });
        }

        const body = await request.json();
        
        if (!body.imageUrl) {
            return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
        }

        await dbConnect();
        
        const newGalleryItem = await Gallery.create({
            ...body,
            uploadedBy: user.id
        });

        revalidatePath('/gallery');

        return NextResponse.json(newGalleryItem, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
