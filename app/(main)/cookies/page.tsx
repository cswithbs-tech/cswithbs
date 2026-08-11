import { Container } from "@/app/components/ui/Container";

export const metadata = {
  title: "Cookie Policy | CSwithBS",
  description: "Cookie Policy for CSwithBS",
};

export default function CookiePolicyPage() {
  return (
    <div className="py-20 md:py-32 bg-black min-h-screen">
      <Container className="max-w-4xl mx-auto text-zinc-300 prose prose-invert prose-lg prose-headings:font-display prose-headings:font-bold prose-a:text-accent">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Cookie Policy</h1>
        <p className="text-sm text-zinc-500 mb-10">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <p>
          This Cookie Policy explains how <strong>CSwithBS</strong> ("we", "us", and "our") uses cookies and similar technologies to recognize you when you visit our website at <strong>https://www.cswithbs.com</strong> ("Website"). It explains what these technologies are and why we use them, as well as your rights to control our use of them.
        </p>

        <h2>1. What are cookies?</h2>
        <p>
          Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
        </p>
        <p>
          Cookies set by the website owner (in this case, CSwithBS) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., like advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.
        </p>

        <h2>2. Why do we use cookies?</h2>
        <p>
          We use first and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. For example, we use cookies to maintain your login session when you are authenticated on the platform.
        </p>
        <p>
          Other cookies also enable us to track and target the interests of our users to enhance the experience on our Website. Third parties serve cookies through our Website for analytics and other purposes.
        </p>

        <h2>3. Types of Cookies We Use</h2>
        
        <h3>Essential Cookies</h3>
        <p>
          These cookies are strictly necessary to provide you with services available through our Website and to use some of its features, such as access to secure areas (like the Admin Dashboard or PRO member areas). Because these cookies are strictly necessary to deliver the Website, you cannot refuse them without impacting how our site functions.
        </p>

        <h3>Analytics and Customization Cookies</h3>
        <p>
          These cookies collect information that is used either in aggregate form to help us understand how our Website is being used or how effective our marketing campaigns are, or to help us customize our Website for you in order to enhance your experience.
        </p>

        <h2>4. How can I control cookies?</h2>
        <p>
          You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by clicking on the appropriate opt-out links provided in the cookie banner.
        </p>
        <p>
          You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website (like remaining logged into your account) may be severely restricted. As the means by which you can refuse cookies through your web browser controls vary from browser-to-browser, you should visit your browser's help menu for more information.
        </p>

        <h2>5. How often will you update this Cookie Policy?</h2>
        <p>
          We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
        </p>

        <h2>6. Where can I get further information?</h2>
        <p>
          If you have any questions about our use of cookies or other technologies, please email us at <strong>support.cswithbs@gmail.com</strong>.
        </p>
      </Container>
    </div>
  );
}
