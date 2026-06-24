import { STORAGE_KEYS } from "@/lib/constants";
import { getReadingHistory } from "@/lib/readingHistory";
import {
  getRankFromStats,
  type ReaderRank,
  type ReadingLevelStats,
} from "@/lib/levels";

export interface ReadingProgressData {
  completedEpisodes: string[];
  fullyReadStories: string[];
  beginnerCelebrationShown: boolean;
}

const EMPTY: ReadingProgressData = {
  completedEpisodes: [],
  fullyReadStories: [],
  beginnerCelebrationShown: false,
};

function episodeKey(seriesId: string, episodeNumber: number): string {
  return `${seriesId}:${episodeNumber}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readData(): ReadingProgressData {
  if (!isBrowser()) return { ...EMPTY };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.readingProgress);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<ReadingProgressData>;
    return {
      completedEpisodes: parsed.completedEpisodes ?? [],
      fullyReadStories: parsed.fullyReadStories ?? [],
      beginnerCelebrationShown: parsed.beginnerCelebrationShown ?? false,
    };
  } catch {
    return { ...EMPTY };
  }
}

function writeData(data: ReadingProgressData): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.readingProgress, JSON.stringify(data));
  window.dispatchEvent(new Event("tl-reading-progress"));
}

export function getReadingLevelStats(): ReadingLevelStats {
  const data = readData();
  return {
    episodesCompleted: data.completedEpisodes.length,
    fullStoriesRead: data.fullyReadStories.length,
  };
}

export function getCurrentRank(): ReaderRank {
  return getRankFromStats(getReadingLevelStats());
}

export function hasCompletedEpisode(
  seriesId: string,
  episodeNumber: number
): boolean {
  return readData().completedEpisodes.includes(
    episodeKey(seriesId, episodeNumber)
  );
}

export function hasSeenBeginnerCelebration(): boolean {
  return readData().beginnerCelebrationShown;
}

export function markBeginnerCelebrationShown(): void {
  const data = readData();
  if (data.beginnerCelebrationShown) return;
  writeData({ ...data, beginnerCelebrationShown: true });
}

export function shouldShowBeginnerLevelUp(
  episodeNumber: number,
  isCatalog: boolean,
  loggedIn: boolean
): boolean {
  if (!isCatalog || loggedIn || episodeNumber !== 1) return false;
  if (hasSeenBeginnerCelebration()) return false;
  return getReadingLevelStats().episodesCompleted >= 1;
}

export function getProfileReadingStats(): {
  storiesStarted: number;
  episodesCompleted: number;
  continueReading: { href: string; title: string } | null;
} {
  const data = readData();
  const history = getReadingHistory();
  const seriesIds = new Set<string>();

  for (const entry of history) {
    seriesIds.add(entry.seriesId);
  }
  for (const key of data.completedEpisodes) {
    const seriesId = key.split(":")[0];
    if (seriesId) seriesIds.add(seriesId);
  }

  const latest = history[0];
  return {
    storiesStarted: seriesIds.size,
    episodesCompleted: data.completedEpisodes.length,
    continueReading: latest
      ? { href: latest.href, title: latest.title }
      : null,
  };
}

/**
 * Record that the reader finished an episode. When every episode in the
 * series has been completed, the series counts as a full read.
 */
export function recordEpisodeComplete(
  seriesId: string,
  episodeNumber: number,
  totalEpisodesInSeries: number
): boolean {
  const data = readData();
  const key = episodeKey(seriesId, episodeNumber);
  if (data.completedEpisodes.includes(key)) return false;

  const completedEpisodes = [...data.completedEpisodes, key];
  const completedInSeries = completedEpisodes.filter((entry) =>
    entry.startsWith(`${seriesId}:`)
  ).length;

  const fullyReadStories =
    totalEpisodesInSeries > 0 &&
    completedInSeries >= totalEpisodesInSeries &&
    !data.fullyReadStories.includes(seriesId)
      ? [...data.fullyReadStories, seriesId]
      : data.fullyReadStories;

  writeData({
    ...data,
    completedEpisodes,
    fullyReadStories,
  });
  return true;
}
