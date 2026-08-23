"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Users, CheckCircle2, XCircle, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import Image from "next/image";
import Link from "next/link";

export default function AnnouncementStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Only super admins can access
    const isSuperAdmin = (session?.user as any)?.roles?.includes("SUPER_ADMIN");
    if (session && !isSuperAdmin) {
      router.push("/admin/announcements");
      return;
    }

    if (session && isSuperAdmin) {
      fetchStats();
    }
  }, [session, router, id]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/admin/announcements/${id}`);
      const json = await res.json();
      
      if (res.ok) {
        setData(json);
      } else {
        showToast(json.error || "Failed to load stats", "error");
        router.push("/admin/announcements");
      }
    } catch (error) {
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { notification, stats } = data;

  const UserList = ({ users, emptyMessage }: { users: any[], emptyMessage: string }) => (
    <div className="bg-black/40 border border-white/5 rounded-xl max-h-[500px] overflow-y-auto custom-scrollbar p-2">
      {users.length === 0 ? (
        <div className="p-8 text-center text-zinc-500 text-sm">{emptyMessage}</div>
      ) : (
        <div className="space-y-1">
          {users.map((u: any) => (
            <div key={u._id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
              <Image 
                src={u.image || "https://placehold.co/100x100/111/FFF?text=User"} 
                alt={u.name} 
                width={32} 
                height={32} 
                className="rounded-full shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{u.name}</p>
                <p className="text-xs text-zinc-500 truncate">{u.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-8 font-sans selection:bg-accent/30">
      <Link href="/admin/announcements" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Broadcasts
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Col: Notification Details */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Users className="w-32 h-32" />
             </div>
             
             <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border mb-4 ${
                  notification.type === "GENERAL" ? "bg-zinc-500/10 text-zinc-300 border-zinc-500/20" :
                  notification.type === "PERSONAL" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                  "bg-accent/10 text-accent border-accent/20"
                }`}>
                  {notification.type}
              </span>
              
              <h1 className="text-xl font-bold text-white mb-2">{notification.title}</h1>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">"{notification.message}"</p>
              
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-500">
                 <span>Sent: {new Date(notification.createdAt).toLocaleString()}</span>
                 <span>Target: {stats.total} User{stats.total !== 1 ? 's' : ''}</span>
              </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111111]/80 border border-white/10 rounded-2xl p-6 text-center">
               <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Read</h3>
               <p className="text-3xl font-bold text-green-400">{stats.readBy.length}</p>
            </div>
            <div className="bg-[#111111]/80 border border-white/10 rounded-2xl p-6 text-center">
               <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Dismissed</h3>
               <p className="text-3xl font-bold text-red-400">{stats.hiddenBy.length}</p>
            </div>
            <div className="bg-[#111111]/80 border border-white/10 rounded-2xl p-6 text-center col-span-2">
               <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Unseen</h3>
               <p className="text-3xl font-bold text-zinc-300">{stats.unseenBy.length}</p>
               <div className="w-full bg-white/5 h-2 rounded-full mt-3 overflow-hidden">
                 <div 
                   className="h-full bg-accent" 
                   style={{ width: `${stats.total > 0 ? ((stats.readBy.length + stats.hiddenBy.length) / stats.total) * 100 : 0}%`}}
                 />
               </div>
               <p className="text-[10px] text-zinc-500 mt-2">
                 {stats.total > 0 ? Math.round(((stats.readBy.length + stats.hiddenBy.length) / stats.total) * 100) : 0}% Engagement Rate
               </p>
            </div>
          </div>
        </div>

        {/* Right Col: User Lists */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="space-y-4">
              <h3 className="text-sm font-bold text-green-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Seen By
              </h3>
              <UserList users={stats.readBy} emptyMessage="No one has read this yet." />
           </div>
           
           <div className="space-y-4">
              <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Dismissed By
              </h3>
              <UserList users={stats.hiddenBy} emptyMessage="No one has dismissed this." />
           </div>

           <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2">
                <EyeOff className="w-4 h-4" /> Unseen
              </h3>
              <UserList users={stats.unseenBy} emptyMessage="Everyone has seen this!" />
           </div>
        </div>

      </div>
    </div>
  );
}
