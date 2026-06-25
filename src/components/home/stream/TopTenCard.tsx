"use client";

import AffiliateLink from "@/components/affiliate/AffiliateLink";
import CinematicStoryCover from "@/components/home/stream/CinematicStoryCover";
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

  return (
    <article className="group relative flex h-[188px] w-[148px] shrink-0 snap-start items-end sm:h-[192px] sm:w-[152px]">
      <span
        className="pointer-events-none absolute -left-1 bottom-2 z-0 select-none font-black leading-none text-[#E7DDCC]"
        style={{
          fontSize: "clamp(3.75rem, 10vw, 5.5rem)",
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
        className="relative z-10 ml-8 block h-[176px] w-[124px] overflow-hidden rounded-lg border border-[#E7DDCC]/90 bg-[#07111F] shadow-[0_2px_10px_rgba(14,23,38,0.08)] transition duration-300 sm:ml-9 sm:h-[180px] sm:w-[128px] sm:group-hover:scale-[1.03] sm:group-hover:shadow-[0_8px_20px_rgba(14,23,38,0.14)]"
      >
        <CinematicStoryCover
          coverArtUrl={story.coverArtUrl}
          title={story.title}
          sagaLabel={story.sagaLabel}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {badge ? (
          <span className="absolute left-1.5 top-1.5 z-10 rounded bg-[#2F80ED] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
            {badge}
          </span>
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07111F]/95 via-[#07111F]/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-2">
          <p
            className="line-clamp-2 text-xs font-bold leading-tight text-[#F8FAFC]"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
          >
            {story.title}
          </p>
          <p className="text-[9px] text-[#AAB4C3]">{chapters} chapters</p>
        </div>
      </AffiliateLink>
    </article>
  );
}
