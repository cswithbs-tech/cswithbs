import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userRoles = (session?.user as any)?.roles || [];
    const hasSuperAdminRole = Array.isArray(userRoles) ? userRoles.some((r) => ['SUPER_ADMIN', 'super_admin'].includes(r)) : userRoles === 'super_admin';
    if (!session || !hasSuperAdminRole) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    revalidatePath('/', 'layout'); // Purge everything
    return NextResponse.json({ message: 'Global cache purged' });
  } catch (err) {
    console.error("Cache purge failed:", err);
    return NextResponse.json({ error: 'Failed to purge cache' }, { status: 500 });
  }
}
