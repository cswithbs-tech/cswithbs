import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Toast from '@/models/Toast';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const isAdmin = (session: any) => {
  const roles = session?.user?.roles || [];
  return Array.isArray(roles)
    ? roles.some((r: string) => ['SUPER_ADMIN', 'ADMIN'].includes(r.toUpperCase()))
    : ['SUPER_ADMIN', 'ADMIN'].includes((roles as string).toUpperCase());
};

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const data = await req.json();
    
    await dbConnect();

    const updatedToast = await Toast.findByIdAndUpdate(id, data, { new: true });
    
    if (!updatedToast) {
      return NextResponse.json({ error: 'Toast not found' }, { status: 404 });
    }

    return NextResponse.json(updatedToast);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();
    
    const deletedToast = await Toast.findByIdAndDelete(id);
    
    if (!deletedToast) {
      return NextResponse.json({ error: 'Toast not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Toast deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
