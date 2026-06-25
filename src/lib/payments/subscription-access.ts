import type { SubscriptionTierId } from "@/lib/payments/subscription-plans";
import { isPaidTier } from "@/lib/payments/subscription-plans";

/** Days Entrepreneur subscribers get early access before public release. */
export const EARLY_ACCESS_DAYS = 7;

/** Days until the free extra-chapter read resets after it is claimed. */
export const WEEKLY_FREE_RESET_DAYS = 7;

export const WEEKLY_FREE_RESET_MS = WEEKLY_FREE_RESET_DAYS * 24 * 60 * 60 * 1000;

/** @deprecated Calendar-week keys — use claim `claimedAt` + {@link WEEKLY_FREE_RESET_DAYS} instead. */
export function getIsoWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** When the current weekly free claim expires (claimedAt + 7 days). */
export function getWeeklyFreeResetAt(claimedAt: string | Date): Date {
  const claimed =
    typeof claimedAt === "string" ? new Date(claimedAt) : claimedAt;
  return new Date(claimed.getTime() + WEEKLY_FREE_RESET_MS);
}

export function msUntilWeeklyFreeResetFromClaim(
  claimedAt: string | null | undefined,
  now = new Date()
): number {
  if (!claimedAt) return 0;
  return Math.max(0, getWeeklyFreeResetAt(claimedAt).getTime() - now.getTime());
}

/** @deprecated Use {@link msUntilWeeklyFreeResetFromClaim} with the user's claim timestamp. */
export function getNextWeeklyFreeResetAt(now = new Date()): Date {
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const isoDay = today.getUTCDay() || 7;
  const daysUntilNextMonday = 8 - isoDay;
  const reset = new Date(today);
  reset.setUTCDate(reset.getUTCDate() + daysUntilNextMonday);
  reset.setUTCHours(0, 0, 0, 0);
  return reset;
}

export function msUntilWeeklyFreeReset(
  claimedAt?: string | null,
  now = new Date()
): number {
  if (claimedAt) {
    return msUntilWeeklyFreeResetFromClaim(claimedAt, now);
  }
  return Math.max(0, getNextWeeklyFreeResetAt(now).getTime() - now.getTime());
}

/** Human-readable countdown, e.g. "5d 12h" or "45m". */
export function formatWeeklyResetCountdown(ms: number): string {
  if (ms <= 0) return "0m";

  const totalMinutes = Math.floor(ms / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
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
  | "subscription_required"
  | "signup_required";

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

  /** Chapter 1 is free on every story — never counts against the weekly extra chapter. */
  if (input.episodeNumber <= 1) {
    return { allowed: true };
  }

  if (input.weeklyFreeUsedThisWeek) {
    return { allowed: false, reason: "weekly_free_used" };
  }

  return { allowed: true };
}
