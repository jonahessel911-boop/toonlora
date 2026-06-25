import { STORAGE_KEYS } from "@/lib/constants";
import { apiFetch } from "@/lib/session";
import type { SubscriptionTierId } from "@/lib/payments/subscription-plans";

export interface EpisodeAccessResult {
  allowed: boolean;
  tier: SubscriptionTierId;
  isRegistered?: boolean;
  reason?: "not_released" | "weekly_free_used" | "subscription_required" | "signup_required";
  weeklyFreeRemaining: number;
  claimedThisWeek: {
    seriesId: string;
    episodeNumber: number;
    claimedAt: string;
  } | null;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function buildSubscribePath(
  seriesId: string,
  episodeNumber: number,
  storyTitle?: string
): string {
  const params = new URLSearchParams({
    storyId: seriesId,
    ep: String(episodeNumber),
  });
  if (storyTitle) params.set("storyTitle", storyTitle);
  return `/subscribe?${params.toString()}`;
}

export async function checkEpisodeReadAccess(
  seriesId: string,
  episodeNumber: number,
  publishedAt?: string | null
): Promise<EpisodeAccessResult> {
  if (!isBrowser()) {
    return {
      allowed: true,
      tier: "free",
      weeklyFreeRemaining: 1,
      claimedThisWeek: null,
    };
  }

  try {
    const params = new URLSearchParams({
      seriesId,
      episodeNumber: String(episodeNumber),
    });
    if (publishedAt) params.set("publishedAt", publishedAt);

    const res = await apiFetch(`/api/reader/episode-access?${params.toString()}`);
    const data = (await res.json()) as EpisodeAccessResult;
    return data;
  } catch {
    return {
      allowed: episodeNumber === 1,
      tier: "free",
      weeklyFreeRemaining: 1,
      claimedThisWeek: null,
    };
  }
}

export async function claimEpisodeRead(
  seriesId: string,
  episodeNumber: number
): Promise<boolean> {
  try {
    const res = await apiFetch("/api/reader/episode-access", {
      method: "POST",
      body: JSON.stringify({ seriesId, episodeNumber }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** @deprecated Use checkEpisodeReadAccess */
export async function checkFreeEpisodeAccess(
  seriesId: string,
  episodeNumber: number
): Promise<{ allowed: boolean; claimedSeriesId: string | null }> {
  const result = await checkEpisodeReadAccess(seriesId, episodeNumber);
  return {
    allowed: result.allowed,
    claimedSeriesId: result.claimedThisWeek?.seriesId ?? null,
  };
}

export function buildFreeEpisodeLimitSignupPath(
  seriesId: string,
  storyTitle: string
): string {
  const returnTo = `/story/${seriesId}/read`;
  const params = new URLSearchParams({
    storyId: seriesId,
    storyTitle,
    reason: "free_episode_used",
    returnTo,
  });
  return `/signup/continue?${params.toString()}`;
}

export function getCachedFreeReadSeriesId(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(STORAGE_KEYS.freeReadSeriesId);
}

export function setCachedFreeReadSeriesId(seriesId: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.freeReadSeriesId, seriesId);
}
