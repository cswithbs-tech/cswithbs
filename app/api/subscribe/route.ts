import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subscriber from '@/models/Subscriber';

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    await dbConnect();

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email: cleanEmail });
    if (existing) {
      if (!existing.active) {
        existing.active = true;
        await existing.save();
        return NextResponse.json({ message: "Welcome back! Your subscription is reactivated.", success: true }, { status: 200 });
      }
      return NextResponse.json({ message: "You are already subscribed to our newsletter!", success: true }, { status: 200 });
    }

    await Subscriber.create({ 
      email: cleanEmail,
      source: source || 'homepage',
      active: true,
    });

    // ----------------------------------------------------------------------
    // SEND AUTOMATED WELCOME EMAIL (via Resend)
    // ----------------------------------------------------------------------
    try {
      const { sendSubscriberWelcomeEmail } = await import("@/lib/email");
      sendSubscriberWelcomeEmail(cleanEmail).catch((mailErr) =>
        console.error("Welcome Email Dispatch Error:", mailErr)
      );
    } catch (e) {
      console.error("Failed to trigger welcome email:", e);
    }

    // ----------------------------------------------------------------------
    // HYBRID SYNC: Push to Buttondown (External Provider if configured)
    // ----------------------------------------------------------------------
    const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY;
    if (BUTTONDOWN_API_KEY) {
      try {
        const buttondownRes = await fetch("https://api.buttondown.email/v1/subscribers", {
          method: "POST",
          headers: {
            "Authorization": `Token ${BUTTONDOWN_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: cleanEmail }),
        });

        if (!buttondownRes.ok) {
           const bdError = await buttondownRes.json();
           console.error("Buttondown Sync Failed:", bdError);
        }
      } catch (bdErr) {
        console.error("Buttondown Network Error:", bdErr);
      }
    }

    return NextResponse.json({ message: "Successfully subscribed! Check your inbox for confirmation.", success: true }, { status: 201 });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
