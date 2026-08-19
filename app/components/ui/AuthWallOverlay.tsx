"use client";

import React from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "./Button";

interface AuthWallOverlayProps {
  title?: string;
  message?: string;
}

export function AuthWallOverlay({
  title = "Unlock Full Access",
  message = "Join CSWITHBS for free to unlock this full lesson, track your progress, and access premium resources.",
}: AuthWallOverlayProps) {
  return (
    <div className="relative mt-8">
      {/* Blurred fade effect for the content above this (optional visual trick) */}
      <div className="absolute -top-32 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 md:p-12 text-center backdrop-blur-md relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10">
            <Lock className="w-8 h-8 text-accent" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-3">
            {title}
          </h3>
          
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row w-full gap-3">
            <Link href="/signup" className="flex-1">
              <Button variant="primary" className="w-full bg-accent text-black hover:bg-accent/90">
                Create Free Account
              </Button>
            </Link>
            <Link href="/login" className="flex-1">
              <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
