import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const roles = (session?.user as any)?.roles || [];
    const isAdmin = roles.some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin'].includes(r));
    
    if (!session || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const isSubscriberOnly = searchParams.get('subscribers') === 'true';

    await dbConnect();
    
    // Build query
    const query: any = {};
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }
    
    // We don't have a newsletter subscriber field strictly tracked right now 
    // unless we check Newsletter model, but for now we just return users.
    
    const users = await User.find(query, '_id name email image')
      .limit(20)
      .lean();
      
    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
