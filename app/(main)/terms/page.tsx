import { Container } from "@/app/components/ui/Container";

export const metadata = {
  title: "Terms of Use | CSwithBS",
  description: "Terms and Conditions of Use for CSwithBS",
};

export default function TermsPage() {
  return (
    <div className="py-20 md:py-32 bg-black min-h-screen">
      <Container className="max-w-4xl mx-auto text-zinc-300 prose prose-invert prose-lg prose-headings:font-display prose-headings:font-bold prose-a:text-accent">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Terms of Use</h1>
        <p className="text-sm text-zinc-500 mb-10">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <p>
          Welcome to <strong>CSwithBS</strong>. These Terms of Use ("Terms") govern your access to and use of the CSwithBS website at <strong>https://www.cswithbs.com</strong>, including any content, functionality, courses, research materials, and services offered on or through the website.
        </p>

        <p>
          By accessing or using this website, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.
        </p>

        <h2>1. Intellectual Property Rights</h2>
        <p>
          Other than the content you own, under these Terms, CSwithBS and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted a limited license only for purposes of viewing the material contained on this Website for personal, non-commercial use.
        </p>

        <h2>2. Restrictions</h2>
        <p>You are specifically restricted from all of the following:</p>
        <ul>
          <li>Publishing any Website material in any other media without proper citation or explicit permission;</li>
          <li>Selling, sublicensing, or otherwise commercializing any Website material, including premium CSwithBS PRO content or answer sets;</li>
          <li>Publicly performing and/or showing any Website material;</li>
          <li>Using this Website in any way that is or may be damaging to this Website;</li>
          <li>Using this Website in any way that impacts user access to this Website;</li>
          <li>Using this Website contrary to applicable laws and regulations, or in any way may cause harm to the Website, or to any person or business entity;</li>
          <li>Engaging in any data mining, data harvesting, data extracting, or any other similar activity in relation to this Website;</li>
          <li>Using this Website to engage in any advertising or marketing.</li>
        </ul>
        <p>
          Certain areas of this Website (such as CSwithBS PRO areas) are restricted from being accessed by you, and CSwithBS may further restrict access by you to any areas of this Website, at any time, in absolute discretion.
        </p>

        <h2>3. User Content</h2>
        <p>
          In these Terms of Use, "User Content" shall mean any audio, video text, images, comments, or other material you choose to display or submit on this Website. By displaying Your Content, you grant CSwithBS a non-exclusive, worldwide irrevocable, sub-licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.
        </p>
        <p>
          Your Content must be your own and must not be invading any third-party's rights. CSwithBS reserves the right to remove any of Your Content from this Website at any time without notice.
        </p>

        <h2>4. CSwithBS PRO and Premium Memberships</h2>
        <p>
          Some sections of the Website are accessible only to premium members ("CSwithBS PRO"). By purchasing a subscription, you agree to pay the stated fees and abide by the billing terms. You may not share your account credentials with others. We reserve the right to suspend or terminate your account if we detect unusual activity or sharing of credentials.
        </p>

        <h2>5. No Warranties</h2>
        <p>
          This Website is provided "as is," with all faults, and CSwithBS expresses no representations or warranties, of any kind related to this Website or the materials contained on this Website (including the accuracy of exam answer keys or research papers). Also, nothing contained on this Website shall be interpreted as advising you.
        </p>

        <h2>6. Limitation of Liability</h2>
        <p>
          In no event shall CSwithBS, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. CSwithBS, including its officers, directors, and employees shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this Website.
        </p>

        <h2>7. Indemnification</h2>
        <p>
          You hereby indemnify to the fullest extent CSwithBS from and against any and/or all liabilities, costs, demands, causes of action, damages, and expenses arising in any way related to your breach of any of the provisions of these Terms.
        </p>

        <h2>8. Severability</h2>
        <p>
          If any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the remaining provisions herein.
        </p>

        <h2>9. Variation of Terms</h2>
        <p>
          CSwithBS is permitted to revise these Terms at any time as it sees fit, and by using this Website you are expected to review these Terms on a regular basis.
        </p>

        <h2>10. Governing Law & Jurisdiction</h2>
        <p>
          These Terms will be governed by and interpreted in accordance with the laws of the jurisdiction in which CSwithBS operates, and you submit to the non-exclusive jurisdiction of the state and federal courts located there for the resolution of any disputes.
        </p>
      </Container>
    </div>
  );
}
