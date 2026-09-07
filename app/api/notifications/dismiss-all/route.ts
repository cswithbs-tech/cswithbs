import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationIds } = await req.json();
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'Missing or invalid notificationIds' }, { status: 400 });
    }

    await dbConnect();
    const userId = (session.user as any).id;

    // Add these notification IDs to the user's hiddenNotifications array
    await User.findByIdAndUpdate(userId, {
      $addToSet: { hiddenNotifications: { $each: notificationIds } }
    });

    return NextResponse.json({ message: 'All dismissed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
