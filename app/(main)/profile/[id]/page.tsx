"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/app/components/ui/Button";
import { Container } from "@/app/components/ui/Container";
import GlobalLoading from "@/app/loading";
import { useToast } from "@/app/context/ToastContext";
import {
  Twitter,
  Linkedin,
  Github,
  Globe,
  MapPin,
  Calendar,
  MessageSquare,
  Loader2,
  BookOpen,
  Crown,
  UserCog,
  PenTool,
  Star,
  GraduationCap,
  Building,
  Clock,
  FileText,
  Presentation,
  ChevronRight,
  AlignLeft
} from "lucide-react";
import { UserBadge } from "@/app/components/ui/UserBadge";
import { BlogCard } from "@/app/components/BlogCard";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [publicComments, setPublicComments] = useState<any[]>([]);
  const [interactionsLoading, setInteractionsLoading] = useState(false);

  const isMyProfile = session?.user && (session.user as any).id === id;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/users/${id}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  useEffect(() => {
    // Fetch public comments for this user
    // Note: In a real app, you'd need an endpoint like /api/users/[id]/comments
    // For now, we only load them if it's the current user for demonstration,
    // or you could implement the public endpoint.
    const fetchComments = async () => {
      if (!isMyProfile) return; // Remove this check if you have a public endpoint

      setInteractionsLoading(true);
      try {
        const res = await fetch("/api/user/comments");
        const data = await res.json();
        if (Array.isArray(data)) {
          setPublicComments(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInteractionsLoading(false);
      }
    };

    if (user) {
      fetchComments();
    }
  }, [user, isMyProfile]);

  if (loading) return <GlobalLoading />;

  if (!user) {
    return (
      <Container className="py-20 text-center min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white mb-4">User not found</h1>
        <p className="text-zinc-500 mb-8">
          The profile you are looking for does not exist or has been removed.
        </p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Return Home
        </Button>
      </Container>
    );
  }

  const SocialLinks = () => {
    if (
      !user.socialLinks ||
      (!user.socialLinks.twitter &&
        !user.socialLinks.linkedin &&
        !user.socialLinks.github &&
        !user.socialLinks.website)
    )
      return null;

    return (
      <div className="flex gap-4 pt-4 border-t border-white/5 mt-6">
        {user.socialLinks.twitter && (
          <a
            href={user.socialLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-[#1DA1F2] transition-colors"
          >
            <Twitter size={20} />
          </a>
        )}
        {user.socialLinks.linkedin && (
          <a
            href={user.socialLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-[#0A66C2] transition-colors"
          >
            <Linkedin size={20} />
          </a>
        )}
        {user.socialLinks.github && (
          <a
            href={user.socialLinks.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <Github size={20} />
          </a>
        )}
        {user.socialLinks.website && (
          <a
            href={user.socialLinks.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-accent transition-colors"
          >
            <Globe size={20} />
          </a>
        )}
      </div>
    );
  };

  return (
    <Container className="pt-32 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Main Profile Card */}
        <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
          {/* Ambient Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            <div className="shrink-0">
              <div className="h-28 w-28 rounded-full bg-zinc-800 border-4 border-[#121212] flex items-center justify-center text-4xl font-bold text-white overflow-hidden shadow-xl">
                {user.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user.name?.charAt(0)}</span>
                )}
              </div>
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    {user.name}
                    {user.roles?.includes("SUPER_ADMIN") && (
                      <Crown className="w-6 h-6 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.6)]" />
                    )}
                    {user.roles?.includes("ADMIN") && !user.roles?.includes("SUPER_ADMIN") && (
                      <UserCog className="w-6 h-6 text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.6)]" />
                    )}
                    {user.roles?.includes("WRITER") && !user.roles?.some((r: string) => ["SUPER_ADMIN", "ADMIN"].includes(r)) && (
                      <PenTool className="w-6 h-6 text-accent drop-shadow-[0_0_5px_rgba(var(--color-accent),0.6)]" />
                    )}
                    {user.isPremium && (
                      <Star className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.6)]" />
                    )}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    {user.occupation && (
                      <span className="text-sm text-accent font-medium bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                        {user.occupation}
                      </span>
                    )}
                  </div>
                </div>

                {isMyProfile ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full md:w-auto cursor-pointer"
                    onClick={() => {
                      router.push("/profile");
                    }}
                  >
                    View Dashboard
                  </Button>
                ) : (
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full md:w-auto"
                      onClick={() =>
                        showToast("Follow feature coming soon", "info")
                      }
                    >
                      Follow
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-zinc-300 leading-relaxed mb-6">
                {user.bio || "No bio"}
              </p>

              <div className="flex flex-wrap gap-6 text-sm text-zinc-500">
                {user.createdAt && (
                  <div className="flex items-center gap-2" title="Joined Date">
                    <Calendar size={16} />
                    <span>Joined {new Date(user.createdAt).getFullYear()}</span>
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center gap-2" title="Location">
                    <MapPin size={16} />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.university && (
                  <div className="flex items-center gap-2" title="University/Institution">
                    <Building size={16} />
                    <span>{user.university}</span>
                  </div>
                )}
                {user.degree && (
                  <div className="flex items-center gap-2" title="Degree/Program">
                    <GraduationCap size={16} />
                    <span>{user.degree}</span>
                  </div>
                )}
                {user.semester && (
                  <div className="flex items-center gap-2" title="Current Semester">
                    <BookOpen size={16} />
                    <span>{user.semester}</span>
                  </div>
                )}
                {user.year && (
                  <div className="flex items-center gap-2" title="Graduation Year">
                    <Clock size={16} />
                    <span>Class of {user.year}</span>
                  </div>
                )}
              </div>

              <SocialLinks />
            </div>
          </div>
        </div>

        {/* Published Articles (For Writers/Admins) */}
        {user.roles?.some((r: string) => ["SUPER_ADMIN", "ADMIN", "WRITER"].includes(r)) && user.posts && user.posts.length > 0 && (
          <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <PenTool className="text-accent" />
              Published Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.posts.map((p: any) => (
                <BlogCard
                  key={p._id}
                  post={{
                    slug: p.slug,
                    title: p.title,
                    excerpt: p.excerpt,
                    date: new Date(p.createdAt).toLocaleDateString(),
                    createdAt: new Date(p.createdAt).toISOString(),
                    category: p.category || "Article",
                    imageUrl: p.image,
                    likes: p.likes || 0,
                    views: p.views || 0,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Collaborative Research */}
        {user.collaborations && user.collaborations.length > 0 && (
        <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="text-accent" />
              Collaborative Works
            </h2>
            <a href="/research/collaborations" className="text-sm font-medium text-accent hover:underline flex items-center gap-1">
              View All <ChevronRight size={14} />
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {user.collaborations.map((collab: any) => (
               <a key={collab._id} href={`/research/collaborations/${collab.slug}`} className="group flex gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-accent/30 transition-all">
                  <div className={`w-24 h-32 shrink-0 bg-black rounded-lg overflow-hidden relative flex flex-col items-center justify-center ${!collab.image ? 'border border-white/10' : ''}`}>
                     {collab.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={collab.image} alt={collab.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                     ) : (
                        <AlignLeft size={24} className="text-zinc-600 opacity-50 mb-2" />
                     )}
                     <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md rounded px-1.5 py-0.5 text-[10px] font-bold text-white border border-white/10 flex items-center gap-1">
                       {collab.type === 'Poster' ? <FileText size={10} className="text-blue-400" /> : <AlignLeft size={10} className="text-amber-400" />} {collab.type}
                     </div>
                  </div>
                  <div className="flex flex-col justify-center space-y-1">
                     <p className="text-[10px] font-bold text-accent tracking-widest uppercase">{collab.event}</p>
                     <h3 className="text-sm font-bold text-zinc-100 leading-snug group-hover:text-white transition-colors line-clamp-2">
                       {collab.title}
                     </h3>
                     <p className="text-xs text-zinc-400">Mentored by {collab.mentor}</p>
                  </div>
               </a>
             ))}
          </div>
        </div>
        )}

        {/* Public Activity Feed (Visible only for Writers/Admins) */}
        {user.roles?.some((r: string) => ["SUPER_ADMIN", "ADMIN", "WRITER"].includes(r)) && (
          <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <MessageSquare className="text-accent" />
              Public Activity
            </h2>

            {interactionsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-zinc-500" />
              </div>
            ) : publicComments.length > 0 ? (
              <div className="space-y-4">
                {publicComments.map((c) => (
                  <div
                    key={c._id}
                    className="p-4 border border-white/5 rounded-xl bg-white/5"
                  >
                    <p className="text-zinc-300 text-sm mb-3">"{c.content}"</p>
                    <div className="text-xs text-zinc-500 flex gap-2">
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      <span className="text-zinc-600">•</span>
                      {c.post ? (
                        <a
                          href={`/blog/${c.post.slug}`}
                          className="text-accent hover:underline"
                        >
                          Commented on: {c.post.title}
                        </a>
                      ) : (
                        <span>Commented on a deleted resource</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500 border border-dashed border-white/10 rounded-xl">
                No public activity to show.
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  );
}
