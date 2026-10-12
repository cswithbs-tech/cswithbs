import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subscriber from "@/models/Subscriber";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    await dbConnect();

    const subscriber = await Subscriber.findOne({
      email: { $regex: `^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });

    if (!subscriber) {
      await Subscriber.create({
        email: cleanEmail,
        active: false,
        source: 'unsubscribed',
      });
      return NextResponse.json({
        success: true,
        message: "You have been successfully unsubscribed from the CSwithBS newsletter.",
      });
    }

    subscriber.active = false;
    await subscriber.save();

    return NextResponse.json({
      success: true,
      message: "You have been successfully unsubscribed from the CSwithBS newsletter.",
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
