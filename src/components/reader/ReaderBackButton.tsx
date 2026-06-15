"use client";

import Link from "next/link";

interface ReaderBackButtonProps {
  seriesId: string;
}

export default function ReaderBackButton({ seriesId }: ReaderBackButtonProps) {
  return (
    <Link
      href={`/story/${seriesId}`}
      className="fixed left-3 top-[max(12px,env(safe-area-inset-top))] z-50 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[11px] font-semibold text-white/95 shadow-lg backdrop-blur-md transition hover:bg-black/60 active:scale-[0.98] sm:left-4 sm:px-3.5 sm:py-2 sm:text-xs"
    >
      <span aria-hidden>←</span>
      Back to series
    </Link>
  );
}
