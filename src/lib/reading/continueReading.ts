import {
  fetchPublishedStory,
  getStoryCoverArtUrl,
} from "@/lib/fetchPublishedStory";
import {
  buildResumeReadHref,
  getReadingHistory,
  type ReadingHistoryEntry,
} from "@/lib/readingHistory";
import { apiFetch } from "@/lib/session";
import type { CatalogSeries } from "@/types/catalog";
import { catalogToCard } from "@/types/catalog";

/** User-specific continue-reading row, hydrated from DB or local history. */
export interface ContinueReadingItem {
  seriesId: string;
  title: string;
  genre: string;
  synopsis?: string;
  coverArtUrl?: string;
  coverGradient: string;
  creatorDisplayName?: string;
  episodeNumber: number;
  panelIndex: number;
  totalPanels: number;
  totalChapters: number;
  href: string;
  updatedAt: string;
}

function isPublishedStory(
  story: Awaited<ReturnType<typeof fetchPublishedStory>>
): story is NonNullable<typeof story> {
  return Boolean(story && (story.status === "published" || story.isPublic));
}

export function historyEntryToContinueItem(
  entry: ReadingHistoryEntry,
  story?: Awaited<ReturnType<typeof fetchPublishedStory>>
): ContinueReadingItem {
  const totalChapters = story?.episodes?.length ?? entry.episodeNumber;
  return {
    seriesId: entry.seriesId,
    title: story?.title ?? entry.title,
    genre: story ? String(story.genre) : entry.genre,
    synopsis: story?.synopsis ?? undefined,
    coverArtUrl: story ? getStoryCoverArtUrl(story) ?? entry.coverArtUrl : entry.coverArtUrl,
    coverGradient: story?.coverGradient ?? entry.coverGradient,
    creatorDisplayName:
      story?.creatorDisplayName ?? entry.creatorDisplayName ?? "Toonlora",
    episodeNumber: entry.episodeNumber,
    panelIndex: entry.panelIndex ?? 0,
    totalPanels: entry.totalPanels ?? 1,
    totalChapters: Math.max(totalChapters, entry.episodeNumber, 1),
    href: entry.href,
    updatedAt: entry.updatedAt,
  };
}

export async function hydrateHistoryEntry(
  entry: ReadingHistoryEntry
): Promise<ContinueReadingItem | null> {
  const story = await fetchPublishedStory(entry.seriesId);
  if (!isPublishedStory(story)) return null;
  return historyEntryToContinueItem(entry, story);
}

export async function loadLocalContinueReading(
  limit = 10
): Promise<ContinueReadingItem[]> {
  const entries = getReadingHistory().slice(0, limit);
  if (entries.length === 0) return [];

  const items = await Promise.all(entries.map((entry) => hydrateHistoryEntry(entry)));
  return items.filter((item): item is ContinueReadingItem => item !== null);
}

export async function loadServerContinueReading(
  limit = 10
): Promise<ContinueReadingItem[]> {
  const res = await apiFetch(`/api/user/continue-reading?limit=${limit}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { items?: ContinueReadingItem[] };
  return data.items ?? [];
}

export async function loadContinueReading(options: {
  loggedIn: boolean;
  limit?: number;
}): Promise<ContinueReadingItem[]> {
  const limit = options.limit ?? 10;

  if (options.loggedIn) {
    const serverItems = await loadServerContinueReading(limit);
    if (serverItems.length > 0) return serverItems;
  }

  return loadLocalContinueReading(limit);
}

export function continueItemToCatalogCard(item: ContinueReadingItem): CatalogSeries {
  return catalogToCard({
    id: item.seriesId,
    title: item.title,
    genre: item.genre,
    coverGradient: item.coverGradient,
    source: "admin",
    status: "published",
    creatorDisplayName: item.creatorDisplayName ?? "Toonlora",
    synopsis: item.synopsis ?? "",
    episodeCount: item.totalChapters,
    viewsCount: 0,
    likesCount: 0,
    featuredRank: null,
    publishedAt: null,
    createdAt: item.updatedAt,
    coverArtUrl: item.coverArtUrl,
    href: item.href,
    sagaLabel: item.genre,
    sagaSubtitle: item.synopsis,
    chapterProgress: item.episodeNumber,
    panelIndex: item.panelIndex,
    totalPanels: item.totalPanels,
    episodes: item.totalChapters,
  });
}

export function continueItemFromApiRow(row: {
  seriesId: string;
  seriesTitle: string;
  genre: string;
  synopsis?: string | null;
  coverArtUrl?: string | null;
  coverGradient?: string | null;
  creatorDisplayName?: string | null;
  episodeNumber: number;
  maxPanelReached: number;
  totalPanels: number;
  totalChapters: number;
  updatedAt: string;
}): ContinueReadingItem {
  const panelIndex = row.maxPanelReached;
  return {
    seriesId: row.seriesId,
    title: row.seriesTitle,
    genre: row.genre,
    synopsis: row.synopsis ?? undefined,
    coverArtUrl: row.coverArtUrl ?? undefined,
    coverGradient: row.coverGradient ?? "from-[#07111F] to-[#1e3a5f]",
    creatorDisplayName: row.creatorDisplayName ?? "Toonlora",
    episodeNumber: row.episodeNumber,
    panelIndex,
    totalPanels: row.totalPanels,
    totalChapters: row.totalChapters,
    href: buildResumeReadHref(row.seriesId, row.episodeNumber, panelIndex),
    updatedAt: row.updatedAt,
  };
}
