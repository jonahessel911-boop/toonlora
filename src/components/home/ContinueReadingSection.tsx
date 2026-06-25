"use client";

import { useMemo } from "react";
import HomeSection from "@/components/home/HomeSection";
import HorizontalScrollRail from "@/components/home/HorizontalScrollRail";
import StoryCard from "@/components/home/StoryCard";
import { useContinueReading } from "@/hooks/useContinueReading";
import { continueItemToCatalogCard } from "@/lib/reading/continueReading";

export default function ContinueReadingSection() {
  const { items } = useContinueReading(8);

  const stories = useMemo(
    () => items.map((item) => continueItemToCatalogCard(item)),
    [items]
  );

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
          <StoryCard
            key={story.id}
            story={story}
            size="standard"
            listSection="continue_reading"
          />
        ))}
      </HorizontalScrollRail>
    </HomeSection>
  );
}
