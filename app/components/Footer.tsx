import Link from "next/link";
import Image from "next/image";
import { Container } from "./ui/Container";
import dbConnect from "@/lib/db";
import Setting from "@/models/Setting";
import { Facebook, Linkedin, Instagram } from "lucide-react";

const XIcon = ({ className = "w-4.5 h-4.5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const Footer = async () => {
  let siteTitle = "CSwithBS";
  let siteTagline =
    "An academic platform dedicated to clear thinking, research, and computer science education.";
  let socialOverrides: Record<string, string> = {};

  try {
    await dbConnect();
    const settings = await Setting.find({
      key: {
        $in: [
          "site_title",
          "site_tagline",
          "social_facebook",
          "social_twitter",
          "social_linkedin",
          "social_instagram",
        ],
      },
    }).lean();

    settings.forEach((s: any) => {
      if (s.key === "site_title" && s.value && s.value !== "CSWITHBS")
        siteTitle = s.value;
      if (s.key === "site_tagline" && s.value) siteTagline = s.value;
      if (s.key.startsWith("social_") && typeof s.value === "string" && s.value.trim()) {
        socialOverrides[s.key] = s.value.trim();
      }
    });
  } catch (err) {
    console.error("Footer fetch error", err);
  }

  // Canonical social channels with default URLs in code + dynamic DB override capability
  const SOCIAL_CHANNELS = [
    {
      key: "social_facebook",
      name: "Facebook",
      defaultUrl: "https://www.facebook.com/share/1ExjhBinXw/",
      hoverClass:
        "hover:text-[#1877F2] hover:bg-[#1877F2]/15 hover:border-[#1877F2]/50 hover:shadow-[0_0_20px_rgba(24,119,242,0.4)]",
      icon: (cls = "w-5 h-5") => <Facebook className={cls} />,
    },
    {
      key: "social_twitter",
      name: "X (Twitter)",
      defaultUrl: "https://x.com/cswithbs",
      hoverClass:
        "hover:text-white hover:bg-white/15 hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]",
      icon: (cls = "w-4.5 h-4.5") => <XIcon className={cls} />,
    },
    {
      key: "social_linkedin",
      name: "LinkedIn",
      defaultUrl: "",
      hoverClass:
        "hover:text-[#0A66C2] hover:bg-[#0A66C2]/15 hover:border-[#0A66C2]/50 hover:shadow-[0_0_20px_rgba(10,102,194,0.4)]",
      icon: (cls = "w-5 h-5") => <Linkedin className={cls} />,
    },
    {
      key: "social_instagram",
      name: "Instagram",
      defaultUrl: "",
      hoverClass:
        "hover:text-[#E4405F] hover:bg-[#E4405F]/15 hover:border-[#E4405F]/50 hover:shadow-[0_0_20px_rgba(228,64,95,0.4)]",
      icon: (cls = "w-5 h-5") => <Instagram className={cls} />,
    },
  ];

  // Resolve link: custom DB override takes precedence over built-in code default
  const activeSocials = SOCIAL_CHANNELS.map((item) => {
    const customUrl = socialOverrides[item.key];
    const url = customUrl !== undefined && customUrl !== "" ? customUrl : item.defaultUrl;
    return {
      ...item,
      url,
      // If admin explicitly set to "off" or "disabled", hide it
      hidden: url === "disabled" || url === "off" || url === "hidden" || url === "none",
    };
  }).filter((item) => !item.hidden && item.url);

  return (
    <footer className="border-t border-white/10 bg-black pt-16 pb-8">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="mb-2 flex items-center">
              <Image
                src="/images/logo.svg"
                alt="CSWITHBS Logo"
                width={160}
                height={40}
                className="h-8 md:h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-muted leading-relaxed">{siteTagline}</p>
            
            {/* Social Presence - Circular frosted glass badges matching Contact page */}
            {activeSocials.length > 0 && (
              <div className="flex items-center gap-3 mt-3">
                {activeSocials.map((social) => (
                  <a
                    key={social.key}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.name}
                    aria-label={social.name}
                    className={`flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-zinc-400 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95 ${social.hoverClass}`}
                  >
                    {social.icon()}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-bold text-white mb-6">Learn</h4>
            <ul className="flex flex-col gap-3 text-sm text-muted">
              <li>
                <Link
                  href="/study"
                  className="hover:text-accent transition-colors"
                >
                  Study Materials
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="hover:text-accent transition-colors"
                >
                  Premium Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/research"
                  className="hover:text-accent transition-colors"
                >
                  Research Papers
                </Link>
              </li>
              <li>
                <Link
                  href="/archive"
                  className="hover:text-accent transition-colors"
                >
                  Archive
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Discover</h4>
            <ul className="flex flex-col gap-3 text-sm text-muted">
              <li>
                <Link
                  href="/about"
                  className="hover:text-accent transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-accent transition-colors"
                >
                  Blog & Articles
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="hover:text-accent transition-colors"
                >
                  Image Gallery
                </Link>
              </li>
              <li>
                <Link
                  href="/research/collaborations"
                  className="hover:text-accent transition-colors"
                >
                  Collaborative Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Support & Legal</h4>
            <ul className="flex flex-col gap-3 text-sm text-muted">
              <li>
                <Link
                  href="/contact"
                  className="hover:text-accent transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-accent transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-accent transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="hover:text-accent transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/10 pt-8 text-xs text-muted">
          <div>
            <p className="mb-1">
              &copy; {new Date().getFullYear()} CSwithBS. All rights reserved.
            </p>
            <p className="text-zinc-500">
              Developed and designed by{" "}
              <a
                href="http://www.amarnathbera.in"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors  decoration-white/20 underline-offset-4"
              >
                Amarnath Bera
              </a>
            </p>
          </div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link
              href="/feed.xml"
              className="hover:text-white transition-colors"
            >
              RSS
            </Link>
            <Link
              href="/sitemap.xml"
              className="hover:text-white transition-colors"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};
