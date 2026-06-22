import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { CatalogSeries } from "@/types/catalog";
import type { SeriesRow } from "@/lib/supabase/types";

export interface CatalogQuery {
  genre?: string;
  source?: "admin" | "creator";
  sort?: "featured" | "newest" | "popular";
  limit?: number;
}

async function episodeMetaForSeriesIds(
  seriesIds: string[]
): Promise<Map<string, { count: number; cover?: string }>> {
  const meta = new Map<string, { count: number; cover?: string }>();
  if (!seriesIds.length) return meta;

  const supabase = getSupabaseAdmin();
  if (!supabase) return meta;

  for (const id of seriesIds) {
    meta.set(id, { count: 0 });
  }

  const { data } = await supabase
    .from("episodes")
    .select("series_id, episode_number, comic_page, panel_breakdown")
    .in("series_id", seriesIds);

  for (const row of data ?? []) {
    const entry = meta.get(row.series_id);
    if (!entry) continue;
    entry.count += 1;
    if (row.episode_number === 1) {
      const comicPage = row.comic_page as { artUrl?: string | null };
      const breakdown = row.panel_breakdown as {
        panels?: Array<{ panel_number: number; artUrl?: string }>;
      } | null;
      const panelCover = breakdown?.panels
        ?.slice()
        .sort((a, b) => a.panel_number - b.panel_number)[0]?.artUrl;
      entry.cover = panelCover ?? comicPage.artUrl ?? undefined;
    }
  }

  return meta;
}

function rowToCatalog(
  series: SeriesRow,
  episodeCount: number,
  coverArtUrl?: string
): CatalogSeries {
  const logline =
    series.synopsis ??
    (series.story_bible as { logline?: string } | null)?.logline ??
    series.story_idea ??
    "";

  return {
    id: series.id,
    title: series.title,
    genre: series.genre,
    coverGradient: series.cover_gradient,
    coverArtUrl,
    source: series.source === "admin" ? "admin" : "creator",
    status: series.status === "published" ? "published" : "draft",
    creatorDisplayName:
      series.creator_display_name ??
      series.main_character ??
      "Toonlora Creator",
    synopsis: logline,
    episodeCount,
    viewsCount: series.views_count ?? 0,
    likesCount: series.likes_count ?? 0,
    featuredRank: series.featured_rank,
    publishedAt: series.published_at,
    createdAt: series.created_at,
  };
}

export async function listPublishedCatalog(
  query: CatalogQuery = {}
): Promise<CatalogSeries[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  let dbQuery = supabase
    .from("series")
    .select("*")
    .eq("status", "published")
    .eq("is_public", true);

  if (query.genre) {
    dbQuery = dbQuery.eq("genre", query.genre);
  }
  if (query.source) {
    dbQuery = dbQuery.eq("source", query.source);
  }

  const sort = query.sort ?? "featured";
  if (sort === "newest") {
    dbQuery = dbQuery.order("published_at", { ascending: false });
  } else if (sort === "popular") {
    dbQuery = dbQuery.order("likes_count", { ascending: false });
  } else {
    dbQuery = dbQuery
      .order("featured_rank", { ascending: true, nullsFirst: false })
      .order("published_at", { ascending: false });
  }

  dbQuery = dbQuery.limit(query.limit ?? 48);

  const { data, error } = await dbQuery;
  if (error || !data?.length) return [];

  const rows = data as SeriesRow[];
  const meta = await episodeMetaForSeriesIds(rows.map((row) => row.id));

  return rows.map((row) => {
    const episodeMeta = meta.get(row.id) ?? { count: 0 };
    return rowToCatalog(row, episodeMeta.count, episodeMeta.cover);
  });
}

export async function listAllSeriesAdmin(): Promise<CatalogSeries[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("series")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data?.length) return [];

  const rows = data as SeriesRow[];
  const meta = await episodeMetaForSeriesIds(rows.map((row) => row.id));

  return rows.map((row) => {
    const episodeMeta = meta.get(row.id) ?? { count: 0 };
    return rowToCatalog(row, episodeMeta.count, episodeMeta.cover);
  });
}

export async function updateSeriesPublishing(
  id: string,
  patch: {
    status?: "draft" | "published";
    isPublic?: boolean;
    featuredRank?: number | null;
    source?: "admin" | "creator";
  }
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const update: Record<string, unknown> = {};
  if (patch.status) {
    update.status = patch.status;
    if (patch.status === "published") {
      update.published_at = new Date().toISOString();
      update.is_public = true;
    } else {
      update.is_public = false;
    }
  }
  if (patch.isPublic !== undefined) update.is_public = patch.isPublic;
  if (patch.featuredRank !== undefined) update.featured_rank = patch.featuredRank;
  if (patch.source) update.source = patch.source;

  const { error } = await supabase.from("series").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteSeriesFromDb(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const { error } = await supabase.from("series").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getCatalogSeriesById(
  id: string
): Promise<CatalogSeries | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from("series")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .eq("is_public", true)
    .maybeSingle();

  if (!data) return null;
  const meta = await episodeMetaForSeriesIds([id]);
  const episodeMeta = meta.get(id) ?? { count: 0 };
  return rowToCatalog(data as SeriesRow, episodeMeta.count, episodeMeta.cover);
}
