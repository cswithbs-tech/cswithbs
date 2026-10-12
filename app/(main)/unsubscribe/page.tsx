"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "@/app/components/ui/Container";
import { Button } from "@/app/components/ui/Button";
import { CheckCircle2, AlertCircle, Loader2, MailX, ArrowLeft } from "lucide-react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "You have been unsubscribed.");
      } else {
        setStatus("error");
        setMessage(data.error || data.message || "Failed to unsubscribe. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("A network error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20 px-4">
      <Container className="max-w-md w-full">
        <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl text-center relative overflow-hidden">
          {/* Subtle gold accent glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

          {status === "success" ? (
            <div className="space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-serif font-bold text-white">Unsubscribed</h1>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {message || "You have been successfully removed from our newsletter list. You will no longer receive periodic updates from CSwithBS."}
                </p>
              </div>
              <div className="pt-4 flex flex-col gap-3">
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft size={16} className="mr-2" /> Return to Homepage
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <MailX size={30} />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-serif font-bold text-white">Unsubscribe from Newsletter</h1>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  We're sorry to see you go! Enter your email address below to confirm unsubscription from CSwithBS updates.
                </p>
              </div>

              {status === "error" && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 text-left">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <form onSubmit={handleUnsubscribe} className="space-y-4 text-left">
                <div>
                  <label htmlFor="email" className="block text-xs font-mono text-zinc-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={status === "loading" || !email}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-3 rounded-xl transition-all"
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Unsubscribing...
                    </span>
                  ) : (
                    "Confirm Unsubscribe"
                  )}
                </Button>
              </form>

              <p className="text-xs text-zinc-500">
                Changed your mind?{" "}
                <Link href="/" className="text-amber-400 hover:underline">
                  Stay subscribed
                </Link>
              </p>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
