"use client";

import { useEffect, useState } from "react";
import HomeSection from "@/components/home/HomeSection";
import StoryCard from "@/components/home/StoryCard";
import { getReadingHistory, type ReadingHistoryEntry } from "@/lib/readingHistory";
import { catalogToCard } from "@/types/catalog";
import type { CatalogSeries } from "@/types/catalog";

function entryToCard(entry: ReadingHistoryEntry): CatalogSeries {
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
    coverArtUrl: entry.coverArtUrl,
    href: entry.href,
  });
}

export default function ContinueReadingSection() {
  const [entries, setEntries] = useState<ReadingHistoryEntry[]>([]);

  useEffect(() => {
    setEntries(getReadingHistory().slice(0, 8));
    const onStorage = () => setEntries(getReadingHistory().slice(0, 8));
    window.addEventListener("storage", onStorage);
    window.addEventListener("tl-reading-history", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("tl-reading-history", onStorage);
    };
  }, []);

  if (entries.length === 0) return null;

  const stories = entries.map(entryToCard);

  return (
    <HomeSection
      id="continue"
      title="Continue Reading"
      subtitle="Pick up where you left off."
      tone="soft"
    >
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide snap-x snap-mandatory sm:mx-0 sm:gap-4 sm:px-0 md:gap-5">
        {stories.map((story) => (
          <StoryCard key={story.id} story={story} size="standard" />
        ))}
      </div>
    </HomeSection>
  );
}
