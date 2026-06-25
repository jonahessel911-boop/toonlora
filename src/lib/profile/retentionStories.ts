import type { FollowingStory } from "@/lib/library/preferences";
import type { ContinueReadingItem } from "@/lib/reading/continueReading";
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
  continueReading,
  following,
  limit = 6,
}: {
  engagement: UserReadingEngagement | null;
  continueReading: ContinueReadingItem[];
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

  for (const entry of continueReading) {
    push({
      seriesId: entry.seriesId,
      title: entry.title,
      subtitle: entry.synopsis ?? entry.genre,
      coverArtUrl: entry.coverArtUrl,
      sagaLabel: entry.genre,
      href: entry.href,
      chaptersRead: entry.episodeNumber,
      reason: "in_progress",
    });
  }

  for (const story of engagement?.topEngagedStories ?? []) {
    push({
      seriesId: story.seriesId,
      title: story.seriesTitle,
      subtitle: story.genre,
      sagaLabel: story.genre,
      href: `/story/${story.seriesId}`,
      chaptersRead: story.chaptersRead,
      reason: "engaged",
    });
  }

  for (const story of following) {
    push({
      seriesId: story.seriesId,
      title: story.title,
      subtitle: story.scheduleLabel,
      sagaLabel: "Business",
      href: story.href,
      chaptersRead: 0,
      reason: "following",
    });
  }

  return results;
}
