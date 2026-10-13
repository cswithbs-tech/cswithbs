"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/app/components/ui/Button";
import { Editor } from "@/app/components/editor/Editor";
import { useToast } from "@/app/context/ToastContext";
import {
  Loader2,
  Plus,
  Send,
  Save,
  ArrowLeft,
  Trash2,
  Eye,
  Mail,
  Smartphone,
  Monitor,
  X,
  Users,
  Sparkles,
  Search,
  UserCheck,
  Radio,
  Check,
  Clock,
  CheckCircle2,
  Zap,
  RefreshCw,
  ShieldCheck,
  Code,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import {
  EMAIL_PRESET_TEMPLATES,
  EmailPresetTemplate,
} from "@/lib/emailPresets";

type Newsletter = {
  _id: string;
  subject: string;
  content: string; // HTML
  status: "draft" | "sent" | "partially_sent" | "scheduled";
  sentAt?: string;
  recipientCount?: number;
  sentRecipients?: string[];
  stats?: { opens: number; clicks: number };
  createdAt: string;
};

export default function NewsletterPage() {
  const { data: session } = useSession();
  const [view, setView] = useState<"list" | "compose">("list");
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [activeSubscriberCount, setActiveSubscriberCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Composer State
  const [draftId, setDraftId] = useState<string | null>(null);
  const [currentNewsletter, setCurrentNewsletter] = useState<Newsletter | null>(null);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState(""); // This will be HTML from editor
  const [editorMode, setEditorMode] = useState<"visual" | "html">("visual");
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Quota-friendly Dispatch Modal State
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [batchLimitOption, setBatchLimitOption] = useState<"safe" | "all" | "custom">("safe");
  const [customBatchLimit, setCustomBatchLimit] = useState<number>(70);

  // Real-time Resend Quota & Logs State
  const [quotaData, setQuotaData] = useState<{
    dailyLimit: number;
    sentToday: number;
    remainingToday: number;
    percentUsed: number;
    resetTime: string;
    hoursUntilReset: number;
    recentActivity: Array<{
      id: string;
      to: string;
      from: string;
      subject: string;
      createdAt: string;
      status: string;
      isTest: boolean;
    }>;
    adminTeam?: Array<{
      name: string;
      email: string;
      role: string;
    }>;
  } | null>(null);
  const [loadingQuota, setLoadingQuota] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);

  // Audience Target Selection State ("all" vs "individual")
  const [targetType, setTargetType] = useState<"all" | "individual">("all");
  const [subscriberQuery, setSubscriberQuery] = useState("");
  const [selectedIndividualEmail, setSelectedIndividualEmail] = useState("");
  const [subscriberResults, setSubscriberResults] = useState<any[]>([]);
  const [isSearchingSubscribers, setIsSearchingSubscribers] = useState(false);
  const [showSubscriberDropdown, setShowSubscriberDropdown] = useState(false);
  const subscriberDropdownRef = useRef<HTMLDivElement>(null);

  // Template Picker Modal State
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Preview Modal State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Test Email Modal State
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");

  useEffect(() => {
    if (session?.user?.email && !testEmailAddress) {
      setTestEmailAddress(session.user.email);
    }
  }, [session]);

  // Close subscriber autocomplete dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        subscriberDropdownRef.current &&
        !subscriberDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSubscriberDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live subscriber search for individual dispatch
  useEffect(() => {
    if (targetType !== "individual") return;
    const timer = setTimeout(async () => {
      setIsSearchingSubscribers(true);
      try {
        const url = subscriberQuery.trim()
          ? `/api/admin/subscribers?q=${encodeURIComponent(subscriberQuery.trim())}&limit=8`
          : `/api/admin/subscribers?status=active&limit=8`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data.subscribers)
            ? data.subscribers
            : Array.isArray(data)
            ? data
            : [];
          setSubscriberResults(list);
        }
      } catch (err) {
        console.error("Error searching subscribers:", err);
      } finally {
        setIsSearchingSubscribers(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [subscriberQuery, targetType]);

  const handleOpenPreviewModal = async () => {
    setShowPreviewModal(true);
    setLoadingPreview(true);
    try {
      const res = await fetch("/api/admin/newsletter/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content }),
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewHtml(data.html);
      }
    } catch {
      showToast("Failed to generate preview", "error");
    } finally {
      setLoadingPreview(false);
    }
  };

  // Fetch List, Subscriber Stats, and Live Resend Quota
  useEffect(() => {
    fetchNewsletters();
    fetchSubscriberCount();
    fetchQuota();
  }, []);

  const fetchQuota = async () => {
    setLoadingQuota(true);
    try {
      const res = await fetch("/api/admin/newsletter/quota");
      if (res.ok) {
        const data = await res.json();
        setQuotaData(data);
      }
    } catch (e) {
      console.error("Failed to fetch Resend quota:", e);
    } finally {
      setLoadingQuota(false);
    }
  };

  const fetchNewsletters = async () => {
    try {
      const res = await fetch("/api/admin/newsletter");
      if (res.ok) {
        const data = await res.json();
        setNewsletters(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscriberCount = async () => {
    try {
      const res = await fetch("/api/admin/subscribers");
      if (res.ok) {
        const data = await res.json();
        const active =
          typeof data.stats?.active === "number"
            ? data.stats.active
            : Array.isArray(data)
            ? data.filter((s: any) => s.active !== false).length
            : Array.isArray(data.subscribers)
            ? data.subscribers.filter((s: any) => s.active !== false).length
            : 0;
        setActiveSubscriberCount(active);
      }
    } catch (e) {
      console.error("Failed to fetch subscriber count", e);
    }
  };

  const fetchSingleNewsletter = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/newsletter/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentNewsletter(data);
      }
    } catch (e) {
      console.error("Failed to fetch single newsletter:", e);
    }
  };

  const handleEdit = (n: Newsletter) => {
    setDraftId(n._id);
    setCurrentNewsletter(n);
    setSubject(n.subject);
    setContent(n.content);
    setView("compose");
  };

  const handleNew = () => {
    setDraftId(null);
    setCurrentNewsletter(null);
    setSubject("");
    setContent("");
    setView("compose");
  };

  const handleSaveDraft = async (silent = false): Promise<string | null> => {
    if (!subject.trim()) {
      showToast("Subject is required", "error");
      return null;
    }
    setIsSaving(true);
    try {
      const payload = { subject, content };
      let res;
      if (draftId) {
        res = await fetch(`/api/admin/newsletter/${draftId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const saved = await res.json();
        setDraftId(saved._id);
        setCurrentNewsletter(saved);
        if (!silent) {
          showToast("Draft saved successfully", "success");
        }
        fetchNewsletters(); // Refresh list background
        return saved._id;
      } else {
        showToast("Failed to save draft", "error");
        return null;
      }
    } catch (e) {
      showToast("Network error while saving draft", "error");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Template Selection Flow
  const handleApplyTemplate = (tpl: EmailPresetTemplate) => {
    if (content.trim() && content !== "<p></p>") {
      if (
        !window.confirm(
          "Loading this template will replace your current editor content. Continue?"
        )
      ) {
        return;
      }
    }
    setSubject(tpl.defaultSubject);
    setContent(tpl.content);
    setShowTemplateModal(false);
    showToast(`Loaded "${tpl.title}" template!`, "success");
  };

  // Test Email Flow
  const handleOpenTestModal = async () => {
    if (!subject.trim()) {
      showToast("Please enter a subject line first", "error");
      return;
    }
    setShowTestModal(true);
  };

  const executeSendTestEmail = async () => {
    if (!testEmailAddress.trim()) {
      showToast("Enter a test email address", "error");
      return;
    }

    setIsSendingTest(true);
    try {
      // Ensure draft is saved first
      let currentId = draftId;
      if (!currentId) {
        currentId = await handleSaveDraft(true);
        if (!currentId) {
          setIsSendingTest(false);
          return;
        }
      } else {
        await handleSaveDraft(true);
      }

      const res = await fetch(`/api/admin/newsletter/${currentId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail: testEmailAddress.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Test email sent to ${testEmailAddress}!`, "success");
        setShowTestModal(false);
        fetchQuota();
      } else {
        showToast(data.error || "Failed to send test email", "error");
      }
    } catch (e) {
      showToast("Network error while sending test email", "error");
    } finally {
      setIsSendingTest(false);
    }
  };

  const executeSendTestToAdmins = async () => {
    setIsSendingTest(true);
    try {
      let currentId = draftId;
      if (!currentId) {
        currentId = await handleSaveDraft(true);
        if (!currentId) {
          setIsSendingTest(false);
          return;
        }
      } else {
        await handleSaveDraft(true);
      }

      const res = await fetch(`/api/admin/newsletter/${currentId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendToAllAdmins: true }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Test email delivered to all admin team members!", "success");
        setShowTestModal(false);
        fetchQuota();
      } else {
        showToast(data.error || "Failed to send test email to admins", "error");
      }
    } catch {
      showToast("Network error while sending test email to admins", "error");
    } finally {
      setIsSendingTest(false);
    }
  };

  // Individual Subscriber Send Flow
  const handleSendIndividual = async () => {
    const targetEmail = selectedIndividualEmail.trim() || subscriberQuery.trim();
    if (!targetEmail || !targetEmail.includes("@")) {
      showToast("Please search or enter a valid recipient email address", "error");
      return;
    }
    if (!subject.trim()) {
      showToast("Please enter a subject line first", "error");
      return;
    }

    setIsSending(true);
    try {
      let currentId = draftId;
      if (!currentId) {
        currentId = await handleSaveDraft(true);
        if (!currentId) {
          setIsSending(false);
          return;
        }
      } else {
        await handleSaveDraft(true);
      }

      const res = await fetch(`/api/admin/newsletter/${currentId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ individualEmail: targetEmail }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Email sent successfully to ${targetEmail}!`, "success");
        if (currentId) {
          fetchSingleNewsletter(currentId);
        }
        fetchNewsletters();
        fetchQuota();
      } else {
        showToast(data.error || "Failed to send email", "error");
      }
    } catch {
      showToast("Network error while sending to individual", "error");
    } finally {
      setIsSending(false);
    }
  };

  // Live Broadcast Flow (Quota-Friendly Dispatch Modal)
  const handleSend = async () => {
    let currentId = draftId;
    if (!currentId) {
      currentId = await handleSaveDraft(true);
      if (!currentId) return;
    } else {
      await handleSaveDraft(true);
    }
    setShowDispatchModal(true);
  };

  const executeSend = async (batchLimit?: number) => {
    setShowDispatchModal(false);
    setIsSending(true);
    try {
      const payload: any = {};
      if (typeof batchLimit === "number" && batchLimit > 0) {
        payload.batchLimit = batchLimit;
      }

      const res = await fetch(`/api/admin/newsletter/${draftId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(
          data.message || `Newsletter sent successfully!`,
          "success"
        );
        if (data.status === "sent" || data.remainingCount === 0) {
          setView("list");
        } else if (draftId) {
          fetchSingleNewsletter(draftId);
        }
        fetchNewsletters();
        fetchQuota();
      } else {
        showToast(data.error || "Failed to blast newsletter", "error");
        if (draftId) {
          fetchSingleNewsletter(draftId);
        }
        fetchNewsletters();
        fetchQuota();
      }
    } catch (e) {
      showToast("Network error while blasting newsletter", "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const executeDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      const res = await fetch(`/api/admin/newsletter/${confirmDeleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Newsletter campaign deleted", "success");
        fetchNewsletters();
      }
    } catch (e) {
      showToast("Error deleting campaign", "error");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const currentSentCount = currentNewsletter?.sentRecipients?.length ?? currentNewsletter?.recipientCount ?? 0;
  const remainingCount = Math.max(0, activeSubscriberCount - currentSentCount);
  const isPartiallySent = currentNewsletter?.status === "partially_sent";
  const isFullySent = currentNewsletter?.status === "sent" && remainingCount === 0;
  const safeBatchCount = Math.min(
    Math.max(1, (quotaData?.remainingToday ?? 100) - 15),
    70,
    remainingCount
  );

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-white mb-2 flex items-center gap-3">
            <Mail className="text-amber-500" size={32} />
            Newsletter & Campaigns
          </h1>
          <p className="text-zinc-400 text-sm">
            Draft, preview, and blast announcements to your subscribers.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Live Resend Quota Pill */}
          <button
            onClick={() => {
              fetchQuota();
              setShowQuotaModal(true);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer backdrop-blur-sm ${
              (quotaData?.remainingToday ?? 100) <= 15
                ? "bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20"
                : (quotaData?.remainingToday ?? 100) <= 35
                ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
            }`}
            title="Click to view real-time Resend API quota & dispatch logs"
          >
            <Zap size={14} className={
              (quotaData?.remainingToday ?? 100) <= 15
                ? "text-rose-400 animate-pulse"
                : (quotaData?.remainingToday ?? 100) <= 35
                ? "text-amber-400"
                : "text-emerald-400"
            } />
            <span>
              Resend Quota: <strong className="font-mono text-white">{quotaData?.sentToday ?? 0}/100</strong>
            </span>
            <span className="text-[11px] opacity-80 font-mono">
              ({quotaData?.remainingToday ?? 100} left)
            </span>
          </button>

          {view === "list" && (
            <Button onClick={handleNew} className="gap-2">
              <Plus size={18} /> New Campaign
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid gap-4"
          >
            {isLoading ? (
              <div className="text-zinc-500 flex gap-2 items-center p-8">
                <Loader2 className="animate-spin" /> Loading campaigns...
              </div>
            ) : newsletters.length === 0 ? (
              <div className="text-zinc-500 italic p-12 border border-white/5 rounded-2xl text-center bg-zinc-900/30">
                <Mail className="mx-auto text-zinc-700 mb-3" size={40} />
                <p className="text-zinc-300 font-medium">No newsletter campaigns yet.</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Click "New Campaign" to write and blast your first update!
                </p>
              </div>
            ) : (
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm divide-y divide-white/5">
                {newsletters.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => handleEdit(n)}
                    className="p-5 hover:bg-white/[0.03] transition-colors cursor-pointer flex justify-between items-center group"
                  >
                    <div>
                      <h3 className="text-white font-medium mb-1.5 group-hover:text-amber-400 transition-colors">
                        {n.subject || "(No Subject)"}
                      </h3>
                      <div className="text-xs text-zinc-500 flex items-center gap-4">
                        <span
                          className={`uppercase font-bold tracking-wider px-2 py-0.5 rounded text-[10px] ${
                            n.status === "sent"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : n.status === "partially_sent"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                          }`}
                        >
                          {n.status === "partially_sent" ? "Partially Sent" : n.status}
                        </span>
                        <span>Created: {new Date(n.createdAt).toLocaleDateString()}</span>
                        {n.status === "sent" && n.sentAt && (
                          <span className="text-zinc-400">
                            Sent: {new Date(n.sentAt).toLocaleDateString()}
                          </span>
                        )}
                        {n.status === "partially_sent" && (
                          <span className="text-amber-400 font-mono">
                            Delivered: {n.sentRecipients?.length ?? n.recipientCount ?? 0} / {activeSubscriberCount} ({Math.max(0, activeSubscriberCount - (n.sentRecipients?.length ?? n.recipientCount ?? 0))} left)
                          </span>
                        )}
                        {n.status === "sent" && typeof n.recipientCount === "number" && (
                          <span className="text-zinc-400 font-mono">
                            Recipients: {n.recipientCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => handleDelete(n._id, e)}
                        className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete Campaign"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="compose"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setView("list")}
                className="text-zinc-400 hover:text-white"
              >
                <ArrowLeft size={18} className="mr-1" /> Back
              </Button>
              <div className="flex-1 min-w-[20px]"></div>

              {/* Templates Button */}
              <Button
                variant="outline"
                onClick={() => setShowTemplateModal(true)}
                className="border-white/10 hover:border-amber-500/40 text-zinc-300"
              >
                <Sparkles size={16} className="mr-2 text-amber-400" />
                Templates
              </Button>

              {/* Preview Button */}
              <Button
                variant="outline"
                onClick={handleOpenPreviewModal}
                disabled={loadingPreview}
                className="border-white/10 hover:border-amber-500/40 text-zinc-300"
              >
                {loadingPreview ? (
                  <Loader2 className="animate-spin mr-2" size={16} />
                ) : (
                  <Eye size={16} className="mr-2 text-amber-400" />
                )}
                Preview Email
              </Button>

              {/* Send Test Email Button */}
              <Button
                variant="outline"
                onClick={handleOpenTestModal}
                disabled={isSaving || isSendingTest}
                className="border-white/10 hover:border-amber-500/40 text-zinc-300"
              >
                {isSendingTest ? (
                  <Loader2 className="animate-spin mr-2" size={16} />
                ) : (
                  <Mail size={16} className="mr-2 text-amber-400" />
                )}
                Send Test Email
              </Button>

              {/* Save Draft Button */}
              <Button
                variant="outline"
                onClick={() => handleSaveDraft(false)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="animate-spin mr-2" size={16} />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                Save Draft
              </Button>

              {/* Primary Action Button (Blast vs Individual) */}
              {targetType === "all" ? (
                <Button
                  onClick={handleSend}
                  disabled={isSending || (isFullySent && remainingCount === 0)}
                  className={`font-semibold shadow-lg ${
                    isPartiallySent
                      ? "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20"
                      : isFullySent
                      ? "bg-emerald-600/90 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                      : "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20"
                  }`}
                >
                  {isSending ? (
                    <Loader2 className="animate-spin mr-2" size={16} />
                  ) : isFullySent ? (
                    <CheckCircle2 size={16} className="mr-2" />
                  ) : (
                    <Send size={16} className="mr-2" />
                  )}
                  {isPartiallySent
                    ? `Resume Campaign (${remainingCount} left)`
                    : isFullySent
                    ? `Delivered (${currentSentCount} Sent)`
                    : `Blast Now (${activeSubscriberCount})`}
                </Button>
              ) : (
                <Button
                  onClick={handleSendIndividual}
                  disabled={isSending || (!selectedIndividualEmail && !subscriberQuery.trim())}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-semibold shadow-lg shadow-amber-500/20"
                >
                  {isSending ? (
                    <Loader2 className="animate-spin mr-2" size={16} />
                  ) : (
                    <Send size={16} className="mr-2" />
                  )}
                  Send to Individual
                </Button>
              )}
            </div>

            {/* Target Audience Segment Bar with Searchable Dropdown */}
            <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Users size={14} className="text-amber-400" /> Target Audience:
                </span>
                <div className="inline-flex rounded-xl p-1 bg-black/60 border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setTargetType("all")}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      targetType === "all"
                        ? "bg-amber-500 text-black font-semibold shadow"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Radio size={13} className={targetType === "all" ? "text-black animate-pulse" : ""} />
                    All Subscribers ({activeSubscriberCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType("individual");
                      setShowSubscriberDropdown(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      targetType === "individual"
                        ? "bg-amber-500 text-black font-semibold shadow"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <UserCheck size={13} />
                    Send to Individual
                  </button>
                </div>
              </div>

              {/* Individual Search Dropdown */}
              {targetType === "individual" ? (
                <div className="relative w-full md:w-80" ref={subscriberDropdownRef}>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="email"
                      value={subscriberQuery}
                      onChange={(e) => {
                        setSubscriberQuery(e.target.value);
                        setSelectedIndividualEmail(e.target.value);
                        setShowSubscriberDropdown(true);
                      }}
                      onFocus={() => setShowSubscriberDropdown(true)}
                      placeholder="Search or enter subscriber email..."
                      className="w-full bg-black/80 border border-white/15 focus:border-amber-500 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none transition-colors"
                    />
                    {subscriberQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSubscriberQuery("");
                          setSelectedIndividualEmail("");
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-0.5"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Dropdown List */}
                  {showSubscriberDropdown && (
                    <div className="absolute z-30 left-0 right-0 mt-2 bg-zinc-900 border border-white/15 rounded-xl shadow-2xl max-h-56 overflow-y-auto p-1 text-xs">
                      {isSearchingSubscribers ? (
                        <div className="p-3 text-center text-zinc-500 flex items-center justify-center gap-2">
                          <Loader2 size={13} className="animate-spin text-amber-500" /> Searching subscribers...
                        </div>
                      ) : subscriberResults.length > 0 ? (
                        subscriberResults.map((s) => (
                          <button
                            key={s._id}
                            type="button"
                            onClick={() => {
                              setSelectedIndividualEmail(s.email);
                              setSubscriberQuery(s.email);
                              setShowSubscriberDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                              selectedIndividualEmail === s.email
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "hover:bg-white/5 text-zinc-300 hover:text-white"
                            }`}
                          >
                            <div className="truncate mr-2">
                              <div className="font-mono text-white text-xs truncate">{s.email}</div>
                              <div className="text-[10px] text-zinc-500">Source: {s.source || "organic"}</div>
                            </div>
                            {selectedIndividualEmail === s.email ? (
                              <Check size={14} className="text-amber-400 flex-shrink-0" />
                            ) : (
                              <span className="text-[10px] text-emerald-400 font-mono px-1.5 py-0.5 rounded bg-emerald-500/10">
                                active
                              </span>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-zinc-500">
                          {subscriberQuery ? (
                            <div>
                              No existing subscriber found.
                              <div className="text-[11px] text-amber-400 mt-1">
                                Will send directly to "{subscriberQuery}"
                              </div>
                            </div>
                          ) : (
                            "Type to search among active subscribers"
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  Ready to broadcast to {activeSubscriberCount} verified subscribers
                </div>
              )}
            </div>

            {/* Delivery Progress Banner if Partially Sent or Fully Sent */}
            {isPartiallySent && (
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-amber-300 font-semibold text-sm">
                      Partially Delivered Campaign
                    </p>
                    <p className="text-zinc-400 mt-0.5">
                      Delivered to <strong className="text-white">{currentSentCount}</strong> of <strong className="text-white">{activeSubscriberCount}</strong> subscribers. <span className="text-amber-400 font-medium">{remainingCount} subscribers</span> are pending for the next run.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleSend}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-semibold shrink-0 gap-1.5 h-9"
                >
                  <Send size={14} /> Resume Dispatch ({remainingCount} left)
                </Button>
              </div>
            )}

            {isFullySent && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-xs shadow-lg backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-emerald-300 font-semibold text-sm">
                    Campaign Fully Delivered
                  </p>
                  <p className="text-zinc-400 mt-0.5">
                    This campaign has been successfully delivered to all <strong className="text-white">{currentSentCount}</strong> subscribers.
                  </p>
                </div>
              </div>
            )}

            {/* Subject Input & Editor */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
                  Campaign Subject Line
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject line..."
                  className="w-full bg-zinc-950/60 text-2xl md:text-3xl font-serif text-white placeholder:text-zinc-700 focus:outline-none border border-white/10 focus:border-amber-500/50 rounded-xl px-5 py-4 transition-colors"
                />
              </div>

              {/* Editor Mode Switcher & Tools */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-3">
                  <div className="inline-flex rounded-xl p-1 bg-zinc-900 border border-white/10 text-xs shadow-inner">
                    <button
                      type="button"
                      onClick={() => setEditorMode("visual")}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                        editorMode === "visual"
                          ? "bg-amber-500 text-black font-semibold shadow"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Sparkles size={13} /> Visual Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode("html")}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                        editorMode === "html"
                          ? "bg-amber-500 text-black font-semibold shadow"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <Code size={13} /> HTML Source Code
                    </button>
                  </div>
                  <span className="text-[11px] text-zinc-500 hidden md:inline">
                    {editorMode === "visual"
                      ? "Rich visual editing with preserved email card layouts"
                      : "Direct HTML code for template styling & tags"}
                  </span>
                </div>

                <div className="text-[11px] text-zinc-400 font-mono">
                  {editorMode === "visual" ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                      WYSIWYG Mode
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
                      Direct HTML Editing Active
                    </span>
                  )}
                </div>
              </div>

              {editorMode === "visual" ? (
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-black shadow-2xl">
                  <Editor
                    value={content}
                    onChange={(val: any) => setContent(val)}
                    placeholder="Write your email body here... You can insert images, code blocks, tables, and links."
                  />
                </div>
              ) : (
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#0d1117] shadow-2xl">
                  <div className="bg-zinc-950 px-4 py-2.5 border-b border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                      <span className="text-zinc-300 font-semibold">email-content.html</span>
                    </div>
                    <span className="text-[11px] text-zinc-500">
                      Changes sync automatically when switching back to Visual mode
                    </span>
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write or paste your email HTML here..."
                    className="w-full h-[650px] bg-transparent text-zinc-200 font-mono text-xs sm:text-sm p-4 focus:outline-none resize-y selection:bg-amber-500/30 leading-relaxed font-normal"
                    spellCheck={false}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quota-Friendly Campaign Dispatch Modal */}
      <AnimatePresence>
        {showDispatchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowDispatchModal(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Send size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">
                    {isPartiallySent ? "Resume Campaign Dispatch" : "Broadcast Newsletter"}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Resend Delivery &bull; Sender: newsletter@cswithbs.com
                  </p>
                </div>
              </div>

              {/* Status and Progress Bar */}
              <div className="bg-black/50 border border-white/10 rounded-xl p-4 mb-5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Campaign Audience:</span>
                  <span className="font-mono text-white font-medium">{activeSubscriberCount} active subscribers</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Already Delivered:</span>
                  <span className="font-mono text-emerald-400 font-medium">
                    {currentSentCount} subscribers ({activeSubscriberCount > 0 ? Math.round((currentSentCount / activeSubscriberCount) * 100) : 0}%)
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Remaining to Send:</span>
                  <span className="font-mono text-amber-400 font-bold">{remainingCount} subscribers</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-white/5">
                  <span className="text-zinc-400">Resend Quota Available Today:</span>
                  <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                    <Zap size={12} /> {quotaData?.remainingToday ?? 100} / 100 credits left
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${activeSubscriberCount > 0 ? Math.min(100, Math.round((currentSentCount / activeSubscriberCount) * 100)) : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Quota Strategy Selector */}
              {remainingCount > 0 ? (
                <div className="space-y-3 mb-6">
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400">
                    Daily Quota Sending Strategy:
                  </label>

                  {/* Option 1: Safe Batch (Recommended) */}
                  <label
                    onClick={() => setBatchLimitOption("safe")}
                    className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
                      batchLimitOption === "safe"
                        ? "bg-amber-500/10 border-amber-500/50 text-white"
                        : "bg-zinc-950/40 border-white/5 text-zinc-400 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="batchOption"
                        checked={batchLimitOption === "safe"}
                        onChange={() => setBatchLimitOption("safe")}
                        className="mt-1 accent-amber-500"
                      />
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            Send Safe Batch Today ({safeBatchCount} Subscribers)
                          </span>
                          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-mono border border-emerald-500/20">
                            Recommended
                          </span>
                        </div>
                        <p className="text-zinc-400 mt-1 leading-relaxed">
                          Keeps daily sending safely below Resend's 100/day free limit (leaving 15 credit buffer for test &amp; welcome emails). You can resume the remaining {Math.max(0, remainingCount - safeBatchCount)} tomorrow!
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Option 2: Send All Remaining */}
                  <label
                    onClick={() => setBatchLimitOption("all")}
                    className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
                      batchLimitOption === "all"
                        ? "bg-amber-500/10 border-amber-500/50 text-white"
                        : "bg-zinc-950/40 border-white/5 text-zinc-400 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="batchOption"
                        checked={batchLimitOption === "all"}
                        onChange={() => setBatchLimitOption("all")}
                        className="mt-1 accent-amber-500"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-white">
                          Send All Remaining ({remainingCount} Subscribers)
                        </span>
                        <p className="text-zinc-400 mt-1 leading-relaxed">
                          Attempts to send to everyone right now in one broadcast.
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Option 3: Custom Count */}
                  <label
                    onClick={() => setBatchLimitOption("custom")}
                    className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
                      batchLimitOption === "custom"
                        ? "bg-amber-500/10 border-amber-500/50 text-white"
                        : "bg-zinc-950/40 border-white/5 text-zinc-400 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="batchOption"
                        checked={batchLimitOption === "custom"}
                        onChange={() => setBatchLimitOption("custom")}
                        className="mt-1 accent-amber-500"
                      />
                      <div className="text-xs w-full">
                        <span className="font-semibold text-white">Custom Batch Limit</span>
                        {batchLimitOption === "custom" && (
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              max={remainingCount}
                              value={customBatchLimit}
                              onChange={(e) => setCustomBatchLimit(Math.max(1, Math.min(remainingCount, parseInt(e.target.value) || 1)))}
                              className="bg-black/60 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white w-24 font-mono focus:outline-none focus:border-amber-500"
                            />
                            <span className="text-zinc-400 text-xs">subscribers in this run</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center mb-6">
                  <CheckCircle2 className="mx-auto mb-1.5" size={20} />
                  This campaign has already been completely delivered to all active subscribers.
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                <Button
                  variant="ghost"
                  onClick={() => setShowDispatchModal(false)}
                  disabled={isSending}
                  className="text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                {remainingCount > 0 && (
                  <Button
                    onClick={() => {
                      const limit =
                        batchLimitOption === "safe"
                          ? safeBatchCount
                          : batchLimitOption === "custom"
                          ? customBatchLimit
                          : 0; // 0 means all remaining
                      executeSend(limit);
                    }}
                    disabled={isSending}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-semibold shadow-lg shadow-amber-500/20"
                  >
                    {isSending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} /> Dispatching...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send size={16} />
                        {batchLimitOption === "safe"
                          ? `Dispatch Next ${safeBatchCount} Subscribers`
                          : batchLimitOption === "custom"
                          ? `Dispatch Next ${customBatchLimit} Subscribers`
                          : `Dispatch All ${remainingCount} Subscribers`}
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal to Delete */}
      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={executeDelete}
        title="Delete Campaign?"
        description="Are you sure you want to delete this newsletter draft? This cannot be undone."
        variant="danger"
        confirmText="Delete"
      />

      {/* Preset Email Templates Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-white/15 rounded-2xl p-6 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Pre-built Email Templates</h3>
                    <p className="text-xs text-zinc-400">
                      Choose a structured academic layout to pre-fill your subject and editor.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {EMAIL_PRESET_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 hover:border-amber-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-amber-400 border border-amber-500/20">
                          {tpl.badge}
                        </span>
                        <h4 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                          {tpl.title}
                        </h4>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {tpl.description}
                      </p>
                      <p className="text-[11px] font-mono text-zinc-500 truncate pt-1">
                        Default Subject: <span className="text-zinc-300">{tpl.defaultSubject}</span>
                      </p>
                    </div>

                    <Button
                      onClick={() => handleApplyTemplate(tpl)}
                      className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs whitespace-nowrap self-start md:self-center"
                    >
                      Use Template
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Test Email Modal */}
      <AnimatePresence>
        {showTestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-white/15 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowTestModal(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Send Test Email</h3>
                  <p className="text-xs text-zinc-400">
                    Verify how your email renders in your personal inbox.
                  </p>
                </div>
              </div>

              <div className="space-y-4 my-4">
                {/* Send to Entire Admin Team Box */}
                <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-amber-500/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-amber-400" />
                      <span className="text-xs font-semibold text-white">Send to All Admin Team Members</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {quotaData?.adminTeam?.length || 4} Staff Members
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Sends private test copies to all CSwithBS admins (
                    <strong className="text-zinc-300 font-mono">
                      {quotaData?.adminTeam?.map((a: any) => a.email).join(", ") || "all team admins"}
                    </strong>
                    ) so your team can review before public broadcast.
                  </p>
                  <Button
                    onClick={executeSendTestToAdmins}
                    disabled={isSendingTest}
                    variant="outline"
                    className="w-full border-amber-500/40 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/70 text-xs py-2 h-auto flex items-center justify-center gap-2 font-semibold"
                  >
                    {isSendingTest ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Dispatching to Admins...
                      </>
                    ) : (
                      <>
                        <Send size={13} /> Send Test to Entire Admin Team ({quotaData?.adminTeam?.length || 4})
                      </>
                    )}
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative my-2 flex items-center justify-center">
                  <div className="border-t border-white/10 w-full"></div>
                  <span className="bg-zinc-900 px-2 text-[10px] font-mono uppercase text-zinc-500 absolute">or send to custom email</span>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                    Custom Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1.5">
                    <span>Sender: <strong className="font-mono text-zinc-400">CSwithBS &lt;newsletter@cswithbs.com&gt;</strong></span>
                    <span className="font-mono text-amber-400">{quotaData?.remainingToday ?? 100} / 100 quota left today</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowTestModal(false)}
                  disabled={isSendingTest}
                >
                  Cancel
                </Button>
                <Button
                  onClick={executeSendTestEmail}
                  disabled={isSendingTest}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-semibold"
                >
                  {isSendingTest ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Sending...
                    </span>
                  ) : (
                    "Send Test Email"
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Email Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-white/15 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Preview Header */}
              <div className="p-4 bg-zinc-900 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="text-amber-400" size={18} />
                  <span className="text-sm font-semibold text-white">Email Inbox Preview</span>
                </div>

                {/* Device Switcher */}
                <div className="flex items-center bg-black/50 p-1 rounded-xl border border-white/10 text-xs">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      previewDevice === "desktop"
                        ? "bg-amber-500 text-black font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Monitor size={14} /> Desktop (600px)
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      previewDevice === "mobile"
                        ? "bg-amber-500 text-black font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Smartphone size={14} /> Mobile (380px)
                  </button>
                </div>

                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Simulated Email Envelope Header */}
              <div className="p-4 bg-zinc-900/90 border-b border-white/5 text-xs text-zinc-400 space-y-1.5 font-sans">
                <div className="flex gap-2 items-center">
                  <span className="text-zinc-500 w-20">Subject:</span>
                  <span className="text-white font-medium">{subject || "(No Subject Line)"}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-zinc-500 w-20">From:</span>
                  <span className="text-zinc-300 font-mono">CSwithBS &lt;newsletter@cswithbs.com&gt;</span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-zinc-500 w-20">Reply-To:</span>
                  <span className="text-zinc-400 font-mono">None (Automated Broadcast · No-Reply)</span>
                </div>
              </div>

              {/* Scrollable Render Area with 1:1 HTML Iframe */}
              <div className="flex-1 overflow-y-auto bg-zinc-950 p-4 md:p-6 flex justify-center items-start">
                <div
                  className={`transition-all duration-300 bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/10 ${
                    previewDevice === "desktop" ? "w-full max-w-[620px]" : "w-[390px]"
                  }`}
                >
                  {loadingPreview ? (
                    <div className="flex flex-col items-center justify-center py-32 text-zinc-400 gap-3 bg-zinc-900">
                      <Loader2 className="animate-spin text-amber-500" size={32} />
                      <p className="text-sm font-medium text-zinc-300">Rendering 1:1 Email Client View...</p>
                    </div>
                  ) : (
                    <iframe
                      srcDoc={previewHtml}
                      title="1:1 Email Client Render"
                      className="w-full h-[620px] border-0 bg-[#f4f4f7]"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Real-time Resend Quota & Logs Modal */}
      <AnimatePresence>
        {showQuotaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-white/15 rounded-2xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden relative"
            >
              {/* Modal Header */}
              <div className="p-5 bg-zinc-900/90 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Zap size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">Resend Live Quota &amp; Activity</h3>
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-mono border border-emerald-500/20">
                        Live API Sync
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Real-time stats queried directly from your Resend mail server.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchQuota}
                    disabled={loadingQuota}
                    className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors border border-white/5 flex items-center gap-1.5 text-xs"
                    title="Refresh quota from Resend API"
                  >
                    <RefreshCw size={14} className={loadingQuota ? "animate-spin text-amber-400" : ""} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                  <button
                    onClick={() => setShowQuotaModal(false)}
                    className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1">
                {/* 3 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Metric 1 */}
                  <div className="bg-zinc-900/70 border border-white/10 rounded-xl p-4">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                      Sent Today (UTC)
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-mono text-white">
                        {quotaData?.sentToday ?? 0}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">
                        / {quotaData?.dailyLimit ?? 100}
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          (quotaData?.percentUsed ?? 0) > 85
                            ? "bg-rose-500"
                            : (quotaData?.percentUsed ?? 0) > 60
                            ? "bg-amber-500"
                            : "bg-emerald-400"
                        }`}
                        style={{ width: `${quotaData?.percentUsed ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-zinc-900/70 border border-white/10 rounded-xl p-4">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                      Available Remaining
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-bold font-mono ${
                        (quotaData?.remainingToday ?? 100) <= 15
                          ? "text-rose-400"
                          : (quotaData?.remainingToday ?? 100) <= 35
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}>
                        {quotaData?.remainingToday ?? 100}
                      </span>
                      <span className="text-xs text-zinc-500">emails</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Free tier daily allowance
                    </p>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-zinc-900/70 border border-white/10 rounded-xl p-4">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                      Daily Reset Window
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-white flex items-center gap-1.5">
                        <Clock size={16} className="text-amber-400" />
                        in ~{quotaData?.hoursUntilReset ?? 0}h
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Resets 5:30 AM IST (00:00 UTC)
                    </p>
                  </div>
                </div>

                {/* Explanation Banner */}
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3.5 text-xs text-zinc-300 flex items-start gap-3">
                  <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-400">Multi-Day Dispatch Strategy:</strong> Since your verified audience ({activeSubscriberCount} subscribers) is close to Resend's 100/day limit, our system automatically tracks which subscribers receive each campaign in MongoDB. You can send a safe batch today (e.g. 70 subscribers) and easily resume the remaining tomorrow without duplicates!
                  </div>
                </div>

                {/* Recent Dispatches & Test Emails Table */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Mail size={15} className="text-amber-400" />
                      Recent Email Dispatches (Live from Resend)
                    </h4>
                    <span className="text-xs text-zinc-500 font-mono">
                      Showing latest {quotaData?.recentActivity?.length ?? 0} logs
                    </span>
                  </div>

                  {(!quotaData?.recentActivity || quotaData.recentActivity.length === 0) ? (
                    <div className="text-center py-8 text-zinc-500 text-xs border border-white/5 rounded-xl bg-zinc-900/30">
                      No email dispatches recorded in Resend yet today.
                    </div>
                  ) : (
                    <div className="border border-white/5 rounded-xl overflow-hidden bg-zinc-900/40 divide-y divide-white/5 max-h-[300px] overflow-y-auto">
                      {quotaData.recentActivity.map((log) => (
                        <div key={log.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/[0.02] transition-colors text-xs">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {log.isTest && (
                                <span className="bg-purple-500/15 text-purple-300 text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold border border-purple-500/30">
                                  TEST
                                </span>
                              )}
                              <span className="text-white font-medium truncate">
                                {log.subject}
                              </span>
                            </div>
                            <div className="text-zinc-400 text-[11px] font-mono truncate">
                              To: <span className="text-zinc-300">{log.to}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`uppercase font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                                log.status === "delivered"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : log.status === "bounced" || log.status === "complained"
                                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                  : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {log.status}
                            </span>
                            <span className="text-[11px] text-zinc-500 font-mono">
                              {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-zinc-900/60 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping"></span>
                  Connected to Resend API
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuotaModal(false)}
                  className="border-white/10 text-white hover:bg-white/5"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
