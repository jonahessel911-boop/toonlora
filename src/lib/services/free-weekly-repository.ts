import {
  evaluateEpisodeAccess,
  getEpisodePublicReleaseAt,
  getWeeklyFreeResetAt,
  isEpisodeReleasedForTier,
  type EpisodeAccessDenyReason,
} from "@/lib/payments/subscription-access";
import {
  getPlanTier,
  isPaidTier,
  type SubscriptionTierId,
} from "@/lib/payments/subscription-plans";
import { getProfileBySessionFromDb } from "@/lib/services/profile-repository";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ensureSession } from "@/lib/services/story-repository";
import {
  getSubscriptionFromDb,
  isActiveSubscription,
} from "@/lib/services/subscription-repository";

export interface WeeklyFreeClaim {
  seriesId: string;
  episodeNumber: number;
  claimedAt: string;
}

export interface EpisodeAccessResult {
  allowed: boolean;
  tier: SubscriptionTierId;
  isRegistered: boolean;
  reason?: EpisodeAccessDenyReason;
  weeklyFreeRemaining: number;
  claimedThisWeek: WeeklyFreeClaim | null;
  /** ISO timestamp when the active weekly claim resets (claimedAt + 7 days). */
  weeklyFreeResetsAt: string | null;
}

function parseClaim(raw: unknown): WeeklyFreeClaim | null {
  if (!raw || typeof raw !== "object") return null;
  const claim = raw as WeeklyFreeClaim;
  if (!claim.seriesId || !claim.episodeNumber || !claim.claimedAt) return null;
  return claim;
}

function isActiveWeeklyClaim(
  claim: WeeklyFreeClaim | null,
  now = new Date()
): claim is WeeklyFreeClaim {
  if (!claim?.claimedAt) return false;
  return now < getWeeklyFreeResetAt(claim.claimedAt);
}

export async function resolveUserTier(sessionId: string): Promise<SubscriptionTierId> {
  const record = await getSubscriptionFromDb(sessionId);
  if (!isActiveSubscription(record)) return "free";
  return getPlanTier(record.planId);
}

function resolveGuestEpisodeAccess(
  episodeNumber: number,
  publicReleaseAt: Date
): EpisodeAccessResult {
  if (episodeNumber > 1) {
    return {
      allowed: false,
      tier: "free",
      isRegistered: false,
      reason: "signup_required",
      weeklyFreeRemaining: 1,
      claimedThisWeek: null,
      weeklyFreeResetsAt: null,
    };
  }

  if (!isEpisodeReleasedForTier("free", publicReleaseAt)) {
    return {
      allowed: false,
      tier: "free",
      isRegistered: false,
      reason: "not_released",
      weeklyFreeRemaining: 1,
      claimedThisWeek: null,
      weeklyFreeResetsAt: null,
    };
  }

  return {
    allowed: true,
    tier: "free",
    isRegistered: false,
    weeklyFreeRemaining: 1,
    claimedThisWeek: null,
    weeklyFreeResetsAt: null,
  };
}

export async function resolveEpisodeAccess(
  sessionId: string,
  seriesId: string,
  episodeNumber: number,
  episodePublishedAt?: string | null
): Promise<EpisodeAccessResult> {
  const tier = await resolveUserTier(sessionId);
  const publicReleaseAt = getEpisodePublicReleaseAt(episodePublishedAt);
  const profile = await getProfileBySessionFromDb(sessionId);
  const isRegistered = Boolean(profile);

  if (isPaidTier(tier)) {
    const allowed = evaluateEpisodeAccess({
      tier,
      episodeNumber,
      publicReleaseAt,
      weeklyFreeUsedThisWeek: false,
    }).allowed;

    return {
      allowed,
      tier,
      isRegistered,
      reason: allowed ? undefined : "not_released",
      weeklyFreeRemaining: 0,
      claimedThisWeek: null,
      weeklyFreeResetsAt: null,
    };
  }

  if (!isRegistered) {
    return resolveGuestEpisodeAccess(episodeNumber, publicReleaseAt);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    const result = evaluateEpisodeAccess({
      tier,
      episodeNumber,
      publicReleaseAt,
      weeklyFreeUsedThisWeek: false,
    });
    return {
      allowed: result.allowed,
      tier,
      isRegistered: true,
      reason: result.reason,
      weeklyFreeRemaining: episodeNumber <= 1 ? 1 : result.allowed ? 0 : 1,
      claimedThisWeek: null,
      weeklyFreeResetsAt: null,
    };
  }

  await ensureSession(sessionId);

  const { data } = await supabase
    .from("user_sessions")
    .select("free_episode_claim")
    .eq("session_id", sessionId)
    .maybeSingle();

  let storedClaim = parseClaim(data?.free_episode_claim);

  // Legacy bug: chapter 1 reads were incorrectly stored as the weekly claim.
  if (storedClaim && storedClaim.episodeNumber <= 1) {
    storedClaim = null;
    await supabase
      .from("user_sessions")
      .update({ free_episode_week: null, free_episode_claim: null })
      .eq("session_id", sessionId);
  }

  const activeClaim = isActiveWeeklyClaim(storedClaim) ? storedClaim : null;
  const weeklyFreeUsed = Boolean(activeClaim);

  const result = evaluateEpisodeAccess({
    tier,
    episodeNumber,
    publicReleaseAt,
    weeklyFreeUsedThisWeek: weeklyFreeUsed,
  });

  const sameClaim =
    activeClaim?.seriesId === seriesId &&
    activeClaim.episodeNumber === episodeNumber;

  const weeklyFreeResetsAt = activeClaim
    ? getWeeklyFreeResetAt(activeClaim.claimedAt).toISOString()
    : null;

  return {
    allowed: result.allowed || sameClaim,
    tier,
    isRegistered: true,
    reason: result.allowed || sameClaim ? undefined : result.reason,
    weeklyFreeRemaining:
      episodeNumber <= 1 ? 1 : weeklyFreeUsed && !sameClaim ? 0 : 1,
    claimedThisWeek: activeClaim,
    weeklyFreeResetsAt,
  };
}

export async function claimWeeklyFreeEpisode(
  sessionId: string,
  seriesId: string,
  episodeNumber: number
): Promise<void> {
  if (episodeNumber <= 1) return;

  const profile = await getProfileBySessionFromDb(sessionId);
  if (!profile) return;

  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  await ensureSession(sessionId);

  const claim: WeeklyFreeClaim = {
    seriesId,
    episodeNumber,
    claimedAt: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("user_sessions")
    .update({
      free_episode_week: null,
      free_episode_claim: claim,
    })
    .eq("session_id", sessionId);

  if (error) throw new Error(error.message);
}
