import {
  catalogSectionFromSlug,
  isPipelineCategorySlug,
} from "@/lib/browseCategories";
import { normalizeCoverTitleSlug } from "@/lib/lp3/coverTitleParam";
import { isStoryUuid } from "@/lib/lp/resolveCatalogByCoverTitle";
import { resolveStoryIdFromCoverTitle } from "@/lib/lp/storyTeasers";
import { FOUNDER_NAME_BY_ID } from "@/lib/mock/sagaMeta";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { formatCatalogCategoryLabel } from "@/lib/catalogCategoryLabel";
import {
  formatFounderStoryTitle,
  isFounderStoryCategory,
} from "@/lib/founderStoryTitle";
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

async function firstPipelinePanelCover(
  seriesId: string
): Promise<string | undefined> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return undefined;

  const { data: episode } = await supabase
    .from("episodes")
    .select("id")
    .eq("series_id", seriesId)
    .eq("episode_number", 1)
    .maybeSingle();

  if (!episode) return undefined;

  const { data: panel } = await supabase
    .from("panels")
    .select("image_url")
    .eq("episode_id", episode.id)
    .not("image_url", "is", null)
    .order("panel_number", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (panel as { image_url?: string | null } | null)?.image_url?.trim() ||
    undefined;
}

function coverFromSeriesRow(series: SeriesRow): string | undefined {
  const row = series as SeriesRow & { cover_art_url?: string | null };
  return row.cover_art_url?.trim() || undefined;
}

function rowToCatalog(
  series: SeriesRow,
  episodeCount: number,
  coverArtUrl?: string
): CatalogSeries {
  const extended = series as SeriesRow & {
    display_title?: string | null;
    category?: string | null;
    cover_art_url?: string | null;
    slug?: string | null;
    research_json?: {
      characters?: Array<{ name: string; role: string }>;
    } | null;
  };

  const logline =
    series.synopsis ??
    (series.story_bible as { logline?: string } | null)?.logline ??
    series.story_idea ??
    "";

  const resolvedCover =
    coverArtUrl ?? coverFromSeriesRow(series) ?? undefined;

  const category = extended.category?.trim() || series.genre;
  const rawTitle = extended.display_title?.trim() || series.title;
  const research = extended.research_json;

  const title = isFounderStoryCategory(category)
    ? formatFounderStoryTitle({
        storyId: series.id,
        title: rawTitle,
        mainCharacter: series.main_character,
        researchCharacters: research?.characters,
      })
    : rawTitle;

  return {
    id: series.id,
    title,
    genre: category,
    sagaLabel: formatCatalogCategoryLabel(category),
    coverGradient: series.cover_gradient,
    coverArtUrl: resolvedCover,
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
    slug: extended.slug?.trim() || undefined,
    mainCharacter: series.main_character?.trim() || undefined,
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
    return rowToCatalog(
      row,
      episodeMeta.count,
      coverFromSeriesRow(row) ?? episodeMeta.cover
    );
  });
}

export interface SitemapSeriesEntry {
  id: string;
  updatedAt: string | null;
}

/** Lightweight list for sitemap generation — all public published stories. */
export async function listPublishedSeriesForSitemap(): Promise<
  SitemapSeriesEntry[]
> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("series")
    .select("id, updated_at, published_at")
    .eq("status", "published")
    .eq("is_public", true)
    .order("published_at", { ascending: false });

  if (error || !data?.length) return [];

  return data.map((row) => ({
    id: row.id as string,
    updatedAt:
      (row.updated_at as string | null) ??
      (row.published_at as string | null) ??
      null,
  }));
}

/** Series with a generated cover — shown on the browse index (incl. draft pipeline). */
export async function listIndexCatalog(
  query: CatalogQuery = {}
): Promise<CatalogSeries[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  let dbQuery = supabase
    .from("series")
    .select("*")
    .not("cover_art_url", "is", null)
    .order("created_at", { ascending: false });

  if (query.genre) {
    dbQuery = dbQuery.or(`category.eq.${query.genre},genre.eq.${query.genre}`);
  }
  if (query.source) {
    dbQuery = dbQuery.eq("source", query.source);
  }

  dbQuery = dbQuery.limit(query.limit ?? 48);

  const { data, error } = await dbQuery;
  if (error || !data?.length) return [];

  const rows = data as SeriesRow[];
  const meta = await episodeMetaForSeriesIds(rows.map((row) => row.id));

  return rows.map((row) => {
    const episodeMeta = meta.get(row.id) ?? { count: 0 };
    return rowToCatalog(
      row,
      episodeMeta.count,
      coverFromSeriesRow(row) ?? episodeMeta.cover
    );
  });
}

/** Resolve `cover_title` to a published catalog row (DB UUID), for LP landers. */
export async function findPublishedCatalogByCoverTitle(
  coverTitle: string
): Promise<CatalogSeries | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase || !coverTitle.trim()) return null;

  const paramSlug = normalizeCoverTitleSlug(coverTitle);
  const canonicalId = resolveStoryIdFromCoverTitle(coverTitle);

  if (isStoryUuid(paramSlug)) {
    const { data: byId } = await supabase
      .from("series")
      .select("*")
      .eq("id", paramSlug)
      .eq("status", "published")
      .maybeSingle();
    if (byId) {
      const meta = await episodeMetaForSeriesIds([byId.id]);
      const episodeMeta = meta.get(byId.id) ?? { count: 0 };
      return rowToCatalog(
        byId as SeriesRow,
        episodeMeta.count,
        coverFromSeriesRow(byId as SeriesRow) ?? episodeMeta.cover
      );
    }
  }

  const slugCandidates = [paramSlug, canonicalId].filter(
    (value, index, all): value is string =>
      Boolean(value) && all.indexOf(value) === index
  );

  for (const slugTry of slugCandidates) {
    const { data: slugMatch } = await supabase
      .from("series")
      .select("*")
      .eq("status", "published")
      .or(`slug.eq.${slugTry},slug.ilike.${slugTry}-%`)
      .limit(1)
      .maybeSingle();

    if (slugMatch) {
      const meta = await episodeMetaForSeriesIds([slugMatch.id]);
      const episodeMeta = meta.get(slugMatch.id) ?? { count: 0 };
      return rowToCatalog(
        slugMatch as SeriesRow,
        episodeMeta.count,
        coverFromSeriesRow(slugMatch as SeriesRow) ?? episodeMeta.cover
      );
    }
  }

  const founder = canonicalId ? FOUNDER_NAME_BY_ID[canonicalId] : undefined;
  if (founder) {
    const { data: founderMatch } = await supabase
      .from("series")
      .select("*")
      .eq("status", "published")
      .or(
        `main_character.ilike.%${founder}%,title.ilike.%${founder}%,display_title.ilike.%${founder}%`
      )
      .limit(1)
      .maybeSingle();

    if (founderMatch) {
      const meta = await episodeMetaForSeriesIds([founderMatch.id]);
      const episodeMeta = meta.get(founderMatch.id) ?? { count: 0 };
      return rowToCatalog(
        founderMatch as SeriesRow,
        episodeMeta.count,
        coverFromSeriesRow(founderMatch as SeriesRow) ?? episodeMeta.cover
      );
    }
  }

  return null;
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
    return rowToCatalog(
      row,
      episodeMeta.count,
      coverFromSeriesRow(row) ?? episodeMeta.cover
    );
  });
}

export async function updateSeriesCategory(
  id: string,
  categorySlug: string
): Promise<void> {
  if (!isPipelineCategorySlug(categorySlug)) {
    throw new Error("Invalid category");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const { error } = await supabase
    .from("series")
    .update({
      category: categorySlug,
      genre: categorySlug,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
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

export async function incrementSeriesViewCount(
  seriesId: string
): Promise<number | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: current } = await supabase
    .from("series")
    .select("views_count")
    .eq("id", seriesId)
    .or("status.eq.published,is_public.eq.true")
    .maybeSingle();

  if (!current) return null;

  const next = (current.views_count ?? 0) + 1;
  const { data, error } = await supabase
    .from("series")
    .update({ views_count: next })
    .eq("id", seriesId)
    .select("views_count")
    .single();

  if (error) throw new Error(error.message);
  return (data as { views_count: number }).views_count;
}

export async function getSeriesViewCount(
  seriesId: string
): Promise<number | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from("series")
    .select("views_count")
    .eq("id", seriesId)
    .or("status.eq.published,is_public.eq.true")
    .maybeSingle();

  if (!data) return null;
  return data.views_count ?? 0;
}

export async function incrementSeriesLikeCount(
  seriesId: string
): Promise<number | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: current } = await supabase
    .from("series")
    .select("likes_count")
    .eq("id", seriesId)
    .or("status.eq.published,is_public.eq.true")
    .maybeSingle();

  if (!current) return null;

  const next = (current.likes_count ?? 0) + 1;
  const { data, error } = await supabase
    .from("series")
    .update({ likes_count: next })
    .eq("id", seriesId)
    .select("likes_count")
    .single();

  if (error) throw new Error(error.message);
  return (data as { likes_count: number }).likes_count;
}

export async function getSeriesLikeCount(
  seriesId: string
): Promise<number | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from("series")
    .select("likes_count")
    .eq("id", seriesId)
    .or("status.eq.published,is_public.eq.true")
    .maybeSingle();

  if (!data) return null;
  return data.likes_count ?? 0;
}

function isSeriesBrowsable(
  row: SeriesRow,
  coverArtUrl: string | undefined,
  episodeCount: number
): boolean {
  if (row.status === "published") return true;
  if (row.is_public) return true;
  if (coverArtUrl) return true;
  if (episodeCount > 0) return true;
  return false;
}

/** Any series visible on browse / story detail (not only published + public). */
export async function getCatalogSeriesById(
  id: string
): Promise<CatalogSeries | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from("series")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;

  const row = data as SeriesRow;
  const meta = await episodeMetaForSeriesIds([id]);
  const episodeMeta = meta.get(id) ?? { count: 0 };
  const coverArtUrl =
    coverFromSeriesRow(row) ??
    episodeMeta.cover ??
    (await firstPipelinePanelCover(id));

  if (!isSeriesBrowsable(row, coverArtUrl, episodeMeta.count)) {
    return null;
  }

  return rowToCatalog(row, episodeMeta.count, coverArtUrl);
}

function hasRealCover(story: CatalogSeries): boolean {
  return Boolean(story.coverArtUrl?.trim());
}

function isRelevantSimilarStory(
  story: CatalogSeries,
  current: CatalogSeries,
  sectionId: ReturnType<typeof catalogSectionFromSlug>
): boolean {
  if (story.id === current.id) return false;
  if (!hasRealCover(story)) return false;
  if (story.episodeCount < 1) return false;

  if (sectionId) {
    return catalogSectionFromSlug(story.genre) === sectionId;
  }

  return story.genre === current.genre;
}

export async function listSimilarCatalogStories(
  seriesId: string,
  limit = 8
): Promise<CatalogSeries[]> {
  const current = await getCatalogSeriesById(seriesId);
  if (!current) return [];

  const sectionId = catalogSectionFromSlug(current.genre);
  const candidates = await listPublishedCatalog({ sort: "featured", limit: 64 });

  return candidates
    .filter((story) => isRelevantSimilarStory(story, current, sectionId))
    .slice(0, limit);
}
