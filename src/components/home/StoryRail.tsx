"use client";

import HorizontalScrollRail from "@/components/home/HorizontalScrollRail";
import StoryCard, { type StoryCardSize } from "@/components/home/StoryCard";
import type { CatalogSeries } from "@/types/catalog";

interface StoryRailProps {
  stories: CatalogSeries[];
  size?: StoryCardSize;
  showRank?: boolean;
  rankChanges?: number[];
  loading?: boolean;
  skeletonCount?: number;
  listSection?: string;
}

function StoryCardSkeleton({ size }: { size: StoryCardSize }) {
  const width =
    size === "featured"
      ? "w-[180px] sm:w-[196px] md:w-[220px] lg:w-[236px] xl:w-[252px] 2xl:w-[268px]"
      : "w-[168px] sm:w-[176px] lg:w-[192px] xl:w-[204px] 2xl:w-[216px]";
  return (
    <div className={`flex h-full snap-start flex-shrink-0 flex-col ${width}`}>
      <div className="aspect-[3/4] animate-pulse rounded-[20px] bg-[#E7D8FF]/60 sm:rounded-[18px]" />
      <div className="mt-3 flex flex-1 flex-col space-y-2">
        <div className="h-[2.75rem] w-full animate-pulse rounded bg-[#E7D8FF]/50" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-[#E7D8FF]/40" />
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
  listSection,
}: StoryRailProps) {
  if (loading) {
    return (
      <div className="flex items-stretch gap-4 overflow-hidden sm:gap-4 md:gap-5 lg:gap-5 xl:gap-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <StoryCardSkeleton key={i} size={size} />
        ))}
      </div>
    );
  }

  if (stories.length === 0) return null;

  return (
    <HorizontalScrollRail className="flex items-stretch gap-4 overflow-x-auto overscroll-x-contain px-4 pb-1 scrollbar-hide snap-x snap-mandatory sm:gap-4 sm:px-0 md:gap-5 lg:gap-5 xl:gap-6">
      {stories.map((story, i) => (
        <StoryCard
          key={story.id}
          story={story}
          size={size}
          rank={showRank ? (story.rank ?? i + 1) : undefined}
          rankChange={rankChanges?.[i]}
          listSection={listSection}
        />
      ))}
    </HorizontalScrollRail>
  );
}
