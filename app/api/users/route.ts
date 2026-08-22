import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    const userRoles = (session?.user as any)?.roles || [];
    const hasAdminRights = Array.isArray(userRoles) 
       ? userRoles.some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin'].includes(r))
       : ['super_admin', 'admin'].includes(userRoles);

    if (!session || !hasAdminRights) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    await dbConnect();
    
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find({}, '-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return NextResponse.json({
        users,
        totalPages,
        currentPage: page
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserRoles = (session?.user as any)?.roles || [];
    const hasAdminRights = Array.isArray(currentUserRoles) 
       ? currentUserRoles.some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin'].includes(r))
       : ['super_admin', 'admin'].includes(currentUserRoles);

    if (!session || !hasAdminRights) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, roles, title, bio } = body;

    if (!name || !email || !password) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Check availability
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    // Role restrictions
    const isCurrentUserAdminOnly = !currentUserRoles.some((r: string) => ['SUPER_ADMIN', 'super_admin'].includes(r));
    const targetRoles = Array.isArray(roles) ? roles.map(r => r.toUpperCase()) : [];
    if (isCurrentUserAdminOnly && targetRoles.some(r => ['ADMIN', 'SUPER_ADMIN'].includes(r))) {
         return NextResponse.json({ error: 'Admins cannot create other Admins' }, { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        roles: targetRoles.length > 0 ? targetRoles : ['USER'],
        title: title || '',
        bio: bio || '',
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    });

    // Valid response excluding password
    const { password: _, ...userWithoutPass } = newUser.toObject();

    return NextResponse.json(userWithoutPass, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
