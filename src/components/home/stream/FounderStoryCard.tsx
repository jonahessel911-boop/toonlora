"use client";

import AffiliateLink from "@/components/affiliate/AffiliateLink";
import CinematicStoryCover from "@/components/home/stream/CinematicStoryCover";
import { formatCatalogCategoryLabel } from "@/lib/catalogCategoryLabel";
import { formatFounderStoryTitle } from "@/lib/founderStoryTitle";
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
  const displayTitle = formatFounderStoryTitle({
    storyId: story.id,
    title: story.title,
    subtitle: story.sagaSubtitle,
  });
  const showSubtitle =
    Boolean(story.sagaSubtitle) &&
    !displayTitle.includes(story.sagaSubtitle ?? "");
  const categoryLabel = formatCatalogCategoryLabel(story.sagaLabel ?? story.genre);

  return (
    <article className="w-[min(92vw,460px)] shrink-0 snap-start sm:w-[480px]">
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
        className="group flex h-[148px] overflow-hidden rounded-xl bg-[#101827] ring-1 ring-[#E7DDCC] shadow-[0_2px_10px_rgba(14,23,38,0.06)] transition hover:scale-[1.02] hover:shadow-[0_10px_28px_rgba(14,23,38,0.12)] hover:ring-[#2F80ED]/40 sm:h-[156px]"
      >
        <div className="relative h-full w-[140px] shrink-0 overflow-hidden sm:w-[148px]">
          <CinematicStoryCover
            coverArtUrl={story.coverArtUrl}
            title={displayTitle}
            sagaLabel={story.sagaLabel}
            className="h-full w-full"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center px-5 py-4">
          <p className="font-heading text-lg font-extrabold leading-snug text-[#F9FAFB] sm:text-xl">
            {displayTitle}
          </p>
          {showSubtitle ? (
            <p className="mt-1 line-clamp-1 text-sm text-[#A7B0BE] sm:text-base">
              {story.sagaSubtitle}
            </p>
          ) : null}
          <p className="mt-2.5 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
            {categoryLabel} · {chapters} chapters
          </p>
          <span className="mt-2.5 inline-flex w-fit items-center gap-1 text-sm font-bold text-[#2F80ED] opacity-0 transition group-hover:opacity-100">
            Read now →
          </span>
        </div>
      </AffiliateLink>
    </article>
  );
}
