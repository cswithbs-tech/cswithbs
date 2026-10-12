import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Subscriber from '@/models/Subscriber';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userRoles = (session?.user as any)?.roles || [];
    const hasAdminRole = Array.isArray(userRoles)
      ? userRoles.some((r: string) => ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(r))
      : ['admin', 'super_admin'].includes(userRoles);

    if (!session || !hasAdminRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();

    // 1. Fetch all registered users
    const users = await User.find({}, 'email name createdAt').lean();

    // 2. Fetch all existing subscribers
    const existingSubscribers = await Subscriber.find({}, 'email').lean();
    const existingEmails = new Set(
      existingSubscribers.map((s: any) => s.email?.toLowerCase().trim())
    );

    // 3. Find unique registered users that are NOT yet in subscribers
    const newSubscribersToInsert: any[] = [];
    const seenNewEmails = new Set<string>();

    for (const user of users) {
      if (!user.email) continue;
      const cleanEmail = user.email.toLowerCase().trim();

      if (!existingEmails.has(cleanEmail) && !seenNewEmails.has(cleanEmail)) {
        seenNewEmails.add(cleanEmail);
        newSubscribersToInsert.push({
          email: cleanEmail,
          source: 'registered-user',
          active: true,
          createdAt: user.createdAt || new Date(),
        });
      }
    }

    // 4. Bulk insert if there are any new subscribers
    if (newSubscribersToInsert.length > 0) {
      try {
        const ops = newSubscribersToInsert.map((item) => ({
          updateOne: {
            filter: { email: item.email },
            update: {
              $setOnInsert: {
                email: item.email,
                source: item.source,
                active: true,
                createdAt: item.createdAt,
              },
            },
            upsert: true,
          },
        }));
        await Subscriber.bulkWrite(ops);
      } catch (insertErr) {
        console.error("Bulk insert warning (some duplicates skipped):", insertErr);
      }
    }

    const totalSubscribers = await Subscriber.countDocuments();
    const activeSubscribers = await Subscriber.countDocuments({ active: { $ne: false } });

    return NextResponse.json({
      success: true,
      addedCount: newSubscribersToInsert.length,
      totalRegisteredUsers: users.length,
      totalSubscribers,
      activeSubscribers,
      message:
        newSubscribersToInsert.length > 0
          ? `Successfully synced ${newSubscribersToInsert.length} new registered users into subscribers!`
          : 'All registered users are already in your subscriber audience (no duplicates).',
    });
  } catch (error: any) {
    console.error('Subscriber sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync subscribers' },
      { status: 500 }
    );
  }
}
