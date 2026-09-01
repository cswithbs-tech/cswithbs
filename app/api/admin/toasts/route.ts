import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Toast from '@/models/Toast';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper to check admin access
const isAdmin = (session: any) => {
  const roles = session?.user?.roles || [];
  return Array.isArray(roles)
    ? roles.some((r: string) => ['SUPER_ADMIN', 'ADMIN'].includes(r.toUpperCase()))
    : ['SUPER_ADMIN', 'ADMIN'].includes((roles as string).toUpperCase());
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const toasts = await Toast.find().sort({ createdAt: -1 });
    return NextResponse.json(toasts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    await dbConnect();

    const newToast = await Toast.create(data);
    return NextResponse.json(newToast, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
