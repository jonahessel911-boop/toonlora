import { recordAnalyticsEvent } from "@/lib/analytics/recordEvent";
import {
  buildLpFunnelProperties,
  clearActiveLpFunnelId,
  getActiveLpFunnelId,
  lpFunnelDedupeConvert,
  lpFunnelDedupeStart,
  setActiveLpFunnelId,
  type LpFunnelConvertEvent,
} from "@/lib/analytics/lp-funnel";
import type { LP3StepId } from "@/lib/lp3/content";

function gtagLpFunnel(
  eventName: string,
  params: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}

function persistLpFunnelEvent(
  eventType: "lp_funnel_start" | "lp_funnel_step" | "lp_funnel_convert",
  properties: Record<string, string | number | boolean>
) {
  recordAnalyticsEvent({ eventType, properties });
  gtagLpFunnel(eventType, properties);
}

export function trackLpFunnelStart(lpId: string, variant?: string) {
  if (lpFunnelDedupeStart(lpId)) return;

  setActiveLpFunnelId(lpId);
  const properties = buildLpFunnelProperties({ lpId, variant });
  persistLpFunnelEvent("lp_funnel_start", properties);
}

export function trackLpFunnelStepView(
  lpId: string,
  step: LP3StepId,
  variant?: string
) {
  const properties = buildLpFunnelProperties({
    lpId,
    variant,
    step,
    action: "view",
  });
  persistLpFunnelEvent("lp_funnel_step", properties);
}

export function trackLpFunnelStepComplete(
  lpId: string,
  step: LP3StepId,
  variant?: string
) {
  const properties = buildLpFunnelProperties({
    lpId,
    variant,
    step,
    action: "complete",
  });
  persistLpFunnelEvent("lp_funnel_step", properties);
}

export function trackLpFunnelStepBack(
  lpId: string,
  step: LP3StepId,
  variant?: string
) {
  const properties = buildLpFunnelProperties({
    lpId,
    variant,
    step,
    action: "back",
  });
  persistLpFunnelEvent("lp_funnel_step", properties);
}

export function trackLpFunnelConvert(params: {
  lpId: string;
  convertEvent: LpFunnelConvertEvent;
  variant?: string;
  step?: LP3StepId;
  planId?: string;
}) {
  if (lpFunnelDedupeConvert(params.lpId, params.convertEvent)) return;

  const properties = buildLpFunnelProperties({
    lpId: params.lpId,
    variant: params.variant,
    step: params.step ?? "checkout",
    convertEvent: params.convertEvent,
    planId: params.planId,
  });
  persistLpFunnelEvent("lp_funnel_convert", properties);

  if (params.convertEvent === "subscribe") {
    clearActiveLpFunnelId();
  }
}

/** Subscribe conversion attributed to the LP funnel that started this session. */
export function trackLpFunnelSubscribeIfActive(planId?: string) {
  const lpId = getActiveLpFunnelId();
  if (!lpId) return;
  trackLpFunnelConvert({
    lpId,
    convertEvent: "subscribe",
    step: "checkout",
    planId,
  });
}
