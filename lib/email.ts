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
  process.env.EMAIL_FROM || "CSwithBS <newsletter@cswithbs.com>";
export const SENDER_SUPPORT =
  process.env.EMAIL_SUPPORT || "CSwithBS <support@cswithbs.com>";

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
    <p>Dear Learner,</p>

    <h2 style="margin: 4px 0 10px 0; font-size: 22px; color: #0f172a; font-weight: 800; line-height: 1.35;">
      Welcome to CSwithBS! 🎉
    </h2>

    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 14px 0;">
      We're delighted to have you join our growing community of Computer Science learners!
    </p>

    <p style="color: #334155; font-size: 14.5px; line-height: 1.65; margin: 0 0 24px 0;">
      Whether you're preparing for university examinations, working toward competitive exams like GATE, or strengthening your technical fundamentals &mdash; CSwithBS is here to support your learning journey.
    </p>

    <h3 style="margin: 0 0 14px 0; font-size: 16px; color: #0f172a; font-weight: 700;">
      🚀 Start Exploring CSwithBS
    </h3>
    <p style="margin: 0 0 16px 0; color: #64748b; font-size: 13px;">
      Here's what you can discover on our platform:
    </p>

    <!-- Feature Card 1: Sky / Blue -->
    <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px 18px; margin-bottom: 12px;">
      <p style="margin: 0 0 4px 0; font-size: 14.5px; font-weight: 700; color: #0369a1;">
        <span style="font-size: 17px;">📚</span> &nbsp;Structured Courses &amp; Study Notes
      </p>
      <p style="margin: 0; color: #334155; font-size: 13.5px; line-height: 1.6;">
        Explore chapter-wise learning resources covering essential Computer Science subjects, including Database Management Systems (DBMS), Operating Systems, Computer Networks, Data Structures &amp; Algorithms (DSA), and more.
      </p>
    </div>

    <!-- Feature Card 2: Violet / Purple -->
    <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 16px 18px; margin-bottom: 12px;">
      <p style="margin: 0 0 4px 0; font-size: 14.5px; font-weight: 700; color: #7c3aed;">
        <span style="font-size: 17px;">💻</span> &nbsp;Technical Articles &amp; Insights
      </p>
      <p style="margin: 0; color: #334155; font-size: 13.5px; line-height: 1.6;">
        Go beyond textbooks with articles, conceptual explanations, and insights into Computer Science, programming, and emerging technologies.
      </p>
    </div>

    <!-- Feature Card 3: Amber / Orange -->
    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 16px 18px; margin-bottom: 24px;">
      <p style="margin: 0 0 4px 0; font-size: 14.5px; font-weight: 700; color: #d97706;">
        <span style="font-size: 17px;">🎯</span> &nbsp;Exam Preparation &amp; Learning Resources
      </p>
      <p style="margin: 0; color: #334155; font-size: 13.5px; line-height: 1.6;">
        Strengthen your understanding of fundamental concepts with syllabus-oriented resources designed to support academic learning and competitive exam preparation.
      </p>
    </div>

    <p style="text-align: center; margin: 26px 0 30px 0;">
      <a href="${SITE_URL}/courses" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; font-weight: 600; font-size: 14px; padding: 14px 34px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.28); letter-spacing: 0.3px;">
        📖 Start Learning Now &rarr;
      </a>
    </p>

    <!-- Feedback Callout (Soft Emerald) -->
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; margin: 26px 0;">
      <h4 style="margin: 0 0 8px 0; font-size: 15px; color: #065f46; font-weight: 700;">
        💬 We'd Love to Hear From You!
      </h4>
      <p style="margin: 0 0 12px 0; color: #047857; font-size: 13.5px; line-height: 1.65;">
        CSwithBS is built for students like you. What subjects or topics would you like us to cover next? Do you have suggestions to make the notes even better?
      </p>
      <p style="margin: 0; font-size: 13.5px;">
        👉 <a href="${SITE_URL}/contact" target="_blank" rel="noopener noreferrer" style="color: #059669; font-weight: 700; text-decoration: underline;">Visit our Contact &amp; Feedback Page</a> to share your ideas with us. We read and appreciate every message!
      </p>
    </div>

    <p style="color: #334155; font-size: 14px; line-height: 1.65; margin-bottom: 6px;">
      Thank you for becoming part of the CSwithBS community. We look forward to helping you learn, explore, and grow.
    </p>

    <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
      Wishing you success in your academic and professional journey!
    </p>

    <div style="margin-top: 26px; padding-top: 18px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0 0 4px 0; font-size: 14px; color: #475569;">Warm regards,</p>
      <p style="margin: 0; font-size: 15px; font-weight: 700; color: #0f172a;">Prof. Buddhadev Sasmal</p>
      <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">CSwithBS &mdash; Learn. Explore. Grow.</p>
    </div>
  `;

  const html = wrapInEmailTemplate({
    title: "Welcome to CSwithBS! 🎉",
    preheader: "We're delighted to have you join our Computer Science learning community!",
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
 * Sends an automated Community Onboarding Email to a newly subscribed user
 */
export async function sendSubscriberWelcomeCommunityEmail(email: string) {
  const content = `
    <p>Dear Learner,</p>

    <h2 style="margin: 4px 0 10px 0; font-size: 22px; color: #0f172a; font-weight: 800; line-height: 1.35;">
      Welcome to CSwithBS! 🎉
    </h2>

    <p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 14px 0;">
      We're delighted to have you join our growing community of Computer Science learners!
    </p>

    <p style="color: #334155; font-size: 14.5px; line-height: 1.65; margin: 0 0 24px 0;">
      Whether you're preparing for university examinations, working toward competitive exams like GATE, or strengthening your technical fundamentals &mdash; CSwithBS is here to support your learning journey.
    </p>

    <div style="border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 18px 0; margin: 20px 0;">
      <p style="margin: 0 0 12px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #0284c7; font-family: ui-monospace, SFMono-Regular, Menlo, monospace;">
        RECOMMENDED LEARNING TRACKS
      </p>

      <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 14px 16px; margin-bottom: 10px;">
        <strong style="color: #0369a1; font-size: 14px;">1. Semester Foundation Track</strong>
        <p style="margin: 4px 0 0 0; color: #334155; font-size: 13px; line-height: 1.55;">
          Start with <em>Database Management Systems (DBMS)</em> and <em>Data Structures &amp; Algorithms (DSA)</em> to build strong core fundamentals.
        </p>
      </div>

      <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 10px; padding: 14px 16px; margin-bottom: 10px;">
        <strong style="color: #7c3aed; font-size: 14px;">2. Core Systems Track</strong>
        <p style="margin: 4px 0 0 0; color: #334155; font-size: 13px; line-height: 1.55;">
          Advance into <em>Operating Systems</em> and <em>Computer Networks</em> to understand low-level architecture and distributed protocols.
        </p>
      </div>

      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 14px 16px;">
        <strong style="color: #d97706; font-size: 14px;">3. Exam &amp; GATE Practice</strong>
        <p style="margin: 4px 0 0 0; color: #334155; font-size: 13px; line-height: 1.55;">
          Solve past university questions, numerical breakdowns, and time complexity analyses after every chapter.
        </p>
      </div>
    </div>

    <p style="text-align: center; margin: 26px 0;">
      <a href="${SITE_URL}/courses" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; font-weight: 600; font-size: 14px; padding: 14px 34px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.28);">
        📖 Start Learning Now &rarr;
      </a>
    </p>

    <!-- Feedback Section -->
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; margin: 26px 0;">
      <h4 style="margin: 0 0 8px 0; font-size: 15px; color: #065f46; font-weight: 700;">
        💬 We'd Love to Hear From You!
      </h4>
      <p style="margin: 0 0 12px 0; color: #047857; font-size: 13.5px; line-height: 1.65;">
        CSwithBS is built for students like you. What subjects or topics would you like us to cover next? Do you have suggestions to make the notes even better?
      </p>
      <p style="margin: 0; font-size: 13.5px;">
        👉 <a href="${SITE_URL}/contact" target="_blank" rel="noopener noreferrer" style="color: #059669; font-weight: 700; text-decoration: underline;">Visit our Contact &amp; Feedback Page</a> to share your ideas with us. We read and appreciate every message!
      </p>
    </div>

    <p style="color: #334155; font-size: 14px; line-height: 1.65; margin-bottom: 6px;">
      Thank you for becoming part of the CSwithBS community. We look forward to helping you learn, explore, and grow.
    </p>

    <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
      Wishing you success in your academic and professional journey!
    </p>

    <div style="margin-top: 26px; padding-top: 18px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0 0 4px 0; font-size: 14px; color: #475569;">Warm regards,</p>
      <p style="margin: 0; font-size: 15px; font-weight: 700; color: #0f172a;">Prof. Buddhadev Sasmal</p>
      <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">CSwithBS &mdash; Learn. Explore. Grow.</p>
    </div>
  `;

  const html = wrapInEmailTemplate({
    title: "Welcome to CSwithBS! 🎉",
    preheader: "Your learning roadmap for university exams & GATE preparation",
    contentHtml: content,
    unsubscribeEmail: email,
    showUnsubscribe: true,
    isNewsletter: true,
  });

  return sendEmail({
    to: email,
    subject: "Welcome to CSwithBS: Your roadmap for university & GATE prep",
    html,
    from: SENDER_NEWSLETTER,
  });
}

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
