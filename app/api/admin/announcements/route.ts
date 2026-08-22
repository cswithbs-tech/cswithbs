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
