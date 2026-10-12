export interface EmailPresetTemplate {
  id: string;
  title: string;
  badge: string;
  description: string;
  defaultSubject: string;
  content: string;
}

export const EMAIL_PRESET_TEMPLATES: EmailPresetTemplate[] = [
  {
    id: "welcome-feedback",
    title: "Welcome & Community Feedback",
    badge: "Welcome",
    description: "Welcome new students, introduce platform resources, invite them to explore, and ask for their feedback.",
    defaultSubject: "Welcome to CSwithBS 🎉 Explore Resources & Share Your Feedback",
    content: `<p>Dear {{name}},</p>

<p>A very warm welcome to <strong>CSwithBS</strong>! 🎉</p>

<p>Whether you are here to prepare for university semester exams, prepare for GATE, or strengthen your core Computer Science fundamentals, we are thrilled to have you in our academic community.</p>

<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 22px 0;">
  <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #0f172a;">🚀 Where to Start on the Platform:</h3>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding-bottom: 12px; vertical-align: top; width: 24px; color: #0284c7; font-size: 18px;">•</td>
      <td style="padding-bottom: 12px; vertical-align: top; color: #334155; font-size: 14px; line-height: 1.5;">
        <strong style="color: #0f172a;">Curriculum Notes & Guides:</strong> Chapter-wise structured notes for DBMS, Operating Systems, Computer Networks, and DSA.
      </td>
    </tr>
    <tr>
      <td style="padding-bottom: 12px; vertical-align: top; width: 24px; color: #0284c7; font-size: 18px;">•</td>
      <td style="padding-bottom: 12px; vertical-align: top; color: #334155; font-size: 14px; line-height: 1.5;">
        <strong style="color: #0f172a;">Technical Blog & Articles:</strong> Deep dives into modern software architecture, algorithms, and real-world systems.
      </td>
    </tr>
    <tr>
      <td style="vertical-align: top; width: 24px; color: #0284c7; font-size: 18px;">•</td>
      <td style="vertical-align: top; color: #334155; font-size: 14px; line-height: 1.5;">
        <strong style="color: #0f172a;">Practice Problems & Q&A:</strong> Key university questions and solution breakdowns.
      </td>
    </tr>
  </table>
</div>

<p style="text-align: center; margin: 28px 0;">
  <a href="https://www.cswithbs.com/courses" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
    Explore All Notes & Courses →
  </a>
</p>

<div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #16a34a; border-radius: 8px; padding: 18px; margin: 24px 0;">
  <h4 style="margin: 0 0 8px 0; font-size: 15px; color: #14532d;">💬 We Want Your Feedback:</h4>
  <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
    CSwithBS is built for students like you. What subjects or topics would you like us to cover next? Do you have suggestions to make the notes even better?
    <br><br>
    Please visit our <a href="https://www.cswithbs.com/contact" target="_blank" rel="noopener noreferrer" style="color: #15803d; font-weight: 600; text-decoration: underline;">Contact & Feedback Page</a> to share your ideas with us. We read and appreciate every message!
  </p>
</div>

<p>Thank you for being part of our journey. We wish you immense success in your learning goals!</p>

<div style="margin-top: 26px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
  <p style="margin: 0 0 4px 0; font-size: 14px; color: #475569;">Warm regards,</p>
  <p style="margin: 0; font-size: 15px; font-weight: 700; color: #0f172a;">Prof. Buddhadev Sasmal</p>
  <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">CSwithBS &bull; Midnapore City College</p>
</div>`,
  },
  {
    id: "study-notes",
    title: "New Study Notes / Chapter Released",
    badge: "Curriculum",
    description: "Announce new semester notes, chapter guides, diagrams, and revision formulas.",
    defaultSubject: "New Study Notes Released: [Chapter Name] — CSwithBS",
    content: `<p>Dear {{name}},</p>

<p>We are pleased to announce that new in-depth study notes for <strong>[Subject Name: e.g. Database Management Systems]</strong> are now live on the academic portal!</p>

<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0284c7; border-radius: 8px; padding: 18px; margin: 20px 0;">
  <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #0f172a;">📖 What's Covered in This Chapter:</h3>
  <ul style="margin: 0; padding-left: 20px; color: #334155; line-height: 1.6;">
    <li><strong>Core Theoretical Foundations:</strong> Clear step-by-step explanations with architectural diagrams.</li>
    <li><strong>Solved Examples & Algorithms:</strong> Real university exam patterns and practical problems.</li>
    <li><strong>Quick Revision Cheat Sheet:</strong> Essential definitions, formulas, and time complexities.</li>
  </ul>
</div>

<p>You can read the full notes online, download resources, and practice revision questions directly on the portal:</p>

<p style="text-align: center; margin: 28px 0;">
  <a href="https://www.cswithbs.com/courses" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
    Access New Study Notes →
  </a>
</p>

<p>Keep up the great momentum and consistent study.</p>`,
  },
  {
    id: "exam-prep",
    title: "Exam Preparation & GATE Guide",
    badge: "Strategy",
    description: "Guidance, high-yield topics, and tips for semester and competitive exams.",
    defaultSubject: "Academic Alert: Semester Exam & GATE Prep Strategy Guide",
    content: `<p>Dear {{name}},</p>

<p>With upcoming examinations approaching, maintaining a focused and structured revision routine is critical for scoring top grades.</p>

<div style="background-color: #fefce8; border: 1px solid #fef08a; border-left: 4px solid #eab308; border-radius: 8px; padding: 18px; margin: 20px 0;">
  <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #713f12;">⚡ 3 Golden Rules for High-Yield Revision:</h3>
  <ol style="margin: 0; padding-left: 20px; color: #854d0e; line-height: 1.6;">
    <li><strong>Focus on High-Frequency Topics:</strong> Revisit question patterns from the last 5 years' university papers.</li>
    <li><strong>Solve Problems on Paper:</strong> Dedicate 45 minutes daily to solving algorithm and numerical problems by hand.</li>
    <li><strong>Summary Cheat Sheets:</strong> Consolidate formulas and proofs for quick 24-hour review before exam day.</li>
  </ol>
</div>

<p>We have updated the portal with past questions and step-by-step problem walkthroughs:</p>

<p style="text-align: center; margin: 28px 0;">
  <a href="https://www.cswithbs.com/courses" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #0284c7; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
    Explore Exam Prep Materials →
  </a>
</p>

<p>Wishing you tremendous success in your preparation.</p>`,
  },
  {
    id: "announcement",
    title: "Important Academic Notice / Schedule",
    badge: "Notice",
    description: "Schedule updates, class reminders, project deadlines, or workshop announcements.",
    defaultSubject: "Important Notice: [Announcement Title] — CSwithBS",
    content: `<p>Dear {{name}},</p>

<p>Please take note of the following important academic announcement regarding <strong>[Topic / Event / Schedule]</strong>.</p>

<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
  <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #0f172a;">📌 Notice Particulars:</h3>
  <p style="margin: 0 0 8px 0; color: #334155;"><strong>Date / Time:</strong> [Insert Date & Time]</p>
  <p style="margin: 0 0 8px 0; color: #334155;"><strong>Department:</strong> Computer Science & Engineering</p>
  <p style="margin: 0; color: #334155; line-height: 1.6;"><strong>Details:</strong> [Write details of the session, schedule change, lab submission, or workshop here.]</p>
</div>

<p>Please ensure you review all prerequisites and adhere to the timeline mentioned above.</p>`,
  },
  {
    id: "weekly-roundup",
    title: "Weekly Academic Roundup & Digest",
    badge: "Newsletter",
    description: "Weekly updates, latest articles, problem of the week, and resources.",
    defaultSubject: "CSwithBS Weekly: Tech Insights, Notes & Problem of the Week",
    content: `<p>Dear {{name}},</p>

<p>Welcome to this week's edition of the <strong>CSwithBS Weekly Digest</strong>! Here is what's new on the platform this week:</p>

<h3 style="color: #0f172a; margin-top: 24px; font-size: 16px;">🔥 Highlights of the Week:</h3>
<ul style="color: #334155; line-height: 1.7; padding-left: 20px;">
  <li><strong>New Article:</strong> <a href="https://www.cswithbs.com/blog" target="_blank" rel="noopener noreferrer" style="color: #0284c7; text-decoration: underline;">[Article Title Here]</a> — A detailed explanation of key computer science concepts.</li>
  <li><strong>Updated Notes:</strong> Enhancements and solved questions added to the [Subject Name] section.</li>
  <li><strong>Coding Practice:</strong> Walkthrough of this week's data structures problem.</li>
</ul>

<div style="background-color: #f1f5f9; border-radius: 8px; padding: 18px; margin: 22px 0; border: 1px solid #e2e8f0;">
  <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #0f172a;">💡 Concept of the Week:</h4>
  <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
    [Brief 2-3 line explanation of an important Computer Science concept, definition, or interview question.]
  </p>
</div>

<p style="text-align: center; margin: 26px 0;">
  <a href="https://www.cswithbs.com/blog" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
    Read Latest Blog Articles →
  </a>
</p>

<p>Have an inspiring and productive week ahead!</p>`,
  },
  {
    id: "direct-student",
    title: "Direct Student Response / Mentorship",
    badge: "Support",
    description: "Template for answering academic queries or project guidance for a single student.",
    defaultSubject: "Update regarding your CSwithBS Inquiry: [Subject / Topic]",
    content: `<p>Dear {{name}},</p>

<p>Thank you for reaching out regarding <strong>[Inquiry / Topic Name]</strong>.</p>

<p>Here are the details and guidance regarding your query:</p>

<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #0284c7; border-radius: 6px; padding: 16px; margin: 18px 0;">
  <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6;">
    [Write your personalized answer, explanation, or project advice here.]
  </p>
</div>

<p>If you have any further questions or need additional clarification, feel free to reply directly to this email.</p>

<div style="margin-top: 26px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
  <p style="margin: 0 0 4px 0; font-size: 14px; color: #475569;">Warm regards,</p>
  <p style="margin: 0; font-size: 15px; font-weight: 700; color: #0f172a;">Prof. Buddhadev Sasmal</p>
  <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">CSwithBS &bull; Midnapore City College</p>
</div>`,
  },
];
