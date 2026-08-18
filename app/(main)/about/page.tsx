import { Container } from "../../components/ui/Container";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Button } from "../../components/ui/Button";
import {
  Briefcase,
  GraduationCap,
  Award,
  BookOpen,
  ChevronRight,
  Cpu,
  Microscope,
  LineChart,
  Code2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Buddhadev Sasmal | Portfolio",
  description:
    "Academic Portfolio of Buddhadev Sasmal, Assistant Professor at Midnapore City College.",
};

const experiences = [
  {
    role: "Assistant Professor",
    institution: "Midnapore City College",
    department:
      "Dept. of Pure and Applied Science (Computer Science & Application)",
    period: "May 2023 – Present",
    desc: "Leading courses in advanced computer science, mentoring students, and actively contributing to the Research Cell. Focusing on AI applications and modern computing paradigms.",
    icon: <Briefcase className="w-5 h-5 text-accent" />,
  },
  {
    role: "Visiting Faculty",
    institution: "Midnapore College (Autonomous)",
    department: "Dept. of Computer Science (PG) and BCA",
    period: "August 2021 – Present",
    desc: "Delivering specialized lectures and guiding postgraduate students through complex computational theories and practical software engineering principles.",
    icon: <GraduationCap className="w-5 h-5 text-accent" />,
  },
  {
    role: "Assistant Professor (RUSA 2.0)",
    institution: "Midnapore College (Autonomous)",
    department: "Dept. of Computer Science",
    period: "February 2021 – July 2021",
    desc: "Served under the Rashtriya Uchchatar Shiksha Abhiyan (RUSA) 2.0 scheme, enhancing institutional research quality and academic rigor.",
    icon: <Award className="w-5 h-5 text-accent" />,
  },
];

const researchAreas = [
  {
    title: "Artificial Intelligence",
    desc: "Designing intelligent agents and predictive models to solve real-world problems in precision agriculture.",
    icon: <Cpu className="w-6 h-6 text-white" />,
  },
  {
    title: "Machine & Deep Learning",
    desc: "Training complex neural networks for advanced pattern recognition, diagnostics, and automated analysis.",
    icon: <Microscope className="w-6 h-6 text-white" />,
  },
  {
    title: "Optimization Algorithms",
    desc: "Researching and developing nature-inspired and metaheuristic algorithms for efficiency and scale.",
    icon: <LineChart className="w-6 h-6 text-white" />,
  },
  {
    title: "Digital Image Processing",
    desc: "Extracting actionable data from visual inputs, heavily applied in medical imaging and spatial analysis.",
    icon: <Code2 className="w-6 h-6 text-white" />,
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[#050505] min-h-screen text-zinc-300 font-sans selection:bg-accent/30 selection:text-white">
      {/* 1. Hero Section */}
      <section className="relative pt-36 pb-32 md:pt-48 md:pb-48 overflow-hidden border-b border-white/5">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text Content */}
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-serif font-medium text-white tracking-tight leading-[1.1] mb-6">
                Buddhadev Sasmal
              </h1>
              <h2 className="text-xl md:text-2xl font-serif text-white tracking-tight leading-[1.2] mb-8">
                Assistant Professor at{" "}
                <span className="italic text-accent">
                  Midnapore City College
                </span>
              </h2>

              <p className="text-base md:text-lg text-zinc-300 font-light leading-relaxed max-w-lg mb-12">
                A dedicated educator and researcher specializing in Artificial
                Intelligence, Deep Learning, and Nature-Inspired Optimization
                Algorithms. Passionate about applying computational models to
                solve complex challenges in healthcare and precision&nbsp;agriculture.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/research">
                  <Button
                    size="lg"
                    className="rounded-full text-base font-medium px-8 bg-accent text-black hover:bg-accent-hover transition-colors h-12 w-full sm:w-auto"
                  >
                    Explore Publications{" "}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full text-base font-medium px-8 border-white/20 text-white hover:bg-white/5 transition-colors h-12 w-full sm:w-auto"
                  >
                    Contact Me
                  </Button>
                </Link>
              </div>

              {/* Quick Stats/Badges */}
              <div className="flex gap-8 pt-8 border-t border-white/10 mt-8">
                <div>
                  <p className="text-2xl font-serif font-medium text-white mb-1">
                    UGC NET
                  </p>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
                    Qualified
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-serif font-medium text-white mb-1">
                    WBSET
                  </p>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
                    Qualified
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-serif font-medium text-white mb-1">
                    GATE
                  </p>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">
                    Qualified
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Glossy Image Showcase */}
            <div className="relative z-10 flex justify-center lg:justify-start mt-12 lg:mt-0">
              <div className="relative w-full max-w-[400px] aspect-[4/5] group">
                {/* Decorative background card */}
                <div className="absolute inset-0 bg-accent/20 rounded-3xl rotate-6 scale-105 blur-sm transition-transform duration-700"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-zinc-800 to-zinc-900 rounded-3xl -rotate-3 scale-105 border border-white/10 transition-transform duration-700"></div>

                {/* Main Image */}
                <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950">
                  <Image
                    src="/images/buddhadev_sasmal.jpeg"
                    alt="Professor Buddhadev Sasmal"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Academic Experience Timeline */}
      <section className="py-24 bg-[#080808] border-y border-white/5 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <Container className="relative z-10">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
              Academic Journey
            </h2>
            <p className="text-lg text-zinc-400">
              A track record of dedication to education and institutional growth
              across esteemed colleges.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {experiences.map((exp, idx) => (
                <div
                  key={idx}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-zinc-900 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10 transition-colors duration-300 group-hover:border-accent group-hover:bg-accent/10">
                    {exp.icon}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl border border-white/5 bg-[#111] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white text-xl">
                        {exp.role}
                      </h3>
                    </div>
                    <div className="text-accent font-medium mb-1 text-sm uppercase tracking-wider">
                      {exp.institution}
                    </div>
                    <div className="text-zinc-500 text-sm mb-4">
                      {exp.department} | {exp.period}
                    </div>
                    <p className="text-zinc-400 leading-relaxed text-sm">
                      {exp.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* 3. Research Interests (Premium Glass Cards) */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px] -z-10"></div>
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <span className="text-accent font-medium tracking-widest uppercase text-sm mb-4 block">
                Areas of Focus
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white">
                Research Expertise
              </h2>
            </div>
            <Link
              href="/research"
              className="inline-flex items-center text-white hover:text-accent transition-colors font-medium underline underline-offset-4 decoration-white/20 hover:decoration-accent"
            >
              View all publications <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {researchAreas.map((area, i) => (
              <div
                key={i}
                className="relative group p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm overflow-hidden hover:bg-white/[0.04] transition-colors"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-accent/50 transition-all duration-300 shadow-xl">
                    {area.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {area.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {area.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 4. Let's Connect CTA */}
      <section className="py-24 border-t border-white/5 bg-[#0A0A0A]">
        <Container>
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#111] to-black border border-white/10 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>

            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 relative z-10">
              Open to Collaboration
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10 relative z-10">
              Whether you are a student looking for guidance, a fellow
              researcher seeking to collaborate, or an institution interested in
              my work, I'd love to hear from you.
            </p>

            <div className="flex flex-wrap justify-center gap-6 relative z-10">
              <Link
                href="/contact"
                className="px-8 py-4 rounded-full bg-accent text-black font-semibold hover:bg-accent-hover transition-colors shadow-[0_0_20px_rgba(var(--color-accent),0.3)]"
              >
                Get in Touch
              </Link>
              <div className="flex items-center gap-6 px-8 py-4 rounded-full border border-white/10 bg-black/50 backdrop-blur-sm">
                <Link
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Google Scholar
                </Link>
                <div className="w-1 h-1 rounded-full bg-white/20"></div>
                <Link
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                >
                  ResearchGate
                </Link>
                <div className="w-1 h-1 rounded-full bg-white/20"></div>
                <Link
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                >
                  LinkedIn
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
