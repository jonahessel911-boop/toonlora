"use client";

import Link from "next/link";
import CoverArt, { getCoverPreset } from "@/components/ui/CoverArt";
import type { SampleStory } from "@/lib/sampleStories";

export type WebtoonCardVariant = "ranked" | "vertical" | "square" | "grid";

interface WebtoonStoryCardProps {
  story: SampleStory;
  variant?: WebtoonCardVariant;
  rank?: number;
  rankChange?: number;
}

const RAIL_WIDTH =
  "w-[40vw] min-w-[132px] max-w-[156px] sm:w-[168px] sm:min-w-0 sm:max-w-none";

export default function WebtoonStoryCard({
  story,
  variant = "vertical",
  rank,
  rankChange,
}: WebtoonStoryCardProps) {
  const preset = getCoverPreset(String(story.genre));
  const href = story.href ?? `/story/${story.id}`;
  const views = story.readers ?? "1M";
  const likes = story.likes ?? "—";
  const episodes = story.episodes ?? 1;

  const widthClass =
    variant === "grid"
      ? "w-full min-w-0"
      : variant === "square"
        ? `snap-start ${RAIL_WIDTH}`
        : `snap-start ${RAIL_WIDTH}`;

  const showTitleOnCover = variant === "ranked" || variant === "grid";

  return (
    <article className={`group ${widthClass}`}>
      <Link href={href} className="block touch-manipulation">
        <div className="card-shadow relative overflow-hidden rounded-2xl ring-1 ring-gs-border transition duration-300 active:scale-[0.98] sm:group-hover:-translate-y-0.5 sm:group-hover:shadow-xl">
          <CoverArt
            gradient={story.coverGradient || preset.gradient}
            genre={String(story.genre)}
            title={showTitleOnCover ? story.title : undefined}
            showOverlay
            seed={story.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)}
            className="aspect-[3/4] w-full"
          />

          {variant === "ranked" && rank !== undefined && (
            <>
              <span className="absolute bottom-1.5 left-1.5 text-4xl font-black leading-none text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] sm:bottom-2 sm:left-2 sm:text-6xl">
                {rank}
              </span>
              {rankChange !== undefined && (
                <span
                  className={`absolute bottom-2 left-9 flex items-center gap-0.5 rounded-full bg-black/30 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm sm:bottom-3 sm:left-12 sm:text-[10px] ${
                    rankChange >= 0 ? "text-accent-lime" : "text-red-200"
                  }`}
                >
                  {rankChange >= 0 ? "▲" : "▼"}
                  {Math.abs(rankChange)}
                </span>
              )}
            </>
          )}

          {story.isNew && (
            <span className="absolute right-1.5 top-1.5 rounded-full bg-gs-accent px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm sm:right-2 sm:top-2 sm:px-2 sm:text-[10px]">
              New
            </span>
          )}
        </div>

        <div className="mt-2 px-0.5 sm:mt-2.5">
          {!showTitleOnCover && (
            <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-gs-text sm:text-sm">
              {story.title}
            </h3>
          )}
          <p
            className={`text-[11px] text-gs-muted sm:text-xs ${showTitleOnCover ? "" : "mt-0.5"}`}
          >
            {story.genre}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] font-medium text-gs-muted sm:mt-1.5 sm:gap-x-2 sm:text-[11px]">
            <span className="text-gs-primary">{views} views</span>
            <span>♥ {likes}</span>
            <span>{episodes} ep</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
