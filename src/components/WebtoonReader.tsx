"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ToonloraIcon } from "@/components/ui/ToonloraLogo";
import SpeechBubble from "@/components/SpeechBubble";
import CoverArt from "@/components/ui/CoverArt";
import SignupWall from "@/components/lp/SignupWall";
import type { ReaderPanelData } from "@/lib/readerPanels";

interface WebtoonReaderProps {
  seriesId: string;
  seriesTitle: string;
  episodeNumber: number;
  episodeTitle: string;
  panels: ReaderPanelData[];
  showControls?: boolean;
  onShare?: () => void;
  onGenerateNext?: () => void;
  credits?: number;
  generating?: boolean;
  isCatalog?: boolean;
}

export default function WebtoonReader({
  seriesId,
  seriesTitle,
  episodeNumber,
  episodeTitle,
  panels,
  showControls = true,
  onShare,
  onGenerateNext,
  credits = 0,
  generating = false,
  isCatalog = false,
}: WebtoonReaderProps) {
  const [index, setIndex] = useState(0);
  const [signupOpen, setSignupOpen] = useState(false);
  const total = panels.length;
  const panel = panels[index];
  const isLast = index >= total - 1;

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    if (index >= total - 1) {
      if (isCatalog) setSignupOpen(true);
      return;
    }
    setIndex((i) => Math.min(total - 1, i + 1));
  }, [index, total, isCatalog]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  if (!panel) return null;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      {/* Dark Webtoon chrome */}
      <header className="sticky top-0 z-50 flex h-12 items-center justify-between bg-[#1b1b1b] px-3 text-white sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link
            href="/"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-primary-dark"
          >
            <ToonloraIcon size={22} />
          </Link>
          <Link
            href={`/story/${seriesId}`}
            className="truncate text-xs text-white/90 hover:text-white sm:text-sm"
          >
            <span className="font-semibold">{seriesTitle}</span>
            <span className="text-white/50"> › </span>
            <span>{episodeTitle}</span>
          </Link>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={index === 0}
            className="flex h-8 w-8 items-center justify-center text-lg disabled:opacity-30"
            aria-label="Previous panel"
          >
            ‹
          </button>
          <span className="min-w-[2rem] text-center text-sm font-bold">
            #{panel.panelNumber}
          </span>
          <button
            type="button"
            onClick={goNext}
            className="flex h-8 w-8 items-center justify-center text-lg"
            aria-label="Next panel"
          >
            ›
          </button>
        </div>

        <div className="hidden flex-shrink-0 items-center gap-1 sm:flex">
          <IconBtn label="Subscribe">+</IconBtn>
          <IconBtn label="Facebook">f</IconBtn>
          <IconBtn label="Share on X">𝕏</IconBtn>
          <IconBtn label="Copy link" onClick={onShare}>
            🔗
          </IconBtn>
          <IconBtn label="Menu">⋮</IconBtn>
        </div>
      </header>

      {/* Panel viewport */}
      <main className="flex flex-1 items-start justify-center bg-white px-4 py-6 sm:py-8">
        <div className="w-full max-w-[720px]">
          <div className="relative mx-auto overflow-hidden bg-white shadow-sm ring-1 ring-gray-100">
            {panel.artUrl ? (
              <div className="relative">
                <img
                  src={panel.artUrl}
                  alt={`Panel ${panel.panelNumber}`}
                  className="w-full"
                />
                {panel.bubbles?.map((b, i) => (
                  <SpeechBubble key={i} bubble={b} />
                ))}
              </div>
            ) : (
              <div className="relative aspect-[4/5] w-full sm:aspect-[3/4]">
                <CoverArt
                  gradient={panel.gradient}
                  emoji={panel.emoji ?? "📖"}
                  className="absolute inset-0"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.25),transparent_55%)]" />
                {panel.bubbles?.map((b, i) => (
                  <SpeechBubble key={i} bubble={b} />
                ))}
              </div>
            )}
          </div>

          {isLast && showControls && (
            <div className="mt-8 text-center">
              <p className="text-sm font-bold text-gray-900">Episode complete</p>
              <p className="mt-1 text-xs text-gray-500">
                {isCatalog
                  ? "Create a free account to read the next episode."
                  : "Share this episode or continue your series."}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                {onShare && (
                  <button
                    type="button"
                    onClick={onShare}
                    className="rounded-full bg-gray-900 px-6 py-3 text-sm font-bold text-white"
                  >
                    Share
                  </button>
                )}
                {onGenerateNext && (
                  <button
                    type="button"
                    disabled={generating}
                    onClick={onGenerateNext}
                    className="rounded-full border-2 border-gray-900 px-6 py-3 text-sm font-bold text-gray-900 disabled:opacity-50"
                  >
                    {generating
                      ? "Generating…"
                      : `Next episode · ${credits} credits`}
                  </button>
                )}
                {isCatalog && (
                  <button
                    type="button"
                    onClick={() => setSignupOpen(true)}
                    className="rounded-full bg-groen-primary px-6 py-3 text-sm font-bold text-white"
                  >
                    Continue reading
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <SignupWall
        storyName={seriesTitle}
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
      />
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full text-sm text-white/90 hover:bg-white/10"
    >
      {children}
    </button>
  );
}
