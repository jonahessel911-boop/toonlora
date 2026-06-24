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
  onFullscreen?: () => void;
  isFullscreen?: boolean;
  dark?: boolean;
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
  onFullscreen,
  isFullscreen,
  dark = false,
}: ReaderTopBarProps) {
  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-xl pt-[env(safe-area-inset-top)] ${
        dark
          ? "border-b border-white/10 bg-[#12091F]/90"
          : "border-b border-[#E7D8FF] bg-[#FCFAFF]/95"
      }`}
    >
      <div className="mx-auto flex h-11 max-w-[720px] items-center gap-1.5 px-2 sm:h-14 sm:gap-3 sm:px-4">
        <Link
          href="/"
          className={`flex flex-shrink-0 items-center rounded-lg px-1 py-0.5 ${
            dark ? "bg-white/95" : ""
          }`}
          aria-label="Toonlora home"
        >
          <ToonloraIcon size={18} className="sm:!h-5" />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={`/story/${seriesId}`}
            className={`block min-w-0 truncate text-xs font-bold sm:text-sm ${
              dark
                ? "text-white hover:text-white/90"
                : "text-[#2A114B] hover:text-[#5340FF]"
            }`}
          >
            {seriesTitle}
          </Link>
          <div className="mt-0.5 flex items-center gap-1.5 sm:gap-2">
            <span className="inline-flex flex-shrink-0 rounded-full bg-[#5340FF] px-1.5 py-0.5 text-[9px] font-bold text-white sm:px-2 sm:text-[11px]">
              Ch {episodeNumber}
            </span>
            <span
              className={`hidden truncate text-[10px] min-[400px]:block sm:text-xs ${
                dark ? "text-white/60" : "text-[#667085]"
              }`}
            >
              {episodeTitle}
            </span>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-0.5 sm:gap-1">
          <BarBtn label="Previous panel" onClick={onPrev} disabled={!canPrev} dark={dark}>
            ‹
          </BarBtn>
          <BarBtn label="Next panel" onClick={onNext} dark={dark}>
            ›
          </BarBtn>
          {onFullscreen && (
            <BarBtn
              label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={onFullscreen}
              dark={dark}
            >
              {isFullscreen ? "⤓" : "⤢"}
            </BarBtn>
          )}
          {onShare && (
            <BarBtn label="Share" onClick={onShare} dark={dark} className="hidden sm:flex">
              ↗
            </BarBtn>
          )}
          <BarBtn
            label="Save"
            onClick={onBookmark}
            dark={dark}
            className="hidden sm:flex"
          >
            ♡
          </BarBtn>
          <Link
            href={`/story/${seriesId}`}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition sm:h-9 sm:w-9 ${
              dark
                ? "text-white/70 hover:bg-white/10 hover:text-white"
                : "text-[#667085] hover:bg-[#F3ECFF] hover:text-[#5340FF]"
            }`}
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
  dark = false,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex h-7 w-7 items-center justify-center rounded-full text-sm transition disabled:opacity-30 sm:h-9 sm:w-9 ${
        dark
          ? "text-white/85 hover:bg-white/10"
          : "text-[#5340FF] hover:bg-[#F3ECFF]"
      } ${className}`}
    >
      {children}
    </button>
  );
}
