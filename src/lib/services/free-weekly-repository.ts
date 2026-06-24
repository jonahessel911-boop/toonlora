import {
  evaluateEpisodeAccess,
  getEpisodePublicReleaseAt,
  getIsoWeekKey,
  type EpisodeAccessDenyReason,
} from "@/lib/payments/subscription-access";
import {
  getPlanTier,
  isPaidTier,
  type SubscriptionTierId,
} from "@/lib/payments/subscription-plans";
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
  reason?: EpisodeAccessDenyReason;
  weeklyFreeRemaining: number;
  claimedThisWeek: WeeklyFreeClaim | null;
}

function parseClaim(raw: unknown): WeeklyFreeClaim | null {
  if (!raw || typeof raw !== "object") return null;
  const claim = raw as WeeklyFreeClaim;
  if (!claim.seriesId || !claim.episodeNumber) return null;
  return claim;
}

export async function resolveUserTier(sessionId: string): Promise<SubscriptionTierId> {
  const record = await getSubscriptionFromDb(sessionId);
  if (!isActiveSubscription(record)) return "free";
  return getPlanTier(record.planId);
}

export async function resolveEpisodeAccess(
  sessionId: string,
  seriesId: string,
  episodeNumber: number,
  episodePublishedAt?: string | null
): Promise<EpisodeAccessResult> {
  const tier = await resolveUserTier(sessionId);
  const publicReleaseAt = getEpisodePublicReleaseAt(episodePublishedAt);
  const weekKey = getIsoWeekKey();

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
      reason: allowed ? undefined : "not_released",
      weeklyFreeRemaining: 0,
      claimedThisWeek: null,
    };
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
      reason: result.reason,
      weeklyFreeRemaining: result.allowed ? 0 : 1,
      claimedThisWeek: null,
    };
  }

  await ensureSession(sessionId);

  const { data } = await supabase
    .from("user_sessions")
    .select("free_episode_week, free_episode_claim")
    .eq("session_id", sessionId)
    .maybeSingle();

  const storedWeek = data?.free_episode_week ?? null;
  const claim = storedWeek === weekKey ? parseClaim(data?.free_episode_claim) : null;
  const weeklyFreeUsedThisWeek = Boolean(claim);

  const result = evaluateEpisodeAccess({
    tier,
    episodeNumber,
    publicReleaseAt,
    weeklyFreeUsedThisWeek,
  });

  const sameClaim =
    claim?.seriesId === seriesId && claim.episodeNumber === episodeNumber;

  return {
    allowed: result.allowed || sameClaim,
    tier,
    reason: result.allowed || sameClaim ? undefined : result.reason,
    weeklyFreeRemaining: weeklyFreeUsedThisWeek && !sameClaim ? 0 : 1,
    claimedThisWeek: claim,
  };
}

export async function claimWeeklyFreeEpisode(
  sessionId: string,
  seriesId: string,
  episodeNumber: number
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  await ensureSession(sessionId);

  const weekKey = getIsoWeekKey();
  const claim: WeeklyFreeClaim = {
    seriesId,
    episodeNumber,
    claimedAt: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("user_sessions")
    .update({
      free_episode_week: weekKey,
      free_episode_claim: claim,
    })
    .eq("session_id", sessionId);

  if (error) throw new Error(error.message);
}
