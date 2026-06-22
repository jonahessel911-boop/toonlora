"use client";

import { useCallback, useEffect, useState } from "react";
import HomeSection from "@/components/home/HomeSection";
import HorizontalScrollRail from "@/components/home/HorizontalScrollRail";
import StoryCard from "@/components/home/StoryCard";
import {
  fetchPublishedStory,
  getStoryCoverArtUrl,
} from "@/lib/fetchPublishedStory";
import { getReadingHistory, type ReadingHistoryEntry } from "@/lib/readingHistory";
import { catalogToCard } from "@/types/catalog";
import type { CatalogSeries } from "@/types/catalog";

function entryToCard(entry: ReadingHistoryEntry, coverArtUrl?: string): CatalogSeries {
  return catalogToCard({
    id: entry.seriesId,
    title: entry.title,
    genre: entry.genre,
    coverGradient: entry.coverGradient,
    source: "creator",
    status: "published",
    creatorDisplayName: entry.creatorDisplayName ?? "Toonlora",
    synopsis: "",
    episodeCount: entry.episodeNumber,
    viewsCount: 0,
    likesCount: 0,
    featuredRank: null,
    publishedAt: null,
    createdAt: entry.updatedAt,
    coverArtUrl: coverArtUrl ?? entry.coverArtUrl,
    href: entry.href,
  });
}

async function hydrateEntry(entry: ReadingHistoryEntry): Promise<CatalogSeries> {
  const story = await fetchPublishedStory(entry.seriesId);
  if (!story) return entryToCard(entry);

  const coverArtUrl = getStoryCoverArtUrl(story) ?? entry.coverArtUrl;
  return entryToCard(
    {
      ...entry,
      title: story.title,
      genre: String(story.genre),
      coverGradient: story.coverGradient,
      creatorDisplayName: story.creatorDisplayName ?? entry.creatorDisplayName,
    },
    coverArtUrl
  );
}

export default function ContinueReadingSection() {
  const [stories, setStories] = useState<CatalogSeries[]>([]);

  const refresh = useCallback(async () => {
    const entries = getReadingHistory().slice(0, 8);
    if (entries.length === 0) {
      setStories([]);
      return;
    }
    const cards = await Promise.all(entries.map((entry) => hydrateEntry(entry)));
    setStories(cards);
  }, []);

  useEffect(() => {
    void refresh();
    const onStorage = () => void refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("tl-reading-history", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("tl-reading-history", onStorage);
    };
  }, [refresh]);

  if (stories.length === 0) return null;

  return (
    <HomeSection
      id="continue"
      title="Continue Reading"
      subtitle="Pick up where you left off."
      tone="soft"
    >
      <HorizontalScrollRail className="flex items-stretch gap-4 overflow-x-auto px-4 pb-1 scrollbar-hide snap-x snap-mandatory sm:gap-4 sm:px-0 md:gap-5 lg:gap-5 xl:gap-6">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} size="standard" />
        ))}
      </HorizontalScrollRail>
    </HomeSection>
  );
}
