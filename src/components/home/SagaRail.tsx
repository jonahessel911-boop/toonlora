"use client";

import HorizontalScrollRail from "@/components/home/HorizontalScrollRail";
import SagaCard from "@/components/home/SagaCard";
import type { CatalogSeries } from "@/types/catalog";

interface SagaRailProps {
  stories: CatalogSeries[];
  loading?: boolean;
  skeletonCount?: number;
  listSection?: string;
  progressMap?: Record<string, number>;
}

function SagaCardSkeleton() {
  return (
    <div className="flex h-full w-[200px] min-w-[200px] snap-start flex-shrink-0 flex-col sm:w-[220px] md:w-[240px]">
      <div className="aspect-[2/3] animate-pulse rounded-2xl bg-surface-soft" />
      <div className="mt-3 space-y-2 rounded-2xl bg-surface p-4 ring-1 ring-border">
        <div className="h-3 w-2/3 animate-pulse rounded bg-surface-soft" />
        <div className="h-8 w-full animate-pulse rounded bg-surface-soft" />
        <div className="h-7 w-20 animate-pulse rounded-full bg-surface-soft" />
      </div>
    </div>
  );
}

export default function SagaRail({
  stories,
  loading = false,
  skeletonCount = 5,
  listSection,
  progressMap,
}: SagaRailProps) {
  if (loading) {
    return (
      <div className="flex items-stretch gap-4 overflow-hidden md:gap-5">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <SagaCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (stories.length === 0) return null;

  return (
    <HorizontalScrollRail className="flex items-stretch gap-4 overflow-x-auto overscroll-x-contain px-4 pb-1 scrollbar-hide snap-x snap-mandatory sm:gap-5 sm:px-0 md:gap-6">
      {stories.map((story) => (
        <SagaCard
          key={story.id}
          story={story}
          listSection={listSection}
          chapterProgress={progressMap?.[story.id]}
        />
      ))}
    </HorizontalScrollRail>
  );
}
