import { apiFetch } from "@/lib/session";

export type AnalyticsEventType =
  | "next_episode_click"
  | "checkout_started"
  | "paywall_view"
  | "series_view"
  | "lp_funnel_start"
  | "lp_funnel_step"
  | "lp_funnel_convert";

export interface AnalyticsEventPayload {
  eventType: AnalyticsEventType;
  seriesId?: string;
  episodeNumber?: number;
  planId?: string;
  properties?: Record<string, string | number | boolean>;
}

/** Persist a product analytics event to the database (fire-and-forget). */
export function recordAnalyticsEvent(payload: AnalyticsEventPayload): void {
  if (typeof window === "undefined") return;

  void apiFetch("/api/analytics/event", {
    method: "POST",
    body: JSON.stringify(payload),
  }).catch(() => {
    /* non-blocking */
  });
}
