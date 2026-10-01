"use client";

import Link from "next/link";
import { ChevronRight, FileText, Search, AlignLeft } from "lucide-react";
import { useState } from "react";
import { ShowcaseCard } from "@/app/components/ui/ShowcaseCard";

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ShowcaseCard key={item._id} project={item} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
