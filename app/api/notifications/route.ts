import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const userId = (session.user as any).id;

    // Fetch user so we have readNotifications and hiddenNotifications array
    const user = await User.findById(userId).select('readNotifications hiddenNotifications');
    const readIds = user?.readNotifications?.map((id: any) => id.toString()) || [];
    const hiddenIds = user?.hiddenNotifications?.map((id: any) => id.toString()) || [];

    // Fetch notifications:
    // 1. Where _id is not in hiddenIds
    // 2. Where recipient is null (global) OR recipient is userId (personal)
    const notifications = await Notification.find({
      _id: { $nin: hiddenIds },
      $or: [{ recipient: null }, { recipient: userId }]
    }).sort({ createdAt: -1 }).limit(50);

    // Map through and attach an `isRead` flag based on if the ID is in the user's readNotifications array
    const formatted = notifications.map(notif => {
      const doc = notif.toObject();
      return {
        ...doc,
        isRead: readIds.includes(doc._id.toString())
      };
    });

    const unreadCount = formatted.filter(n => !n.isRead).length;

    return NextResponse.json({ notifications: formatted, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId } = await req.json();
    if (!notificationId) {
      return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 });
    }

    await dbConnect();
    const userId = (session.user as any).id;

    // Add this notification ID to the user's readNotifications array if not already present
    await User.findByIdAndUpdate(userId, {
      $addToSet: { readNotifications: notificationId }
    });

    return NextResponse.json({ message: 'Marked as read' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
