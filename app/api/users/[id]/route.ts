import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Post from '@/models/Post';
import Category from '@/models/Category';
import Collaboration from '@/models/Collaboration';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET Public User Profile
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();

    // Fetch user but exclude sensitive fields like password
    const user = await User.findById(id).select('-password');
    
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch Authored Posts
    const posts = await Post.find({ 
        author: user._id, 
        status: 'published' 
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate({ path: "category", model: Category, select: "name" })
    .lean();

    // Fetch Collaborations
    const collaborations = await Collaboration.find({
        student: user._id,
        status: 'published'
    })
    .sort({ createdAt: -1 })
    .lean();

    return NextResponse.json({
        ...user.toObject(),
        posts: posts.map(p => ({
            ...p,
            _id: p._id.toString(),
            createdAt: p.createdAt.toISOString(),
            category: p.category?.name || "Uncategorized" // Flatten object to string
        })),
        collaborations: collaborations.map(c => ({
            ...c,
            _id: c._id.toString(),
            createdAt: c.createdAt.toISOString()
        }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// DELETE User
// DELETE User
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserRoles = (session?.user as any)?.roles || [];
    const hasAdminRights = Array.isArray(currentUserRoles) 
       ? currentUserRoles.some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin'].includes(r))
       : ['SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin'].includes(currentUserRoles);
    const currentUserId = (session?.user as any)?.id;

    if (!session || !hasAdminRights) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    // Prevent self-deletion
    if (id === currentUserId) {
        return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    await dbConnect();
    const targetUser = await User.findById(id);

    if (!targetUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Role-based deletion logic
    const isSuperAdmin = Array.isArray(currentUserRoles) 
       ? currentUserRoles.some((r: string) => ['SUPER_ADMIN', 'super_admin'].includes(r))
       : ['SUPER_ADMIN', 'super_admin'].includes(currentUserRoles);

    if (!isSuperAdmin) {
        // Admins cannot delete other Admins or Super Admins
        if (targetUser.roles?.some((r: string) => ['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(r))) {
            return NextResponse.json({ error: 'Unauthorized: Cannot delete a superior or peer' }, { status: 403 });
        }
    }
    
    // Super Admins can delete anyone (except themselves, handled above)

    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE User Role
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
      const session = await getServerSession(authOptions);
      const currentUserRoles = (session?.user as any)?.roles || [];
      const hasAdminRights = Array.isArray(currentUserRoles) 
         ? currentUserRoles.some((r: string) => ['SUPER_ADMIN', 'ADMIN', 'super_admin', 'admin'].includes(r))
         : ['super_admin', 'admin'].includes(currentUserRoles);

      if (!session || !hasAdminRights) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
  
      const { id } = await params;
      const body = await req.json();
      const { roles: newRoles, isPremium, isCourseRestricted } = body;
      
      const updateData: any = {};

      if (newRoles !== undefined) {
        const validRoles = ['USER', 'ADMIN', 'WRITER', 'SUPER_ADMIN'];
        if (!Array.isArray(newRoles) || !newRoles.every(r => validRoles.includes(r.toUpperCase()))) {
            return NextResponse.json({ error: 'Invalid roles' }, { status: 400 });
        }
        updateData.roles = newRoles;
      }

      if (isPremium !== undefined) {
          updateData.isPremium = Boolean(isPremium);
      }

      if (isCourseRestricted !== undefined) {
          updateData.isCourseRestricted = Boolean(isCourseRestricted);
      }

      if (Object.keys(updateData).length === 0) {
          return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
      }

      await dbConnect();
      
      // Fetch target user to check their current rank
      const targetUser = await User.findById(id);
      if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      // LOGIC MATRIX:
      // Super Admin: Can do anything.
      // Admin: 
      //    - Can set role to 'user' or 'writer'.
      //    - CANNOT set role to 'admin' or 'super_admin'.
      //    - CANNOT modify a target who is currently 'admin' or 'super_admin'.

      const isCurrentUserAdminOnly = !currentUserRoles.some((r: string) => ['SUPER_ADMIN', 'super_admin'].includes(r));
      if (isCurrentUserAdminOnly && newRoles !== undefined) {
          // 1. Prevent promoting to admin/super_admin
          if (newRoles.some((r: string) => ['ADMIN', 'SUPER_ADMIN'].includes(r.toUpperCase()))) {
              return NextResponse.json({ error: 'Unauthorized: Admins cannot create other Admins' }, { status: 403 });
          }
          // 2. Prevent modifying existing admins
          if (targetUser.roles?.some((r: string) => ['ADMIN', 'SUPER_ADMIN'].includes(r))) {
               return NextResponse.json({ error: 'Unauthorized: Cannot modify a superior or peer' }, { status: 403 });
          }
      }

      // If admin tries to edit premium, we can allow it or restrict it based on rules,
      // currently allowing it since there are no explicit restrictions.

      const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
  
      return NextResponse.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
