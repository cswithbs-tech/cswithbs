"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  MapPin,
  Activity,
  X,
  Server
} from "lucide-react";
import { format } from "date-fns";

export default function LiveTrafficPage() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [journeyModalOpen, setJourneyModalOpen] = useState(false);
  const [activeVisitorId, setActiveVisitorId] = useState<string | null>(null);
  const [journeyData, setJourneyData] = useState<any[]>([]);
  const [journeyLoading, setJourneyLoading] = useState(false);

  // Drag-to-scroll implementation
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  useEffect(() => {
    const fetchTraffic = async () => {
      try {
        const res = await fetch("/api/admin/live-traffic");
        if (res.ok) {
          const data = await res.json();
          setVisitors(data.visitors || []);
        }
      } catch (err) {
        console.error("Failed to fetch live traffic", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTraffic();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(fetchTraffic, 30000);
    return () => clearInterval(interval);
  }, []);

  const openJourney = async (visitorId: string) => {
    setActiveVisitorId(visitorId);
    setJourneyModalOpen(true);
    setJourneyLoading(true);
    setJourneyData([]);
    
    try {
      const res = await fetch(`/api/admin/live-traffic/journey/${visitorId}`);
      if (res.ok) {
        const data = await res.json();
        setJourneyData(data.journey || []);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setJourneyLoading(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    const d = device.toLowerCase();
    if (d.includes("mobile")) return <Smartphone className="w-4 h-4 text-zinc-400" />;
    if (d.includes("tablet")) return <Tablet className="w-4 h-4 text-zinc-400" />;
    return <Monitor className="w-4 h-4 text-zinc-400" />;
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 md:p-10">
      <div className="max-w-screen-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link 
                href="/admin/dashboard"
                className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-400" />
              </Link>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Globe className="text-accent" />
                Live Traffic Feed
              </h1>
            </div>
            <p className="text-zinc-500 text-sm ml-11">
              Detailed view of the 100 most recent visitors. Auto-updates every 30s. Drag the table to scroll horizontally.
            </p>
          </div>
          
          {loading && (
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full">
               <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
               <span className="text-xs text-zinc-400 font-mono">Syncing...</span>
            </div>
          )}
        </div>

        {/* Table Container */}
        <div className="bg-[#0f0f11] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl relative">
          <div 
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`overflow-x-auto select-none [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:bg-zinc-900/80 [&::-webkit-scrollbar-thumb]:bg-zinc-700/80 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-thumb]:rounded-full transition-all ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
              <thead className="bg-[#121215] border-b border-zinc-800/80 text-zinc-400 uppercase font-semibold text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-3 sticky left-0 z-20 bg-[#121215] border-r border-zinc-800/80 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.5)]">Location & ISP</th>
                  <th className="px-4 py-3">Active Page & Campaign</th>
                  <th className="px-4 py-3">Device</th>
                  <th className="px-4 py-3">Browser & OS</th>
                  <th className="px-4 py-3 text-center">Sessions</th>
                  <th className="px-4 py-3 text-right">Exact Last Seen</th>
                  <th className="px-4 py-3 text-right">Journey</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
                {visitors.length > 0 ? (
                  visitors.map((v, i) => (
                    <tr key={v._id || i} className="group hover:bg-zinc-800/30 transition-colors">
                      {/* Location & ISP (Sticky) */}
                      <td className="px-4 py-3 sticky left-0 z-10 bg-[#0f0f11] group-hover:bg-[#18181b] border-r border-zinc-800/40 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.5)] transition-colors">
                        <div className="flex items-center gap-2 font-medium text-white mb-1">
                          <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {v.city !== "Unknown" ? `${v.city}, ${v.country}` : v.country}
                          </span>
                        </div>
                        {v.isp && v.isp !== "Unknown" && (
                           <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 ml-6">
                              <Server className="w-3 h-3" />
                              <span className="truncate max-w-[180px]">{v.isp}</span>
                           </div>
                        )}
                      </td>
                      
                      {/* Page & UTM */}
                      <td className="px-4 py-3">
                        <span className="truncate max-w-[250px] inline-block text-zinc-300 font-medium" title={v.path}>
                          {v.path}
                        </span>
                        {(v.utmSource || v.utmMedium) && (
                          <div className="flex gap-2 mt-1">
                            {v.utmSource && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono uppercase border border-accent/20">src: {v.utmSource}</span>}
                            {v.utmMedium && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono uppercase border border-purple-500/20">med: {v.utmMedium}</span>}
                          </div>
                        )}
                      </td>
                      
                      {/* Device */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-zinc-400">
                          {getDeviceIcon(v.device)}
                          {v.device}
                        </div>
                      </td>
                      
                      {/* Browser & OS */}
                      <td className="px-4 py-3 text-zinc-400">
                        {v.browser} <span className="text-zinc-600 px-1">•</span> {v.os}
                      </td>

                      {/* Total Visits */}
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-1 bg-zinc-800 rounded-md text-xs font-mono font-medium text-zinc-300 border border-zinc-700/50">
                          {v.visitCount}
                        </span>
                      </td>
                      
                      {/* Exact Last Seen */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end gap-1 text-zinc-400">
                          <span className="font-mono text-white text-[11px]">
                            {format(new Date(v.lastSeen), "MMM dd • hh:mm:ss a")}
                          </span>
                          {v.timezone && v.timezone !== 'Unknown' && (
                            <span className="text-[10px] text-zinc-500">{v.timezone}</span>
                          )}
                        </div>
                      </td>
                      
                      {/* Journey Action */}
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => openJourney(v.visitorId)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-accent/10 hover:text-accent border border-white/10 hover:border-accent/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          View Journey
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                      {loading ? "Loading visitor data..." : "No recent visitors found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Journey Modal */}
      {journeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
             
             {/* Modal Header */}
             <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <div>
                   <h2 className="text-lg font-bold text-white flex items-center gap-2">
                     <Activity className="w-5 h-5 text-accent" />
                     Visitor Journey
                   </h2>
                   <p className="text-xs text-zinc-500 mt-1 font-mono">ID: {activeVisitorId}</p>
                </div>
                <button 
                  onClick={() => setJourneyModalOpen(false)}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
             </div>
             
             {/* Modal Body: Timeline */}
             <div className="p-6 overflow-y-auto flex-1 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
                {journeyLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-500 text-sm animate-pulse">Tracing footprint...</p>
                  </div>
                ) : journeyData.length === 0 ? (
                  <div className="text-center py-20 text-zinc-500">No journey data found.</div>
                ) : (
                  <div className="relative pl-6 border-l border-zinc-800 space-y-8">
                     {journeyData.map((hit: any, i: number) => (
                       <div key={hit._id || i} className="relative">
                          {/* Timeline dot */}
                          <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-zinc-900 border-2 border-accent rounded-full shadow-[0_0_10px_rgba(var(--accent),0.3)]"></div>
                          
                          {/* Content */}
                          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 ml-4">
                             <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2">
                                <span className="font-mono text-accent text-xs bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                                   Hit #{i + 1}
                                </span>
                                <span className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                                   <Clock className="w-3.5 h-3.5" />
                                   {format(new Date(hit.createdAt), "MMM dd, yyyy • hh:mm:ss a")}
                                </span>
                             </div>
                             <p className="text-white text-sm font-medium break-all">
                               {hit.path}
                             </p>
                          </div>
                       </div>
                     ))}
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
