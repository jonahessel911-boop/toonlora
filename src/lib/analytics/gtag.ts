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
  gate: "open" | "signup" | "subscribe" | "creator";
}) {
  gtagEvent("next_episode_click", {
    series_id: params.seriesId,
    story_title: params.title,
    episode_number: params.episodeNumber,
    next_episode_number: params.nextEpisodeNumber,
    gate: params.gate,
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
}

export function trackLogin() {
  gtagEvent("login", { method: "email" });
}

export function trackPaywallView(params: {
  storyId?: string;
  storyTitle?: string;
  variant: "page" | "modal";
  episodeNumber?: number;
}) {
  gtagEvent("paywall_view", {
    story_id: params.storyId,
    story_title: params.storyTitle,
    variant: params.variant,
    episode_number: params.episodeNumber,
  });
}

export function trackPaywallCheckoutClick(params: {
  planId: string;
  storyId?: string;
}) {
  gtagEvent("begin_checkout", {
    currency: "EUR",
    plan_id: params.planId,
    story_id: params.storyId,
  });
}
