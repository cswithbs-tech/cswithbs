import Link from "next/link";
import Image from "next/image";
import { ChevronRight, FileText, AlignLeft } from "lucide-react";

interface ShowcaseCardProps {
  project: {
    slug: string;
    title: string;
    abstract?: string;
    type: "Poster" | "Abstract" | string;
    image?: string;
    event: string;
    student: string | { name: string; image?: string; [key: string]: any };
  };
}

export function ShowcaseCard({ project }: ShowcaseCardProps) {
  const studentName =
    typeof project.student === "object"
      ? project.student.name
      : project.student;
  const studentImage =
    typeof project.student === "object" ? project.student.image : undefined;

  return (
    <Link
      href={`/research/collaborations/${project.slug}`}
      className="group flex flex-col bg-[#050505] border border-white/10 hover:border-accent/50 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(var(--accent-color-rgb),0.15)] relative h-full"
    >
      {/* Glowing Hover Effect */}
      <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors z-0 pointer-events-none"></div>

      {/* Cover/Image Area (Blog card style: fixed height landscape) */}
      <div className="relative h-48 w-full overflow-hidden shrink-0 z-10 flex items-center justify-center bg-[#0a0a0a]">
        {project.image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
            />
            {/* Gradient overlay to blend with card body */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90"></div>
          </>
        ) : (
          /* Typographic Cover Fallback */
          <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-[#111] to-[#050505] p-6 flex flex-col items-center justify-center text-center group-hover:scale-105 transition-transform duration-700">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-[40px]"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-[30px]"></div>
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>

            <div className="border border-white/5 w-full h-full flex flex-col items-center justify-center p-4">
              <AlignLeft size={24} className="text-zinc-600 mb-2 opacity-50" />
              <div className="text-[10px] font-mono text-accent uppercase tracking-[0.2em] mb-2">
                {project.type === "Poster"
                  ? "Poster Submission"
                  : "Abstract Submission"}
              </div>
              <h4 className="text-lg font-serif font-bold text-zinc-300 leading-snug line-clamp-2">
                {project.title}
              </h4>
              <div className="mt-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest border-t border-white/5 pt-2 w-full">
                {studentName}
              </div>
            </div>
          </div>
        )}


      </div>
      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1 z-10 relative">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-zinc-400 mb-3 tracking-widest uppercase">
          <span className="text-accent">{project.event}</span>
        </div>

        <h4 className="text-lg font-bold text-white mb-3 font-display group-hover:text-accent transition-colors leading-tight line-clamp-2 drop-shadow-md">
          {project.title}
        </h4>

        {project.abstract && (
          <p className="text-sm text-zinc-400 line-clamp-3 mb-6 leading-relaxed font-sans flex-1">
            {project.abstract}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden text-[10px] font-bold text-zinc-400 border border-white/10">
              {studentImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={studentImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                studentName.charAt(0)
              )}
            </div>
            <span className="text-xs font-medium text-zinc-400">
              {studentName}
            </span>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 group-hover:bg-accent group-hover:text-black group-hover:border-accent transition-all duration-300 shadow-lg">
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
}
