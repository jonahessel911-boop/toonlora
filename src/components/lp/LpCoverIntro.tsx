"use client";

import LP3CoverThumb from "@/components/lp3/LP3CoverThumb";
import type { LpStoryOption } from "@/lib/lp3/storyOptions";

export function SingleCoverIntro({
  label,
  story,
}: {
  label: string;
  story: LpStoryOption;
}) {
  return (
    <div className="mx-auto w-full max-w-[220px] px-4 pt-4 sm:max-w-[260px]">
      <p className="text-center font-heading text-xl font-extrabold uppercase tracking-wide text-[#0A1628] sm:text-2xl">
        {label}
      </p>
      <div className="mt-3 overflow-hidden rounded-2xl shadow-xl ring-1 ring-[#0A1628]/10">
        <div className="aspect-[2/3] w-full">
          {story.coverArtUrl ? (
            <LP3CoverThumb
              src={story.coverArtUrl}
              priority
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className={`h-full w-full bg-gradient-to-br ${story.coverGradient}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function CoverMosaic({ stories }: { stories: LpStoryOption[] }) {
  const tiles = stories.slice(0, 12);
  return (
    <div className="relative mx-auto max-w-lg overflow-hidden px-2">
      <div className="grid grid-cols-4 gap-1 sm:grid-cols-5 sm:gap-1.5">
        {tiles.map((story, i) => (
          <div
            key={`${story.id}-${i}`}
            className="aspect-[2/3] overflow-hidden rounded-md shadow-sm"
          >
            {story.coverArtUrl ? (
              <LP3CoverThumb
                src={story.coverArtUrl}
                priority={i < 10}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={`h-full w-full bg-gradient-to-br ${story.coverGradient}`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#F6F1E7] to-transparent" />
    </div>
  );
}
