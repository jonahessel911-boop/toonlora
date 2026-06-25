import { STORAGE_KEYS } from "@/lib/constants";

export interface ReadingHistoryEntry {
  seriesId: string;
  title: string;
  genre: string;
  coverArtUrl?: string;
  coverGradient: string;
  creatorDisplayName?: string;
  episodeNumber: number;
  /** Furthest panel index reached in the current episode (0-based). */
  panelIndex?: number;
  /** Total panels in the episode when progress was saved. */
  totalPanels?: number;
  href: string;
  updatedAt: string;
}

const MAX_ENTRIES = 12;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Deep link to resume reading at a specific chapter + panel. */
export function buildResumeReadHref(
  seriesId: string,
  episodeNumber: number,
  panelIndex = 0
): string {
  const params = new URLSearchParams();
  if (episodeNumber > 1) params.set("ep", String(episodeNumber));
  if (panelIndex > 0) params.set("panel", String(panelIndex));
  const qs = params.toString();
  return `/story/${seriesId}/read${qs ? `?${qs}` : ""}`;
}

export function getReadingHistory(): ReadingHistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.readingHistory);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ReadingHistoryEntry[];
    return parsed.map((entry) => ({
      ...entry,
      panelIndex: entry.panelIndex ?? 0,
    }));
  } catch {
    return [];
  }
}

export function getReadingEntry(seriesId: string): ReadingHistoryEntry | undefined {
  return getReadingHistory().find((entry) => entry.seriesId === seriesId);
}

export function saveReadingProgress(
  entry: Omit<ReadingHistoryEntry, "updatedAt" | "href"> & { href?: string }
): void {
  if (!isBrowser()) return;

  const panelIndex = entry.panelIndex ?? 0;
  const href =
    entry.href ??
    buildResumeReadHref(entry.seriesId, entry.episodeNumber, panelIndex);

  const next: ReadingHistoryEntry = {
    ...entry,
    panelIndex,
    href,
    updatedAt: new Date().toISOString(),
  };

  const rest = getReadingHistory().filter((e) => e.seriesId !== entry.seriesId);
  localStorage.setItem(
    STORAGE_KEYS.readingHistory,
    JSON.stringify([next, ...rest].slice(0, MAX_ENTRIES))
  );
  window.dispatchEvent(new Event("tl-reading-history"));
}

export function pruneReadingHistory(validSeriesIds: string[]): void {
  if (!isBrowser()) return;
  const valid = new Set(validSeriesIds);
  const pruned = getReadingHistory().filter((entry) =>
    valid.has(entry.seriesId)
  );
  localStorage.setItem(
    STORAGE_KEYS.readingHistory,
    JSON.stringify(pruned)
  );
}

/** Series-wide read % using chapter index + panel position within chapter. */
export function computeSeriesReadPercent(
  episodeNumber: number,
  totalChapters: number,
  panelIndex = 0,
  totalPanels = 1
): number {
  if (totalChapters <= 0) return 0;
  const safePanels = Math.max(1, totalPanels);
  const withinChapter = Math.min(1, Math.max(0, panelIndex / safePanels));
  const completed = Math.max(0, episodeNumber - 1) + withinChapter;
  return Math.min(100, (completed / totalChapters) * 100);
}
