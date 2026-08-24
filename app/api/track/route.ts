
import { NextResponse } from 'next/server';
import Visitor from '@/models/Visitor';
import PageView from '@/models/PageView';
import dbConnect from '@/lib/db';
import { UAParser } from 'ua-parser-js';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { path, referrer, visitorId } = body;
    
    // 0. Ignore Development Traffic to prevent polluting analytics
    if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({ success: true, ignored: true, reason: 'development_mode' });
    }

    // 1. Validate Input & Backwards Compatibility
    // If no visitorId provided (cached client), fallback to IP as ID
    const effectiveVisitorId = visitorId || (request.headers.get('x-forwarded-for') ? request.headers.get('x-forwarded-for')!.split(',')[0].trim() : '127.0.0.1');

    // 2. Ignore Admin Paths & API calls (except this one)
    if (path.startsWith('/admin') || path.startsWith('/api') || path.startsWith('/_next')) {
        return NextResponse.json({ success: true, ignored: true });
    }

    // 3. User Agent Parsing
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    const browserName = result.browser.name || 'Unknown';
    const osName = result.os.name || 'Unknown';
    let deviceType = result.device.type || 'Desktop';
    if (deviceType) {
        deviceType = deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
    }

    // 4. IP Extraction
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    // 5. Advanced Geolocation Resolution (IP-API with Vercel fallback)
    let country = request.headers.get('x-vercel-ip-country') || 'Unknown';
    let city = request.headers.get('x-vercel-ip-city') || 'Unknown';
    let isp = 'Unknown';
    let timezone = 'Unknown';
    let region = 'Unknown';
    
    if (city && city !== 'Unknown') {
        try { city = decodeURIComponent(city); } catch (e) {}
    }

    // Try to fetch high-fidelity data from IP-API if we have a real IP
    if (ip && ip !== '127.0.0.1' && ip !== '::1') {
        try {
            // timeout of 1500ms to avoid blocking track request for too long
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500);
            const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,timezone`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (geoRes.ok) {
                const geoData = await geoRes.json();
                if (geoData.status === 'success') {
                    country = geoData.country || country;
                    city = geoData.city || city;
                    isp = geoData.isp || isp;
                    timezone = geoData.timezone || timezone;
                    region = geoData.regionName || region;
                }
            }
        } catch (err) {
            console.error("IP-API fetch failed", err);
        }
    }

    // 5b. UTM Parameter Extraction
    let utmSource = "";
    let utmMedium = "";
    let utmCampaign = "";
    try {
        const urlObj = new URL(path, "http://dummy");
        utmSource = urlObj.searchParams.get("utm_source") || "";
        utmMedium = urlObj.searchParams.get("utm_medium") || "";
        utmCampaign = urlObj.searchParams.get("utm_campaign") || "";
    } catch(e) {}

    
    // 6. Manage Unique Visitor (Atomic Upsert by Visitor ID)
    const updates: any = {
        $set: {
            lastSeen: new Date(),
            path,
            browser: browserName,
            os: osName,
            device: deviceType,
            country: country, // Always update geo in case they move/vpn
            city: city,
            ip: ip, // Keep latest IP
            isp,
            timezone
        },
        $inc: { visitCount: 1 },
        $setOnInsert: { 
            createdAt: new Date(),
            referrer: referrer || 'Direct',
            visitorId: effectiveVisitorId,
            utmSource,
            utmMedium,
            utmCampaign
        }
    };

    await Visitor.findOneAndUpdate(
        { visitorId: effectiveVisitorId }, 
        updates,
        { 
            upsert: true, 
            new: true,
            setDefaultsOnInsert: true 
        }
    );

    // 7. Log Page View
    await PageView.create({
        visitorId: effectiveVisitorId,
        ip,
        path,
        createdAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tracking error", error);
    return NextResponse.json({ error: "Track failed" }, { status: 500 });
  }
}
