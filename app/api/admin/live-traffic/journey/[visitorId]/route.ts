import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PageView from '@/models/PageView';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{ visitorId: string }> }) {
  try {
    const { visitorId } = await params;
    const session = await getServerSession(authOptions);
    const userRoles = (session?.user as any)?.roles || [];
    
    const hasAdminRole = Array.isArray(userRoles) 
       ? userRoles.some((r: string) => ["ADMIN", "SUPER_ADMIN", "admin", "super_admin"].includes(r))
       : ["admin", "super_admin"].includes(userRoles);

    if (!session || !hasAdminRole) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();

    // Fetch the visitor's page views chronologically
    const journey = await PageView.find({ visitorId })
      .sort({ createdAt: 1 }) // Chronological order
      .lean();

    return NextResponse.json({
        journey: journey
    });

  } catch (error) {
    console.error('Error fetching visitor journey:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
