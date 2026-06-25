"use client";

import AffiliateLink from "@/components/affiliate/AffiliateLink";
import CinematicStoryCover from "@/components/home/stream/CinematicStoryCover";
import { formatCatalogCategoryLabel } from "@/lib/catalogCategoryLabel";
import { trackStoryClick } from "@/lib/analytics/gtag";
import type { CatalogSeries, SagaBadge } from "@/types/catalog";

const BADGE_LABELS: Record<SagaBadge, string> = {
  trending: "Trending",
  "new-drop": "New",
  "founder-saga": "Founder",
  "billion-dollar": "Billion $",
  company: "Company",
};

interface StreamPosterCardProps {
  story: CatalogSeries;
  listSection?: string;
  chapterProgress?: number;
  className?: string;
}

export default function StreamPosterCard({
  story,
  listSection,
  chapterProgress,
  className = "",
}: StreamPosterCardProps) {
  const href = story.href ?? `/story/${story.id}`;
  const chapters = story.episodes ?? story.episodeCount ?? 1;
  const progress = chapterProgress ?? story.chapterProgress;
  const badges = story.sagaBadges ?? [];
  const readMinutes = story.readMinutes ?? 8;
  const categoryLabel = formatCatalogCategoryLabel(story.sagaLabel ?? story.genre);

  return (
    <article
      className={`group relative w-[78vw] max-w-[280px] shrink-0 snap-start sm:w-[260px] md:w-[280px] ${className}`}
    >
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
        className="relative block h-[380px] overflow-hidden rounded-xl bg-[#101827] ring-1 ring-[#E7DDCC] shadow-[0_2px_10px_rgba(14,23,38,0.06)] transition duration-300 ease-out md:h-[400px] sm:group-hover:z-20 sm:group-hover:scale-[1.04] sm:group-hover:shadow-[0_12px_32px_rgba(14,23,38,0.14)]"
      >
        <CinematicStoryCover
          coverArtUrl={story.coverArtUrl}
          title={story.title}
          sagaLabel={story.sagaLabel ?? String(story.genre)}
          className="absolute inset-0"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10" />

        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          {badges.slice(0, 2).map((badge) => (
            <span
              key={badge}
              className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white ${
                badge === "trending" ? "bg-orange-500/90" : "bg-black/60 backdrop-blur-sm"
              }`}
            >
              {badge === "trending" ? "🔥 Trending" : BADGE_LABELS[badge]}
            </span>
          ))}
          <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
            {readMinutes} min
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3.5 transition group-hover:translate-y-2 group-hover:opacity-0">
          <p className="font-heading text-lg font-extrabold leading-snug text-[#F9FAFB]">
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
          {progress && progress > 0 ? (
            <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-[#2F80ED]"
                style={{ width: `${Math.min(100, (progress / chapters) * 100)}%` }}
              />
            </div>
          ) : null}
        </div>

        <div className="absolute inset-0 flex flex-col justify-end bg-black/75 p-3 opacity-0 backdrop-blur-[2px] transition duration-300 group-hover:opacity-100">
          <p className="font-heading text-base font-extrabold text-white">{story.title}</p>
          <p className="mt-1 line-clamp-2 text-xs text-[#CBD5E1]">{story.synopsis}</p>
          <div className="mt-3 flex gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-white px-3 py-1.5 text-xs font-bold text-black">
              ▶ Read
            </span>
            <span className="inline-flex items-center rounded border border-white/30 px-3 py-1.5 text-xs font-semibold text-white">
              Info
            </span>
          </div>
        </div>
      </AffiliateLink>
    </article>
  );
}
