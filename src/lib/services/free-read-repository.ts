import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ensureSession } from "@/lib/services/story-repository";

export interface FreeEpisodeAccessResult {
  allowed: boolean;
  claimedSeriesId: string | null;
}

export async function getFreeReadSeriesId(
  sessionId: string
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  await ensureSession(sessionId);

  const { data } = await supabase
    .from("user_sessions")
    .select("free_read_series_id")
    .eq("session_id", sessionId)
    .maybeSingle();

  return data?.free_read_series_id ?? null;
}

/** Anonymous users get one free episode 1, locked to a single series. */
export async function resolveFreeEpisodeAccess(
  sessionId: string,
  seriesId: string,
  episodeNumber: number
): Promise<FreeEpisodeAccessResult> {
  if (episodeNumber > 1) {
    const claimed = await getFreeReadSeriesId(sessionId);
    return { allowed: false, claimedSeriesId: claimed };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { allowed: true, claimedSeriesId: null };
  }

  await ensureSession(sessionId);

  const { data } = await supabase
    .from("user_sessions")
    .select("free_read_series_id")
    .eq("session_id", sessionId)
    .maybeSingle();

  const claimed = data?.free_read_series_id ?? null;

  if (!claimed) {
    const { error } = await supabase
      .from("user_sessions")
      .update({ free_read_series_id: seriesId })
      .eq("session_id", sessionId);

    if (error) throw new Error(error.message);
    return { allowed: true, claimedSeriesId: seriesId };
  }

  return {
    allowed: claimed === seriesId,
    claimedSeriesId: claimed,
  };
}
