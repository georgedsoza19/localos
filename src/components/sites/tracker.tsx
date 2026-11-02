"use client";

import { useEffect } from "react";

const KEY = "localos_vid";

export function getVisitorId() {
  if (typeof window === "undefined") return "";
  let v = localStorage.getItem(KEY);
  if (!v) {
    v = `vid_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    localStorage.setItem(KEY, v);
  }
  return v;
}

export function JourneyTracker({
  orgSlug,
  storeSlug,
}: {
  orgSlug: string;
  storeSlug?: string;
}) {
  useEffect(() => {
    const visitorId = getVisitorId();
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgSlug,
        storeSlug,
        visitorId,
        eventType: "page_view",
        pagePath: window.location.pathname,
      }),
    }).catch(() => null);
  }, [orgSlug, storeSlug]);

  return null;
}
