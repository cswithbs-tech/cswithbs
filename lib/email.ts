import { Resend } from "resend";
import {
  wrapInEmailTemplate,
  EMAIL_LOGO_URL,
  SITE_URL,
} from "./emailTemplate";

export { wrapInEmailTemplate, EMAIL_LOGO_URL, SITE_URL };

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Official Domain Senders
export const SENDER_NEWSLETTER =
  process.env.EMAIL_FROM || "CSwithBS Newsletter <newsletter@cswithbs.com>";
export const SENDER_SUPPORT =
  process.env.EMAIL_SUPPORT || "CSwithBS Support <support@cswithbs.com>";

// Support receiving address
export const SUPPORT_EMAIL = "support@cswithbs.com";

// Where backend alerts (like contact form messages) are delivered to the owner
export const ADMIN_NOTIFICATION_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL || "support.cswithbs@gmail.com";

/**
 * Sends a single email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = SENDER_NEWSLETTER,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}) {
  if (!resend) {
    throw new Error("Resend API Key is missing. Please check RESEND_API_KEY in .env");
  }

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) {
    console.error("Resend Send Error:", error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Sends an automated Welcome Email to a newly subscribed user
 */
export async function sendSubscriberWelcomeEmail(email: string) {
  const content = `
    <p>Hi there,</p>
    <p>Thank you for subscribing to <strong>CSwithBS</strong>! We are excited to have you join our academic computer science community.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 22px 0;">
      <h3 style="margin: 0 0 14px 0; font-size: 15px; color: #0f172a;">What You Get Access To:</h3>
      
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding-bottom: 10px; vertical-align: top; width: 22px; color: #0284c7; font-size: 16px;">•</td>
          <td style="padding-bottom: 10px; vertical-align: top; color: #334155; font-size: 14px; line-height: 1.5;">
            <strong style="color: #0f172a;">Curriculum Notes:</strong> Chapter-by-chapter breakdowns for DBMS, Operating Systems, DSA, and Computer Networks.
          </td>
        </tr>
        <tr>
          <td style="padding-bottom: 10px; vertical-align: top; width: 22px; color: #0284c7; font-size: 16px;">•</td>
          <td style="padding-bottom: 10px; vertical-align: top; color: #334155; font-size: 14px; line-height: 1.5;">
            <strong style="color: #0f172a;">Technical Deep Dives:</strong> Clear architectural articles on distributed systems and software engineering.
          </td>
        </tr>
        <tr>
          <td style="vertical-align: top; width: 22px; color: #0284c7; font-size: 16px;">•</td>
          <td style="vertical-align: top; color: #334155; font-size: 14px; line-height: 1.5;">
            <strong style="color: #0f172a;">GATE & University Exam Prep:</strong> Concise topic summaries and revision notes.
          </td>
        </tr>
      </table>
    </div>

    <p style="margin: 26px 0; text-align: center;">
      <a href="${SITE_URL}/courses" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
        Explore Courses & Notes →
      </a>
    </p>

    <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
      Warm regards,<br>
      <strong style="color: #0f172a;">The CSwithBS Team</strong>
    </p>
  `;

  const html = wrapInEmailTemplate({
    title: "Welcome to CSwithBS 🎉",
    preheader: "Welcome! Your structured computer science learning materials are ready.",
    contentHtml: content,
    unsubscribeEmail: email,
    showUnsubscribe: true,
    isNewsletter: true,
  });

  return sendEmail({
    to: email,
    subject: "Welcome to CSwithBS 🎉 Your Computer Science Learning Journey",
    html,
    from: SENDER_NEWSLETTER,
    // Newsletters do not accept direct reply
  });
}

/**
 * Sends an automated Community Welcome Email to a newly subscribed user
 * (Second welcome variant — warm, community-focused onboarding)
 */
export async function sendSubscriberWelcomeCommunityEmail(email: string) {
  const content = `
    <p>Hi there,</p>
    
    <p><strong>Welcome to CSwithBS!</strong> 🎉<br>
    We're delighted to have you join our growing community of Computer Science learners!</p>

    <p>Whether you're preparing for university examinations, working toward competitive exams like GATE, or strengthening your technical fundamentals, CSwithBS is here to support your learning journey.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 22px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #0f172a;">🚀 Start Exploring CSwithBS</h3>
      <p style="margin: 0 0 14px 0; color: #475569; font-size: 14px;">Here's what you can discover on our platform:</p>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding-bottom: 14px; vertical-align: top; width: 28px; font-size: 18px;">📚</td>
          <td style="padding-bottom: 14px; vertical-align: top; color: #334155; font-size: 14px; line-height: 1.55;">
            <strong style="color: #0f172a;">Structured Courses &amp; Study Notes</strong><br>
            Explore chapter-wise learning resources covering essential Computer Science subjects, including Database Management Systems (DBMS), Operating Systems, Computer Networks, Data Structures &amp; Algorithms (DSA), and more.
          </td>
        </tr>
        <tr>
          <td style="padding-bottom: 14px; vertical-align: top; width: 28px; font-size: 18px;">💻</td>
          <td style="padding-bottom: 14px; vertical-align: top; color: #334155; font-size: 14px; line-height: 1.55;">
            <strong style="color: #0f172a;">Technical Articles &amp; Insights</strong><br>
            Go beyond textbooks with articles, conceptual explanations, and insights into Computer Science, programming, and emerging technologies.
          </td>
        </tr>
        <tr>
          <td style="vertical-align: top; width: 28px; font-size: 18px;">🎯</td>
          <td style="vertical-align: top; color: #334155; font-size: 14px; line-height: 1.55;">
            <strong style="color: #0f172a;">Exam Preparation &amp; Learning Resources</strong><br>
            Strengthen your understanding of fundamental concepts with syllabus-oriented resources designed to support academic learning and competitive exam preparation.
          </td>
        </tr>
      </table>
    </div>

    <p style="text-align: center; margin: 28px 0;">
      <a href="${SITE_URL}/courses" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: 600; font-size: 14px; padding: 13px 30px; border-radius: 8px; text-decoration: none; margin-right: 10px;">
        📖 Browse Courses →
      </a>
      <a href="${SITE_URL}/blog" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #0284c7; color: #ffffff; font-weight: 600; font-size: 14px; padding: 13px 30px; border-radius: 8px; text-decoration: none;">
        ✍️ Read Articles →
      </a>
    </p>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; border-radius: 8px; padding: 18px; margin: 24px 0;">
      <h4 style="margin: 0 0 8px 0; font-size: 15px; color: #14532d;">💬 We're Building This For You</h4>
      <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
        CSwithBS is a community-first platform. Your feedback shapes what we build next. If there's a topic, subject, or feature you'd love to see — we genuinely want to hear from you!
        <br><br>
        Feel free to reach out via our <a href="${SITE_URL}/contact" target="_blank" rel="noopener noreferrer" style="color: #15803d; font-weight: 600; text-decoration: underline;">Contact Page</a> at any time. We read every message.
      </p>
    </div>

    <p style="margin-top: 20px; color: #334155; font-size: 14px; line-height: 1.6;">
      We wish you great success in your studies. Welcome aboard — we're happy you're here! 🙌
    </p>

    <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
      Warm regards,<br>
      <strong style="color: #0f172a;">The CSwithBS Team</strong>
    </p>
  `;

  const html = wrapInEmailTemplate({
    title: "Welcome to CSwithBS! 🎉",
    preheader: "We're delighted to have you in our CS learning community. Start exploring today!",
    contentHtml: content,
    unsubscribeEmail: email,
    showUnsubscribe: true,
    isNewsletter: true,
  });

  return sendEmail({
    to: email,
    subject: "Welcome to CSwithBS! 🎉 Your Learning Journey Starts Here",
    html,
    from: SENDER_NEWSLETTER,
  });
}

/**
 * Sends a notification email to the admin when someone fills out the contact form,
 * and sends an acknowledgment copy to the user.
 */
export async function sendContactFormEmails({
  firstName,
  lastName,
  email,
  subject,
  message,
}: {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}) {
  const fullName = `${firstName} ${lastName}`.trim();

  // 1. Alert to Admin (Sent to admin Gmail)
  const adminAlertContent = `
    <p>You received a new inquiry from the <strong>CSwithBS Contact Form</strong>:</p>
    
    <table role="presentation" border="0" cellpadding="8" cellspacing="0" style="width: 100%; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 16px 0;">
      <tr>
        <td style="color: #64748b; width: 110px; font-size: 13px; font-family: ui-monospace, monospace;">Sender Name:</td>
        <td style="color: #0f172a; font-weight: 600; font-size: 14px;">${fullName}</td>
      </tr>
      <tr>
        <td style="color: #64748b; font-size: 13px; font-family: ui-monospace, monospace;">Email:</td>
        <td style="color: #0284c7; font-weight: 500; font-size: 14px;">
          <a href="mailto:${email}" style="color: #0284c7; text-decoration: none;">${email}</a>
        </td>
      </tr>
      <tr>
        <td style="color: #64748b; font-size: 13px; font-family: ui-monospace, monospace;">Topic:</td>
        <td style="color: #0f172a; font-size: 14px;">${subject}</td>
      </tr>
    </table>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #0284c7; border-radius: 6px; padding: 16px; margin: 18px 0;">
      <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px; font-family: ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600;">Message Content:</p>
      <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
    </div>

    <p style="margin-top: 20px; font-size: 13px; color: #64748b;">
      💡 <em>You can hit <strong>Reply</strong> in your email client to respond directly to ${fullName} (${email}).</em>
    </p>
  `;

  const adminHtml = wrapInEmailTemplate({
    title: `New Contact Inquiry: "${subject}"`,
    preheader: `New message from ${fullName} (${email})`,
    contentHtml: adminAlertContent,
    showUnsubscribe: false,
    isNewsletter: false,
  });

  // 2. Acknowledgment to Sender
  const userAckContent = `
    <p>Hi ${firstName},</p>
    <p>Thank you for reaching out to <strong>CSwithBS Support</strong>. We have received your message regarding <em>"${subject}"</em>.</p>
    <p>Our team reviews all inquiries and will get back to you as soon as possible.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #0f172a; border-radius: 6px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px; font-family: ui-monospace, monospace; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600;">Your Message Summary:</p>
      <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
    </div>

    <p style="margin-top: 20px; font-size: 14px; color: #334155;">
      If you have additional details to add, feel free to reply directly to this email.
    </p>

    <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
      Best regards,<br>
      <strong style="color: #0f172a;">CSwithBS Support Team</strong>
    </p>
  `;

  const userHtml = wrapInEmailTemplate({
    title: "We Received Your Message",
    preheader: `Thank you for contacting CSwithBS regarding "${subject}".`,
    contentHtml: userAckContent,
    showUnsubscribe: false,
    isNewsletter: false,
  });

  // Send admin notification
  const adminPromise = sendEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `[Contact Inquiry] ${subject} - ${fullName}`,
    html: adminHtml,
    from: SENDER_SUPPORT,
    replyTo: email, // Direct reply to user
  });

  // Send user acknowledgment (from support@cswithbs.com, user can reply to support@cswithbs.com!)
  const userPromise = sendEmail({
    to: email,
    subject: `We received your message: "${subject}" — CSwithBS`,
    html: userHtml,
    from: SENDER_SUPPORT,
    replyTo: SUPPORT_EMAIL,
  });

  return Promise.allSettled([adminPromise, userPromise]);
}
