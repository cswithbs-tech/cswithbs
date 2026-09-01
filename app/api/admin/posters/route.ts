import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Poster from '@/models/Poster';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper to check admin access
const isAdmin = (session: any) => {
  const roles = session?.user?.roles || [];
  return Array.isArray(roles)
    ? roles.some((r: string) => ['SUPER_ADMIN', 'ADMIN'].includes(r.toUpperCase()))
    : ['SUPER_ADMIN', 'ADMIN'].includes((roles as string).toUpperCase());
};

// GET all posters
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    const posters = await Poster.find().sort({ createdAt: -1 });
    return NextResponse.json(posters);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST a new poster
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const data = await req.json();
    await dbConnect();

    // If this one is set to active, optionally we could deactivate others,
    // but the schema allows multiple active (or the frontend can pick the latest one).
    // Let's just create it.
    const newPoster = await Poster.create(data);
    return NextResponse.json(newPoster, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
