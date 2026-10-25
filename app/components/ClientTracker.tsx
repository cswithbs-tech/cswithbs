"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function ClientTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 0. Ignore admin and writers-hub routes completely
    if (
      !pathname ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/writers-hub") ||
      pathname.startsWith("/api")
    ) {
      return;
    }

    // 1. Generate or retrieve persistent visitor ID
    let visitorId = localStorage.getItem("cswithbs_visitor_id");
    if (!visitorId) {
      visitorId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `v_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("cswithbs_visitor_id", visitorId);
    }

    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    // 2. Throttle duplicate hits for the same URL in the same session (2 minutes cooldown)
    try {
      const cacheKey = `cswithbs_trk_${url}`;
      const lastTracked = sessionStorage.getItem(cacheKey);
      const now = Date.now();
      if (lastTracked && now - parseInt(lastTracked, 10) < 120000) {
        return;
      }
      sessionStorage.setItem(cacheKey, now.toString());
    } catch (e) {
      // Ignore storage errors in private browsing
    }

    // 3. Send lightweight hit to API
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: url,
        referrer: document.referrer,
        visitorId: visitorId,
      }),
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}
