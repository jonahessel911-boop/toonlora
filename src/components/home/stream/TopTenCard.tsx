"use client";

import AffiliateLink from "@/components/affiliate/AffiliateLink";
import CinematicStoryCover from "@/components/home/stream/CinematicStoryCover";
import { formatCatalogCategoryLabel } from "@/lib/catalogCategoryLabel";
import { trackStoryClick } from "@/lib/analytics/gtag";
import type { CatalogSeries } from "@/types/catalog";

interface TopTenCardProps {
  story: CatalogSeries;
  rank: number;
  listSection?: string;
}

export default function TopTenCard({ story, rank, listSection }: TopTenCardProps) {
  if (!story.coverArtUrl) return null;

  const href = story.href ?? `/story/${story.id}`;
  const chapters = story.episodes ?? story.episodeCount ?? 1;
  const badge =
    story.sagaBadges?.includes("new-drop")
      ? "NEW"
      : story.sagaBadges?.includes("trending") || rank <= 3
        ? "TRENDING"
        : null;
  const readMinutes = story.readMinutes ?? 8;

  const categoryLabel = formatCatalogCategoryLabel(story.sagaLabel ?? story.genre);

  return (
    <article className="group relative flex h-[400px] w-[min(88vw,320px)] shrink-0 snap-start items-end sm:h-[420px] sm:w-[300px] md:w-[320px]">
      <span
        className="pointer-events-none absolute -left-2 bottom-6 z-0 select-none font-black leading-none text-[#E7DDCC] sm:-left-3"
        style={{
          fontSize: "clamp(5rem, 14vw, 8rem)",
          opacity: 0.38,
          WebkitTextStroke: "1px rgba(231, 221, 204, 0.25)",
        }}
        aria-hidden
      >
        {rank}
      </span>

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
        className="relative z-10 ml-10 block h-[380px] w-[min(78vw,280px)] overflow-hidden rounded-xl border border-[#E7DDCC] bg-[#101827] shadow-[0_2px_10px_rgba(14,23,38,0.08)] ring-1 ring-[#E7DDCC] transition duration-300 sm:ml-12 sm:h-[400px] sm:w-[260px] md:w-[280px] sm:group-hover:scale-[1.04] sm:group-hover:shadow-[0_12px_32px_rgba(14,23,38,0.14)]"
      >
        <CinematicStoryCover
          coverArtUrl={story.coverArtUrl}
          title={story.title}
          sagaLabel={story.sagaLabel}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10" />

        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {badge ? (
            <span className="rounded bg-[#2F80ED] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              {badge}
            </span>
          ) : null}
          <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
            {readMinutes} min
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <p
            className="line-clamp-2 font-heading text-lg font-extrabold leading-snug text-[#F9FAFB]"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
          >
            {story.title}
          </p>
          {story.sagaSubtitle ? (
            <p className="mt-1 line-clamp-1 text-sm font-medium text-[#CBD5E1]">
              {story.sagaSubtitle}
            </p>
          ) : null}
          <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
            {categoryLabel} · {chapters} chapters
          </p>
        </div>
      </AffiliateLink>
    </article>
  );
}
