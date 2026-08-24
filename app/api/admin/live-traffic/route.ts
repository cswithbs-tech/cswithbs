import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Visitor from '@/models/Visitor';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRoles = (session?.user as any)?.roles || [];
    
    const hasAdminRole = Array.isArray(userRoles) 
       ? userRoles.some((r: string) => ["ADMIN", "SUPER_ADMIN", "admin", "super_admin"].includes(r))
       : ["admin", "super_admin"].includes(userRoles);

    if (!session || !hasAdminRole) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();

    // Fetch the 100 most recent visitors
    const visitors = await Visitor.find()
      .sort({ lastSeen: -1 })
      .limit(100)
      .lean();

    // Decode any previously encoded city names for older data
    const formattedVisitors = visitors.map(v => {
      let decodedCity = v.city;
      if (decodedCity && decodedCity !== 'Unknown') {
        try {
          decodedCity = decodeURIComponent(decodedCity);
        } catch (e) {
          // Keep as is if it fails
        }
      }

      let device = v.device || 'Desktop';
      if (device) {
        device = device.charAt(0).toUpperCase() + device.slice(1);
      }

      return {
        ...v,
        city: decodedCity,
        device: device
      };
    });

    return NextResponse.json({
        visitors: formattedVisitors
    });

  } catch (error) {
    console.error('Error fetching live traffic:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
