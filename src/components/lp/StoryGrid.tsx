"use client";

import LPStoryCard from "@/components/lp/StoryCard";
import type { CatalogSeries } from "@/types/catalog";

interface StoryGridProps {
  stories: CatalogSeries[];
}

export default function StoryGrid({ stories }: StoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {stories.map((story) => (
        <LPStoryCard key={story.id} story={story} />
      ))}
    </div>
  );
}
