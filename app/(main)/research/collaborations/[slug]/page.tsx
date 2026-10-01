import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, User, Award, Quote, Download, Linkedin, AlignLeft, Calendar } from "lucide-react";
import dbConnect from "@/lib/db";
import Collaboration from "@/models/Collaboration";
import UserModel from "@/models/User";
import { notFound } from "next/navigation";
import ToolkitActions from "./ToolkitActions";
import { PosterLightbox } from "@/app/components/PosterLightbox";

export const revalidate = 60;

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  await dbConnect();
  
  const data = await Collaboration.findOne({ slug: params.slug }).lean();
  
  if (!data) return { title: "Not Found" };
  
  return {
    title: `${data.title} | CSWithBS`,
    description: data.abstract ? data.abstract.substring(0, 160) + "..." : "Research collaboration at CSWithBS",
    openGraph: {
      title: data.title,
      description: data.abstract ? data.abstract.substring(0, 160) + "..." : "Research collaboration at CSWithBS",
      images: data.image ? [{ url: data.image }] : [],
    }
  };
}

export default async function CollaborationDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  
  await dbConnect();
  
  if (typeof UserModel === "undefined") {}

  const dataRaw = await Collaboration.findOne({ slug: params.slug })
    .populate("student", "name email image username")
    .populate("coAuthors", "name username image")
    .lean();

  if (!dataRaw) {
    notFound();
  }

  const studentRaw = dataRaw.student as any;
  const isPopulated = studentRaw && typeof studentRaw === "object" && "name" in studentRaw;

  const data = {
    ...dataRaw,
    _id: dataRaw._id.toString(),
    student: isPopulated ? {
      _id: studentRaw._id?.toString() || "",
      name: studentRaw.name || "Unknown",
      username: studentRaw.username || (studentRaw.name ? studentRaw.name.replace(/\s+/g, "").toLowerCase() : "#"),
      image: studentRaw.image || ""
    } : { name: "Unknown", username: "#", image: "" },
    coAuthors: (dataRaw as any).coAuthors || []
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Blurred Background Hero */}
      {data.image && (
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-[70vh] pointer-events-none overflow-hidden z-0 opacity-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={data.image} 
            alt="Background" 
            className="w-full h-full object-cover blur-[120px] scale-150 transform translate-x-1/4" 
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/80 to-black"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black"></div>
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 max-w-7xl pt-24 pb-24 relative z-10">
        
        <Link href="/research/collaborations" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors mb-8 md:mb-12 group uppercase tracking-widest border border-white/10 bg-white/5 px-4 py-2 rounded-full">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Gallery
        </Link>

        {/* FULL WIDTH HEADER */}
        <div className="mb-16 space-y-6 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black font-display leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-500 drop-shadow-sm pb-2">
            {data.title}
          </h1>
          
          {/* Metadata Grid */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
            <Link href={`/profile/${data.student.username}`} className="flex items-center gap-3 text-white hover:text-accent transition-colors bg-white/5 border border-white/10 pr-4 pl-1.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
               <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs overflow-hidden border border-white/20">
                 {data.student.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={data.student.image} alt="" className="w-full h-full object-cover" />
                 ) : (
                    data.student.name.charAt(0)
                 )}
               </div>
               {data.student.name}
            </Link>

            {data.coAuthors && data.coAuthors.length > 0 && data.coAuthors.map((coAuthor: any) => (
              <Link key={coAuthor._id} href={`/profile/${coAuthor.username}`} className="flex items-center gap-3 text-white hover:text-accent transition-colors bg-white/5 border border-white/10 pr-4 pl-1.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                 <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs overflow-hidden border border-white/20">
                   {coAuthor.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={coAuthor.image} alt="" className="w-full h-full object-cover" />
                   ) : (
                      coAuthor.name.charAt(0)
                   )}
                 </div>
                 {coAuthor.name}
              </Link>
            ))}
            
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs font-bold text-zinc-300 uppercase tracking-widest">
              <Calendar size={14} className="text-accent" />
              {data.event}
            </div>
            
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs font-bold text-zinc-300 uppercase tracking-widest">
              <Award size={14} className="text-accent" />
              Mentor: {data.mentor}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* LEFT COLUMN: Sticky Poster / Visuals */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-28 space-y-6">
              {/* Poster Image */}
              <div className="rounded-3xl overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                {data.image ? (
                  <PosterLightbox src={data.image} alt={data.title} />
                ) : (
                  <div className="aspect-[3/4] w-full relative overflow-hidden bg-gradient-to-br from-[#111] to-[#050505] p-8 flex flex-col items-center justify-center text-center">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full blur-[60px]"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px]"></div>
                    <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                    
                    <div className="border border-white/10 w-full h-full flex flex-col items-center justify-center p-6 bg-black/20 backdrop-blur-sm rounded-xl">
                      <AlignLeft size={48} className="text-zinc-600 mb-8 opacity-50" />
                      <div className="text-xs font-mono text-accent uppercase tracking-[0.2em] mb-4">
                        {data.type === 'Poster' ? 'Poster Submission' : 'Abstract Submission'}
                      </div>
                      <h4 className="text-2xl font-serif font-bold text-zinc-300 leading-snug">
                        {data.title}
                      </h4>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Content & Details */}
          <div className="lg:col-span-7 flex flex-col">

            {/* Abstract Reading Experience */}
            <div className="prose prose-invert prose-lg max-w-none mb-16">
              <h3 className="text-xl font-mono text-zinc-500 uppercase tracking-[0.2em] mb-8 border-b border-white/10 pb-4">Abstract & Overview</h3>
              <div className="text-zinc-300 text-[1.1rem] leading-[2] font-serif space-y-6">
                {data.abstract.split(/\n\s*\n/).map((paragraph: string, idx: number) => {
                  if (!paragraph.trim()) return null;
                  return (
                    <p key={idx}>
                      {paragraph.replace(/\n/g, ' ')}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Toolkit Actions */}
            <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/5 space-y-6 mt-auto">
               <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 pb-4">Researcher Toolkit</h3>
               
               <ToolkitActions 
                 title={data.title} 
                 author={data.coAuthors && data.coAuthors.length > 0 ? `${data.student.name}, ${data.coAuthors.map((c:any) => c.name).join(", ")}` : data.student.name} 
                 event={data.event} 
                 image={data.image} 
               />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
