import type { LP3StepId } from "@/lib/lp3/content";
import { LP3_PROGRESS_STEPS } from "@/lib/lp3/content";

export const LP_FUNNEL_ACTIVE_ID_KEY = "toonlora-lp-funnel-active-id";

/** Ordered funnel steps for drop-off reporting (intro → checkout). */
export const LP_FUNNEL_STEP_ORDER: LP3StepId[] = ["intro", ...LP3_PROGRESS_STEPS];

export type LpFunnelConvertEvent =
  | "checkout_start"
  | "payment_submit"
  | "subscribe";

export function parseLpNumberFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/lp\/(\d+)(?:\/|$)/);
  return match?.[1] ?? null;
}

export function lpFunnelStepIndex(step: LP3StepId): number {
  const index = LP_FUNNEL_STEP_ORDER.indexOf(step);
  return index >= 0 ? index : 0;
}

export function humanizeLpFunnelStep(step: string): string {
  return step
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getActiveLpFunnelId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(LP_FUNNEL_ACTIVE_ID_KEY);
  } catch {
    return null;
  }
}

export function setActiveLpFunnelId(lpId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(LP_FUNNEL_ACTIVE_ID_KEY, lpId);
  } catch {
    /* private browsing */
  }
}

export function clearActiveLpFunnelId(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(LP_FUNNEL_ACTIVE_ID_KEY);
  } catch {
    /* private browsing */
  }
}

function dedupeSessionKey(lpId: string, kind: string, step?: string): string {
  return `lp-funnel-${lpId}-${kind}${step ? `-${step}` : ""}`;
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
  variant?: string;
  step?: LP3StepId;
  action?: "view" | "complete" | "back";
  convertEvent?: LpFunnelConvertEvent;
  planId?: string;
}): Record<string, string | number | boolean> {
  const properties: Record<string, string | number | boolean> = {
    lp_id: params.lpId,
  };
  if (params.variant) properties.variant = params.variant;
  if (params.step) {
    properties.step = params.step;
    properties.step_index = lpFunnelStepIndex(params.step);
  }
  if (params.action) properties.action = params.action;
  if (params.convertEvent) properties.convert_event = params.convertEvent;
  if (params.planId) properties.plan_id = params.planId;
  return properties;
}

export function lpFunnelDedupeView(lpId: string, step: LP3StepId): boolean {
  return shouldSkipDedupe(dedupeSessionKey(lpId, "view", step));
}

export function lpFunnelDedupeStart(lpId: string): boolean {
  return shouldSkipDedupe(dedupeSessionKey(lpId, "start"));
}

export function lpFunnelDedupeConvert(
  lpId: string,
  convertEvent: LpFunnelConvertEvent
): boolean {
  return shouldSkipDedupe(dedupeSessionKey(lpId, `convert-${convertEvent}`));
}
