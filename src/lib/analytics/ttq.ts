import { buildSubscribeEventId } from "@/lib/analytics/tiktok-event-ids";
import {
  TIKTOK_CONTENT_TYPE,
  buildTikTokContents,
} from "@/lib/analytics/tiktok-content";

declare global {
  interface Window {
    ttq?: {
      (...args: unknown[]): void;
      track?: (event: string, params?: Record<string, unknown>) => void;
      page?: () => void;
    };
  }
}

function ttqTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.ttq !== "function") return;

  const cleaned = params
    ? Object.fromEntries(
        Object.entries(params).filter(
          ([, value]) => value !== undefined && value !== ""
        )
      )
    : undefined;

  if (cleaned && Object.keys(cleaned).length > 0) {
    window.ttq.track?.(event, cleaned);
    return;
  }

  window.ttq.track?.(event);
}

export function ttqPageView() {
  if (typeof window === "undefined" || typeof window.ttq !== "function") return;
  window.ttq.page?.();
}

export function ttqTrackSignup(params?: { seriesId?: string }) {
  ttqTrack("CompleteRegistration", {
    content_type: TIKTOK_CONTENT_TYPE,
    content_id: params?.seriesId ?? "signup",
    content_name: "Toonlora account",
  });
}

export function ttqTrackLogin() {
  ttqTrack("Login");
}

export function ttqTrackPaywallView(params?: {
  storyId?: string;
  planId?: string;
  variant?: string;
}) {
  const contentId = params?.planId ?? params?.storyId ?? "paywall";
  ttqTrack("ViewContent", {
    content_type: TIKTOK_CONTENT_TYPE,
    content_id: contentId,
    content_name: params?.variant ? `paywall_${params.variant}` : "paywall",
    currency: "EUR",
  });
}

export function ttqTrackInitiateCheckout(params: {
  planId: string;
  planName?: string;
  value?: number;
  storyId?: string;
}) {
  ttqTrack("InitiateCheckout", {
    content_type: TIKTOK_CONTENT_TYPE,
    content_id: params.planId,
    content_name: params.planName ?? params.planId,
    currency: "EUR",
    value: params.value,
    contents: buildTikTokContents({
      contentId: params.planId,
      contentName: params.planName ?? params.planId,
      price: params.value,
    }),
  });
}

export function ttqTrackSubscribe(params?: {
  planId?: string;
  planName?: string;
  value?: number;
  subscriptionId?: string;
}) {
  const eventId = params?.subscriptionId
    ? buildSubscribeEventId(params.subscriptionId)
    : undefined;
  const contentId = params?.planId ?? "subscription";

  ttqTrack("Subscribe", {
    content_type: TIKTOK_CONTENT_TYPE,
    content_id: contentId,
    content_name: params?.planName ?? contentId,
    currency: "EUR",
    value: params?.value,
    event_id: eventId,
    contents: buildTikTokContents({
      contentId,
      contentName: params?.planName ?? contentId,
      price: params?.value,
    }),
  });
}
