import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Toast from '@/models/Toast';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    await dbConnect();

    // Determine Audience Scope
    const isGuest = !session;
    const queryConds: any[] = [{ targetAudience: 'ALL' }];
    
    if (isGuest) {
      queryConds.push({ targetAudience: 'GUESTS' });
    } else {
      queryConds.push({ targetAudience: 'LOGGED_IN' });
    }

    let activeToasts = await Toast.find({ 
      isActive: true,
      $or: queryConds
    }).sort({ createdAt: -1 });

    // Seed initial feedback toast if collection is entirely empty to satisfy the user request
    const totalCount = await Toast.countDocuments();
    if (totalCount === 0) {
       const initialToast = await Toast.create({
          title: "Feedback Matters",
          message: "CSWITHBS is actively being built! Your feedback, bug reports, and suggestions are incredibly valuable to us.",
          icon: "message",
          linkText: "Share Feedback",
          linkUrl: "/contact?type=feedback",
          isActive: true,
          targetAudience: "ALL"
       });
       if (queryConds.some(c => c.targetAudience === initialToast.targetAudience)) {
           activeToasts = [initialToast];
       }
    }

    return NextResponse.json(activeToasts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
