"use client";

import Link from "next/link";
import { ChevronRight, FileText, Search, AlignLeft } from "lucide-react";
import { useState } from "react";

export default function CollaborationsGallery({ initialData }: { initialData: any[] }) {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = initialData.filter((item) => {
    const matchesFilter = filter === "All" || item.type === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.student?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-12 border-b border-zinc-800 pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Student Showcase
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight font-display">
              Collaborative <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-500">Research</span>
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Explore outstanding posters and abstracts crafted by our students under faculty mentorship for national seminars and conferences.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            
            {/* Filter Buttons */}
            <div className="flex bg-zinc-900 border border-zinc-800 rounded-full p-1">
               {["All", "Poster", "Abstract"].map((type) => (
                 <button
                   key={type}
                   onClick={() => setFilter(type)}
                   className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full transition-all ${
                     filter === type 
                       ? "bg-accent text-black" 
                       : "text-zinc-400 hover:text-white hover:bg-white/5"
                   }`}
                 >
                   {type}
                 </button>
               ))}
            </div>

            <div className="relative group flex-1 sm:flex-none">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-accent transition-colors" size={18} />
               <input 
                 type="text" 
                 placeholder="Search projects..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all w-full sm:w-64"
               />
            </div>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <h3 className="text-2xl font-bold text-white">No results found</h3>
            <p className="text-zinc-500">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredItems.map((item) => (
              <Link 
                href={`/research/collaborations/${item.slug}`} 
                key={item._id}
                className="block break-inside-avoid group relative rounded-2xl overflow-hidden border border-zinc-800/50 bg-zinc-900/20 hover:border-accent/30 transition-all duration-500"
              >
                {/* Image Container */}
                <div className={`relative w-full overflow-hidden bg-zinc-900 flex items-center justify-center ${item.type === 'Abstract' ? 'aspect-video' : 'aspect-[3/4]'}`}>
                  {item.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-700 p-6 text-center">
                       <AlignLeft size={48} className="mb-4 opacity-50" />
                       <span className="font-bold uppercase tracking-widest text-xs">Text-Only Abstract</span>
                    </div>
                  )}
                  
                  {/* Type Badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                    {item.type === "Poster" ? <FileText size={14} className="text-blue-400" /> : <AlignLeft size={14} className="text-amber-400" />}
                    {item.type}
                  </div>
                </div>

                {/* Content / Info Overlay */}
                <div className={`p-5 space-y-3 relative ${item.image ? 'bg-gradient-to-t from-black via-black/95 to-transparent -mt-12 pt-16' : 'bg-black/90'}`}>
                  <p className="text-xs font-bold text-accent tracking-widest uppercase">{item.event}</p>
                  <h3 className="text-lg font-bold text-zinc-100 leading-snug group-hover:text-white transition-colors line-clamp-2 font-display">
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden text-xs font-bold text-zinc-400">
                        {item.student?.image ? (
                           /* eslint-disable-next-line @next/next/no-img-element */
                           <img src={item.student.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                           item.student?.name?.charAt(0)
                        )}
                      </div>
                      <span className="text-sm font-medium text-zinc-400">{item.student?.name}</span>
                    </div>
                    
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-accent group-hover:text-black transition-all duration-300">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
