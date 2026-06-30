import { recordAnalyticsEvent } from "@/lib/analytics/recordEvent";
import {
  ttqTrackInitiateCheckout,
  ttqTrackLogin,
  ttqTrackPaywallView,
  ttqTrackSignup,
  ttqTrackSubscribe,
} from "@/lib/analytics/ttq";
import { trackLpFunnelSubscribeIfActive } from "@/lib/analytics/lp-funnel-tracking";

type GtagParams = Record<string, string | number | boolean | undefined>;

function gtagEvent(eventName: string, params?: GtagParams) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  const cleaned = params
    ? Object.fromEntries(
        Object.entries(params).filter(
          ([, value]) => value !== undefined && value !== ""
        )
      )
    : undefined;

  window.gtag("event", eventName, cleaned);
}

export function trackStoryClick(params: {
  seriesId: string;
  title: string;
  genre: string;
  listSection?: string;
}) {
  gtagEvent("story_click", {
    series_id: params.seriesId,
    story_title: params.title,
    genre: params.genre,
    list_section: params.listSection ?? "unknown",
  });
}

export function trackEpisodeComplete(params: {
  seriesId: string;
  title: string;
  episodeNumber: number;
  totalPanels: number;
  isCatalog: boolean;
}) {
  gtagEvent("episode_complete", {
    series_id: params.seriesId,
    story_title: params.title,
    episode_number: params.episodeNumber,
    panel_count: params.totalPanels,
    is_catalog: params.isCatalog ? 1 : 0,
  });
}

export function trackNextEpisodePromptView(params: {
  seriesId: string;
  title: string;
  episodeNumber: number;
  nextEpisodeNumber: number;
}) {
  gtagEvent("next_episode_prompt_view", {
    series_id: params.seriesId,
    story_title: params.title,
    episode_number: params.episodeNumber,
    next_episode_number: params.nextEpisodeNumber,
  });
}

export function trackNextEpisodeClick(params: {
  seriesId: string;
  title: string;
  episodeNumber: number;
  nextEpisodeNumber: number;
  gate: "open" | "signup" | "subscribe" | "creator" | "lp_funnel";
}) {
  gtagEvent("next_episode_click", {
    series_id: params.seriesId,
    story_title: params.title,
    episode_number: params.episodeNumber,
    next_episode_number: params.nextEpisodeNumber,
    gate: params.gate,
  });
  recordAnalyticsEvent({
    eventType: "next_episode_click",
    seriesId: params.seriesId,
    episodeNumber: params.episodeNumber,
    properties: {
      gate: params.gate,
      next_episode_number: params.nextEpisodeNumber,
    },
  });
}

export function trackSignupFormView(params: {
  formType: "reader_continue" | "register" | "signin";
  seriesId?: string;
  storyTitle?: string;
}) {
  gtagEvent("signup_form_view", {
    form_type: params.formType,
    series_id: params.seriesId,
    story_title: params.storyTitle,
  });
}

export function trackSignUp(params: {
  formType: "reader_continue" | "register";
  seriesId?: string;
}) {
  gtagEvent("sign_up", {
    method: "email",
    form_type: params.formType,
    series_id: params.seriesId,
  });
  ttqTrackSignup({ seriesId: params.seriesId });
}

export function trackLogin() {
  gtagEvent("login", { method: "email" });
  ttqTrackLogin();
}

export function trackPaywallView(params: {
  storyId?: string;
  storyTitle?: string;
  planId?: string;
  variant: "page" | "modal" | "inline_preview" | "lp3" | "lp4" | "lp5";
  episodeNumber?: number;
}) {
  gtagEvent("paywall_view", {
    story_id: params.storyId,
    story_title: params.storyTitle,
    variant: params.variant,
    episode_number: params.episodeNumber,
  });
  recordAnalyticsEvent({
    eventType: "paywall_view",
    seriesId: params.storyId,
    episodeNumber: params.episodeNumber,
    properties: { variant: params.variant },
  });
  ttqTrackPaywallView({
    storyId: params.storyId,
    planId: params.planId,
    variant: params.variant,
  });
}

export function trackPaywallCheckoutClick(params: {
  planId: string;
  planName?: string;
  valueCents?: number;
  storyId?: string;
}) {
  gtagEvent("begin_checkout", {
    currency: "EUR",
    plan_id: params.planId,
    story_id: params.storyId,
  });
  ttqTrackInitiateCheckout({
    planId: params.planId,
    planName: params.planName,
    value: params.valueCents != null ? params.valueCents / 100 : undefined,
    storyId: params.storyId,
  });
}

export function trackSubscribe(params: {
  planId?: string;
  planName?: string;
  valueCents?: number;
  subscriptionId?: string;
}) {
  if (typeof window !== "undefined") {
    try {
      const dedupeKey = params.subscriptionId
        ? `ttq_subscribe_${params.subscriptionId}`
        : "ttq_subscribe_tracked";
      if (sessionStorage.getItem(dedupeKey) === "1") return;
      sessionStorage.setItem(dedupeKey, "1");
    } catch {
      /* private browsing */
    }
  }

  gtagEvent("purchase", {
    currency: "EUR",
    transaction_id: params.subscriptionId ?? params.planId,
    value: params.valueCents != null ? params.valueCents / 100 : undefined,
  });
  ttqTrackSubscribe({
    planId: params.planId,
    planName: params.planName,
    value: params.valueCents != null ? params.valueCents / 100 : undefined,
    subscriptionId: params.subscriptionId,
  });
  trackLpFunnelSubscribeIfActive(params.planId);
}
