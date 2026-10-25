"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AnnouncementStatsPage() {
  const router = useRouter();

  useEffect(() => {
    // Stats have been removed to prevent server load
    router.replace("/admin/announcements");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
