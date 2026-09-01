import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Poster from '@/models/Poster';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch the most recently created active poster
    const activePoster = await Poster.findOne({ isActive: true }).sort({ createdAt: -1 }).lean();
    
    if (!activePoster) {
      return NextResponse.json({ message: 'No active posters' }, { status: 404 });
    }

    return NextResponse.json(activePoster);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
