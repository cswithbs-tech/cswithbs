import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const userId = (session.user as any).id;

    // Fetch all applicable notifications for this user
    const notifications = await Notification.find({
      $or: [{ recipient: null }, { recipient: userId }]
    }).select('_id');

    const notificationIds = notifications.map(n => n._id.toString());

    // Add all these IDs to the user's readNotifications array
    await User.findByIdAndUpdate(userId, {
      $addToSet: { readNotifications: { $each: notificationIds } }
    });

    return NextResponse.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
