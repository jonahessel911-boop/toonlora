import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resolveProfileId } from "@/lib/services/analytics-repository";
import type { ReadingProgressRow } from "@/lib/supabase/types";

export interface RecentReadItem {
  seriesId: string;
  seriesTitle: string;
  genre: string;
  episodeNumber: number;
  maxPanelReached: number;
  totalPanels: number;
  updatedAt: string;
  href: string;
}

export interface GenreAffinityItem {
  genre: string;
  chaptersRead: number;
  storiesTouched: number;
}

export interface TopEngagedStory {
  seriesId: string;
  seriesTitle: string;
  genre: string;
  chaptersRead: number;
  lastReadAt: string;
}

export interface UserReadingEngagement {
  recentReads: RecentReadItem[];
  genreAffinity: GenreAffinityItem[];
  topEngagedStories: TopEngagedStory[];
  storiesReadCount: number;
  readStories: TopEngagedStory[];
}

type ProgressRow = ReadingProgressRow & {
  series_title?: string | null;
  genre?: string | null;
};

function resolveGenre(seriesId: string, stored?: string | null): string {
  if (stored?.trim()) return stored.trim();
  return "Business";
}

function resolveTitle(seriesId: string, stored?: string | null): string {
  if (stored?.trim()) return stored.trim();
  return seriesId;
}

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

/** Chapter counts as read when completed or user scrolled past early panels. */
export function isChapterEngaged(row: Pick<
  ProgressRow,
  "max_panel_reached" | "total_panels" | "completed_at"
>): boolean {
  if (row.completed_at) return true;
  const total = Math.max(1, row.total_panels);
  const threshold = Math.min(Math.max(1, total - 1), Math.ceil(total * 0.25));
  return row.max_panel_reached >= threshold;
}

function buildResumeHref(seriesId: string, episodeNumber: number, panel: number): string {
  const params = new URLSearchParams();
  if (episodeNumber > 1) params.set("ep", String(episodeNumber));
  if (panel > 0) params.set("panel", String(panel));
  const qs = params.toString();
  return `/story/${seriesId}/read${qs ? `?${qs}` : ""}`;
}

export async function getUserReadingEngagement(
  sessionId: string
): Promise<UserReadingEngagement | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

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

  const rows = dedupeBySeries((data ?? []) as ProgressRow[]);

  const recentReads: RecentReadItem[] = rows.slice(0, 12).map((row) => ({
    seriesId: row.series_id,
    seriesTitle: resolveTitle(row.series_id, row.series_title),
    genre: resolveGenre(row.series_id, row.genre),
    episodeNumber: row.episode_number,
    maxPanelReached: row.max_panel_reached,
    totalPanels: row.total_panels,
    updatedAt: row.updated_at,
    href: buildResumeHref(
      row.series_id,
      row.episode_number,
      row.max_panel_reached
    ),
  }));

  const engagedBySeries = new Map<
    string,
    { chaptersRead: number; lastReadAt: string; genre: string; title: string }
  >();
  const genreStats = new Map<
    string,
    { chaptersRead: number; stories: Set<string> }
  >();

  for (const row of rows) {
    if (!isChapterEngaged(row)) continue;

    const genre = resolveGenre(row.series_id, row.genre);
    const title = resolveTitle(row.series_id, row.series_title);

    const current = engagedBySeries.get(row.series_id) ?? {
      chaptersRead: 0,
      lastReadAt: row.updated_at,
      genre,
      title,
    };
    current.chaptersRead += 1;
    if (new Date(row.updated_at) > new Date(current.lastReadAt)) {
      current.lastReadAt = row.updated_at;
    }
    engagedBySeries.set(row.series_id, current);

    const g = genreStats.get(genre) ?? { chaptersRead: 0, stories: new Set() };
    g.chaptersRead += 1;
    g.stories.add(row.series_id);
    genreStats.set(genre, g);
  }

  const topEngagedStories = [...engagedBySeries.entries()]
    .map(([seriesId, stats]) => ({
      seriesId,
      seriesTitle: stats.title,
      genre: stats.genre,
      chaptersRead: stats.chaptersRead,
      lastReadAt: stats.lastReadAt,
    }))
    .sort((a, b) => b.chaptersRead - a.chaptersRead || b.lastReadAt.localeCompare(a.lastReadAt))
    .slice(0, 5);

  const genreAffinity = [...genreStats.entries()]
    .map(([genre, stats]) => ({
      genre,
      chaptersRead: stats.chaptersRead,
      storiesTouched: stats.stories.size,
    }))
    .sort((a, b) => b.chaptersRead - a.chaptersRead);

  return {
    recentReads,
    genreAffinity,
    topEngagedStories,
    storiesReadCount: engagedBySeries.size,
    readStories: [...engagedBySeries.entries()]
      .map(([seriesId, stats]) => ({
        seriesId,
        seriesTitle: stats.title,
        genre: stats.genre,
        chaptersRead: stats.chaptersRead,
        lastReadAt: stats.lastReadAt,
      }))
      .sort((a, b) => b.lastReadAt.localeCompare(a.lastReadAt)),
  };
}
