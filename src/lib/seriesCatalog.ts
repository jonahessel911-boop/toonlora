import type { Story } from "@/types/story";
import { formatCatalogViews } from "@/types/catalog";
import { getStoryCoverArtUrl } from "@/lib/fetchPublishedStory";

export interface SeriesEpisodeListing {
  number: number;
  title: string;
  date: string;
  likes: number;
  coverGradient: string;
  coverArtUrl?: string;
}

export interface SeriesDetail {
  id: string;
  title: string;
  genre: string;
  coverGradient: string;
  coverArtUrl?: string;
  creators: string[];
  views: string;
  likes: string;
  schedule: string;
  synopsis: string;
  episodes: SeriesEpisodeListing[];
  source?: "admin" | "creator";
  status?: "draft" | "published";
}

export function storyToSeriesDetail(story: Story): SeriesDetail {
  const coverArtUrl = getStoryCoverArtUrl(story);

  const episodes: SeriesEpisodeListing[] =
    story.episodes?.map((ep) => ({
      number: ep.episodeNumber,
      title: ep.title,
      date: new Date(story.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      likes: story.likesCount ?? 0,
      coverGradient: story.coverGradient,
      coverArtUrl: ep.comicPage?.artUrl ?? coverArtUrl,
    })) ?? [];

  const creatorName =
    story.creatorDisplayName ??
    story.mainCharacter ??
    "Toonlora Creator";

  const schedule =
    story.source === "admin"
      ? "TOONLORA ORIGINAL"
      : story.status === "published"
        ? "PUBLISHED"
        : "DRAFT";

  return {
    id: story.id,
    title: story.title,
    genre: String(story.genre),
    coverGradient: story.coverGradient,
    coverArtUrl,
    creators: [creatorName, story.loveInterest].filter(Boolean) as string[],
    views: formatCatalogViews(story.viewsCount ?? 0),
    likes: formatCatalogViews(story.likesCount ?? 0),
    schedule,
    synopsis:
      story.synopsis ??
      story.storyBible?.logline ??
      story.prompt ??
      "A Toonlora series.",
    episodes,
    source: story.source,
    status: story.status,
  };
}
