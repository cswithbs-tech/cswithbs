import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Media from '@/models/Media';
import cloudinary from '@/lib/cloudinary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRoles = (session?.user as any)?.roles || [];
    const hasEditorRole = Array.isArray(userRoles) ? userRoles.some((r) => ['ADMIN', 'SUPER_ADMIN', 'EDITOR', 'WRITER', 'admin', 'super_admin', 'editor', 'writer'].includes(r)) : ['admin', 'super_admin', 'editor', 'writer'].includes(userRoles);
    if (!session || !hasEditorRole) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    
    let query: any = { folder: { $ne: 'avatars' } };
    
    // If user is ONLY a writer (not admin/super_admin), only show their own uploads
    const isSuperOrAdmin = Array.isArray(userRoles) ? userRoles.some(r => ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(r)) : ['admin', 'super_admin'].includes(userRoles);
    if (!isSuperOrAdmin) {
      query.uploadedBy = (session.user as any).id;
    }

    const media = await Media.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(media);
  } catch (error) {
    console.error("Failed to fetch media:", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRoles = (session?.user as any)?.roles || [];
    const hasEditorRole = Array.isArray(userRoles) ? userRoles.some((r) => ['ADMIN', 'SUPER_ADMIN', 'EDITOR', 'WRITER', 'admin', 'super_admin', 'editor', 'writer'].includes(r)) : ['admin', 'super_admin', 'editor', 'writer'].includes(userRoles);
    if (!session || !hasEditorRole) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await dbConnect();

    const media = await Media.findById(id);
    if (!media) {
        return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Check permissions
    const isSuperOrAdmin = Array.isArray(userRoles) ? userRoles.some(r => ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(r)) : ['admin', 'super_admin'].includes(userRoles);
    if (!isSuperOrAdmin && media.uploadedBy?.toString() !== (session.user as any).id) {
        return NextResponse.json({ error: 'Unauthorized to delete this media' }, { status: 403 });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(media.publicId);

    // Delete from DB
    await Media.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete media:", error);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRoles = (session?.user as any)?.roles || [];
    const hasEditorRole = Array.isArray(userRoles) ? userRoles.some((r) => ['ADMIN', 'SUPER_ADMIN', 'EDITOR', 'WRITER', 'admin', 'super_admin', 'editor', 'writer'].includes(r)) : ['admin', 'super_admin', 'editor', 'writer'].includes(userRoles);
    if (!session || !hasEditorRole) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, newFilename } = body;

    if (!id || !newFilename) {
        return NextResponse.json({ error: "ID and new filename required" }, { status: 400 });
    }

    await dbConnect();

    const media = await Media.findById(id);
    if (!media) {
        return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Check permissions
    const isSuperOrAdmin = Array.isArray(userRoles) ? userRoles.some(r => ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(r)) : ['admin', 'super_admin'].includes(userRoles);
    if (!isSuperOrAdmin && media.uploadedBy?.toString() !== (session.user as any).id) {
        return NextResponse.json({ error: 'Unauthorized to edit this media' }, { status: 403 });
    }

    // Update in DB
    media.filename = newFilename;
    await media.save();

    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error("Failed to rename media:", error);
    return NextResponse.json({ error: "Failed to rename media" }, { status: 500 });
  }
}
