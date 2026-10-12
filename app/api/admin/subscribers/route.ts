import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subscriber from '@/models/Subscriber';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRoles = (session?.user as any)?.roles || [];
    const hasAdminRole = Array.isArray(userRoles)
      ? userRoles.some((r) => ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(r))
      : ['admin', 'super_admin'].includes(userRoles);

    if (!session || !hasAdminRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const status = searchParams.get('status'); // 'all', 'active', 'inactive'
    const source = searchParams.get('source'); // 'all', 'homepage', 'registered-user', etc.
    const isExport = searchParams.get('export') === 'true' || searchParams.get('all') === 'true';

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));

    // Build filter
    const filter: any = {};
    if (query) {
      filter.email = { $regex: query, $options: 'i' };
    }
    if (status === 'active') {
      filter.active = { $ne: false };
    } else if (status === 'inactive') {
      filter.active = false;
    }
    if (source && source !== 'all') {
      filter.source = source;
    }

    // Export mode: return raw array without pagination
    if (isExport) {
      const allSubscribers = await Subscriber.find(filter).sort({ createdAt: -1 }).lean();
      return NextResponse.json(allSubscribers);
    }

    // Paginated fetch & stats in parallel
    const [
      subscribers,
      filteredCount,
      totalCount,
      activeCount,
      inactiveCount,
      totalRegisteredUsers,
    ] = await Promise.all([
      Subscriber.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Subscriber.countDocuments(filter),
      Subscriber.countDocuments({}),
      Subscriber.countDocuments({ active: { $ne: false } }),
      Subscriber.countDocuments({ active: false }),
      User.countDocuments({}),
    ]);

    const totalPages = Math.ceil(filteredCount / limit) || 1;

    return NextResponse.json({
      subscribers,
      pagination: {
        page,
        limit,
        total: filteredCount,
        totalPages,
      },
      stats: {
        total: totalCount,
        active: activeCount,
        inactive: inactiveCount,
        registeredUsers: totalRegisteredUsers,
      },
    });
  } catch (error) {
    console.error("Fetch subscribers error:", error);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRoles = (session?.user as any)?.roles || [];
    const hasAdminRole = Array.isArray(userRoles)
      ? userRoles.some((r: string) => ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(r))
      : ['admin', 'super_admin'].includes(userRoles);
    if (!session || !hasAdminRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { email, source } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    await dbConnect();
    const cleanEmail = email.trim().toLowerCase();

    const existing = await Subscriber.findOne({ email: cleanEmail });
    if (existing) {
      existing.active = true;
      await existing.save();
      return NextResponse.json({ message: 'Subscriber reactivated', subscriber: existing });
    }

    const newSub = await Subscriber.create({
      email: cleanEmail,
      source: source || 'admin-manual',
      active: true,
    });

    return NextResponse.json({ message: 'Subscriber added', subscriber: newSub }, { status: 201 });
  } catch (error: any) {
    console.error("Create subscriber error:", error);
    return NextResponse.json({ error: error.message || "Failed to add subscriber" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRoles = (session?.user as any)?.roles || [];
    const hasAdminRole = Array.isArray(userRoles)
      ? userRoles.some((r: string) => ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(r))
      : ['admin', 'super_admin'].includes(userRoles);
    if (!session || !hasAdminRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, active } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 });
    }

    await dbConnect();
    const updated = await Subscriber.findByIdAndUpdate(
      id,
      { active: Boolean(active) },
      { new: true }
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Update subscriber error:", error);
    return NextResponse.json({ error: "Failed to update subscriber" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRoles = (session?.user as any)?.roles || [];

    const hasAdminRole = Array.isArray(userRoles)
      ? userRoles.some((r: string) => ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(r))
      : ['admin', 'super_admin'].includes(userRoles);
    if (!session || !hasAdminRole) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 });
    }

    await dbConnect();
    await Subscriber.findByIdAndDelete(id);

    return NextResponse.json({ message: "Subscriber removed" });
  } catch (error) {
    console.error("Delete subscriber error:", error);
    return NextResponse.json({ error: "Failed to delete subscriber" }, { status: 500 });
  }
}
