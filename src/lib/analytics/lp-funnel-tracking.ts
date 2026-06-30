import { recordAnalyticsEvent } from "@/lib/analytics/recordEvent";
import {
  buildLpFunnelProperties,
  clearActiveLpFunnelId,
  getActiveLpFunnel,
  lpFunnelDedupeClick,
  lpFunnelDedupeConvert,
  lpFunnelDedupeStart,
  LP_FUNNEL_CLICK_TARGETS,
  setActiveLpFunnel,
  type ActiveLpFunnelSession,
  type LpFunnelConvertEvent,
} from "@/lib/analytics/lp-funnel";
import type { LpLanderContext } from "@/lib/lp/landerAngles";

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

function landerToSession(lander: LpLanderContext): ActiveLpFunnelSession {
  return {
    lpId: lander.lpId,
    angleId: lander.angleId,
    angleLabel: lander.angleLabel,
    reportKey: lander.reportKey,
  };
}

function funnelProps(
  lander: LpLanderContext,
  extra: Omit<
    Parameters<typeof buildLpFunnelProperties>[0],
    "lpId" | "angleId" | "angleLabel" | "reportKey"
  >
) {
  return buildLpFunnelProperties({
    ...extra,
    lpId: lander.lpId,
    angleId: lander.angleId,
    angleLabel: lander.angleLabel,
    reportKey: lander.reportKey,
  });
}

function landerFromActiveSession(): LpLanderContext | null {
  const active = getActiveLpFunnel();
  if (!active) return null;
  return {
    lpId: active.lpId,
    angleId: active.angleId,
    angleLabel: active.angleLabel ?? active.angleId,
    reportKey: active.reportKey,
  };
}

export function trackLpFunnelStart(
  lander: LpLanderContext,
  variant?: string
) {
  if (lpFunnelDedupeStart(lander.reportKey)) return;

  setActiveLpFunnel(landerToSession(lander));
  persistLpFunnelEvent(
    "lp_funnel_start",
    funnelProps(lander, { variant })
  );
}

export function trackLpFunnelStepView(
  lander: LpLanderContext,
  step: string,
  variant?: string
) {
  persistLpFunnelEvent(
    "lp_funnel_step",
    funnelProps(lander, { variant, step, action: "view" })
  );
}

export function trackLpFunnelStepComplete(
  lander: LpLanderContext,
  step: string,
  variant?: string
) {
  persistLpFunnelEvent(
    "lp_funnel_step",
    funnelProps(lander, { variant, step, action: "complete" })
  );
}

export function trackLpFunnelStepBack(
  lander: LpLanderContext,
  step: string,
  variant?: string
) {
  persistLpFunnelEvent(
    "lp_funnel_step",
    funnelProps(lander, { variant, step, action: "back" })
  );
}

/** Unique click on a funnel CTA (deduped per session). */
export function trackLpFunnelStepClick(
  lander: LpLanderContext,
  step: string,
  clickTarget: string,
  variant?: string
) {
  if (lpFunnelDedupeClick(lander.reportKey, clickTarget)) return;

  persistLpFunnelEvent(
    "lp_funnel_step",
    funnelProps(lander, {
      variant,
      step,
      action: "click",
      clickTarget,
    })
  );
}

export function trackLpFunnelChapter2UnlockClick(variant = "lp5") {
  const lander = landerFromActiveSession();
  if (!lander) return;
  trackLpFunnelStepClick(
    lander,
    "read",
    LP_FUNNEL_CLICK_TARGETS.chapter2Unlock,
    variant
  );
}

export function trackLpFunnelConvert(params: {
  lander: LpLanderContext;
  convertEvent: LpFunnelConvertEvent;
  variant?: string;
  step?: string;
  planId?: string;
}) {
  if (lpFunnelDedupeConvert(params.lander.reportKey, params.convertEvent)) {
    return;
  }

  persistLpFunnelEvent(
    "lp_funnel_convert",
    funnelProps(params.lander, {
      variant: params.variant,
      step: params.step ?? "checkout",
      convertEvent: params.convertEvent,
      planId: params.planId,
    })
  );

  if (params.convertEvent === "subscribe") {
    clearActiveLpFunnelId();
  }
}

/** Subscribe conversion attributed to the LP funnel that started this session. */
export function trackLpFunnelSubscribeIfActive(planId?: string) {
  const active = getActiveLpFunnel();
  if (!active) return;
  trackLpFunnelConvert({
    lander: {
      lpId: active.lpId,
      angleId: active.angleId,
      angleLabel: active.angleLabel ?? active.angleId,
      reportKey: active.reportKey,
    },
    convertEvent: "subscribe",
    step: "checkout",
    planId,
  });
}
