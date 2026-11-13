"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Sparkles,
  Zap,
  Activity,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Plus,
  Trash2,
  Send,
  Check,
  Copy,
  PenTool,
  Bot,
  Layers,
  GraduationCap,
  ChevronDown,
  Info,
  Server,
  Lock,
  ArrowRight,
  Code2,
} from "lucide-react";

interface Conversation {
  _id: string;
  title: string;
  aiModel?: string;
  lastMessageAt: string;
}

interface ChatMessage {
  _id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: {
    type?: string;
    draftData?: {
      title?: string;
      slug?: string;
      excerpt?: string;
      content?: string;
      tags?: string[];
      subjectName?: string;
      chapterName?: string;
      contentType?: "post" | "note";
    };
  };
  createdAt: string;
}

const MODEL_OPTIONS = [
  {
    id: "gemini-3-flash-preview",
    name: "Gemini 3 Flash",
    tagline: "Complex Academic Proofs & Reasoning",
    icon: "🧠",
    badge: "Heavy Reasoning (~4-6s)",
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    tagline: "System Architecture & Long Syllabi",
    icon: "🏗️",
    badge: "High Density (~5-7s)",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash",
    tagline: "Coding Tutorials, Algorithms & Logic",
    icon: "💻",
    badge: "Balanced (~2-3s)",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "gemini-flash-lite-latest",
    name: "Gemini Flash Lite",
    tagline: "Ultra-Fast Q&A & Quick Outlines",
    icon: "⚡",
    badge: "Ultra-Fast (~1-2s)",
    color: "from-amber-500 to-orange-500",
  },
];

const QUICK_PROMPTS = [
  {
    icon: "⚡",
    title: "Draft B+ Tree Tutorial",
    prompt: "Draft a comprehensive, publication-ready academic note on 'B+ Tree Indexing in Relational Databases'. Include formal definition, node structure, search & insertion algorithms with ASCII diagram, and time complexity comparison with B-Trees.",
  },
  {
    icon: "🎓",
    title: "Audit Operating Systems",
    prompt: "Audit our Operating Systems curriculum. List the standard GATE CS and ABET-accredited topics we should cover, group them by priority, and identify any advanced topics that would give our students a competitive edge.",
  },
  {
    icon: "✍️",
    title: "Editorial Guidelines",
    prompt: "Generate an inspiring, concrete set of Editorial Quality Guidelines for our contributing writers. Cover code readability standards, avoidance of AI fluff, diagram conventions, and real-world system examples.",
  },
  {
    icon: "🔍",
    title: "Paxos vs Raft Consensus",
    prompt: "Write a high-impact technical comparison between Paxos and Raft distributed consensus protocols. Break down leader election, log replication, and safety guarantees with step-by-step state diagrams.",
  },
];

// Feature flag to keep AI Studio hidden from the UI while preserving code for future work
const AI_STUDIO_ENABLED = false;

export default function AiStudioHubPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!AI_STUDIO_ENABLED) {
      router.replace("/writers-hub/dashboard");
    }
  }, [router]);

  // Conversations & Chat State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3-flash-preview");
  const [isSending, setIsSending] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Quota & Health Telemetry State
  const [statsData, setStatsData] = useState<any>(null);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Authorization Check
  const userRoles = (session?.user as any)?.roles || [];
  const isAuthorized = Array.isArray(userRoles)
    ? userRoles.some((r: string) => ["ADMIN", "SUPER_ADMIN", "admin", "super_admin"].includes(r))
    : ["ADMIN", "SUPER_ADMIN", "admin", "super_admin"].includes(userRoles);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Load telemetry stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/writers-hub/ai/stats");
      if (res.ok) {
        const d = await res.json();
        setStatsData(d);
      }
    } catch (e) {
      console.error("Failed to load telemetry stats", e);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/admin/ai/conversations");
      if (res.ok) {
        const d = await res.json();
        const convList: Conversation[] = d.conversations || [];
        setConversations(convList);
        if (convList.length > 0 && !activeConversationId) {
          setActiveConversationId(convList[0]._id);
        }
      }
    } catch (e) {
      console.error("Failed to load conversations", e);
    }
  };

  // Load messages for conversation
  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/admin/ai/chat?conversationId=${convId}`);
      if (res.ok) {
        const d = await res.json();
        setMessages(d.messages || []);
      }
    } catch (e) {
      console.error("Failed to load messages", e);
    }
  };

  useEffect(() => {
    if (AI_STUDIO_ENABLED && isAuthorized) {
      fetchConversations();
      fetchStats();
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (!AI_STUDIO_ENABLED) return;
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  // Start a new conversation
  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/admin/ai/conversations?id=${convId}`, { method: "DELETE" });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c._id !== convId));
        if (activeConversationId === convId) {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Failed to delete conversation", err);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    setInputMessage("");
    setIsSending(true);

    // Optimistic UI for user message
    const tempUserMsg: ChatMessage = {
      _id: `temp-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch("/api/admin/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          message: text,
          selectedModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate AI response");

      if (!activeConversationId && data.conversationId) {
        setActiveConversationId(data.conversationId);
        fetchConversations();
      }

      setMessages((prev) => [
        ...prev.filter((m) => m._id !== tempUserMsg._id),
        data.userMessage || tempUserMsg,
        data.reply,
      ]);

      // Refresh stats in background
      fetchStats();
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          _id: `err-${Date.now()}`,
          role: "assistant",
          content: `⚠️ Error: ${err.message || "Failed to communicate with Google Gemini."}`,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  if (!AI_STUDIO_ENABLED) {
    return null;
  }

  // Access Control Guard
  if (status !== "loading" && !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 text-zinc-100">
        <div className="max-w-md w-full p-8 rounded-2xl bg-zinc-900/60 border border-red-500/20 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
            <Lock size={26} />
          </div>
          <h2 className="text-xl font-bold text-white">Private Admin Console</h2>
          <p className="text-zinc-400 text-xs leading-relaxed">
            The AI Studio Command Center is strictly reserved for platform Administrators and Super Admins.
            Regular writers and external contributors do not have access to direct inference models.
          </p>
          <Link
            href="/writers-hub/posts"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            Return to Writers Hub
          </Link>
        </div>
      </div>
    );
  }

  const activeModelMeta = MODEL_OPTIONS.find((m) => m.id === selectedModel) || MODEL_OPTIONS[0];

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans selection:bg-accent/30 selection:text-black">
      {/* Top Header */}
      <header className="h-14 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-purple-600 via-accent to-blue-500 text-black shadow-md shadow-accent/20">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                AI Studio Command Center
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent">
                Private Admin Agent
              </span>
            </div>
          </div>
        </div>

        {/* Model Selector & Telemetry Badge */}
        <div className="flex items-center gap-2.5">
          {/* Model Switcher Pill */}
          <div className="relative group">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="appearance-none bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl pl-3 pr-8 py-1.5 text-xs font-semibold text-zinc-200 focus:outline-none focus:border-accent transition-colors cursor-pointer"
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.icon} {m.name} — {m.badge}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
            />
          </div>

          {/* Telemetry Status Trigger */}
          <button
            onClick={() => setShowQuotaModal(!showQuotaModal)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-300 transition-colors"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                statsData?.health?.ok ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span className="font-mono text-[11px]">
              {statsData?.stats?.todayTotal ?? 0} / 1500 calls
            </span>
          </button>
        </div>
      </header>

      {/* Main Studio Body: Sidebar + Chat Thread */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Conversations & Telemetry */}
        <aside className="w-64 border-r border-white/5 bg-zinc-950/40 hidden md:flex flex-col shrink-0">
          <div className="p-3 border-b border-white/5">
            <button
              onClick={handleNewConversation}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500/10 via-accent/10 to-blue-500/10 border border-purple-500/30 hover:border-accent text-zinc-100 hover:text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm group"
            >
              <Plus size={14} className="text-accent group-hover:scale-110 transition-transform" />
              <span>New Conversation</span>
            </button>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Recent Sessions
            </div>
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-600 italic">
                No past chats yet. Start asking anything!
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv._id === activeConversationId;
                return (
                  <div
                    key={conv._id}
                    onClick={() => setActiveConversationId(conv._id)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                      isActive
                        ? "bg-accent/10 border border-accent/30 text-white font-medium"
                        : "hover:bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare size={13} className={isActive ? "text-accent" : "text-zinc-600"} />
                      <span className="truncate">{conv.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(conv._id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 rounded transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Telemetry Card */}
          <div className="p-3 border-t border-white/5 bg-zinc-900/20 text-[11px] text-zinc-400 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 font-medium">Free Tier Status</span>
              <span className="text-emerald-400 font-mono text-[10px]">100% Free</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-accent h-1.5 rounded-full transition-all"
                style={{ width: `${statsData?.stats?.percentUsed || 1}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>{statsData?.stats?.remainingToday ?? 1500} calls left</span>
              <span>15 req/min</span>
            </div>
          </div>
        </aside>

        {/* Center Chat Thread */}
        <main className="flex-1 flex flex-col bg-gradient-to-b from-black via-zinc-950 to-black overflow-hidden relative">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="max-w-2xl mx-auto py-12 text-center space-y-6 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500/20 via-accent/20 to-blue-500/20 border border-accent/30 text-accent flex items-center justify-center mx-auto shadow-lg shadow-accent/10">
                  <Bot size={32} />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    How can I assist your CS publication today?
                  </h2>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                    Connected directly to Google Gemini high-reasoning TPUs. Ask to draft academic
                    tutorials, audit course syllabi, verify algorithm correctness, or compose guidelines.
                  </p>
                </div>

                {/* Quick Start Action Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-2">
                  {QUICK_PROMPTS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(q.prompt)}
                      className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-accent/40 hover:bg-zinc-900 transition-all group flex items-start gap-3"
                    >
                      <span className="text-base p-1.5 rounded-lg bg-zinc-800/80 group-hover:scale-110 transition-transform">
                        {q.icon}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-zinc-200 group-hover:text-accent transition-colors">
                          {q.title}
                        </div>
                        <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                          {q.prompt}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-5">
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  const draftData = msg.metadata?.draftData;

                  return (
                    <div
                      key={msg._id}
                      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 via-accent to-blue-600 text-black flex items-center justify-center shrink-0 shadow-sm mt-1">
                          <Bot size={14} />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] md:max-w-[78%] rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                          isUser
                            ? "bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-100 border border-zinc-700/60 shadow-sm"
                            : "bg-zinc-900/60 border border-zinc-800/80 text-zinc-200"
                        }`}
                      >
                        <div className="whitespace-pre-wrap font-sans selection:bg-accent/40">
                          {msg.content}
                        </div>

                        {/* Interactive Draft Card if AI generated a post/note */}
                        {draftData && (
                          <div className="mt-3 p-3.5 rounded-xl bg-black/60 border border-accent/40 space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                                <PenTool size={12} /> Ready for Editorial Hub
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                                {draftData.contentType === "note" ? "Academic Note" : "Blog Post"}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-white">{draftData.title}</h4>
                              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
                                {draftData.excerpt}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                              <span className="text-[10px] text-zinc-500 font-mono">
                                slug: /{draftData.slug}
                              </span>
                              <Link
                                href={`/writers-hub/editor?type=${draftData.contentType || "post"}&title=${encodeURIComponent(
                                  draftData.title || ""
                                )}&slug=${encodeURIComponent(draftData.slug || "")}&excerpt=${encodeURIComponent(
                                  draftData.excerpt || ""
                                )}`}
                                target="_blank"
                                className="px-3 py-1 rounded-lg bg-accent text-black font-bold text-[11px] hover:bg-accent-hover transition-colors flex items-center gap-1 shadow-sm"
                              >
                                <span>Open in Editor</span>
                                <ExternalLink size={11} />
                              </Link>
                            </div>
                          </div>
                        )}

                        {/* Message actions (copy) */}
                        {!isUser && (
                          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/40 text-[10px] text-zinc-500">
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            <button
                              onClick={() => copyToClipboard(msg.content, msg._id)}
                              className="hover:text-zinc-300 flex items-center gap-1 transition-colors"
                            >
                              {copiedMsgId === msg._id ? <Check size={11} /> : <Copy size={11} />}
                              <span>{copiedMsgId === msg._id ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Typing / Thinking indicator */}
                {isSending && (
                  <div className="flex gap-3 justify-start animate-in fade-in duration-200">
                    <div className="w-7 h-7 rounded-xl bg-zinc-800 border border-zinc-700 text-accent flex items-center justify-center shrink-0 mt-1">
                      <RefreshCw size={13} className="animate-spin" />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                      <span>{activeModelMeta.name} is reasoning & synthesizing...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Bottom Command Input Dock */}
          <div className="p-4 border-t border-white/5 bg-zinc-950/80 backdrop-blur-md shrink-0">
            <div className="max-w-3xl mx-auto relative">
              <div className="relative rounded-2xl bg-zinc-900/90 border border-zinc-800 focus-within:border-accent/60 shadow-xl transition-all overflow-hidden">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask ${activeModelMeta.name} to draft notes, audit syllabi, or explain code... (Shift+Enter for new line)`}
                  rows={2}
                  className="w-full bg-transparent px-4 py-3 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none leading-relaxed font-sans"
                />

                <div className="px-3 pb-2.5 pt-1 flex items-center justify-between border-t border-zinc-800/40">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <span className="font-mono">{activeModelMeta.icon} {activeModelMeta.name}</span>
                    <span>•</span>
                    <span>Zero server load (Direct Cloud TPU)</span>
                  </div>

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isSending || !inputMessage.trim()}
                    className="px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-black text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-accent/20"
                  >
                    <span>Send</span>
                    <Send size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Telemetry Modal */}
      {showQuotaModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowQuotaModal(false)}
        >
          <div
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
                  <Activity size={16} />
                </div>
                <h3 className="font-bold text-white text-sm">AI Quotas & Server Health</h3>
              </div>
              <button
                onClick={() => setShowQuotaModal(false)}
                className="text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                <div className="text-[10px] font-bold text-zinc-500 uppercase">Requests Today</div>
                <div className="text-xl font-bold text-white">{statsData?.stats?.todayTotal ?? 0}</div>
                <div className="text-[10px] text-zinc-500">of 1,500 daily quota</div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                <div className="text-[10px] font-bold text-zinc-500 uppercase">TPU Latency</div>
                <div className="text-xl font-bold text-emerald-400">
                  {statsData?.health?.latencyMs ?? 0} ms
                </div>
                <div className="text-[10px] text-zinc-500">Google Cloud Direct</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck size={14} /> Server CPU Impact: 0%
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                All inference is performed externally on Google TPU clusters via REST. Next.js server CPU
                is unaffected even under heavy concurrent generations.
              </p>
            </div>

            <button
              onClick={() => setShowQuotaModal(false)}
              className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
