"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function ClientTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Generate or retrieve visitor ID
    let visitorId = localStorage.getItem("cswithbs_visitor_id");
    if (!visitorId) {
      // Use crypto.randomUUID if available, else fallback
      visitorId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `v_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("cswithbs_visitor_id", visitorId);
    }

    // Debounce or just fire? Fire once per navigation.
    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    // Send hit to API
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: url,
        referrer: document.referrer,
        visitorId: visitorId,
      }),
    }).catch((err) => console.error("Tracking error:", err));
  }, [pathname, searchParams]);

  return null;
}
