"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { parseLpNumberFromPath } from "@/lib/analytics/lp-funnel";
import { trackLpFunnelStart, trackLpFunnelStepView } from "@/lib/analytics/lp-funnel-tracking";
import { useLpLanderContext } from "@/lib/lp/useLpLanderContext";

export function useLpFunnelId(variant: "lp3" | "lp4" | "lp5" | "lp6"): string {
  const pathname = usePathname();
  if (variant === "lp4") return parseLpNumberFromPath(pathname) ?? "4";
  if (variant === "lp5") return parseLpNumberFromPath(pathname) ?? "5";
  if (variant === "lp6") return parseLpNumberFromPath(pathname) ?? "6";
  return parseLpNumberFromPath(pathname) ?? "3";
}

/** Records funnel start + per-step views for /lp/{n} drop-off analytics. */
export function useLpFunnelStepAnalytics(
  variant: "lp3" | "lp4" | "lp5" | "lp6",
  step: string
) {
  const lpId = useLpFunnelId(variant);
  const lander = useLpLanderContext(lpId);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!lander.reportKey) return;
    if (startedRef.current) return;
    startedRef.current = true;
    trackLpFunnelStart(lander, variant);
  }, [lander, variant]);

  useEffect(() => {
    if (!lander.reportKey) return;
    trackLpFunnelStepView(lander, step, variant);
  }, [lander, step, variant]);
}
