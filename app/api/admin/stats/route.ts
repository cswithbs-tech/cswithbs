import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Post from '@/models/Post';
import Comment from '@/models/Comment';
import Subscriber from '@/models/Subscriber';
import Settings from '@/models/Settings';
import Visitor from '@/models/Visitor';
import PageView from '@/models/PageView';
import Contact from '@/models/Contact';
import Subject from '@/models/Subject';
import Note from '@/models/Note';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';
import { normalizeCountry } from '@/lib/country';

export const dynamic = 'force-dynamic';

export async function GET() {
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

    // Parallel fetch for dashboard stats
    const [
      totalRegisteredUsers,
      totalPosts,
      totalSubscribers,
      totalPageViews,
      totalUniqueVisitors,
      activeUsers,
      recentUsers, // Registered users
      recentVisits, // Anonymous visitors
      topPosts, // Top Viewed Posts (Added)
      deviceStats,
      browserStats,
      osStats,
      rawCountryStats,
      referrerStats,
      unreadCount,
      totalComments,
      settings,
      totalCourses,
      totalLessons,
      topLessons
    ] = await Promise.all([
      User.countDocuments({}),
      Post.countDocuments({}),
      Subscriber.countDocuments({}),
      PageView.countDocuments({}), // "Total Page Views"
      Visitor.countDocuments({}),  // "Total Unique Visitors"
      
      // Active Users (Last 5 mins)
      Visitor.countDocuments({ 
          lastSeen: { $gte: new Date(Date.now() - 5 * 60 * 1000) } 
      }),

      User.find().sort({ createdAt: -1 }).limit(5).lean(),
      Visitor.find().sort({ lastSeen: -1 }).limit(10).lean(),
      Post.find().sort({ views: -1 }).limit(5).select('title views category').lean(), // Top Posts

      // Breakdowns (Audience)
      Visitor.aggregate([
          { $group: { _id: "$device", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
      ]),
      Visitor.aggregate([
          { $group: { _id: "$browser", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
      ]),
      Visitor.aggregate([
          { $group: { _id: "$os", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
      ]),
      Visitor.aggregate([
          { $group: { _id: "$country", count: { $sum: 1 } } }
      ]),
      Visitor.aggregate([
          { $group: { _id: "$referrer", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
      ]),

      // Unread Messages
      Contact.countDocuments({ read: false }),
      Comment.countDocuments({}),
      Settings.findOne(),

      // New Education Metrics
      Subject.countDocuments({}),
      Note.countDocuments({}),
      Note.find().sort({ views: -1 }).limit(5).select('title views subject chapter').lean()
    ]);

    // Normalize and merge duplicate country representations (e.g. "IN" and "India")
    const countryMap = new Map<string, { code: string; name: string; count: number }>();
    for (const raw of (rawCountryStats || [])) {
      if (!raw._id || raw._id === "Unknown") continue;
      const { code, name } = normalizeCountry(raw._id);
      if (!code || code === "UN") continue;

      const existing = countryMap.get(code);
      if (existing) {
        existing.count += raw.count;
      } else {
        countryMap.set(code, { code, name, count: raw.count });
      }
    }

    const countryStats = Array.from(countryMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(c => ({
        _id: c.code,
        code: c.code,
        name: c.name,
        country: c.name,
        count: c.count
      }));

    // Chart Data (Page Views Last 7 Days)
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const viewsLast7Days = await PageView.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          visitors: { $addToSet: "$visitorId" }
        }
      },
      {
        $project: {
          _id: 1,
          count: { $size: "$visitors" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing days
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const record = viewsLast7Days.find((r: any) => r._id === dateStr);
        chartData.push({
            date: dateStr,
            visitors: record ? record.count : 0
        });
    }

    return NextResponse.json({
        metrics: {
            users: totalRegisteredUsers,
            posts: totalPosts,
            subscribers: totalSubscribers,
            visitors: totalPageViews,
            comments: totalComments,
            courses: totalCourses,
            lessons: totalLessons
        },
        
        totalVisitors: totalUniqueVisitors, 
        activeUsers,
        recentVisits,
        topPosts,
        topLessons,
        deviceStats,
        browserStats,
        osStats,
        countryStats,
        referrerStats,
        uptime: process.uptime(),
        dbStatus: mongoose.connection.readyState === 1,
        unreadMessages: unreadCount,
        maintenanceMode: settings?.maintenanceMode || false,
        
        charts: {
            visitors: chartData
        }
    });

  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
