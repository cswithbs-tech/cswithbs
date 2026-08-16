import { Container } from "@/app/components/ui/Container";
import { ResearchCarouselClient } from "./ResearchCarouselClient";
import { ProfileSection } from "./ProfileSection";
import { ExternalLink, FileText } from "lucide-react";
import { PdfButton } from "./PdfButton";
import { ExternalLinkButton } from "./ExternalLinkButton";

export const revalidate = 60;

const PUBLICATIONS = [
  {
    id: 1,
    title:
      "A Comprehensive Survey on Artificial Hummingbird Algorithm and its Applications",
    authors: "B. Sasmal, A. Das, K. G. Dhal",
    journal: "Archives of Computational Methods in Engineering",
    year: "2023",
    tags: ["Metaheuristics", "Optimization", "AHA"],
    link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=qE2uisoAAAAJ&citation_for_view=qE2uisoAAAAJ:N5tVd3kTz84C",
    hasPdf: false,
  },
  {
    id: 2,
    title: "Reptile Search Algorithm: Theory, variants and applications",
    authors: "B. Sasmal, K. G. Dhal",
    journal: "Swarm and Evolutionary Computation",
    year: "2024",
    tags: ["Swarm Intelligence", "RSA"],
    link: "https://link.springer.com/article/10.1007/s11831-023-09990-1",
    hasPdf: true,
  },
  {
    id: 3,
    title:
      "Mango leaf disease classification using deep learning techniques: a comprehensive review",
    authors:
      "Rebika Rai, Arunita Das, Krishna Gopal Dhal, Buddhadev Sasmal, Jorge Galvez",
    journal: "Multimedia Tools and Applications",
    year: "2023",
    tags: ["Deep Learning", "Agriculture", "Classification"],
    link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=qE2uisoAAAAJ&citation_for_view=qE2uisoAAAAJ:__bU50VfleQC",
    hasPdf: false,
  },
  {
    id: 4,
    title: "A comprehensive review on Aquila Optimizer",
    authors:
      "Buddhadev Sasmal, Abdelazim G Hussien, Arunita Das, Krishna Gopal Dhal",
    journal: "Artificial Intelligence Review",
    year: "2023",
    tags: ["Optimization", "Aquila Optimizer"],
    link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=qE2uisoAAAAJ&citation_for_view=qE2uisoAAAAJ:1yQoGdGgb4wC",
    hasPdf: false,
  },
  {
    id: 5,
    title: "Groundnut leaf disease classification using deep transfer learning",
    authors:
      "Buddhadev Sasmal, Suparna Biswas, Ramesh Saha, Krishna Gopal Dhal, Arunita Das, Sudip Pramanik",
    journal:
      "2025 6th International Conference on Recent Advances in Information Technology (RAIT)",
    year: "2025",
    tags: ["Deep Learning", "Transfer Learning", "Agriculture"],
    link: "https://scholar.google.com/citations?view_op=view_citation&hl=en&user=qE2uisoAAAAJ&citation_for_view=qE2uisoAAAAJ:NxmKEeNBbOMC",
    hasPdf: false,
  },
  {
    id: 6,
    title:
      "A novel groundnut leaf dataset for detection and classification of groundnut leaf diseases",
    authors:
      "Buddhadev Sasmal, Arunita Das, Krishna Gopal Dhal, Belal Saheb, Ruba Abu Khurma, Pedro A. Castillo-Valdivieso",
    journal: "Science Direct",
    year: "2024",
    tags: ["Dataset", "Agriculture"],
    link: "https://www.sciencedirect.com/science/article/pii/S2352340924007297",
    hasPdf: false,
  },
];

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] pt-32 pb-24">
      {/* ── Ambient background orbs ─────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#E2C6B9]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-amber-900/10 rounded-full blur-[100px]" />
      </div>

      <Container className="max-w-7xl mx-auto">
        <h1 className="sr-only">Research & Publications</h1>

        {/* Carousel */}
        <section className="mb-20">
          <ResearchCarouselClient />
        </section>

        {/* Profile */}
        <ProfileSection />

        {/* Publications */}
        <section id="publications" className="max-w-5xl mx-auto scroll-mt-32">
          <div className="flex items-baseline justify-between gap-4 mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white font-display">
              Selected Publications
            </h2>
            <div className="flex-1 h-px bg-white/5 mx-4 hidden md:block" />
            <ExternalLinkButton
              href="https://scholar.google.com/citations?user=qE2uisoAAAAJ&hl=en"
              className="text-sm font-bold text-accent hover:text-white transition-colors"
            >
              View All on Scholar
            </ExternalLinkButton>
          </div>

          <div className="flex flex-col gap-6">
            {PUBLICATIONS.map((pub) => (
              <div
                key={pub.id}
                className="group relative py-8 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors -mx-4 px-4 rounded-2xl"
              >
                <div className="flex flex-col md:flex-row gap-6 md:gap-10">
                  {/* Year Badge */}
                  <div className="shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xl font-display group-hover:bg-[#E2C6B9]/10 group-hover:text-[#E2C6B9] group-hover:border-[#E2C6B9]/30 transition-all">
                    {pub.year}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-snug font-display group-hover:text-accent transition-colors">
                      {pub.title}
                    </h3>
                    <p className="text-zinc-400 mb-2">
                      <span className="font-bold text-zinc-300">
                        {pub.authors}
                      </span>
                    </p>
                    <p className="text-zinc-500 text-sm font-mono italic mb-6">
                      {pub.journal}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {pub.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-zinc-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-6 mt-4 md:mt-0">
                        {pub.hasPdf ? <PdfButton /> : null}

                        <ExternalLinkButton
                          href={pub.link}
                          className="flex items-center gap-2 text-zinc-400 hover:text-white text-xs font-bold transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View on Scholar
                          <ExternalLink className="w-3 h-3 opacity-50" />
                        </ExternalLinkButton>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
