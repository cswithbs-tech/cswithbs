import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET History of Announcements
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const roles = (session?.user as any)?.roles || [];
    const isAdmin = roles.some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin'].includes(r));
    
    if (!session || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .populate({ path: 'recipient', model: User, select: 'name email image' })
      .limit(50);
      
    return NextResponse.json({ notifications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST a new Announcement
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const roles = (session?.user as any)?.roles || [];
    const isAdmin = roles.some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin'].includes(r));
    
    if (!session || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { type, recipientId, title, message, link } = await req.json();

    if (!type || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    const recipient = recipientId === 'ALL' || !recipientId ? null : recipientId;

    const newNotification = await Notification.create({
      type,
      recipient,
      title,
      message,
      link: link || ''
    });

    return NextResponse.json({ 
      message: 'Announcement broadcasted successfully!',
      notification: newNotification
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Bulk DELETE or Clean Old Announcements
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const roles = (session?.user as any)?.roles || [];
    const isAdmin = roles.some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin'].includes(r));
    
    if (!session || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { ids, keepLatest10 } = await req.json();

    await dbConnect();

    // Option 1: Clean old global broadcasts, keeping latest 10 (individual personal messages are NEVER touched!)
    if (keepLatest10) {
      const latest10 = await Notification.find({ recipient: null })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('_id')
        .lean();
      
      const keepIds = latest10.map((n: any) => n._id);

      const result = await Notification.deleteMany({
        recipient: null,
        _id: { $nin: keepIds },
      });

      return NextResponse.json({ 
        message: `Cleaned up ${result.deletedCount} old global broadcasts. Latest 10 and all personal messages preserved.` 
      });
    }

    // Option 2: Delete selected IDs
    if (Array.isArray(ids) && ids.length > 0) {
      const result = await Notification.deleteMany({ _id: { $in: ids } });
      return NextResponse.json({ message: `Deleted ${result.deletedCount} notification(s) successfully.` });
    }

    return NextResponse.json({ error: 'No notifications specified for deletion' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
