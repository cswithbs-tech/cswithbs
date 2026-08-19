"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "../../components/ui/Button";
import { Container } from "../../components/ui/Container";
import GlobalLoading from "@/app/loading";
import { useToast } from "@/app/context/ToastContext";
import { BookOpen, Settings, LogOut, CheckCircle2, Crown, PenTool, Star, Camera, Info, UserCog, Edit3, BarChart } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"dashboard" | "settings" | "writer">("dashboard");

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    qualification: "",
    occupation: "",
    location: "",
    image: "",
    socialLinks: {
      twitter: "",
      linkedin: "",
      github: "",
      website: "",
    },
  });
  const [initialData, setInitialData] = useState({ ...formData });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [deleteReason, setDeleteReason] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [hasPassword, setHasPassword] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (session?.user) {
      const init = {
        name: session.user.name || "",
        bio: (session.user as any).bio || "",
        qualification: "",
        occupation: "",
        location: "",
        image: session.user.image || "",
        socialLinks: {
          twitter: "",
          linkedin: "",
          github: "",
          website: "",
        },
      };

      fetch("/api/user/profile/me")
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data) => {
          if (data) {
            setHasPassword(data.hasPassword !== false);
            const fetchedInit = {
              name: data.name || "",
              bio: data.bio || "",
              qualification: data.qualification || "",
              occupation: data.occupation || "",
              location: data.location || "",
              image: data.image || "",
              socialLinks: {
                twitter: data.socialLinks?.twitter || "",
                linkedin: data.socialLinks?.linkedin || "",
                github: data.socialLinks?.github || "",
                website: data.socialLinks?.website || "",
              },
            };
            setFormData(fetchedInit);
            setInitialData(fetchedInit);
          } else {
            setFormData(init);
            setInitialData(init);
          }
          setLoading(false);
        })
        .catch(() => {
          setFormData(init);
          setInitialData(init);
          setLoading(false);
        });
    }
  }, [session, status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      socialLinks: {
        ...formData.socialLinks,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData) || selectedImage !== null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setSelectedImage(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;

    setLoading(true);
    try {
      let imageUrl = formData.image;

      if (selectedImage) {
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", selectedImage);
        uploadData.append("folder", "avatars");
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        const uploadJson = await uploadRes.json();

        if (uploadJson.url) {
          imageUrl = uploadJson.url;
        } else {
          throw new Error("Image upload failed");
        }
      }

      const updatedData = { ...formData, image: imageUrl };

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        showToast("Profile updated successfully", "success");
        setFormData(updatedData);
        setInitialData(updatedData);
        setSelectedImage(null);
        setImagePreview(null);
        await update({ image: imageUrl, name: updatedData.name });
        router.refresh();
      } else {
        showToast("Failed to update profile", "error");
      }
    } catch (error) {
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (hasPassword && !passwordData.currentPassword) {
      showToast("Please enter your current password", "error");
      return;
    }
    if (!passwordData.newPassword) {
      showToast("Please enter a new password", "error");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    setPassLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: hasPassword ? passwordData.currentPassword : undefined,
          newPassword: passwordData.newPassword,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        showToast("Password updated successfully", "success");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setHasPassword(true);
      } else {
        showToast(json.error || "Failed to update password", "error");
      }
    } catch (err) {
      showToast("Something went wrong", "error");
    } finally {
      setPassLoading(false);
    }
  };

  const confirmDeactivate = async () => {
    if (deleteReason.trim().length < 10) {
      showToast("Please provide a valid reason (at least 10 characters) before leaving.", "error");
      return;
    }
    
    // In a real app, you might send the reason to a feedback endpoint here

    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (res.ok) {
        showToast("Account deleted. Goodbye.", "success");
        signOut({ callbackUrl: "/" });
      } else {
        showToast("Failed to delete account", "error");
      }
    } catch (err) {
      showToast("Something went wrong", "error");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (status === "loading" || (loading && !initialData.name)) return <GlobalLoading />;
  if (!session) return null;

  return (
    <Container className="pt-32 pb-20 min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Menu */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
           <div className="bg-[#0D0D0D] border border-white/5 rounded-xl p-6 mb-4 text-center">
             <div className="relative inline-block mb-4 group cursor-pointer">
                  <div className="h-24 w-24 rounded-full bg-zinc-800 border-4 border-[#0D0D0D] flex items-center justify-center text-3xl font-bold text-white overflow-hidden shadow-xl mx-auto transition-transform hover:scale-105 duration-300">
                    {imagePreview || formData.image || session?.user?.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imagePreview || formData.image || session?.user?.image || ""}
                        alt={session?.user?.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{session?.user?.name?.charAt(0)}</span>
                    )}
                  </div>
                  {activeTab === 'settings' && (
                      <>
                        <label className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 cursor-pointer z-10">
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                          <span className="text-[10px] text-white font-bold">Change</span>
                        </label>
                        <div className="absolute bottom-0 right-0 p-2 bg-accent rounded-full border-2 border-[#0D0D0D] shadow-lg pointer-events-none z-20">
                          <Camera size={14} className="text-white" />
                        </div>
                      </>
                  )}
             </div>
             <h2 className="text-xl font-bold text-white mb-1 flex items-center justify-center gap-2 truncate">
               {session.user?.name}
               {(session.user as any).roles?.includes("SUPER_ADMIN") && (
                 <Crown className="w-5 h-5 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.6)]" />
               )}
               {(session.user as any).roles?.includes("ADMIN") && !(session.user as any).roles?.includes("SUPER_ADMIN") && (
                 <UserCog className="w-5 h-5 text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.6)]" />
               )}
               {(session.user as any).roles?.includes("WRITER") && !(session.user as any).roles?.some((r: string) => ["SUPER_ADMIN", "ADMIN"].includes(r)) && (
                 <PenTool className="w-5 h-5 text-accent drop-shadow-[0_0_5px_rgba(var(--color-accent),0.6)]" />
               )}
               {(session.user as any).isPremium && (
                 <Star className="w-5 h-5 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.6)]" />
               )}
             </h2>
           </div>

           <button 
             onClick={() => setActiveTab('dashboard')} 
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-accent/10 text-accent border border-accent/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
           >
             <BookOpen className="w-4 h-4" />
             Learning Hub
           </button>
           <button 
             onClick={() => setActiveTab('settings')} 
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-accent/10 text-accent border border-accent/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
           >
             <Settings className="w-4 h-4" />
             Account Settings
           </button>

           {(session.user as any).roles?.some((r: string) => ["SUPER_ADMIN", "ADMIN", "WRITER"].includes(r)) && (
             <button 
               onClick={() => setActiveTab('writer')} 
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'writer' ? 'bg-accent/10 text-accent border border-accent/20' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
             >
               <Edit3 className="w-4 h-4" />
               Writing Hub
             </button>
           )}

           <div className="pt-4 mt-4 border-t border-white/5">
             <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
             >
               <LogOut className="w-4 h-4" />
               Sign Out
             </button>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-[#0D0D0D] border border-white/5 rounded-xl p-8">
            
            {activeTab === 'dashboard' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">My Learning Hub</h2>
                        <p className="text-zinc-400 text-sm">Welcome back! Here is an overview of your active courses and saved materials.</p>
                    </div>

                    {/* Placeholder for Courses/PRO status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-white/5 bg-white/5 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-accent/20 text-accent rounded-lg">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-white">Enrolled Courses</h3>
                            </div>
                            <p className="text-zinc-500 text-sm mb-4">You are not currently enrolled in any courses.</p>
                            <Button variant="outline" onClick={() => router.push("/courses")} className="w-full text-xs">Browse Courses</Button>
                        </div>
                        <div className="border border-white/5 bg-white/5 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-500/20 text-green-500 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-white">CSwithBS PRO</h3>
                            </div>
                            <p className="text-zinc-500 text-sm mb-4">You are currently on the Free Tier.</p>
                            <Button variant="primary" onClick={() => showToast("CSwithBS PRO is coming soon!", "info")} className="w-full text-xs">Upgrade to PRO</Button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'writer' && (session.user as any).roles?.some((r: string) => ["SUPER_ADMIN", "ADMIN", "WRITER"].includes(r)) && (
                <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Writing Hub</h2>
                            <p className="text-zinc-400 text-sm">Overview of your articles, views, and engagement.</p>
                        </div>
                        <Button variant="primary" onClick={() => router.push("/writers-hub/write")} className="shrink-0 flex items-center gap-2">
                            <PenTool size={16} /> Write New Post
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-white/5 bg-white/5 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/20 text-blue-500 rounded-lg">
                                    <BarChart className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-white">Total Views</h3>
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">0</p>
                            <p className="text-zinc-500 text-xs">Across all published posts</p>
                        </div>
                        <div className="border border-white/5 bg-white/5 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-pink-500/20 text-pink-500 rounded-lg">
                                    <Star className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-white">Total Likes</h3>
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">0</p>
                            <p className="text-zinc-500 text-xs">Across all published posts</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">My Drafts & Posts</h3>
                            <Button variant="outline" size="sm" onClick={() => router.push("/writers-hub/posts")}>
                                Go to Writer Panel
                            </Button>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center text-zinc-500">
                            View and manage all your posts, drafts, and analytics in the Writer Panel.
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="space-y-10 animate-in fade-in duration-300">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Account Settings</h2>
                        <p className="text-zinc-400 text-sm">Manage your personal information and security preferences.</p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-400">Full Name</label>
                                <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent/50 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-400">Email Address</label>
                                <input type="email" defaultValue={session.user?.email || ""} readOnly className="w-full bg-[#1A1A1A]/50 border border-white/5 rounded-lg px-4 py-3 text-zinc-600 cursor-not-allowed focus:outline-none text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-400">Location</label>
                                <input name="location" type="text" value={formData.location} onChange={handleChange} placeholder="e.g. New York, USA" className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent/50 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-zinc-400">Occupation / Student Status</label>
                                <input name="occupation" type="text" value={formData.occupation} onChange={handleChange} placeholder="e.g. Computer Science Student" className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent/50 text-sm" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-400">About Me / Bio</label>
                            <textarea name="bio" rows={4} value={formData.bio} onChange={handleChange} placeholder="Tell the community about your learning journey..." className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent/50 text-sm"></textarea>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <h4 className="text-sm font-bold text-white mb-4">Social Links</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {['github', 'linkedin', 'twitter', 'website'].map((platform) => (
                                    <div key={platform} className="space-y-1">
                                        <label className="text-xs font-medium text-zinc-400 capitalize">{platform}</label>
                                        <input name={platform} type="text" value={(formData.socialLinks as any)[platform]} onChange={handleSocialChange} placeholder={`${platform} URL`} className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent/50 text-sm" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button variant="primary" type="submit" isLoading={loading} disabled={!isDirty || loading}>
                                Save Changes
                            </Button>
                        </div>
                    </form>

                    {/* Security Section */}
                    <div className="pt-8 border-t border-white/5">
                        <h3 className="text-lg font-bold text-white mb-6">Security & Password</h3>
                        <div className="space-y-4 max-w-md">
                            {!hasPassword ? (
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm text-zinc-400 flex gap-4 items-start">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0">
                                        <Info size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white mb-1">Social Login</p>
                                        <p className="text-xs leading-relaxed">You signed in using a social account (e.g. Google). Password changes are disabled for social accounts because you manage your security directly through your social provider.</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-zinc-400">Current Password</label>
                                        <input name="currentPassword" type="password" value={passwordData.currentPassword} onChange={handlePassChange} placeholder="••••••••" className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent/50 text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-zinc-400">New Password</label>
                                        <input name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePassChange} placeholder="New password" className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent/50 text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-zinc-400">Confirm Password</label>
                                        <input name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePassChange} placeholder="Confirm password" className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent/50 text-sm" />
                                    </div>
                                    <Button variant="outline" onClick={handlePasswordUpdate} isLoading={passLoading} className="w-full mt-2">
                                        Update Password
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-8 border-t border-white/5">
                        <h3 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h3>
                        <p className="text-sm text-zinc-400 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                        
                        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6 space-y-4">
                            {!showDeleteConfirm ? (
                                <button onClick={() => setShowDeleteConfirm(true)} className="text-sm text-red-500 font-medium hover:underline">
                                    I want to delete my account
                                </button>
                            ) : (
                                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-white">We're sorry to see you go.</label>
                                        <p className="text-xs text-zinc-400">Please let us know why you are leaving so we can improve CSwithBS. (Required)</p>
                                        <textarea 
                                            value={deleteReason}
                                            onChange={(e) => setDeleteReason(e.target.value)}
                                            placeholder="Your feedback is incredibly valuable to us..."
                                            rows={3}
                                            className="w-full bg-[#1A1A1A] border border-red-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button 
                                            onClick={confirmDeactivate} 
                                            disabled={deleteReason.trim().length < 10}
                                            className="bg-red-600 hover:bg-red-700 text-white border-0"
                                        >
                                            Permanently Delete Account
                                        </Button>
                                        <button onClick={() => { setShowDeleteConfirm(false); setDeleteReason(''); }} className="text-sm text-zinc-400 hover:text-white">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </Container>
  );
}
