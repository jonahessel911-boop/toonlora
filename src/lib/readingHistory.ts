import { STORAGE_KEYS } from "@/lib/constants";

export interface ReadingHistoryEntry {
  seriesId: string;
  title: string;
  genre: string;
  coverArtUrl?: string;
  coverGradient: string;
  creatorDisplayName?: string;
  episodeNumber: number;
  href: string;
  updatedAt: string;
}

const MAX_ENTRIES = 12;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getReadingHistory(): ReadingHistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.readingHistory);
    if (!raw) return [];
    return JSON.parse(raw) as ReadingHistoryEntry[];
  } catch {
    return [];
  }
}

export function saveReadingProgress(entry: Omit<ReadingHistoryEntry, "updatedAt">): void {
  if (!isBrowser()) return;
  const next: ReadingHistoryEntry = {
    ...entry,
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
