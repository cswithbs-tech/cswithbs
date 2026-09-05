import Link from "next/link";
import { ArrowLeft, User, Award, Quote, Download, Linkedin, AlignLeft } from "lucide-react";
import dbConnect from "@/lib/db";
import Collaboration from "@/models/Collaboration";
import UserModel from "@/models/User";
import { notFound } from "next/navigation";
import CitationButton from "./CitationButton";

export const revalidate = 60;

export default async function CollaborationDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  
  await dbConnect();
  
  if (typeof UserModel === "undefined") {}

  const dataRaw = await Collaboration.findOne({ slug: params.slug })
    .populate("student", "name email image username")
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
    } : { name: "Unknown", username: "#", image: "" }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        
        <Link href="/research/collaborations" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors mb-12 group uppercase tracking-widest">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Gallery
        </Link>

        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-10 space-y-6">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
               {data.type}
             </div>
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display leading-tight text-white">
               {data.title}
             </h1>
             
             <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm font-bold text-zinc-400 tracking-widest uppercase">
               <Link href={`/profile/${data.student.username}`} className="flex items-center gap-2 text-white hover:text-accent transition-colors">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs overflow-hidden">
                    {data.student.image ? (
                       /* eslint-disable-next-line @next/next/no-img-element */
                       <img src={data.student.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                       data.student.name.charAt(0)
                    )}
                  </div>
                  {data.student.name}
               </Link>
               <span className="text-zinc-700">&bull;</span>
               <span>{data.event}</span>
               <span className="text-zinc-700">&bull;</span>
               <span className="flex items-center gap-2 text-zinc-300">
                 <Award size={16} className="text-accent" />
                 {data.mentor}
               </span>
             </div>
          </div>

          {/* Priority Image */}
          {data.image ? (
            <div className="mb-16 rounded-[2rem] border border-white/5 bg-white/[0.02] p-2 md:p-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img 
                 src={data.image} 
                 alt={data.title}
                 className="w-full h-auto max-h-[70vh] object-contain rounded-[1.5rem]"
               />
            </div>
          ) : (
            <div className="mb-16 rounded-[2rem] border border-white/5 bg-white/[0.01] p-12 md:p-24 shadow-[0_0_50px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center text-center">
               <AlignLeft size={64} className="text-zinc-700 mb-6" />
               <h3 className="text-xl font-bold text-zinc-500 uppercase tracking-widest">Text-Only Abstract</h3>
            </div>
          )}

          {/* Focus on Writing (Abstract) & Toolkit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
             
             {/* Left: Reading Content */}
             <div className="md:col-span-2">
                <h3 className="text-2xl font-display font-black text-white mb-6">Abstract & Overview</h3>
                <div className="text-zinc-300 leading-loose text-lg font-sans whitespace-pre-wrap">
                  {data.abstract}
                </div>
             </div>

             {/* Right: Actions */}
             <div className="md:col-span-1">
                <div className="p-6 md:p-8 rounded-3xl bg-[#0a0a0a] border border-white/5 space-y-6 sticky top-24">
                   <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Toolkit</h3>
                   
                   <div className="flex flex-col gap-3">
                     <button className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-[#0077b5] hover:bg-[#006396] text-white font-bold text-sm transition-all shadow-lg">
                       <Linkedin size={18} />
                       Share on LinkedIn
                     </button>
                     
                     <CitationButton title={data.title} author={data.student.name} event={data.event} />
                     
                     <div className="pt-4 border-t border-white/5 mt-2">
                       <button className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-sm transition-all shadow-lg">
                         <Download size={18} />
                         Download File
                       </button>
                     </div>
                   </div>
                </div>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
}
