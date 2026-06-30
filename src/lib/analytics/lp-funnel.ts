import {
  LP3_PROGRESS_STEPS,
  LP4_PROGRESS_STEPS,
  type LP3StepId,
} from "@/lib/lp3/content";

export function lpProgressSteps(variant: "lp3" | "lp4"): LP3StepId[] {
  return variant === "lp4" ? LP4_PROGRESS_STEPS : LP3_PROGRESS_STEPS;
}

export const LP5_FUNNEL_STEPS = ["intro", "read", "checkout"] as const;

/** Canonical step order per `/lp/{n}` for admin funnel reporting. */
export function lpFunnelStepsForLpId(lpId: string): string[] {
  if (lpId === "5") return [...LP5_FUNNEL_STEPS];
  if (lpId === "4") return ["intro", ...LP4_PROGRESS_STEPS];
  return ["intro", ...LP3_PROGRESS_STEPS];
}

export const LP_FUNNEL_STEP_LABELS: Record<string, string> = {
  intro: "Intro",
  storyWhy: "Why this story?",
  categories: "Categories",
  stories: "Story picks",
  time: "Chapter length",
  feel: "How you want to feel",
  habit: "When you read",
  depth: "What you want most",
  quiz: "Quiz 1",
  quiz2: "Quiz 2",
  reveal: "Story reveal",
  stat: "Reader stat",
  profile: "Your profile",
  journey: "Your plan",
  loading: "Building plan",
  checkout: "Checkout",
  read: "Read chapter 1",
};

export type LpFunnelConvertEvent =
  | "checkout_start"
  | "payment_submit"
  | "subscribe";

export const LP_FUNNEL_ACTIVE_KEY = "toonlora-lp-funnel-active";
/** @deprecated Use {@link LP_FUNNEL_ACTIVE_KEY} with full session payload. */
export const LP_FUNNEL_ACTIVE_ID_KEY = "toonlora-lp-funnel-active-id";

export interface ActiveLpFunnelSession {
  lpId: string;
  angleId: string;
  angleLabel?: string;
  reportKey: string;
}

export function parseLpNumberFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/lp\/(\d+)(?:\/|$)/);
  return match?.[1] ?? null;
}

export function lpFunnelStepIndexForLp(lpId: string, step: string): number {
  const order = lpFunnelStepsForLpId(lpId);
  const idx = order.indexOf(step);
  return idx >= 0 ? idx : order.length;
}

/** @deprecated Prefer {@link lpFunnelStepIndexForLp} with lpId. */
export function lpFunnelStepIndex(step: string): number {
  return lpFunnelStepIndexForLp("3", step);
}

export function humanizeLpFunnelStep(step: string): string {
  if (LP_FUNNEL_STEP_LABELS[step]) return LP_FUNNEL_STEP_LABELS[step];
  return step
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getActiveLpFunnel(): ActiveLpFunnelSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LP_FUNNEL_ACTIVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ActiveLpFunnelSession;
      if (parsed?.lpId && parsed?.angleId && parsed?.reportKey) {
        return parsed;
      }
    }
    const legacyId = sessionStorage.getItem(LP_FUNNEL_ACTIVE_ID_KEY);
    if (legacyId) {
      return {
        lpId: legacyId,
        angleId: "default",
        reportKey: legacyId,
      };
    }
  } catch {
    return null;
  }
  return null;
}

/** @deprecated Use {@link getActiveLpFunnel}. */
export function getActiveLpFunnelId(): string | null {
  return getActiveLpFunnel()?.lpId ?? null;
}

export function setActiveLpFunnel(session: ActiveLpFunnelSession): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(LP_FUNNEL_ACTIVE_KEY, JSON.stringify(session));
    sessionStorage.setItem(LP_FUNNEL_ACTIVE_ID_KEY, session.lpId);
  } catch {
    /* private browsing */
  }
}

/** @deprecated Use {@link setActiveLpFunnel}. */
export function setActiveLpFunnelId(lpId: string): void {
  setActiveLpFunnel({
    lpId,
    angleId: "default",
    reportKey: lpId,
  });
}

export function clearActiveLpFunnelId(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(LP_FUNNEL_ACTIVE_KEY);
    sessionStorage.removeItem(LP_FUNNEL_ACTIVE_ID_KEY);
  } catch {
    /* private browsing */
  }
}

function dedupeSessionKey(reportKey: string, kind: string, step?: string): string {
  return `lp-funnel-${reportKey}-${kind}${step ? `-${step}` : ""}`;
}

function shouldSkipDedupe(key: string): boolean {
  try {
    if (sessionStorage.getItem(key) === "1") return true;
    sessionStorage.setItem(key, "1");
  } catch {
    return false;
  }
  return false;
}

export function buildLpFunnelProperties(params: {
  lpId: string;
  angleId?: string;
  angleLabel?: string;
  reportKey?: string;
  variant?: string;
  step?: string;
  action?: "view" | "complete" | "back" | "click";
  convertEvent?: LpFunnelConvertEvent;
  planId?: string;
  clickTarget?: string;
}): Record<string, string | number | boolean> {
  const properties: Record<string, string | number | boolean> = {
    lp_id: params.lpId,
  };
  if (params.angleId) properties.lp_angle_id = params.angleId;
  if (params.angleLabel) properties.lp_angle_label = params.angleLabel;
  if (params.reportKey) properties.lp_report_key = params.reportKey;
  if (params.variant) properties.variant = params.variant;
  if (params.step) {
    properties.step = params.step;
    properties.step_index = lpFunnelStepIndexForLp(params.lpId, params.step);
  }
  if (params.action) properties.action = params.action;
  if (params.clickTarget) properties.click_target = params.clickTarget;
  if (params.convertEvent) properties.convert_event = params.convertEvent;
  if (params.planId) properties.plan_id = params.planId;
  return properties;
}

export function lpFunnelDedupeView(reportKey: string, step: string): boolean {
  return shouldSkipDedupe(dedupeSessionKey(reportKey, "view", step));
}

export function lpFunnelDedupeStart(reportKey: string): boolean {
  return shouldSkipDedupe(dedupeSessionKey(reportKey, "start"));
}

export function lpFunnelDedupeConvert(
  reportKey: string,
  convertEvent: LpFunnelConvertEvent
): boolean {
  return shouldSkipDedupe(dedupeSessionKey(reportKey, `convert-${convertEvent}`));
}

export function lpFunnelDedupeClick(
  reportKey: string,
  clickTarget: string
): boolean {
  return shouldSkipDedupe(dedupeSessionKey(reportKey, `click-${clickTarget}`));
}

/** LP/5 (and other funnels) click targets stored on `lp_funnel_step` events. */
export const LP_FUNNEL_CLICK_TARGETS = {
  introCta: "intro_cta",
  chapter2Unlock: "chapter2_unlock",
} as const;
