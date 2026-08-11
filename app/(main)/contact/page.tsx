import { Container } from "../../components/ui/Container";
import { ContactForm } from "../../components/ContactForm";
import { Metadata } from "next";
import {
  Mail,
  Globe,
  User,
  Twitter,
  Facebook,
  Linkedin,
  GraduationCap,
  MapPin,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact | Buddhadev Sasmal",
  description:
    "Get in touch with Professor Buddhadev Sasmal for academic collaborations, student queries, or website feedback.",
};

export default function ContactPage() {
  return (
    <div className="bg-[#050505] min-h-screen pt-24 pb-20 font-sans text-zinc-300 selection:bg-accent/30 selection:text-white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-16">
          {/* Left Column: Contact Info */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-serif font-medium text-white mb-12 leading-tight">
              Get in Touch.
            </h1>

            <div className="space-y-10">
              {/* Academic & Personal Contact */}
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-accent transition-colors hover:bg-accent/10 hover:border-accent/30">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-medium text-white mb-1">
                    Academic & Personal Inquiry
                  </h3>
                  <p className="text-zinc-400 mb-2 text-sm leading-relaxed max-w-xs">
                    For research, students, and personal messages.
                  </p>
                  <a
                    href="mailto:academic.cswithbs@gmail.com"
                    className="text-white hover:text-accent font-medium transition-colors"
                  >
                    academic.cswithbs@gmail.com
                  </a>
                </div>
              </div>

              {/* Website Related Contact */}
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-zinc-300 transition-colors hover:bg-white/10 hover:border-white/30">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-medium text-white mb-1">
                    Website & Technical Support
                  </h3>
                  <p className="text-zinc-400 mb-2 text-sm leading-relaxed max-w-xs">
                    For reporting site issues or technical feedback.
                  </p>
                  <a
                    href="mailto:support.cswithbs@gmail.com"
                    className="text-white hover:text-accent font-medium transition-colors"
                  >
                    support.cswithbs@gmail.com
                  </a>
                </div>
              </div>

              {/* Office / Location */}
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-accent transition-colors hover:bg-white/10 hover:border-white/30">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-medium text-white mb-1">
                    Academic Office
                  </h3>
                  <p className="text-zinc-400 mb-2 text-sm leading-relaxed max-w-xs">
                    Midnapore, Paschim Medinipur
                    <br />
                    West Bengal, 721129, India
                  </p>
                </div>
              </div>

              {/* Professional Socials */}
              <div className="flex items-start gap-4 pt-4 border-t border-white/10">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-medium text-white mb-3">
                    Professional Networks
                  </h3>
                  <div className="flex gap-4">
                    <a
                      href="#"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-accent/20 hover:border-accent/50 transition-all"
                      title="Google Scholar"
                    >
                      <GraduationCap className="w-5 h-5" />
                    </a>
                    <a
                      href="#"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-accent/20 hover:border-accent/50 transition-all"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href="#"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-accent/20 hover:border-accent/50 transition-all"
                      title="Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a
                      href="#"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-accent/20 hover:border-accent/50 transition-all"
                      title="Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="flex lg:justify-end">
            <div className="w-full max-w-lg bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 md:p-10 shadow-2xl relative overflow-hidden">
              {/* Glassmorphism Background Gradients */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-zinc-800/30 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="relative z-10">
                <h2 className="text-3xl font-serif font-medium text-white mb-6">
                  Need Support?
                </h2>
                <p className="text-zinc-400 mb-8 text-sm">
                  Raise a ticket below and we will get back to you.
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
