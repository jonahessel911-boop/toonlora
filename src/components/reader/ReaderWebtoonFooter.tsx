"use client";

import Link from "next/link";
import CoverArt from "@/components/ui/CoverArt";

interface EpisodeThumb {
  number: number;
  title: string;
  coverGradient: string;
}

interface ReaderWebtoonFooterProps {
  seriesId: string;
  episodeNumber: number;
  episodes: EpisodeThumb[];
  genre: string;
  commentCount: number;
  liked?: boolean;
  onLike?: () => void;
  onComments?: () => void;
}

export default function ReaderWebtoonFooter({
  seriesId,
  episodeNumber,
  episodes,
  genre,
  commentCount,
  liked = false,
  onLike,
  onComments,
}: ReaderWebtoonFooterProps) {
  const prevEp = episodes.find((e) => e.number === episodeNumber - 1);
  const nextEp = episodes.find((e) => e.number === episodeNumber + 1);

  const epHref = (n: number) =>
    `/story/${seriesId}/read${n > 1 ? `?ep=${n}` : ""}`;

  return (
    <footer className="sticky bottom-0 z-50 border-t border-white/10 bg-[#1a1a1a] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-[720px]">
        <div className="flex gap-2 overflow-x-auto px-3 py-2.5 scrollbar-hide">
          {episodes.slice(0, 12).map((ep) => {
            const isActive = ep.number === episodeNumber;
            return (
              <Link
                key={ep.number}
                href={epHref(ep.number)}
                className="relative shrink-0"
              >
                <div
                  className={`h-14 w-14 overflow-hidden sm:h-16 sm:w-16 ${
                    isActive ? "ring-2 ring-white" : "opacity-80"
                  }`}
                >
                  <CoverArt
                    gradient={ep.coverGradient}
                    genre={genre}
                    showOverlay={false}
                    className="h-full w-full"
                  />
                </div>
                <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-xs font-bold text-white">
                  #{ep.number === 0 ? "P" : ep.number}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={onLike}
              className={`flex items-center gap-1.5 text-white/90 ${liked ? "text-[#FF4FA3]" : ""}`}
              aria-label="Like episode"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 21s-7-4.5-9.5-9C.5 8.5 2 5 5.5 5c2 0 3.5 1.5 4.5 3 1-1.5 2.5-3 4.5-3 3.5 0 5 3.5 3.5 7C19 16.5 12 21 12 21z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  fill={liked ? "currentColor" : "none"}
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={onComments}
              className="flex items-center gap-1.5 text-white/90"
              aria-label="View comments"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M21 11.5a8.5 8.5 0 01-8.5 8.5H7l-4 3V11.5A8.5 8.5 0 0111.5 3h1A8.5 8.5 0 0121 11.5z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
              <span className="text-sm font-semibold">
                {commentCount.toLocaleString()}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-white/90">
            {prevEp ? (
              <Link
                href={epHref(prevEp.number)}
                className="flex h-8 w-8 items-center justify-center"
                aria-label="Previous episode"
              >
                ‹
              </Link>
            ) : (
              <span className="flex h-8 w-8 items-center justify-center opacity-30">‹</span>
            )}
            <span className="min-w-[2rem] text-center text-sm font-bold">
              #{episodeNumber}
            </span>
            {nextEp ? (
              <Link
                href={epHref(nextEp.number)}
                className="flex h-8 w-8 items-center justify-center"
                aria-label="Next episode"
              >
                ›
              </Link>
            ) : (
              <span className="flex h-8 w-8 items-center justify-center opacity-30">›</span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
