"use client";

import Link from "next/link";

interface ReaderWebtoonHeaderProps {
  seriesId: string;
  episodeNumber: number;
  episodeTitle: string;
  onShare?: () => void;
  onMenu?: () => void;
}

export default function ReaderWebtoonHeader({
  seriesId,
  episodeNumber,
  episodeTitle,
  onShare,
  onMenu,
}: ReaderWebtoonHeaderProps) {
  const label = `Ep. ${episodeNumber} - ${episodeTitle}`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#1a1a1a] pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-11 max-w-[720px] items-center gap-2 px-3 sm:h-12 sm:px-4">
        <button
          type="button"
          onClick={onMenu}
          className="flex h-9 w-9 shrink-0 items-center justify-center text-white/90"
          aria-label="Episode list"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <Link
          href={`/story/${seriesId}`}
          className="min-w-0 flex-1 truncate text-center text-sm font-medium text-white sm:text-[15px]"
        >
          {label}
        </Link>

        <button
          type="button"
          onClick={onShare}
          className="flex h-9 w-9 shrink-0 items-center justify-center text-white/90"
          aria-label="Share episode"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 5v14M5 12l7-7 7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
