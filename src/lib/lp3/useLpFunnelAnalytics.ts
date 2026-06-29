"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { parseLpNumberFromPath } from "@/lib/analytics/lp-funnel";
import { trackLpFunnelStart, trackLpFunnelStepView } from "@/lib/analytics/lp-funnel-tracking";
import type { LP3StepId } from "@/lib/lp3/content";

export function useLpFunnelId(variant: "lp3" | "lp4"): string {
  const pathname = usePathname();
  return parseLpNumberFromPath(pathname) ?? (variant === "lp4" ? "4" : "3");
}

/** Records funnel start + per-step views for /lp/{n} drop-off analytics. */
export function useLpFunnelStepAnalytics(
  lpId: string,
  variant: "lp3" | "lp4",
  step: LP3StepId
) {
  const startedRef = useRef(false);

  useEffect(() => {
    if (!lpId) return;
    if (startedRef.current) return;
    startedRef.current = true;
    trackLpFunnelStart(lpId, variant);
  }, [lpId, variant]);

  useEffect(() => {
    if (!lpId) return;
    trackLpFunnelStepView(lpId, step, variant);
  }, [lpId, step, variant]);
}
