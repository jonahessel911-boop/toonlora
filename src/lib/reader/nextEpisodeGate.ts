/** Paywall page after signup or for logged-in non-VIP readers. */
export function buildPaywallPath(
  seriesId: string,
  nextEpisode = 2,
  storyTitle?: string
): string {
  const params = new URLSearchParams({
    storyId: seriesId,
    ep: String(nextEpisode),
  });
  if (storyTitle) {
    params.set("storyTitle", storyTitle);
  }
  return `/subscribe?${params.toString()}`;
}

/** Signup page from the next-episode card in the reader. */
export function buildReaderSignupPath(
  seriesId: string,
  storyTitle: string,
  fromEpisode = 1
): string {
  const nextEpisode = fromEpisode + 1;
  const paywallPath = buildPaywallPath(seriesId, nextEpisode, storyTitle);
  const params = new URLSearchParams({
    storyId: seriesId,
    storyTitle,
    ep: String(nextEpisode),
    returnTo: paywallPath,
  });
  return `/signup/continue?${params.toString()}`;
}

export function buildAuthHref(
  path: "/signup/register" | "/signin",
  returnTo: string
): string {
  return `${path}?returnTo=${encodeURIComponent(returnTo)}`;
}

export function sanitizeReturnTo(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }
  return value;
}
