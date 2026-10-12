// Official Logo hosted on high-speed global CDN (692x207 Retina PNG rendered at 125x37)
export const EMAIL_LOGO_URL =
  "https://res.cloudinary.com/cswithbs/image/upload/v1791785820/cswithbs_logo_email.png";

// Production URL for email links (never localhost, even during dev)
export const SITE_URL =
  process.env.EMAIL_SITE_URL || "https://www.cswithbs.com";

export interface EmailTemplateOptions {
  title: string;
  preheader?: string;
  recipientName?: string;
  contentHtml: string;
  unsubscribeEmail?: string;
  showUnsubscribe?: boolean;
  isNewsletter?: boolean;
}

/**
 * Clean, modern, industry-standard universal email template.
 * Designed to look crisp in both Light & Dark modes across Gmail, Apple Mail, and Outlook.
 * - No logo on top; official Retina logo positioned cleanly in the footer.
 * - Clean greeting at the top with recipient name personalization.
 * - Warm regards sign-off from Prof. Buddhadev Sasmal.
 * - High-speed production links (Courses, Blog, Contact) and 100% working unsubscribe link.
 */
export function wrapInEmailTemplate({
  title,
  preheader,
  recipientName,
  contentHtml,
  unsubscribeEmail,
  showUnsubscribe = true,
  isNewsletter = true,
}: EmailTemplateOptions): string {
  const unsubscribeUrl = unsubscribeEmail
    ? `${SITE_URL}/unsubscribe?email=${encodeURIComponent(unsubscribeEmail)}`
    : `${SITE_URL}/unsubscribe`;

  const displayName = recipientName?.trim() || (isNewsletter ? "Learner" : "");

  // 1. Name Personalization: Replace {{name}} tokens if present
  let processedContent = contentHtml.replace(
    /\{\{\s*name\s*\}\}/gi,
    displayName || "Learner"
  );

  // 2. Industry standard: Ensure all hyperlinks inside the content open in a new browser tab
  processedContent = processedContent.replace(/<a\b([^>]*)>/gi, (_match, attrs) => {
    let cleanAttrs = attrs;
    if (!/\btarget\s*=/i.test(cleanAttrs)) {
      cleanAttrs += ' target="_blank"';
    }
    if (!/\brel\s*=/i.test(cleanAttrs)) {
      cleanAttrs += ' rel="noopener noreferrer"';
    }
    return `<a${cleanAttrs}>`;
  });

  // 3. Greeting: Check if content already starts with a greeting
  const startsWithGreeting = /^\s*<p[^>]*>\s*(Dear|Hello|Hi|Greetings)/i.test(
    processedContent.trim()
  );
  const greetingHtml =
    !startsWithGreeting && displayName
      ? `<p style="margin: 0 0 16px 0; font-size: 15px; color: #374151; font-weight: 600;">Dear ${displayName},</p>`
      : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; }
    a { color: #0284c7; text-decoration: none; font-weight: 500; }
    a:hover { text-decoration: underline; }
    .prose p { margin: 0 0 16px 0; line-height: 1.65; color: #374151; font-size: 15px; }
    .prose h1, .prose h2, .prose h3 { color: #111827; margin-top: 24px; margin-bottom: 12px; font-weight: 700; line-height: 1.35; }
    .prose h1 { font-size: 22px; }
    .prose h2 { font-size: 19px; }
    .prose h3 { font-size: 17px; }
    .prose ul, .prose ol { padding-left: 22px; color: #374151; line-height: 1.65; margin: 0 0 16px 0; }
    .prose li { margin-bottom: 6px; }
    .prose code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; color: #0369a1; border: 1px solid #e2e8f0; }
    .prose pre { background: #0f172a; padding: 16px; border-radius: 8px; overflow-x: auto; color: #f8fafc; margin: 16px 0; font-family: ui-monospace, monospace; font-size: 13px; line-height: 1.5; }
    .prose blockquote { border-left: 3px solid #00bedc; margin: 16px 0; padding-left: 16px; color: #4b5563; font-style: italic; background: #f8fafc; padding: 12px 16px; border-radius: 0 8px 8px 0; }
    .prose img { max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; border-radius: 0 !important; border: 0 !important; }
      .email-padding { padding: 26px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f7; color: #1f2937;">
  ${
    preheader
      ? `<div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #f4f4f7;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`
      : ""
  }
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f7;">
    <tr>
      <td align="center" style="padding: 36px 16px 48px 16px;">
        <!-- Clean White Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);">
          
          <!-- Main Content (Begins directly with greeting and body content; no subject title in body) -->
          <tr>
            <td class="email-padding" style="padding: 38px 36px 32px 36px;">
              ${greetingHtml}
              <div class="prose" style="font-size: 15px; line-height: 1.65; color: #374151;">
                ${processedContent}
              </div>
            </td>
          </tr>

          <!-- Footer (Minimal, Premium & Industry-Standard) -->
          <tr>
            <td class="email-padding" style="padding: 28px 36px 28px 36px; background-color: #fafbfc; border-top: 1px solid #edf0f2; text-align: center;">
              
              <!-- Brand Logo in Footer -->
              <div style="margin-bottom: 12px;">
                <a href="${SITE_URL}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: inline-block;">
                  <img 
                    src="${EMAIL_LOGO_URL}" 
                    alt="CSwithBS" 
                    width="120" 
                    height="36" 
                    style="display: block; margin: 0 auto; width: 120px; max-width: 120px; height: auto; border: 0; outline: none;"
                  />
                </a>
              </div>

              <p style="margin: 0 0 4px 0; font-size: 13px; color: #4b5563; line-height: 1.5; font-weight: 500;">
                Curated Computer Science Notes &amp; Learning Resources
              </p>
              <p style="margin: 0 0 16px 0; font-size: 12px; color: #9ca3af;">
                Prof. Buddhadev Sasmal &bull; Founder &amp; Lead Educator
              </p>

              <!-- Navigation Links -->
              <div style="margin-bottom: 16px;">
                <a href="${SITE_URL}/courses" target="_blank" rel="noopener noreferrer" style="color: #6b7280; font-size: 13px; margin: 0 10px; text-decoration: none; font-weight: 500;">Courses</a>
                <span style="color: #d1d5db;">•</span>
                <a href="${SITE_URL}/blog" target="_blank" rel="noopener noreferrer" style="color: #6b7280; font-size: 13px; margin: 0 10px; text-decoration: none; font-weight: 500;">Blog</a>
                <span style="color: #d1d5db;">•</span>
                <a href="${SITE_URL}/contact" target="_blank" rel="noopener noreferrer" style="color: #6b7280; font-size: 13px; margin: 0 10px; text-decoration: none; font-weight: 500;">Contact</a>
              </div>

              <!-- Sleek Single-Line Broadcast & Unsubscribe Notice -->
              ${
                showUnsubscribe && isNewsletter
                  ? `<div style="border-top: 1px solid #edf0f2; padding-top: 14px; margin-top: 14px;">
                      <p style="margin: 0; font-size: 11px; color: #9ca3af; line-height: 1.6;">
                        You received this automated broadcast from CSwithBS.
                        <span style="display: inline-block; margin: 0 4px; color: #d1d5db;">•</span>
                        <a href="${unsubscribeUrl}" target="_blank" rel="noopener noreferrer" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
                      </p>
                    </div>`
                  : !isNewsletter
                  ? `<div style="border-top: 1px solid #edf0f2; padding-top: 14px; margin-top: 14px;">
                      <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
                        Have questions? Reply directly to this email or write to <a href="mailto:support@cswithbs.com" style="color: #0284c7; text-decoration: none; font-weight: 500;">support@cswithbs.com</a>.
                      </p>
                    </div>`
                  : ""
              }
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
