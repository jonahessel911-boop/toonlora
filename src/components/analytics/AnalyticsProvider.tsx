"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/lib/session";

const HEARTBEAT_MS = 30_000;

export default function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const lastPath = useRef<string>("");

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const sendHeartbeat = () => {
      void apiFetch("/api/analytics/heartbeat", {
        method: "POST",
        body: JSON.stringify({ path: pathname }),
      });
    };

    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      sendHeartbeat();
    }

    const interval = window.setInterval(sendHeartbeat, HEARTBEAT_MS);

    const onHide = () => {
      void apiFetch("/api/analytics/heartbeat", {
        method: "POST",
        body: JSON.stringify({ path: pathname }),
        keepalive: true,
      });
    };

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") onHide();
    });

    return () => window.clearInterval(interval);
  }, [pathname]);

  return children;
}

export function trackReadingProgress(input: {
  seriesId: string;
  episodeNumber: number;
  panelIndex: number;
  totalPanels: number;
}) {
  void apiFetch("/api/analytics/reading", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
