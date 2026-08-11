import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subscriber from '@/models/Subscriber';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRoles = (session?.user as any)?.roles || [];
    const hasAdminRole = Array.isArray(userRoles) ? userRoles.some((r) => ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(r)) : ['admin', 'super_admin'].includes(userRoles);
    if (!session || !hasAdminRole) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();

    // Support simple search via query params
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    let filter = {};
    if (query) {
      filter = { 
        email: { $regex: query, $options: 'i' } 
      };
    }

    const subscribers = await Subscriber.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error("Fetch subscribers error:", error);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRoles = (session?.user as any)?.roles || [];

    // Only Admin can delete subscribers
    const hasAdminRole = Array.isArray(userRoles)
      ? userRoles.some((r: string) => ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(r))
      : ['admin', 'super_admin'].includes(userRoles);
    if (!session || !hasAdminRole) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
       return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 });
    }

    await dbConnect();
    await Subscriber.findByIdAndDelete(id);

    return NextResponse.json({ message: "Subscriber removed" });

  } catch (error) {
    console.error("Delete subscriber error:", error);
    return NextResponse.json({ error: "Failed to delete subscriber" }, { status: 500 });
  }
}
