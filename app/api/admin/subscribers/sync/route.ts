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

    // 1. Fetch all admin/super admin users to strictly exclude them
    const adminUsers = await User.find(
      { roles: { $in: ['ADMIN', 'SUPER_ADMIN'] } },
      'email'
    ).lean();
    const adminEmails = new Set(
      adminUsers.map((u: any) => (u.email || '').toLowerCase().trim()).filter(Boolean)
    );

    // Safety purge: Ensure no admin/staff emails remain in Subscriber collection
    if (adminEmails.size > 0) {
      await Subscriber.deleteMany({ email: { $in: Array.from(adminEmails) } });
    }

    // 2. Fetch only registered non-admin users (students and regular learners)
    const users = await User.find(
      { roles: { $nin: ['ADMIN', 'SUPER_ADMIN'] } },
      'email name createdAt'
    ).lean();

    // 3. Fetch all existing subscribers
    const existingSubscribers = await Subscriber.find({}, 'email').lean();
    const existingEmails = new Set(
      existingSubscribers.map((s: any) => s.email?.toLowerCase().trim())
    );

    // 4. Find unique registered users that are NOT yet in subscribers and NOT admins
    const newSubscribersToInsert: any[] = [];
    const seenNewEmails = new Set<string>();

    for (const user of users) {
      if (!user.email) continue;
      const cleanEmail = user.email.toLowerCase().trim();

      if (
        !adminEmails.has(cleanEmail) &&
        !existingEmails.has(cleanEmail) &&
        !seenNewEmails.has(cleanEmail)
      ) {
        seenNewEmails.add(cleanEmail);
        newSubscribersToInsert.push({
          email: cleanEmail,
          source: 'registered-user',
          active: true,
          createdAt: user.createdAt || new Date(),
        });
      }
    }

    // 5. Bulk insert if there are any new subscribers
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
    const totalUsersCount = await User.countDocuments();

    return NextResponse.json({
      success: true,
      addedCount: newSubscribersToInsert.length,
      totalRegisteredUsers: totalUsersCount,
      adminCount: adminEmails.size,
      studentUsersCount: users.length,
      totalSubscribers,
      activeSubscribers,
      message:
        newSubscribersToInsert.length > 0
          ? `Successfully synced ${newSubscribersToInsert.length} new registered users into subscribers! (Excluding ${adminEmails.size} admin accounts)`
          : `All student accounts are already synced (${adminEmails.size} admin accounts excluded).`,
    });
  } catch (error: any) {
    console.error('Subscriber sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync subscribers' },
      { status: 500 }
    );
  }
}
