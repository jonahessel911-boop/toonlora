"use client";

import AffiliateLink from "@/components/affiliate/AffiliateLink";
import CinematicStoryCover from "@/components/home/stream/CinematicStoryCover";
import { trackStoryClick } from "@/lib/analytics/gtag";
import { computeSeriesReadPercent } from "@/lib/readingHistory";
import type { CatalogSeries } from "@/types/catalog";

interface ContinueReadingCardProps {
  story: CatalogSeries;
  chapterProgress?: number;
  panelIndex?: number;
  totalPanels?: number;
  listSection?: string;
}

export default function ContinueReadingCard({
  story,
  chapterProgress = 1,
  panelIndex,
  totalPanels,
  listSection,
}: ContinueReadingCardProps) {
  const href = story.href ?? `/story/${story.id}`;
  const chapters = story.episodes ?? story.episodeCount ?? 1;
  const episode = chapterProgress ?? story.chapterProgress ?? 1;
  const panel = panelIndex ?? story.panelIndex ?? 0;
  const panelsInEpisode = totalPanels ?? story.totalPanels ?? 1;
  const pct = computeSeriesReadPercent(
    episode,
    chapters,
    panel,
    panelsInEpisode
  );

  return (
    <article className="w-[min(88vw,360px)] shrink-0 snap-start sm:w-[360px]">
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
        className="group flex h-[96px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#101827] shadow-[0_2px_12px_rgba(7,17,31,0.12)] transition hover:border-[#2F80ED]/35 hover:shadow-[0_8px_24px_rgba(7,17,31,0.2)] sm:h-[104px]"
      >
        <div className="relative h-full w-[72px] shrink-0 overflow-hidden sm:w-[76px]">
          <CinematicStoryCover
            coverArtUrl={story.coverArtUrl}
            title={story.title}
            sagaLabel={story.sagaLabel}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2">
          <p className="truncate font-heading text-[15px] font-extrabold leading-tight text-[#F8FAFC]">
            {story.title}
          </p>
          {story.sagaSubtitle ? (
            <p className="truncate text-xs text-[#64748B]">{story.sagaSubtitle}</p>
          ) : null}
          <div className="mt-2 h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#2F80ED]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-[#AAB4C3]">
            Chapter {episode} of {chapters}
            {panel > 0 ? ` · Panel ${panel + 1}` : ""}
          </p>
        </div>

        <div className="flex w-12 shrink-0 items-center justify-center pr-2 sm:pr-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.08] text-xs text-[#F8FAFC] transition group-hover:border-[#2F80ED]/50 group-hover:bg-[#2F80ED]">
            ▶
          </span>
        </div>
      </AffiliateLink>
    </article>
  );
}
