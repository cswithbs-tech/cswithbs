"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import {
  AlertTriangle,
  Power,
  Hammer,
  Zap,
  RefreshCw,
  Facebook,
  Github,
  Linkedin,
  Mail,
  Clock,
  User,
  Activity,
  X,
} from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";
import GlobalLoading from "@/app/loading";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";

// Custom Toggle Component
const Toggle = ({ active, onChange, disabled }: { active: boolean, onChange: (v: boolean) => void, disabled: boolean }) => (
  <button
    onClick={() => onChange(!active)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black ${
      active ? "bg-accent" : "bg-zinc-700"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md ${
        active ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [settingsMetadata, setSettingsMetadata] = useState<any>({});

  // Unified State Management
  const [originalState, setOriginalState] = useState<Record<string, any>>({});
  const [formState, setFormState] = useState<Record<string, any>>({});

  const isSuperAdmin = (session?.user as any)?.roles?.includes('SUPER_ADMIN');

  useEffect(() => {
    if (status === "loading") return;

    const roles: string[] = (session?.user as any)?.roles || [];
    const hasAccess = roles.some((r) =>
      ["admin", "super_admin", "ADMIN", "SUPER_ADMIN"].includes(r)
    );
    if (!hasAccess) {
      router.replace("/admin/dashboard");
      return;
    }

    fetchSettings();
  }, [session, status, router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettingsMetadata(data);

        const loadedState = {
          maintenance_mode: !!data.maintenance_mode?.value,
          announcement_active: !!data.announcement_active?.value,
          announcement_message: data.announcement_message?.value || "",
          comments_enabled: data.comments_enabled?.value !== undefined ? data.comments_enabled.value : true,
          auto_close_days: data.auto_close_days?.value || "0",
          registration_enabled: !!data.registration_enabled?.value,
          public_indexing: data.public_indexing?.value !== undefined ? data.public_indexing.value : true,
          ga_measurement_id: data.ga_measurement_id?.value || "",
          site_title: data.site_title?.value || "CSwithBS",
          site_tagline: data.site_tagline?.value || "",
          social_twitter: data.social_twitter?.value || "",
          social_github: data.social_github?.value || "",
          social_linkedin: data.social_linkedin?.value || "",
          social_instagram: data.social_instagram?.value || "",
          admin_email: data.admin_email?.value || "",
          posts_per_page: data.posts_per_page?.value || "10",
          home_quote_text: data.home_quote_text?.value || "",
          home_quote_author: data.home_quote_author?.value || "",
          home_quote_link: data.home_quote_link?.value || "",
          general_notification_active: !!data.general_notification_active?.value,
          general_notification: data.general_notification?.value || "",
          general_notification_type: data.general_notification_type?.value || "info",
        };

        setOriginalState(loadedState);
        setFormState(loadedState);
      }
    } catch (error) {
      console.error("Failed to load settings", error);
    } finally {
      setLoading(false);
    }
  };

  // Change Detection
  const hasChanges = useMemo(() => {
    return Object.keys(formState).some((key) => formState[key] !== originalState[key]);
  }, [formState, originalState]);

  const handleChange = (key: string, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const discardChanges = () => {
    setFormState(originalState);
  };

  const saveAllChanges = async () => {
    setUpdating(true);
    try {
      const changedKeys = Object.keys(formState).filter(
        (key) => formState[key] !== originalState[key]
      );

      let keysToUpdate = [...changedKeys];
      
      // If general notification was activated, we also update its ID to trigger it for users
      if (
        changedKeys.includes("general_notification_active") && 
        formState.general_notification_active === true
      ) {
         await fetch("/api/admin/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: "general_notification_id", value: Date.now().toString() }),
         });
      }

      // Batch requests
      const promises = keysToUpdate.map(key => 
        fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value: formState[key] }),
        }).then(res => {
           if (!res.ok) throw new Error(`Failed to update ${key}`);
           return res.json();
        }).then(updatedSetting => {
           setSettingsMetadata((prev: any) => ({
             ...prev,
             [key]: {
               value: updatedSetting.value,
               updatedBy: updatedSetting.updatedBy,
               updatedAt: updatedSetting.updatedAt,
             }
           }));
        })
      );

      await Promise.all(promises);
      
      setOriginalState(formState);
      showToast("Settings updated successfully", "success");
    } catch (error) {
      showToast("Failed to save some settings", "error");
    } finally {
      setUpdating(false);
      router.refresh();
    }
  };

  const AuditTrail = ({ keys }: { keys: string[] }) => {
    const relevantSettings = keys
      .map((k) => settingsMetadata[k])
      .filter((s) => s && s.updatedAt)
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

    if (relevantSettings.length === 0) return null;

    const latest = relevantSettings[0];
    const date = new Date(latest.updatedAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center gap-4 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-zinc-600" />
          <span>Last updated {date}</span>
        </div>
        {latest.updatedBy && (
          <div className="flex items-center gap-1.5 ml-auto">
            <User size={12} className="text-zinc-600" />
            <span>By {latest.updatedBy}</span>
          </div>
        )}
      </div>
    );
  };

  const handlePurgeCache = () => setShowPurgeConfirm(true);

  const confirmPurgeCache = async () => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/system/revalidate", { method: "POST" });
      if (res.ok) {
        showToast("Global cache purged successfully", "success");
      } else {
        showToast("Failed to purge cache", "error");
      }
    } catch (error) {
      showToast("Something went wrong", "error");
    } finally {
      setUpdating(false);
      setShowPurgeConfirm(false);
      router.refresh();
    }
  };

  if (loading) return <GlobalLoading />;

  return (
    <div className="p-6 w-full space-y-8 animate-fade-in font-sans min-h-screen max-w-4xl mx-auto pb-32">
      <div className="flex flex-col gap-2 border-b border-zinc-800 pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="bg-gradient-to-r from-accent to-accent bg-clip-text text-transparent">
            System Settings
          </span>
        </h1>
        <p className="text-zinc-400 text-sm">
          Manage global application configuration. Changes are saved automatically when submitted.
        </p>
      </div>

      <div className="grid gap-6">
        {/* --- 0. Branding & Contact --- */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-accent">🏷️</span> Branding & Identity
            </h3>
            <p className="text-zinc-400 text-sm">Global branding and administrative contact information.</p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Site Name</label>
                <input
                  type="text"
                  value={formState.site_title || ""}
                  onChange={(e) => handleChange("site_title", e.target.value)}
                  placeholder="e.g. CSwithBS"
                  className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Site Tagline</label>
                <input
                  type="text"
                  value={formState.site_tagline || ""}
                  onChange={(e) => handleChange("site_tagline", e.target.value)}
                  placeholder="e.g. Science, Tech & Future Insights"
                  className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-800/50">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Admin Contact Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    value={formState.admin_email || ""}
                    onChange={(e) => handleChange("admin_email", e.target.value)}
                    placeholder="admin@cswithbs.com"
                    className="w-full bg-black/50 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Articles Per Page</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={formState.posts_per_page || ""}
                  onChange={(e) => handleChange("posts_per_page", e.target.value)}
                  placeholder="10"
                  className="w-full bg-black/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-mono"
                />
              </div>
            </div>
          </div>
          <AuditTrail keys={["site_title", "site_tagline", "admin_email", "posts_per_page"]} />
        </div>

        {/* --- 1. Social Presence --- */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-amber-500">🌐</span> Social Presence
            </h3>
            <p className="text-zinc-400 text-sm">Connect your brand to social media platforms.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
            {/* Facebook */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                <Facebook size={12} /> Facebook
              </label>
              <input
                type="text"
                value={formState.social_facebook || ""}
                onChange={(e) => handleChange("social_facebook", e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
              />
            </div>

            {/* GitHub */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                <Github size={12} /> GitHub
              </label>
              <input
                type="text"
                value={formState.social_github || ""}
                onChange={(e) => handleChange("social_github", e.target.value)}
                placeholder="https://github.com/..."
                className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                <Linkedin size={12} /> LinkedIn
              </label>
              <input
                type="text"
                value={formState.social_linkedin || ""}
                onChange={(e) => handleChange("social_linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
              />
            </div>

          </div>
          <AuditTrail keys={["social_facebook", "social_github", "social_linkedin"]} />
        </div>

        {/* --- 2. Real-time Notification Banner --- */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          
          <div className="flex items-start justify-between mb-6 relative">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg"><Zap size={16} /></span>
                Live Push Notification
              </h3>
              <p className="text-zinc-400 text-sm max-w-lg">
                Instantly push a floating alert to all active users without them needing to refresh the page.
              </p>
            </div>
            <Toggle 
              active={formState.general_notification_active} 
              onChange={(v) => handleChange("general_notification_active", v)} 
              disabled={updating}
            />
          </div>

          <div className="space-y-6 relative">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Alert Type</label>
              <div className="flex flex-wrap gap-2">
                {(["info", "warning", "success", "error"] as const).map((type) => {
                   const colors = {
                     info: "hover:border-blue-500 hover:text-blue-400",
                     warning: "hover:border-amber-500 hover:text-amber-400",
                     success: "hover:border-emerald-500 hover:text-emerald-400",
                     error: "hover:border-rose-500 hover:text-rose-400",
                   };
                   const activeColors = {
                     info: "bg-blue-500/10 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]",
                     warning: "bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
                     success: "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
                     error: "bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.2)]",
                   };
                   
                   const isActive = formState.general_notification_type === type;

                   return (
                    <button
                      key={type}
                      onClick={() => handleChange("general_notification_type", type)}
                      className={`px-4 py-2 text-xs font-bold uppercase rounded-lg border transition-all duration-300 ${
                        isActive 
                          ? activeColors[type]
                          : `bg-zinc-900/50 text-zinc-500 border-zinc-700/50 ${colors[type]}`
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Message Content</label>
              <input
                type="text"
                value={formState.general_notification || ""}
                onChange={(e) => handleChange("general_notification", e.target.value)}
                placeholder="e.g. 🚀 New Feature Released: Check out the dashboard!"
                className="w-full bg-black/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>
            
            {/* Live Preview Pill */}
            {formState.general_notification_active && (
              <div className="pt-4 border-t border-zinc-800/50">
                 <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Live Preview</label>
                 <div className="flex justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-black/20 rounded-xl border border-zinc-800/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
                    <div className={`relative px-4 py-2 rounded-full border shadow-2xl flex items-center gap-3 max-w-sm w-full backdrop-blur-md ${
                       formState.general_notification_type === 'info' ? 'bg-blue-500/10 border-blue-500/30 text-blue-50' :
                       formState.general_notification_type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-50' :
                       formState.general_notification_type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-50' :
                       'bg-rose-500/10 border-rose-500/30 text-rose-50'
                    }`}>
                       <div className={`w-2 h-2 rounded-full animate-pulse ${
                         formState.general_notification_type === 'info' ? 'bg-blue-400' :
                         formState.general_notification_type === 'warning' ? 'bg-amber-400' :
                         formState.general_notification_type === 'success' ? 'bg-emerald-400' :
                         'bg-rose-400'
                       }`} />
                       <span className="text-sm font-medium truncate flex-1">{formState.general_notification || "(No message set)"}</span>
                       <X size={14} className="text-white/50 cursor-pointer" />
                    </div>
                 </div>
              </div>
            )}
          </div>
          <AuditTrail keys={["general_notification_active", "general_notification", "general_notification_type"]} />
        </div>



        {/* --- 3. Global Announcement (Static) --- */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          
          <div className="flex items-start justify-between mb-6 relative">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg"><Activity size={16} /></span>
                Static Announcement Bar
              </h3>
              <p className="text-zinc-400 text-sm max-w-lg">
                Display a persistent edge-to-edge banner across all pages. Best for downtime notices or major events.
              </p>
            </div>
            <Toggle 
              active={formState.announcement_active} 
              onChange={(v) => handleChange("announcement_active", v)} 
              disabled={updating}
            />
          </div>

          <div className="space-y-6 relative">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Banner Message</label>
              <input
                type="text"
                value={formState.announcement_message || ""}
                onChange={(e) => handleChange("announcement_message", e.target.value)}
                placeholder="e.g. 🛠️ Scheduled maintenance on Friday at 10 PM EST."
                className="w-full bg-black/50 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              />
            </div>
            
            {/* Live Preview Edge-to-edge */}
            {formState.announcement_active && (
              <div className="pt-4 border-t border-zinc-800/50">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Live Preview</label>
                <div className="w-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 rounded-lg py-2 px-4 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] animate-[shimmer_3s_infinite]" />
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs uppercase tracking-widest font-bold text-zinc-300">
                      {formState.announcement_message || "(No message set)"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <AuditTrail keys={["announcement_active", "announcement_message"]} />
        </div>

        {/* --- 4. Community Controls --- */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-accent">👥</span> Community Controls
            </h3>
            <p className="text-zinc-400 text-sm">Manage how users interact with your content.</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-zinc-200 uppercase tracking-wide">Global Comments</label>
                <p className="text-xs text-zinc-500">Enable or disable comments across the entire site.</p>
              </div>
              <Toggle 
                active={formState.comments_enabled} 
                onChange={(v) => handleChange("comments_enabled", v)} 
                disabled={updating}
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-zinc-200 uppercase tracking-wide">Auto-Close Comments</label>
                <p className="text-xs text-zinc-500">Close comments on posts older than X days. Set to 0 to keep forever.</p>
              </div>
              <input
                type="number"
                value={formState.auto_close_days || ""}
                onChange={(e) => handleChange("auto_close_days", e.target.value)}
                className="w-20 bg-black/50 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-mono"
              />
            </div>

            {isSuperAdmin && (
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium text-zinc-200 uppercase tracking-wide">User Registration</label>
                  <p className="text-xs text-zinc-500">Allow new users to create accounts on the platform.</p>
                </div>
                <button
                  onClick={() => handleChange("registration_enabled", !formState.registration_enabled)}
                  disabled={updating}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black ${
                    formState.registration_enabled ? "bg-amber-500" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formState.registration_enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
          <AuditTrail keys={["comments_enabled", "auto_close_days", "registration_enabled"]} />
        </div>

        {/* --- 5. Technical & SEO --- */}
        {isSuperAdmin && (
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-accent">🚀</span> Search & Analytics
              </h3>
              <p className="text-zinc-400 text-sm">Control search engine visibility and tracking IDs.</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium text-zinc-200 uppercase tracking-wide">Search Engine Visibility</label>
                  <p className="text-xs text-zinc-500">Discourage search engines from indexing this site.</p>
                </div>
                <Toggle 
                  active={formState.public_indexing} 
                  onChange={(v) => handleChange("public_indexing", v)} 
                  disabled={updating}
                />
              </div>

              <div className="space-y-1.5 pt-4 border-t border-zinc-800/50">
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">Google Analytics ID</label>
                <input
                  type="text"
                  value={formState.ga_measurement_id || ""}
                  onChange={(e) => handleChange("ga_measurement_id", e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full bg-black/50 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-mono"
                />
              </div>
            </div>
            <AuditTrail keys={["public_indexing", "ga_measurement_id"]} />
          </div>
        )}

        {/* --- 6. Infrastructure --- */}
        {isSuperAdmin && (
          <div className="p-6 rounded-2xl border border-red-900/30 bg-red-900/5">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="text-red-500">⚙️</span> Infrastructure
              </h3>
              <p className="text-zinc-400 text-sm">Critical system operations and cache management.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-3">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-accent/10 rounded-lg text-accent"><Zap size={20} /></div>
                  <div>
                    <h4 className="font-bold text-sm">Site-wide Revalidation</h4>
                    <p className="text-xs text-zinc-500">Purge all cached pages.</p>
                  </div>
                </div>
                <button
                  onClick={handlePurgeCache}
                  disabled={updating}
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} className={updating ? "animate-spin" : ""} />
                  Purge Cache
                </button>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-3">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><Power size={20} /></div>
                  <div>
                    <h4 className="font-bold text-sm">Maintenance Mode</h4>
                    <p className="text-xs text-zinc-500">Take the site offline.</p>
                  </div>
                </div>
                <button
                  onClick={() => handleChange("maintenance_mode", !formState.maintenance_mode)}
                  disabled={updating}
                  className={`w-full py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    formState.maintenance_mode
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  }`}
                >
                  <Hammer size={14} />
                  {formState.maintenance_mode ? "Disable Maintenance" : "Enable Maintenance"}
                </button>
              </div>
            </div>
            <AuditTrail keys={["maintenance_mode", "last_cache_purge"]} />
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <div 
        className={`fixed bottom-0 left-0 right-0 p-4 border-t border-zinc-800 bg-black/80 backdrop-blur-md z-50 transform transition-transform duration-300 ${
          hasChanges ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm font-medium text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            You have unsaved changes
          </div>
          <div className="flex gap-3">
            <button
              onClick={discardChanges}
              disabled={updating}
              className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Discard
            </button>
            <button
              onClick={saveAllChanges}
              disabled={updating}
              className="px-4 py-2 text-sm font-medium text-black bg-accent hover:bg-accent-hover rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {updating ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showPurgeConfirm}
        onClose={() => setShowPurgeConfirm(false)}
        onConfirm={confirmPurgeCache}
        title="Purge Global Cache?"
        description="This will clear the entire server cache (ISR). The next visitor to any page will trigger a regeneration. This might temporarily increase server load."
        confirmText="Yes, Purge Everything"
        variant="warning"
      />
    </div>
  );
}
