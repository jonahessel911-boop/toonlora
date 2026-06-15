import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { CatalogSeries } from "@/types/catalog";
import type { SeriesRow } from "@/lib/supabase/types";

export interface CatalogQuery {
  genre?: string;
  source?: "admin" | "creator";
  sort?: "featured" | "newest" | "popular";
  limit?: number;
}

async function episodeCountForSeries(seriesId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;

  const { count } = await supabase
    .from("episodes")
    .select("id", { count: "exact", head: true })
    .eq("series_id", seriesId);

  return count ?? 0;
}

async function coverArtForSeries(seriesId: string): Promise<string | undefined> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return undefined;

  const { data } = await supabase
    .from("episodes")
    .select("comic_page")
    .eq("series_id", seriesId)
    .eq("episode_number", 1)
    .maybeSingle();

  if (!data?.comic_page) return undefined;
  const comicPage = data.comic_page as { artUrl?: string | null };
  return comicPage.artUrl ?? undefined;
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
  const meta = await Promise.all(
    rows.map(async (row) => ({
      count: await episodeCountForSeries(row.id),
      cover: await coverArtForSeries(row.id),
    }))
  );

  return rows.map((row, i) => rowToCatalog(row, meta[i].count, meta[i].cover));
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
  const meta = await Promise.all(
    rows.map(async (row) => ({
      count: await episodeCountForSeries(row.id),
      cover: await coverArtForSeries(row.id),
    }))
  );

  return rows.map((row, i) => rowToCatalog(row, meta[i].count, meta[i].cover));
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
  const count = await episodeCountForSeries(id);
  const cover = await coverArtForSeries(id);
  return rowToCatalog(data as SeriesRow, count, cover);
}
