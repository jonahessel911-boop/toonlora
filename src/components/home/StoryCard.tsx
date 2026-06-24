"use client";

import AffiliateLink from "@/components/affiliate/AffiliateLink";
import StoryCoverImage from "@/components/ui/StoryCoverImage";
import { getCoverPreset } from "@/components/ui/CoverArt";
import { CHAPTER_LABEL, CHAPTERS_LABEL } from "@/lib/brand";
import { trackStoryClick } from "@/lib/analytics/gtag";
import type { CatalogSeries } from "@/types/catalog";

export type StoryCardSize = "featured" | "standard" | "ranked";
export type StoryCardLayout = "rail" | "grid";

interface StoryCardProps {
  story: CatalogSeries;
  size?: StoryCardSize;
  layout?: StoryCardLayout;
  rank?: number;
  rankChange?: number;
  listSection?: string;
  className?: string;
}

const SIZE_WIDTH: Record<StoryCardSize, string> = {
  featured:
    "w-[180px] min-w-[180px] max-w-[180px] sm:w-[196px] sm:min-w-[196px] sm:max-w-[196px] md:w-[220px] md:min-w-[220px] md:max-w-[220px] lg:w-[236px] lg:min-w-[236px] lg:max-w-[236px] xl:w-[252px] xl:min-w-[252px] xl:max-w-[252px] 2xl:w-[268px] 2xl:min-w-[268px] 2xl:max-w-[268px]",
  standard:
    "w-[168px] min-w-[168px] max-w-[168px] sm:w-[176px] sm:min-w-[176px] sm:max-w-[176px] lg:w-[192px] lg:min-w-[192px] lg:max-w-[192px] xl:w-[204px] xl:min-w-[204px] xl:max-w-[204px] 2xl:w-[216px] 2xl:min-w-[216px] 2xl:max-w-[216px]",
  ranked:
    "w-[168px] min-w-[168px] max-w-[168px] sm:w-[176px] sm:min-w-[176px] sm:max-w-[176px] lg:w-[192px] lg:min-w-[192px] lg:max-w-[192px] xl:w-[204px] xl:min-w-[204px] xl:max-w-[204px] 2xl:w-[216px] 2xl:min-w-[216px] 2xl:max-w-[216px]",
};

export default function StoryCard({
  story,
  size = "standard",
  layout = "rail",
  rank,
  rankChange,
  listSection,
  className = "",
}: StoryCardProps) {
  const preset = getCoverPreset(String(story.genre));
  const href = story.href ?? `/story/${story.id}`;
  const views = story.readers ?? "0";
  const likes = story.likes ?? "0";
  const chapters = story.episodes ?? story.episodeCount ?? 1;
  const creator = story.creator ?? story.creatorDisplayName;
  const seed = story.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  return (
    <article
      className={`group flex h-full snap-start flex-col ${
        layout === "grid" ? "w-full min-w-0" : SIZE_WIDTH[size]
      } ${className}`}
    >
      <AffiliateLink
        href={href}
        className="flex h-full flex-col touch-manipulation"
        onClick={() =>
          trackStoryClick({
            seriesId: story.id,
            title: story.title,
            genre: String(story.genre),
            listSection,
          })
        }
      >
        <div className="relative overflow-hidden rounded-xl bg-surface shadow-[0_4px_20px_rgba(10,22,40,0.06)] ring-1 ring-border transition duration-300 active:scale-[0.98] sm:group-hover:-translate-y-1 sm:group-hover:shadow-[0_12px_32px_rgba(10,22,40,0.1)]">
          <StoryCoverImage
            coverArtUrl={story.coverArtUrl}
            title={story.title}
            genre={String(story.genre)}
            gradient={story.coverGradient || preset.gradient}
            seed={seed}
          />

          <span className="absolute left-2.5 top-2.5 rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm sm:text-[10px]">
            {story.genre}
          </span>

          {story.isNew ? (
            <span className="absolute right-2.5 top-2.5 rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold text-white shadow-sm sm:text-[10px]">
              New
            </span>
          ) : null}

          {size === "ranked" && rank !== undefined ? (
            <>
              <span className="absolute bottom-2 left-2 font-heading text-5xl font-extrabold leading-none text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:text-6xl">
                {rank}
              </span>
              {rankChange !== undefined ? (
                <span
                  className={`absolute bottom-3 left-11 flex items-center gap-0.5 rounded-full bg-black/35 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm sm:left-14 sm:text-[10px] ${
                    rankChange >= 0 ? "text-[#86EFAC]" : "text-red-200"
                  }`}
                >
                  {rankChange >= 0 ? "▲" : "▼"}
                  {Math.abs(rankChange)}
                </span>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="mt-3 flex flex-1 flex-col px-0.5">
          <h3 className="line-clamp-2 min-h-[2.75rem] font-heading text-[15px] font-bold leading-snug text-primary sm:min-h-[2.5rem] sm:text-sm">
            {story.title}
          </h3>
          <p className="mt-1 line-clamp-1 min-h-[1.125rem] text-xs text-muted">
            {creator ? `by ${creator}` : "\u00A0"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-medium text-muted sm:mt-1.5 sm:text-[11px]">
            <span className="text-accent">{views} views</span>
            <span>♥ {likes}</span>
            <span>
              {chapters} {chapters !== 1 ? CHAPTERS_LABEL : CHAPTER_LABEL}
            </span>
          </div>
        </div>
      </AffiliateLink>
    </article>
  );
}

/** Published stories with generated cover art (hide gradient placeholders). */
export function withRealCoverArt<T extends CatalogSeries>(stories: T[]): T[] {
  return stories.filter((story) => Boolean(story.coverArtUrl));
}

/** Prefer series with real cover art for curated rails. */
export function prioritizeCoverArt<T extends CatalogSeries>(stories: T[]): T[] {
  return [...stories].sort(
    (a, b) => Number(Boolean(b.coverArtUrl)) - Number(Boolean(a.coverArtUrl))
  );
}
