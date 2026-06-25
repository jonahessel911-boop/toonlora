import type { FollowingStory } from "@/lib/library/preferences";
import type { ReadingHistoryEntry } from "@/lib/readingHistory";
import { findMockStory } from "@/lib/mock/businessStoryCatalog";
import type { UserReadingEngagement } from "@/lib/services/user-reading-engagement";

export interface RetentionStory {
  seriesId: string;
  title: string;
  subtitle: string;
  coverArtUrl?: string;
  sagaLabel: string;
  href: string;
  chaptersRead: number;
  reason: "in_progress" | "engaged" | "following";
}

export function buildRetentionStories({
  engagement,
  history,
  following,
  limit = 6,
}: {
  engagement: UserReadingEngagement | null;
  history: ReadingHistoryEntry[];
  following: FollowingStory[];
  limit?: number;
}): RetentionStory[] {
  const seen = new Set<string>();
  const results: RetentionStory[] = [];

  const push = (story: RetentionStory) => {
    if (seen.has(story.seriesId) || results.length >= limit) return;
    seen.add(story.seriesId);
    results.push(story);
  };

  for (const entry of history) {
    const mock = findMockStory(entry.seriesId);
    push({
      seriesId: entry.seriesId,
      title: entry.title,
      subtitle: mock?.subtitle ?? entry.genre,
      coverArtUrl: entry.coverArtUrl,
      sagaLabel: entry.genre || mock?.sagaLabel || "Business",
      href: entry.href,
      chaptersRead: entry.episodeNumber,
      reason: "in_progress",
    });
  }

  for (const story of engagement?.topEngagedStories ?? []) {
    const mock = findMockStory(story.seriesId);
    push({
      seriesId: story.seriesId,
      title: story.seriesTitle,
      subtitle: mock?.subtitle ?? story.genre,
      coverArtUrl: mock?.coverArtUrl,
      sagaLabel: story.genre,
      href: `/story/${story.seriesId}`,
      chaptersRead: story.chaptersRead,
      reason: "engaged",
    });
  }

  for (const story of following) {
    const mock = findMockStory(story.seriesId);
    push({
      seriesId: story.seriesId,
      title: story.title,
      subtitle: mock?.subtitle ?? story.scheduleLabel,
      coverArtUrl: mock?.coverArtUrl,
      sagaLabel: mock?.sagaLabel ?? "Business",
      href: story.href,
      chaptersRead: 0,
      reason: "following",
    });
  }

  return results;
}
