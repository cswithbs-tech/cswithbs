"use client";

import { Container } from "@/app/components/ui/Container";
import Link from "next/link";
import { Microscope, FileText, Download, Users, ArrowRight, ExternalLink } from "lucide-react";
import Image from "next/image";

const researchAreas = [
  {
    title: "Artificial Intelligence & ML",
    description: "Investigating novel neural architectures, LLM reasoning capabilities, and ethical AI alignment.",
    icon: Microscope,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  {
    title: "Distributed Systems",
    description: "Scalability, consensus algorithms, and fault-tolerance in global-scale cloud infrastructure.",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    title: "Cryptography & Security",
    description: "Post-quantum cryptography, zero-knowledge proofs, and secure multi-party computation.",
    icon: FileText,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  }
];

const publications = [
  {
    id: 1,
    title: "Beyond Transformers: Linear Attention Mechanisms in Large Language Models",
    authors: "Alice Super, Bob Builder",
    date: "October 2024",
    type: "Whitepaper",
    tags: ["AI", "LLMs"],
  },
  {
    id: 2,
    title: "Optimizing Garbage Collection in High-Frequency Trading Systems",
    authors: "Charlie Root",
    date: "August 2024",
    type: "Journal Article",
    tags: ["Systems", "Performance"],
  },
  {
    id: 3,
    title: "A Comprehensive Review of Zero-Knowledge Rollups for Blockchain Scaling",
    authors: "Alice Super",
    date: "May 2024",
    type: "Review Paper",
    tags: ["Web3", "Cryptography"],
  },
];

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-20">
      <Container>
        
        {/* Hero Section */}
        <section className="mb-24 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-accent text-sm font-bold uppercase tracking-wider mb-8">
              <Microscope className="w-4 h-4" /> CSwithBS Labs
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight font-display tracking-tight mb-8">
              Pushing the Boundaries of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-white">
                Computer Science
              </span>
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed mb-10 max-w-2xl mx-auto">
              Our research division is dedicated to exploring the uncharted territories of software engineering, artificial intelligence, and theoretical computing.
            </p>
          </div>
        </section>

        {/* Focus Areas */}
        <section className="mb-32">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-white font-display">Research Focus Areas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {researchAreas.map((area, idx) => {
              const Icon = area.icon;
              return (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors group">
                  <div className={`w-14 h-14 rounded-2xl ${area.bg} flex items-center justify-center mb-6`}>
                    <Icon className={`w-7 h-7 ${area.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-accent transition-colors">
                    {area.title}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed">
                    {area.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Publications Grid */}
        <section className="mb-32">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-white font-display">Latest Publications</h2>
            <Link href="#" className="hidden md:flex items-center gap-2 text-accent hover:text-white transition-colors font-medium">
              View All Archive <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="flex flex-col gap-4">
            {publications.map((pub) => (
              <div key={pub.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:border-white/30 transition-colors group">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider bg-accent/10 px-3 py-1 rounded-full">
                      {pub.type}
                    </span>
                    <span className="text-xs font-medium text-zinc-500">{pub.date}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-accent transition-colors leading-snug">
                    {pub.title}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    <span className="font-medium text-zinc-300">Authors:</span> {pub.authors}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors">
                    <Download className="w-4 h-4" /> PDF
                  </button>
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-accent text-black hover:bg-accent/90 rounded-xl font-bold transition-colors">
                    Read <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Collaboration CTA */}
        <section className="bg-gradient-to-br from-white/10 to-transparent border border-white/20 rounded-3xl p-10 md:p-16 text-center">
          <Users className="w-12 h-12 text-white mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 font-display">
            Collaborate With Us
          </h2>
          <p className="text-lg text-zinc-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Are you a student, academic, or industry professional working on groundbreaking CS research? We are always open to publishing guest papers and collaborating on joint projects.
          </p>
          <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-transform active:scale-95 shadow-xl">
            Submit a Proposal
          </button>
        </section>

      </Container>
    </div>
  );
}
