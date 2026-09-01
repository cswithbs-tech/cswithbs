import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Poster from '@/models/Poster';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper to check admin access
const isAdmin = (session: any) => {
  const roles = session?.user?.roles || [];
  return Array.isArray(roles)
    ? roles.some((r: string) => ['SUPER_ADMIN', 'ADMIN'].includes(r.toUpperCase()))
    : ['SUPER_ADMIN', 'ADMIN'].includes((roles as string).toUpperCase());
};

// UPDATE a poster
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const data = await req.json();
    await dbConnect();

    // If making this one active, we might want to deactivate others (optional, depending on requirements)
    // For now, let's just update the specific poster.
    const updatedPoster = await Poster.findByIdAndUpdate(id, data, { new: true });
    
    if (!updatedPoster) {
      return NextResponse.json({ error: 'Poster not found' }, { status: 404 });
    }

    return NextResponse.json(updatedPoster);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE a poster
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const deletedPoster = await Poster.findByIdAndDelete(id);
    if (!deletedPoster) {
      return NextResponse.json({ error: 'Poster not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Poster deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
