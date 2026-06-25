"use client";

import AffiliateLink from "@/components/affiliate/AffiliateLink";
import CinematicStoryCover from "@/components/home/stream/CinematicStoryCover";
import { trackStoryClick } from "@/lib/analytics/gtag";
import type { CatalogSeries } from "@/types/catalog";

interface FounderStoryCardProps {
  story: CatalogSeries;
  listSection?: string;
}

export default function FounderStoryCard({
  story,
  listSection,
}: FounderStoryCardProps) {
  const href = story.href ?? `/story/${story.id}`;
  const chapters = story.episodes ?? story.episodeCount ?? 1;

  return (
    <article className="w-[min(88vw,360px)] shrink-0 snap-start sm:w-[380px]">
      <AffiliateLink
        href={href}
        onClick={() =>
          trackStoryClick({
            seriesId: story.id,
            title: story.title,
            genre: String(story.genre),
            listSection,
          })
        }
        className="group flex h-[118px] overflow-hidden rounded-xl bg-[#101827] ring-1 ring-[#E7DDCC] shadow-[0_2px_10px_rgba(14,23,38,0.06)] transition hover:scale-[1.02] hover:shadow-[0_10px_28px_rgba(14,23,38,0.12)] hover:ring-[#2F80ED]/40"
      >
        <div className="relative h-full w-[110px] shrink-0 overflow-hidden">
          <CinematicStoryCover
            coverArtUrl={story.coverArtUrl}
            title={story.title}
            sagaLabel={story.sagaLabel}
            className="h-full w-full"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3">
          <p className="font-heading text-base font-extrabold leading-tight text-[#F9FAFB]">
            {story.title}
          </p>
          {story.sagaSubtitle ? (
            <p className="mt-0.5 line-clamp-1 text-sm text-[#A7B0BE]">
              {story.sagaSubtitle}
            </p>
          ) : null}
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">
            {story.sagaLabel ?? story.genre} · {chapters} chapters
          </p>
          <span className="mt-2 inline-flex w-fit items-center gap-1 text-xs font-bold text-[#2F80ED] opacity-0 transition group-hover:opacity-100">
            Read now →
          </span>
        </div>
      </AffiliateLink>
    </article>
  );
}
