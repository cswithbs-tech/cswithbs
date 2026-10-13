export interface EmailPresetTemplate {
  id: string;
  title: string;
  badge: string;
  description: string;
  defaultSubject: string;
  content: string;
}

export const EMAIL_PRESET_TEMPLATES: EmailPresetTemplate[] = [
  // =========================================================================
  // TYPE 1: WELCOME EMAILS (Warm Regards from Prof. Buddhadev Sasmal)
  // =========================================================================
  {
    id: "welcome-feedback",
    title: "Welcome to CSwithBS 🎉",
    badge: "Welcome",
    description: "Vibrant welcome onboarding with curriculum highlights, feedback invitation, and personal sign-off from Prof. Sasmal.",
    defaultSubject: "Welcome to CSwithBS! 🎉 Your Learning Journey Starts Here",
    content: `<p>Dear {{name}},</p>

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
  <a href="https://www.cswithbs.com/courses" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; font-weight: 600; font-size: 14px; padding: 14px 34px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.28); letter-spacing: 0.3px;">
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
    👉 <a href="https://www.cswithbs.com/contact" target="_blank" rel="noopener noreferrer" style="color: #059669; font-weight: 700; text-decoration: underline;">Visit our Contact &amp; Feedback Page</a> to share your ideas with us. We read and appreciate every message!
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
</div>`,
  },
  {
    id: "welcome-community",
    title: "Community Exploration & Roadmap",
    badge: "Welcome",
    description: "Encouraging roadmap welcoming students, highlighting subject tracks, and inviting community feedback.",
    defaultSubject: "Welcome to CSwithBS: Your roadmap for university & GATE prep",
    content: `<p>Dear {{name}},</p>

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
  <a href="https://www.cswithbs.com/courses" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; font-weight: 600; font-size: 14px; padding: 14px 34px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.28);">
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
    👉 <a href="https://www.cswithbs.com/contact" target="_blank" rel="noopener noreferrer" style="color: #059669; font-weight: 700; text-decoration: underline;">Visit our Contact &amp; Feedback Page</a> to share your ideas with us. We read and appreciate every message!
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
</div>`,
  },

  // =========================================================================
  // TYPE 2: NEWSLETTERS, BLOG & COURSES (Vibrant, Colorful, No "Warm Regards")
  // =========================================================================
  {
    id: "study-notes",
    title: "New Study Notes / Chapter Released",
    badge: "Curriculum",
    description: "Vibrant curriculum announcement highlighting new semester notes, diagrams, and cheat sheets.",
    defaultSubject: "New Study Notes Live: [Subject Name — Chapter Title] &bull; CSwithBS",
    content: `<p>Dear {{name}},</p>

<h2 style="margin: 4px 0 10px 0; font-size: 21px; color: #0f172a; font-weight: 800; line-height: 1.35;">
  New Study Notes Live: [Chapter Name]
</h2>

<p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
  We are pleased to announce that new in-depth study notes for <strong>[Subject Name: e.g. Database Management Systems]</strong> are now live on the academic portal!
</p>

<div style="margin: 20px 0;">
  <!-- Sky Blue Card -->
  <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 14px 18px; margin-bottom: 12px;">
    <p style="margin: 0 0 3px 0; font-size: 14.5px; font-weight: 700; color: #0284c7;">
      📖 Core Theoretical Foundations
    </p>
    <p style="margin: 0; color: #334155; font-size: 13.5px; line-height: 1.55;">
      Clear step-by-step explanations with architectural diagrams and memory representations.
    </p>
  </div>

  <!-- Violet Card -->
  <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 14px 18px; margin-bottom: 12px;">
    <p style="margin: 0 0 3px 0; font-size: 14.5px; font-weight: 700; color: #7c3aed;">
      ⚡ Solved Examples &amp; Algorithm Walkthroughs
    </p>
    <p style="margin: 0; color: #334155; font-size: 13.5px; line-height: 1.55;">
      Real university exam patterns, numerical problems, and step-by-step proofs.
    </p>
  </div>

  <!-- Emerald Card -->
  <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 18px;">
    <p style="margin: 0 0 3px 0; font-size: 14.5px; font-weight: 700; color: #059669;">
      🎯 Quick Revision Formula Sheet
    </p>
    <p style="margin: 0; color: #334155; font-size: 13.5px; line-height: 1.55;">
      Essential definitions, formulas, and time complexities for 24-hour review before exams.
    </p>
  </div>
</div>

<p style="text-align: center; margin: 28px 0;">
  <a href="https://www.cswithbs.com/courses" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; font-weight: 600; font-size: 14px; padding: 13px 32px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);">
    Access New Study Notes &rarr;
  </a>
</p>

<p style="color: #475569; font-size: 14px; line-height: 1.6;">
  Keep up the great momentum and consistent study!
</p>

<!-- Editorial Sign-off (No Warm Regards) -->
<div style="margin-top: 26px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
  <p style="margin: 0 0 3px 0; font-size: 13px; color: #64748b; font-weight: 600;">Happy learning,</p>
  <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">The CSwithBS Academic Team</p>
  <p style="margin: 2px 0 0 0; font-size: 12px; color: #94a3b8;">CSwithBS &bull; www.cswithbs.com</p>
</div>`,
  },
  {
    id: "weekly-roundup",
    title: "Weekly Academic Roundup & Digest",
    badge: "Newsletter",
    description: "Vibrant weekly digest with color tags for articles, notes updates, and concept of the week.",
    defaultSubject: "CSwithBS Weekly: Tech Insights, Notes & Problem of the Week",
    content: `<p>Dear {{name}},</p>

<h2 style="margin: 4px 0 10px 0; font-size: 21px; color: #0f172a; font-weight: 800;">
  CSwithBS Weekly: Tech Insights &amp; Problem of the Week
</h2>

<p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
  Welcome to this week's edition of the <strong>CSwithBS Weekly Digest</strong>! Here is what's new on the platform this week:
</p>

<div style="margin: 20px 0;">
  <!-- Article 1: Sky Blue -->
  <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 14px 16px; margin-bottom: 12px;">
    <span style="display: inline-block; background-color: #0284c7; color: #ffffff; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; text-transform: uppercase; margin-bottom: 6px;">New Article</span>
    <p style="margin: 0 0 3px 0; font-size: 14.5px; font-weight: 700; color: #0f172a;">
      <a href="https://www.cswithbs.com/blog" target="_blank" rel="noopener noreferrer" style="color: #0f172a; text-decoration: none;">[Article Title Here] &rarr;</a>
    </p>
    <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.55;">
      A detailed conceptual explanation of modern software architecture and distributed algorithms. (6 min read)
    </p>
  </div>

  <!-- Article 2: Emerald -->
  <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px 16px; margin-bottom: 12px;">
    <span style="display: inline-block; background-color: #059669; color: #ffffff; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; text-transform: uppercase; margin-bottom: 6px;">Updated Notes</span>
    <p style="margin: 0 0 3px 0; font-size: 14.5px; font-weight: 700; color: #0f172a;">
      <a href="https://www.cswithbs.com/courses" target="_blank" rel="noopener noreferrer" style="color: #0f172a; text-decoration: none;">[Subject Name: e.g. Operating Systems] &rarr;</a>
    </p>
    <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.55;">
      Enhancements, diagrams, and solved university questions added to chapter 3. (8 min read)
    </p>
  </div>

  <!-- Article 3: Amber -->
  <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 14px 16px;">
    <span style="display: inline-block; background-color: #d97706; color: #ffffff; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; text-transform: uppercase; margin-bottom: 6px;">Coding Practice</span>
    <p style="margin: 0 0 3px 0; font-size: 14.5px; font-weight: 700; color: #0f172a;">
      <a href="https://www.cswithbs.com/blog" target="_blank" rel="noopener noreferrer" style="color: #0f172a; text-decoration: none;">Problem of the Week: [Problem Name] &rarr;</a>
    </p>
    <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.55;">
      Time complexity optimization and step-by-step memory trace. (5 min read)
    </p>
  </div>
</div>

<!-- Concept of the Week (Soft Purple) -->
<div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 16px 18px; margin: 22px 0;">
  <h4 style="margin: 0 0 6px 0; font-size: 14px; color: #6b21a8; font-weight: 700;">
    💡 Concept of the Week
  </h4>
  <p style="margin: 0; color: #581c87; font-size: 13.5px; line-height: 1.6;">
    <em>[Brief 2-3 line explanation of an important Computer Science concept, definition, or interview question.]</em>
  </p>
</div>

<p style="text-align: center; margin: 26px 0;">
  <a href="https://www.cswithbs.com/blog" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: #ffffff; font-weight: 600; font-size: 14px; padding: 13px 30px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);">
    Read Latest Technical Articles &rarr;
  </a>
</p>

<!-- Editorial Sign-off (No Warm Regards) -->
<div style="margin-top: 26px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
  <p style="margin: 0 0 3px 0; font-size: 13px; color: #64748b; font-weight: 600;">Wishing you a great week of learning,</p>
  <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">The CSwithBS Editorial Team</p>
  <p style="margin: 2px 0 0 0; font-size: 12px; color: #94a3b8;">CSwithBS &bull; www.cswithbs.com</p>
</div>`,
  },
  {
    id: "exam-prep",
    title: "Exam Preparation & GATE Guide",
    badge: "Strategy",
    description: "Vibrant high-yield strategy sheet for semester exams and competitive papers.",
    defaultSubject: "Academic Alert: Semester Exam & GATE Prep Strategy Guide",
    content: `<p>Dear {{name}},</p>

<h2 style="margin: 4px 0 10px 0; font-size: 21px; color: #0f172a; font-weight: 800;">
  Academic Alert: Semester Exam &amp; GATE Strategy Guide
</h2>

<p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 20px 0;">
  With upcoming examinations approaching, maintaining a focused and structured revision routine is critical for scoring top grades.
</p>

<div style="margin: 20px 0;">
  <!-- Rule 1: Amber -->
  <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 14px 18px; margin-bottom: 12px;">
    <p style="margin: 0 0 3px 0; font-size: 14.5px; font-weight: 700; color: #b45309;">
      ⚡ 1. Focus on High-Frequency Topics
    </p>
    <p style="margin: 0; color: #334155; font-size: 13.5px; line-height: 1.55;">
      Revisit question patterns from the last 5 years' university papers. Master repeated question types first.
    </p>
  </div>

  <!-- Rule 2: Sky Blue -->
  <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 14px 18px; margin-bottom: 12px;">
    <p style="margin: 0 0 3px 0; font-size: 14.5px; font-weight: 700; color: #0284c7;">
      ✍️ 2. Solve Problems on Paper with a Pen
    </p>
    <p style="margin: 0; color: #334155; font-size: 13.5px; line-height: 1.55;">
      Dedicate 45 minutes daily to solving algorithm and numerical problems by hand. Draw memory trees and trace pipelines manually.
    </p>
  </div>

  <!-- Rule 3: Emerald -->
  <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 18px;">
    <p style="margin: 0 0 3px 0; font-size: 14.5px; font-weight: 700; color: #059669;">
      📝 3. One-Page Formula &amp; Cheat Sheets
    </p>
    <p style="margin: 0; color: #334155; font-size: 13.5px; line-height: 1.55;">
      Consolidate formulas, proofs, and time complexities for quick 24-hour review before exam day.
    </p>
  </div>
</div>

<p style="text-align: center; margin: 28px 0;">
  <a href="https://www.cswithbs.com/courses" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; font-weight: 600; font-size: 14px; padding: 13px 32px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 14px rgba(217, 119, 6, 0.3);">
    Explore Exam Prep Materials &rarr;
  </a>
</p>

<!-- Editorial Sign-off (No Warm Regards) -->
<div style="margin-top: 26px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
  <p style="margin: 0 0 3px 0; font-size: 13px; color: #64748b; font-weight: 600;">Wishing you tremendous success in your preparation,</p>
  <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">The CSwithBS Exam Preparation Team</p>
  <p style="margin: 2px 0 0 0; font-size: 12px; color: #94a3b8;">CSwithBS &bull; www.cswithbs.com</p>
</div>`,
  },

  // =========================================================================
  // TYPE 3: FEEDBACK, UPDATES & MAINTENANCE (Vibrant, Clear, Purpose-Built)
  // =========================================================================
  {
    id: "feedback-request",
    title: "Student Feedback & Experience",
    badge: "Feedback",
    description: "Vibrant feedback survey inviting students to request subjects and suggest improvements (Warm regards from Prof. Sasmal).",
    defaultSubject: "How can we make your learning experience better? 💭 — CSwithBS",
    content: `<p>Dear {{name}},</p>

<h2 style="margin: 4px 0 10px 0; font-size: 21px; color: #0f172a; font-weight: 800; line-height: 1.35;">
  How is your learning journey going? 💭
</h2>

<p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 14px 0;">
  We hope your study sessions on <strong>CSwithBS</strong> have been productive and insightful!
</p>

<p style="color: #334155; font-size: 14.5px; line-height: 1.65; margin: 0 0 22px 0;">
  From day one, our mission has been simple: to turn complex Computer Science concepts into clear, intuitive, and exam-ready notes. But the best educational resources are shaped directly by students like you.
</p>

<div style="margin: 20px 0;">
  <!-- Question 1: Sky Blue -->
  <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 14px 18px; margin-bottom: 12px;">
    <p style="margin: 0 0 3px 0; font-size: 14px; font-weight: 700; color: #0284c7;">
      1. Notes Clarity &amp; Coverage:
    </p>
    <p style="margin: 0; color: #334155; font-size: 13.5px; line-height: 1.55;">
      Are the explanations in DBMS, OS, DSA, or Networks clear and easy to follow? Did you find any concept tricky or missing?
    </p>
  </div>

  <!-- Question 2: Violet -->
  <div style="background-color: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 14px 18px; margin-bottom: 12px;">
    <p style="margin: 0 0 3px 0; font-size: 14px; font-weight: 700; color: #7c3aed;">
      2. Upcoming Exams &amp; Subjects:
    </p>
    <p style="margin: 0; color: #334155; font-size: 13.5px; line-height: 1.55;">
      What semester subjects, university papers, or GATE topics are you preparing for right now that you want us to cover next?
    </p>
  </div>

  <!-- Question 3: Emerald -->
  <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 18px;">
    <p style="margin: 0 0 3px 0; font-size: 14px; font-weight: 700; color: #059669;">
      3. Platform Experience:
    </p>
    <p style="margin: 0; color: #334155; font-size: 13.5px; line-height: 1.55;">
      How has your reading experience been on mobile or laptop? Any feature or tool you wish we had on CSwithBS?
    </p>
  </div>
</div>

<!-- Amber Action Card -->
<div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
  <h4 style="margin: 0 0 6px 0; font-size: 16px; color: #92400e; font-weight: 700;">
    Ready to share your thoughts?
  </h4>
  <p style="margin: 0 0 16px 0; color: #b45309; font-size: 13.5px; line-height: 1.55;">
    It takes less than a minute, and your feedback directly influences our upcoming chapters and study resources.
  </p>
  <a href="https://www.cswithbs.com/contact" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 3px 10px rgba(217, 119, 6, 0.3);">
    📝 Share Your Feedback Here &rarr;
  </a>
</div>

<p style="font-size: 13.5px; color: #64748b; line-height: 1.6; margin: 20px 0 0 0;">
  <em>Prefer writing directly?</em> You can also reply directly to this email or drop a note to <a href="mailto:support@cswithbs.com" style="color: #0284c7; text-decoration: underline;">support@cswithbs.com</a>. Every message is personally read by our team.
</p>

<!-- Sir's Name Closing (Personal Mentorship / Feedback) -->
<div style="margin-top: 26px; padding-top: 18px; border-top: 1px solid #e2e8f0;">
  <p style="margin: 0 0 4px 0; font-size: 14px; color: #475569;">Warm regards,</p>
  <p style="margin: 0; font-size: 15px; font-weight: 700; color: #0f172a;">Prof. Buddhadev Sasmal</p>
  <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">CSwithBS &mdash; Learn. Explore. Grow.</p>
</div>`,
  },
  {
    id: "announcement",
    title: "Important Academic Notice / Schedule",
    badge: "Notice",
    description: "Vibrant notice for schedule updates, class reminders, maintenance windows, or workshops.",
    defaultSubject: "Important Notice: [Announcement Title] &bull; CSwithBS",
    content: `<p>Dear {{name}},</p>

<h2 style="margin: 4px 0 10px 0; font-size: 20px; color: #0f172a; font-weight: 800;">
  Important Notice: [Announcement Title]
</h2>

<p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 18px 0;">
  Please take note of the following important academic announcement regarding <strong>[Topic / Event / Schedule]</strong>:
</p>

<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
  <table role="presentation" border="0" cellpadding="6" cellspacing="0" width="100%">
    <tr>
      <td style="width: 110px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: #64748b; vertical-align: top;">Date / Time:</td>
      <td style="font-size: 14px; color: #0f172a; font-weight: 600;">[Insert Date &amp; Time]</td>
    </tr>
    <tr>
      <td style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: #64748b; vertical-align: top;">Department:</td>
      <td style="font-size: 14px; color: #334155;">Computer Science &amp; Engineering</td>
    </tr>
    <tr>
      <td style="font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: #64748b; vertical-align: top;">Details:</td>
      <td style="font-size: 14px; color: #334155; line-height: 1.6;">
        [Write details of the session, schedule change, lab submission, maintenance window, or workshop here.]
      </td>
    </tr>
  </table>
</div>

<p style="font-size: 14px; color: #475569; line-height: 1.65;">
  Please ensure you review all prerequisites and adhere to the timeline mentioned above. If you have questions, write to <a href="mailto:support@cswithbs.com" style="color: #0284c7; text-decoration: underline;">support@cswithbs.com</a>.
</p>

<!-- Operations Sign-off (No Warm Regards) -->
<div style="margin-top: 26px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
  <p style="margin: 0 0 3px 0; font-size: 13px; color: #64748b; font-weight: 600;">Best regards,</p>
  <p style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">CSwithBS Academic Administration</p>
  <p style="margin: 2px 0 0 0; font-size: 12px; color: #94a3b8;">support@cswithbs.com</p>
</div>`,
  },
  {
    id: "direct-student",
    title: "1-on-1 Student Response / Mentorship",
    badge: "Mentorship",
    description: "Personal mentorship note answering a student inquiry (Warm regards from Prof. Sasmal).",
    defaultSubject: "Update regarding your CSwithBS Inquiry: [Subject / Topic]",
    content: `<p>Dear {{name}},</p>

<p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 14px 0;">
  Thank you for reaching out regarding <strong>[Inquiry / Topic Name]</strong>.
</p>

<p style="color: #334155; font-size: 15px; line-height: 1.7; margin: 0 0 18px 0;">
  Here are the details and guidance regarding your query:
</p>

<div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 18px 20px; margin: 20px 0;">
  <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.65;">
    [Write your personalized answer, explanation, or project advice here.]
  </p>
</div>

<p style="color: #475569; font-size: 14px; line-height: 1.65; margin: 18px 0;">
  If you have any further questions or need additional clarification, feel free to reply directly to this email.
</p>

<!-- Sir's Name Closing (Personal Mentorship) -->
<div style="margin-top: 26px; padding-top: 18px; border-top: 1px solid #e2e8f0;">
  <p style="margin: 0 0 4px 0; font-size: 14px; color: #475569;">Warm regards,</p>
  <p style="margin: 0; font-size: 15px; font-weight: 700; color: #0f172a;">Prof. Buddhadev Sasmal</p>
  <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">CSwithBS &bull; Midnapore City College</p>
</div>`,
  },
];
