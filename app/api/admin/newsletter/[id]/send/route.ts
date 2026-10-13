import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Newsletter from "@/models/Newsletter";
import Subscriber from "@/models/Subscriber";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  resend,
  SENDER_NEWSLETTER,
  wrapInEmailTemplate,
} from "@/lib/email";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const userRoles = (session?.user as any)?.roles || [];
    const hasSuperAdminRole = Array.isArray(userRoles)
      ? userRoles.some((r: string) => ["SUPER_ADMIN", "super_admin"].includes(r))
      : userRoles === "super_admin";

    // Only Super Admin can blast emails
    if (!session || !hasSuperAdminRole) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is okay for direct blast
    }

    const testEmail = body?.testEmail?.trim();
    const individualEmail = body?.individualEmail?.trim();

    await dbConnect();

    const newsletter = await Newsletter.findById(id);
    if (!newsletter) {
      return NextResponse.json(
        { error: "Newsletter not found" },
        { status: 404 },
      );
    }

    // Check if fully completed
    const existingRecipients = (newsletter.sentRecipients || []).map((e: string) => e.toLowerCase());
    const alreadySentSet = new Set(existingRecipients);

    if (!testEmail && !individualEmail && newsletter.status === "sent") {
      const allActive = await Subscriber.find({ active: { $ne: false } }).select("email").lean();
      const unreceived = allActive.filter((s: any) => !alreadySentSet.has(s.email.toLowerCase()));
      if (unreceived.length === 0) {
        return NextResponse.json(
          { error: "Newsletter has already been delivered to all active subscribers." },
          { status: 400 },
        );
      }
    }

    // ==================================================================
    // MODE A-1: SEND TO INDIVIDUAL SUBSCRIBER
    // ==================================================================
    if (individualEmail) {
      if (!resend) {
        return NextResponse.json(
          { error: "Resend API Key is missing. Please check RESEND_API_KEY in .env" },
          { status: 500 }
        );
      }

      // Check if user exists in database to personalize their name
      const matchedUser = await User.findOne({
        email: { $regex: `^${individualEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
      }).select("name").lean();
      const recipientName = (matchedUser as any)?.name || "";

      const individualHtml = wrapInEmailTemplate({
        title: newsletter.subject,
        recipientName,
        contentHtml: newsletter.content,
        unsubscribeEmail: individualEmail,
        showUnsubscribe: true,
        isNewsletter: true,
      });

      const { data, error } = await resend.emails.send({
        from: SENDER_NEWSLETTER,
        to: individualEmail,
        subject: newsletter.subject,
        html: individualHtml,
      });

      if (error) {
        return NextResponse.json(
          { error: `Failed to send to ${individualEmail}: ${error.message}` },
          { status: 500 }
        );
      }

      // Add to sentRecipients so this individual doesn't get duplicate during broadcasts
      const cleanEmail = individualEmail.toLowerCase();
      if (!newsletter.sentRecipients) newsletter.sentRecipients = [];
      if (!newsletter.sentRecipients.includes(cleanEmail)) {
        newsletter.sentRecipients.push(cleanEmail);
        newsletter.recipientCount = newsletter.sentRecipients.length;
        await newsletter.save();
      }

      return NextResponse.json({
        success: true,
        isIndividual: true,
        recipient: individualEmail,
        message: `Email successfully delivered to ${individualEmail}!`,
        id: data?.id,
      });
    }

    // ==================================================================
    // MODE A: SEND TEST EMAIL TO ADMIN
    // ==================================================================
    if (testEmail) {
      if (!resend) {
        return NextResponse.json(
          { error: "Resend API Key is missing. Please check RESEND_API_KEY in .env" },
          { status: 500 }
        );
      }

      const testHtml = wrapInEmailTemplate({
        title: newsletter.subject,
        preheader: "[TEST PREVIEW] CSwithBS Newsletter",
        recipientName: (session?.user as any)?.name || "Admin",
        contentHtml: `
          <div style="background: #27272a; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px; font-size: 13px; color: #fbbf24; border: 1px solid #3f3f46;">
            ⚠️ <strong>Admin Test Preview:</strong> This is a test dispatch for newsletter draft "${newsletter.subject}".
          </div>
          ${newsletter.content}
        `,
        unsubscribeEmail: testEmail,
        showUnsubscribe: true,
        isNewsletter: true,
      });

      const { data, error } = await resend.emails.send({
        from: SENDER_NEWSLETTER,
        to: testEmail,
        subject: `[TEST PREVIEW] ${newsletter.subject}`,
        html: testHtml,
      });

      if (error) {
        return NextResponse.json(
          { error: `Failed to send test email: ${error.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        isTest: true,
        message: `Test email successfully sent to ${testEmail}!`,
        id: data?.id,
      });
    }

    // ==================================================================
    // MODE B: BROADCAST VIA RESEND WITH RECIPIENT TRACKING & BATCHING
    // ==================================================================
    if (resend) {
      // 1. Fetch all active subscribers
      const allSubscribers = await Subscriber.find({ active: { $ne: false } }).select("email").lean();

      if (!allSubscribers || allSubscribers.length === 0) {
        return NextResponse.json(
          { error: "No active subscribers found in the database to receive this newsletter." },
          { status: 400 }
        );
      }

      // 2. Filter out subscribers who ALREADY received this newsletter
      const deliveredSet = new Set((newsletter.sentRecipients || []).map((e: string) => e.toLowerCase()));
      const pendingSubscribers = allSubscribers.filter(
        (sub: any) => !deliveredSet.has(sub.email.toLowerCase())
      );

      if (pendingSubscribers.length === 0) {
        newsletter.status = "sent";
        await newsletter.save();
        return NextResponse.json({
          success: true,
          alreadyCompleted: true,
          recipientCount: newsletter.sentRecipients.length,
          message: `All ${allSubscribers.length} subscribers have already received this campaign!`,
        });
      }

      // 3. Determine how many to send in this run (optional batchLimit)
      const requestedBatchLimit = typeof body?.batchLimit === "number" && body.batchLimit > 0 ? body.batchLimit : 0;
      const targets = requestedBatchLimit > 0
        ? pendingSubscribers.slice(0, requestedBatchLimit)
        : pendingSubscribers;

      // 4. Map registered user names for personal greetings
      const targetEmails = targets.map((s: any) => s.email.toLowerCase());
      const registeredUsers = await User.find({ email: { $in: targetEmails } }).select("email name").lean();
      const nameMap = new Map<string, string>();
      for (const u of registeredUsers) {
        if (u.email && u.name) {
          nameMap.set(u.email.toLowerCase(), u.name);
        }
      }

      if (!newsletter.sentRecipients) {
        newsletter.sentRecipients = [];
      }

      // 5. Send in chunks of up to 100 (Resend batch API limit)
      const CHUNK_SIZE = 100;
      let sentThisRun = 0;
      let quotaErrorOccurred = false;
      let quotaErrorMessage = "";

      for (let i = 0; i < targets.length; i += CHUNK_SIZE) {
        const chunk = targets.slice(i, i + CHUNK_SIZE);
        const batchPayload = chunk.map((sub: any) => {
          const recipientName = nameMap.get(sub.email.toLowerCase()) || "";
          return {
            from: SENDER_NEWSLETTER,
            to: sub.email,
            subject: newsletter.subject,
            html: wrapInEmailTemplate({
              title: newsletter.subject,
              recipientName,
              contentHtml: newsletter.content,
              unsubscribeEmail: sub.email,
              showUnsubscribe: true,
              isNewsletter: true,
            }),
          };
        });

        try {
          const { error } = await resend.batch.send(batchPayload);
          if (error) {
            console.error(`Resend batch send error at chunk starting ${i}:`, error);
            quotaErrorOccurred = true;
            quotaErrorMessage = error.message || "Sending failed";
            break; // Stop loop, but preserve all previously sent recipients!
          }

          // Successfully sent chunk -> track them in DB immediately
          for (const sub of chunk) {
            const clean = sub.email.toLowerCase();
            if (!newsletter.sentRecipients.includes(clean)) {
              newsletter.sentRecipients.push(clean);
            }
          }
          sentThisRun += chunk.length;
          newsletter.recipientCount = newsletter.sentRecipients.length;
          await newsletter.save();
        } catch (err: any) {
          console.error(`Unexpected error during batch chunk ${i}:`, err);
          quotaErrorOccurred = true;
          quotaErrorMessage = err.message || "Network / provider error";
          break;
        }
      }

      // 6. Update Newsletter status and counters
      const remainingCount = allSubscribers.length - newsletter.sentRecipients.length;
      newsletter.recipientCount = newsletter.sentRecipients.length;
      newsletter.sentAt = new Date();

      if (remainingCount <= 0) {
        newsletter.status = "sent";
      } else {
        newsletter.status = "partially_sent";
      }
      await newsletter.save();

      // If nothing could be sent due to quota
      if (quotaErrorOccurred && sentThisRun === 0) {
        return NextResponse.json(
          {
            error: `Resend sending failed: ${quotaErrorMessage}. Daily quota may be reached. You can resume sending to the remaining ${remainingCount} subscribers tomorrow!`,
            isQuotaError: true,
            status: newsletter.status,
            sentThisRun: 0,
            deliveredCount: newsletter.sentRecipients.length,
            remainingCount,
          },
          { status: 429 }
        );
      }

      // If partially sent due to quota or batchLimit
      if (quotaErrorOccurred && sentThisRun > 0) {
        return NextResponse.json({
          success: true,
          partial: true,
          sentThisRun,
          deliveredCount: newsletter.sentRecipients.length,
          totalTarget: allSubscribers.length,
          remainingCount,
          status: newsletter.status,
          message: `Sent to ${sentThisRun} subscribers! Daily limit reached (${quotaErrorMessage}). ${remainingCount} subscribers remaining. You can resume tomorrow!`,
        });
      }

      return NextResponse.json({
        success: true,
        sentThisRun,
        deliveredCount: newsletter.sentRecipients.length,
        totalTarget: allSubscribers.length,
        remainingCount,
        status: newsletter.status,
        message: remainingCount > 0
          ? `Batch of ${sentThisRun} sent successfully! ${remainingCount} subscribers remaining for the next run.`
          : `Newsletter successfully delivered to all ${newsletter.sentRecipients.length} subscribers!`,
      });
    }

    // ==================================================================
    // MODE C: FALLBACK VIA BUTTONDOWN (If Resend is not configured)
    // ==================================================================
    const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY;
    if (BUTTONDOWN_API_KEY) {
      const response = await fetch("https://api.buttondown.email/v1/emails", {
        method: "POST",
        headers: {
          Authorization: `Token ${BUTTONDOWN_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: newsletter.subject,
          body: newsletter.content,
          status: "sent",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Buttondown Send Error:", errorData);
        return NextResponse.json(
          { error: "Failed to send via Buttondown", details: errorData },
          { status: 502 },
        );
      }

      const data = await response.json();
      newsletter.status = "sent";
      newsletter.sentAt = new Date();
      newsletter.providerId = data.id;
      await newsletter.save();

      return NextResponse.json({ success: true, providerId: data.id, provider: "buttondown" });
    }

    return NextResponse.json(
      { error: "No email provider configured. Please provide RESEND_API_KEY in .env" },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("Send Newsletter Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
