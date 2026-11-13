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
    const limitParam = searchParams.get('limit');
    const rolesParam = searchParams.get('roles') || searchParams.get('role');
    const sortBy = searchParams.get('sortBy') || (rolesParam ? 'name' : 'createdAt');
    const orderParam = searchParams.get('order');
    const order = orderParam === 'asc' ? 1 : orderParam === 'desc' ? -1 : (sortBy === 'name' ? 1 : -1);

    await dbConnect();

    const dbQuery: any = {};
    if (rolesParam) {
      const rolesArray = rolesParam.split(',').map((r: string) => r.trim()).filter(Boolean);
      if (rolesArray.length > 0) {
        const rolesRegex = rolesArray.map((r: string) => new RegExp(`^${r}$`, 'i'));
        dbQuery.$or = [
          { roles: { $in: rolesRegex } },
          { role: { $in: rolesRegex } }
        ];
      }
    }

    const search = searchParams.get('search') || searchParams.get('query');
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const searchCondition = [{ name: searchRegex }, { email: searchRegex }];
      if (dbQuery.$or) {
        dbQuery.$and = [
          { $or: dbQuery.$or },
          { $or: searchCondition }
        ];
        delete dbQuery.$or;
      } else {
        dbQuery.$or = searchCondition;
      }
    }

    const totalUsers = await User.countDocuments(dbQuery);

    let queryBuilder = User.find(dbQuery, '-password').sort({ [sortBy]: order });

    if (limitParam === 'all' || limitParam === '0') {
      // Return all matching without pagination
    } else {
      const limit = parseInt(limitParam || '10');
      const skip = (page - 1) * limit;
      queryBuilder = queryBuilder.skip(skip).limit(limit);
    }

    const users = await queryBuilder.lean();
    const limit = limitParam === 'all' || limitParam === '0' ? totalUsers : parseInt(limitParam || '10');
    const totalPages = limit > 0 ? Math.ceil(totalUsers / limit) : 1;

    return NextResponse.json({
        users,
        totalPages,
        currentPage: page,
        totalUsers
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
