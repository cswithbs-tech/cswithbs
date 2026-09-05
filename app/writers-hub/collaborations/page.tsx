"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, FileText, AlignLeft, Search } from "lucide-react";
import Image from "next/image";

export default function CollaborationsListPage() {
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const fetchCollaborations = async () => {
    try {
      const res = await fetch("/api/collaborations");
      if (res.ok) {
        const data = await res.json();
        setCollaborations(data);
      }
    } catch (error) {
      console.error("Failed to fetch collaborations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Student Collaborations</h1>
          <p className="text-sm text-zinc-400">Manage posters and abstracts for the research showcase.</p>
        </div>
        <Link 
          href="/writers-hub/collaborations/add"
          className="flex items-center gap-2 px-4 py-2 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors"
        >
          <Plus size={18} />
          Add New Work
        </Link>
      </div>

      <div className="bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#111]">
           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
             <input type="text" placeholder="Search..." className="bg-black border border-white/10 rounded-md pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-accent text-white w-64" />
           </div>
        </div>
        
        {isLoading ? (
          <div className="p-12 text-center text-zinc-500">Loading collaborations...</div>
        ) : collaborations.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            No collaborations found. Click "Add New Work" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#111] text-zinc-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Student</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Event</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {collaborations.map((collab) => (
                  <tr key={collab._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white line-clamp-1">{collab.title}</p>
                      <p className="text-xs text-zinc-500">{collab.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                          {collab.student?.image ? (
                             <img src={collab.student.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                             <span className="text-[10px] text-zinc-400 font-bold">{collab.student?.name?.charAt(0)}</span>
                          )}
                        </div>
                        <span className="text-zinc-300">{collab.student?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${collab.type === 'Poster' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {collab.type === 'Poster' ? <FileText size={12} /> : <AlignLeft size={12} />}
                        {collab.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{collab.event}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-zinc-400 hover:text-white rounded bg-white/5 hover:bg-white/10 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button className="p-1.5 text-zinc-400 hover:text-red-400 rounded bg-white/5 hover:bg-red-500/10 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
