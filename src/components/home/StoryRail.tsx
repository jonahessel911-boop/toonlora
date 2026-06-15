"use client";

import { useRef } from "react";
import StoryCard, { type StoryCardSize } from "@/components/home/StoryCard";
import type { CatalogSeries } from "@/types/catalog";

interface StoryRailProps {
  stories: CatalogSeries[];
  size?: StoryCardSize;
  showRank?: boolean;
  rankChanges?: number[];
  loading?: boolean;
  skeletonCount?: number;
}

function StoryCardSkeleton({ size }: { size: StoryCardSize }) {
  const width =
    size === "featured"
      ? "w-[148px] sm:w-[172px] md:w-[200px]"
      : "w-[132px] sm:w-[156px]";
  return (
    <div className={`snap-start ${width} flex-shrink-0`}>
      <div className="aspect-[3/4] animate-pulse rounded-[18px] bg-[#E7D8FF]/60" />
      <div className="mt-3 space-y-2">
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-[#E7D8FF]/50" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#E7D8FF]/40" />
      </div>
    </div>
  );
}

export default function StoryRail({
  stories,
  size = "standard",
  showRank = false,
  rankChanges,
  loading = false,
  skeletonCount = 5,
}: StoryRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <div className="flex gap-3 overflow-hidden sm:gap-4 md:gap-5">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <StoryCardSkeleton key={i} size={size} />
        ))}
      </div>
    );
  }

  if (stories.length === 0) return null;

  return (
    <div className="relative -mx-4 sm:mx-0">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 scrollbar-hide snap-x snap-mandatory sm:gap-4 sm:px-0 md:gap-5"
      >
        {stories.map((story, i) => (
          <StoryCard
            key={story.id}
            story={story}
            size={size}
            rank={showRank ? (story.rank ?? i + 1) : undefined}
            rankChange={rankChanges?.[i]}
          />
        ))}
      </div>
    </div>
  );
}
