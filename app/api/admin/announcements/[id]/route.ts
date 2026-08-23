import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const roles = (session?.user as any)?.roles || [];
    // Strictly SUPER_ADMIN only
    const isSuperAdmin = roles.some((r: string) => ['SUPER_ADMIN', 'super_admin'].includes(r));
    
    if (!session || !isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Only Super Admins can view broadcast stats' }, { status: 403 });
    }

    await dbConnect();
    
    const notification = await Notification.findById(id).lean();
    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    let usersQuery = {};
    if (notification.recipient) {
      usersQuery = { _id: notification.recipient };
    }

    const allUsers = await User.find(usersQuery).select('name email image readNotifications hiddenNotifications').lean();
    
    const stats = {
      readBy: [] as any[],
      hiddenBy: [] as any[],
      unseenBy: [] as any[],
      total: allUsers.length
    };

    allUsers.forEach(user => {
      const u = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image
      };
      
      const hasRead = user.readNotifications?.some((nid: any) => nid.toString() === id);
      const hasHidden = user.hiddenNotifications?.some((nid: any) => nid.toString() === id);
      
      if (hasHidden) {
        stats.hiddenBy.push(u);
      } else if (hasRead) {
        stats.readBy.push(u);
      } else {
        stats.unseenBy.push(u);
      }
    });

    return NextResponse.json({ notification, stats });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const roles = (session?.user as any)?.roles || [];
    const isAdmin = roles.some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin'].includes(r));
    
    if (!session || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    
    const notification = await Notification.findByIdAndDelete(id);
    
    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Broadcast retracted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
