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
  status: "draft" | "sent" | "scheduled";
  sentAt?: string;
  recipientCount?: number;
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
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState(""); // This will be HTML from editor
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  // Fetch List and Subscriber Stats
  useEffect(() => {
    fetchNewsletters();
    fetchSubscriberCount();
  }, []);

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

  const handleEdit = (n: Newsletter) => {
    setDraftId(n._id);
    setSubject(n.subject);
    setContent(n.content);
    setView("compose");
  };

  const handleNew = () => {
    setDraftId(null);
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
      } else {
        showToast(data.error || "Failed to send test email", "error");
      }
    } catch (e) {
      showToast("Network error while sending test email", "error");
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
      } else {
        showToast(data.error || "Failed to send email", "error");
      }
    } catch {
      showToast("Network error while sending to individual", "error");
    } finally {
      setIsSending(false);
    }
  };

  // Live Broadcast Flow
  const handleSend = async () => {
    if (!draftId) {
      const savedId = await handleSaveDraft(true);
      if (!savedId) return;
    }
    setConfirmSend(true);
  };

  const executeSend = async () => {
    setConfirmSend(false);
    setIsSending(true);
    try {
      const res = await fetch(`/api/admin/newsletter/${draftId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(
          data.message || `Newsletter blasted to ${activeSubscriberCount} subscribers!`,
          "success"
        );
        setView("list");
        fetchNewsletters();
      } else {
        showToast(data.error || "Failed to blast newsletter", "error");
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
            Draft, preview, and blast announcements to your verified audience (
            <span className="text-amber-400 font-semibold">{activeSubscriberCount} active</span> subscribers).
          </p>
        </div>
        {view === "list" && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 px-3 py-2 rounded-xl text-xs text-zinc-400">
              <Users size={14} className="text-amber-400" />
              <span>Audience: <strong className="text-white">{activeSubscriberCount}</strong></span>
            </div>
            <Button onClick={handleNew} className="gap-2">
              <Plus size={18} /> New Campaign
            </Button>
          </div>
        )}
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
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {n.status}
                        </span>
                        <span>Created: {new Date(n.createdAt).toLocaleDateString()}</span>
                        {n.status === "sent" && n.sentAt && (
                          <span className="text-zinc-400">
                            Sent: {new Date(n.sentAt).toLocaleDateString()}
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
                  disabled={isSending}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-semibold shadow-lg shadow-amber-500/20"
                >
                  {isSending ? (
                    <Loader2 className="animate-spin mr-2" size={16} />
                  ) : (
                    <Send size={16} className="mr-2" />
                  )}
                  Blast Now ({activeSubscriberCount})
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

              <div className="border border-white/10 rounded-2xl overflow-hidden bg-black shadow-2xl">
                <Editor
                  value={content}
                  onChange={(val: any) => setContent(val)}
                  placeholder="Write your email body here... You can insert images, code blocks, tables, and links."
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal to Blast */}
      <ConfirmDialog
        isOpen={confirmSend}
        onClose={() => setConfirmSend(false)}
        onConfirm={executeSend}
        title="Blast Newsletter to Audience?"
        description={`Are you sure you want to blast this email to ALL ${activeSubscriberCount} active subscribers via Resend (@cswithbs.com)? This action is permanent and cannot be undone.`}
        variant="danger"
        confirmText={`Blast to ${activeSubscriberCount} Subscribers`}
      />

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
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    value={testEmailAddress}
                    onChange={(e) => setTestEmailAddress(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1.5">
                    Sender: <span className="font-mono text-zinc-400">CSwithBS &lt;newsletter@cswithbs.com&gt;</span>
                  </p>
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
                  <span className="text-zinc-300 font-mono">CSwithBS Newsletter &lt;newsletter@cswithbs.com&gt;</span>
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
    </div>
  );
}
