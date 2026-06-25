import { getStoryCoverArtUrl } from "@/lib/fetchPublishedStory";
import { continueItemFromApiRow } from "@/lib/reading/continueReading";
import type { ContinueReadingItem } from "@/lib/reading/continueReading";
import { resolveProfileId } from "@/lib/services/analytics-repository";
import { getStoryFromDb } from "@/lib/services/story-repository";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ReadingProgressRow } from "@/lib/supabase/types";

type ProgressRow = ReadingProgressRow & {
  series_title?: string | null;
  genre?: string | null;
};

function dedupeBySeries(rows: ProgressRow[]): ProgressRow[] {
  const bySeries = new Map<string, ProgressRow>();

  for (const row of rows) {
    const existing = bySeries.get(row.series_id);
    if (
      !existing ||
      new Date(row.updated_at).getTime() > new Date(existing.updated_at).getTime()
    ) {
      bySeries.set(row.series_id, row);
    }
  }

  return [...bySeries.values()].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );
}

async function hydrateProgressRow(
  row: ProgressRow
): Promise<ContinueReadingItem | null> {
  const story = await getStoryFromDb(row.series_id);
  if (!story || (story.status !== "published" && !story.isPublic)) {
    return null;
  }

  const title = row.series_title?.trim() || story.title;
  const genre = row.genre?.trim() || String(story.genre);
  const totalChapters = Math.max(story.episodes?.length ?? 1, row.episode_number, 1);

  return continueItemFromApiRow({
    seriesId: row.series_id,
    seriesTitle: title,
    genre,
    synopsis: story.synopsis ?? undefined,
    coverArtUrl: getStoryCoverArtUrl(story),
    coverGradient: story.coverGradient,
    creatorDisplayName: story.creatorDisplayName ?? "Toonlora",
    episodeNumber: row.episode_number,
    maxPanelReached: row.max_panel_reached,
    totalPanels: row.total_panels,
    totalChapters,
    updatedAt: row.updated_at,
  });
}

export async function getContinueReadingForSession(
  sessionId: string,
  limit = 10
): Promise<ContinueReadingItem[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const profileId = await resolveProfileId(sessionId);

  let query = supabase
    .from("reading_progress")
    .select("*")
    .order("updated_at", { ascending: false });

  if (profileId) {
    query = query.or(`profile_id.eq.${profileId},session_id.eq.${sessionId}`);
  } else {
    query = query.eq("session_id", sessionId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = dedupeBySeries((data ?? []) as ProgressRow[]).slice(0, limit);
  const items = await Promise.all(rows.map((row) => hydrateProgressRow(row)));
  return items.filter((item): item is ContinueReadingItem => item !== null);
}
