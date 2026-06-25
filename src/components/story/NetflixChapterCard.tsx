"use client";

import CoverArt from "@/components/ui/CoverArt";
import type { ChapterAccessBadge } from "@/lib/mock/mockSeriesDetail";
import { chapterBadgeLabel } from "@/lib/mock/mockSeriesDetail";

export interface NetflixChapterCardProps {
  number: number;
  title: string;
  description: string;
  durationMinutes: number;
  coverArtUrl?: string;
  coverGradient: string;
  genre: string;
  progressPercent: number;
  badge: ChapterAccessBadge | null;
  disabled?: boolean;
  variant?: "dark" | "light";
  showFastPass?: boolean;
  onClick: () => void;
  onFastPassClick?: () => void;
}

export default function NetflixChapterCard({
  number,
  title,
  description,
  durationMinutes,
  coverArtUrl,
  coverGradient,
  genre,
  progressPercent,
  badge,
  disabled = false,
  variant = "dark",
  showFastPass = false,
  onClick,
  onFastPassClick,
}: NetflixChapterCardProps) {
  const isComing = badge === "coming";
  const isLight = variant === "light";
  const cardDisabled = disabled || (isComing && !showFastPass);

  return (
    <article className="flex w-[min(78vw,300px)] shrink-0 snap-start flex-col sm:w-[320px]">
      <button
        type="button"
        disabled={cardDisabled}
        onClick={onClick}
        className={`group w-full text-left ${cardDisabled ? "cursor-default" : ""}`}
      >
        <div
          className={`relative aspect-video overflow-hidden rounded ${
            isLight ? "bg-[#E6DFD1] ring-1 ring-[#D1C9B8]" : "bg-[#2a2a2a]"
          }`}
        >
          {coverArtUrl ? (
            <img
              src={coverArtUrl}
              alt=""
              className={`h-full w-full object-cover transition duration-300 ${
                isComing
                  ? "opacity-55 saturate-[0.7]"
                  : "group-hover:scale-[1.03]"
              }`}
            />
          ) : (
            <CoverArt
              gradient={coverGradient}
              genre={genre}
              title={title}
              showOverlay={false}
              className="h-full w-full"
            />
          )}

          <div
            className={`absolute inset-0 bg-gradient-to-t ${
              isLight
                ? "from-black/50 via-black/5 to-transparent"
                : "from-black/75 via-black/10 to-transparent"
            }`}
          />

          <span
            className="absolute bottom-3 left-3 font-heading text-5xl font-black leading-none text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
            aria-hidden
          >
            {number}
          </span>

          {badge ? (
            <span className="absolute right-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
              {chapterBadgeLabel(badge)}
            </span>
          ) : null}

          {progressPercent > 0 ? (
            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/20">
              <div
                className={`h-full ${isLight ? "bg-[#2F80ED]" : "bg-[#E50914]"}`}
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              />
            </div>
          ) : null}
        </div>

        <div className="mt-2.5 flex items-start justify-between gap-3">
          <p
            className={`font-heading text-[15px] font-bold leading-tight ${
              isComing
                ? isLight
                  ? "text-[#6B7280]"
                  : "text-white/55"
                : isLight
                  ? "text-[#111827] group-hover:text-[#2F80ED]"
                  : "text-white group-hover:underline"
            }`}
          >
            {title}
          </p>
          <span
            className={`shrink-0 pt-0.5 text-sm ${
              isLight ? "text-[#6B7280]" : "text-[#999]"
            }`}
          >
            {durationMinutes}m
          </span>
        </div>

        <p
          className={`mt-1.5 line-clamp-3 text-sm leading-[1.45] ${
            isLight ? "text-[#6B7280]" : "text-[#999]"
          }`}
        >
          {isComing && !showFastPass
            ? "Coming soon — new chapter drops weekly."
            : isComing && showFastPass
              ? "Public release next week — or skip the wait with Entrepreneur."
              : description}
        </p>
      </button>

      {showFastPass && onFastPassClick ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFastPassClick();
          }}
          className={`mt-3 w-full rounded-lg border px-3 py-2.5 text-left transition ${
            isLight
              ? "border-[#D8A84E]/50 bg-[#FFFBF0] hover:border-[#D8A84E] hover:bg-[#FFF8E8]"
              : "border-[#D8A84E]/40 bg-[#D8A84E]/10 hover:bg-[#D8A84E]/20"
          }`}
        >
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#B8860B]">
            Fast pass
          </p>
          <p className="mt-0.5 text-sm font-semibold leading-snug text-[#111827]">
            Next week&apos;s episode — 1 week early with Entrepreneur
          </p>
        </button>
      ) : null}
    </article>
  );
}
