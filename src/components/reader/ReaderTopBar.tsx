"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ToonloraIcon } from "@/components/ui/ToonloraLogo";

interface ReaderTopBarProps {
  seriesId: string;
  seriesTitle: string;
  episodeNumber: number;
  episodeTitle: string;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  onShare?: () => void;
  onBookmark?: () => void;
}

export default function ReaderTopBar({
  seriesId,
  seriesTitle,
  episodeNumber,
  episodeTitle,
  onPrev,
  onNext,
  canPrev,
  onShare,
  onBookmark,
}: ReaderTopBarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E7D8FF] bg-[#FCFAFF]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-[720px] items-center gap-2 px-3 sm:h-14 sm:gap-3 sm:px-4">
        <Link
          href="/"
          className="flex flex-shrink-0 items-center rounded-lg px-1 py-0.5"
          aria-label="Toonlora home"
        >
          <ToonloraIcon size={18} className="sm:!h-5" />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={`/story/${seriesId}`}
            className="block min-w-0 truncate text-xs font-bold text-[#2A114B] hover:text-[#5340FF] sm:text-sm"
          >
            {seriesTitle}
          </Link>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="inline-flex flex-shrink-0 rounded-full bg-[#5340FF] px-2 py-0.5 text-[10px] font-bold text-white sm:text-[11px]">
              Episode {episodeNumber}
            </span>
            <span className="truncate text-[10px] text-[#667085] sm:text-xs">
              {episodeTitle}
            </span>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-0.5 sm:gap-1">
          <BarBtn label="Previous panel" onClick={onPrev} disabled={!canPrev}>
            ‹
          </BarBtn>
          <BarBtn label="Next panel" onClick={onNext}>
            ›
          </BarBtn>
          {onShare && (
            <BarBtn label="Share" onClick={onShare} className="hidden sm:flex">
              ↗
            </BarBtn>
          )}
          <BarBtn
            label="Save"
            onClick={onBookmark}
            className="hidden sm:flex"
          >
            ♡
          </BarBtn>
          <Link
            href={`/story/${seriesId}`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-[#667085] transition hover:bg-[#F3ECFF] hover:text-[#5340FF] sm:h-9 sm:w-9"
            aria-label="Close reader"
          >
            ✕
          </Link>
        </div>
      </div>
    </header>
  );
}

function BarBtn({
  children,
  label,
  onClick,
  disabled,
  className = "",
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-full text-base text-[#5340FF] transition hover:bg-[#F3ECFF] disabled:opacity-30 sm:h-9 sm:w-9 ${className}`}
    >
      {children}
    </button>
  );
}
