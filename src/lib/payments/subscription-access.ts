import type { SubscriptionTierId } from "@/lib/payments/subscription-plans";
import { isPaidTier } from "@/lib/payments/subscription-plans";

/** Days Entrepreneur subscribers get early access before public release. */
export const EARLY_ACCESS_DAYS = 7;

export function getIsoWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** When an episode becomes readable on the public (Achiever / Free) schedule. */
export function getEpisodePublicReleaseAt(publishedAt: string | Date | null | undefined): Date {
  if (!publishedAt) return new Date(0);
  return new Date(publishedAt);
}

/** Entrepreneur early-access window opens EARLY_ACCESS_DAYS before public release. */
export function getEpisodeEarlyAccessAt(publicReleaseAt: Date): Date {
  return addDays(publicReleaseAt, -EARLY_ACCESS_DAYS);
}

export function isEpisodeReleasedForTier(
  tier: SubscriptionTierId,
  publicReleaseAt: Date,
  now = new Date()
): boolean {
  if (tier === "entrepreneur") {
    return now >= getEpisodeEarlyAccessAt(publicReleaseAt);
  }
  return now >= publicReleaseAt;
}

export type EpisodeAccessDenyReason =
  | "not_released"
  | "weekly_free_used"
  | "subscription_required";

export interface EpisodeAccessInput {
  tier: SubscriptionTierId;
  episodeNumber: number;
  publicReleaseAt: Date;
  weeklyFreeUsedThisWeek: boolean;
  now?: Date;
}

export function evaluateEpisodeAccess(input: EpisodeAccessInput): {
  allowed: boolean;
  reason?: EpisodeAccessDenyReason;
} {
  const now = input.now ?? new Date();

  if (!isEpisodeReleasedForTier(input.tier, input.publicReleaseAt, now)) {
    return { allowed: false, reason: "not_released" };
  }

  if (isPaidTier(input.tier)) {
    return { allowed: true };
  }

  if (input.weeklyFreeUsedThisWeek) {
    return { allowed: false, reason: "weekly_free_used" };
  }

  return { allowed: true };
}
