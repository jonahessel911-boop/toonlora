"use client";

import { useEffect, useRef } from "react";
import CoverArt from "@/components/ui/CoverArt";
import { trackNextEpisodePromptView } from "@/lib/analytics/gtag";

export interface NextEpisodeInfo {
  number: number;
  title: string;
  coverGradient: string;
  coverArtUrl?: string;
}

interface EpisodeCompleteCardProps {
  seriesId?: string;
  seriesTitle?: string;
  episodeNumber?: number;
  isCatalog?: boolean;
  genre?: string;
  nextEpisode?: NextEpisodeInfo;
  requiresSignup?: boolean;
  requiresSubscription?: boolean;
  credits?: number;
  generating?: boolean;
  onShare?: () => void;
  onNextEpisode?: () => void;
  onContinueReading?: () => void;
  onStartNextEpisode?: () => void;
  onCreateInspired?: () => void;
}

export default function EpisodeCompleteCard({
  seriesId,
  seriesTitle,
  episodeNumber = 1,
  isCatalog = false,
  genre = "Romance",
  nextEpisode,
  requiresSignup = false,
  requiresSubscription = false,
  credits = 7,
  generating = false,
  onShare,
  onNextEpisode,
  onContinueReading,
  onStartNextEpisode,
  onCreateInspired,
}: EpisodeCompleteCardProps) {
  const nextEpisodePromptTracked = useRef(false);
  const nextEpisodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!nextEpisode || !seriesId || nextEpisodePromptTracked.current) return;

    const el = nextEpisodeRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        nextEpisodePromptTracked.current = true;
        trackNextEpisodePromptView({
          seriesId,
          title: seriesTitle ?? "",
          episodeNumber,
          nextEpisodeNumber: nextEpisode.number,
        });
        observer.disconnect();
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [nextEpisode, seriesId, seriesTitle, episodeNumber]);

  const handleContinue = () => {
    (onStartNextEpisode ?? onContinueReading)?.();
  };

  const catalogNextOnly = isCatalog && Boolean(nextEpisode);
  const showEpisodeTitle =
    nextEpisode?.title &&
    nextEpisode.title !== `Episode ${nextEpisode.number}`;

  return (
    <section className="overflow-hidden">
      {!catalogNextOnly ? (
        <div className="relative bg-gradient-to-br from-[#2A114B] via-[#3D2BB8] to-[#5340FF] px-5 py-10 sm:px-8 sm:py-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.15), transparent 45%), radial-gradient(circle at 80% 100%, rgba(255,224,51,0.08), transparent 40%)",
            }}
            aria-hidden
          />

          <div className="relative mx-auto max-w-[480px] text-center">
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/90">
              Episode {episodeNumber} is free
            </span>

            <h2 className="font-heading mt-4 text-2xl font-extrabold text-white sm:text-3xl">
              Episode complete ✨
            </h2>

            {seriesTitle ? (
              <p className="mt-1 text-sm font-semibold text-white/80">{seriesTitle}</p>
            ) : null}

            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/75">
              {nextEpisode
                ? "Continue reading or create your own version."
                : "You reached the latest episode."}
            </p>

            <div className="mt-8 flex flex-col gap-3">
              {isCatalog && !nextEpisode ? (
                <button
                  type="button"
                  onClick={handleContinue}
                  className="btn-coral h-12 w-full text-sm font-bold sm:h-14 sm:text-base"
                >
                  Continue reading
                </button>
              ) : null}

              {!isCatalog && onNextEpisode ? (
                <button
                  type="button"
                  disabled={generating}
                  onClick={onNextEpisode}
                  className="btn-coral h-12 w-full text-sm font-bold disabled:opacity-50 sm:h-14 sm:text-base"
                >
                  {generating
                    ? "Creating next episode…"
                    : `Next episode · ${credits} credits`}
                </button>
              ) : null}

              {onShare ? (
                <button
                  type="button"
                  onClick={onShare}
                  className="h-12 w-full rounded-full border-2 border-white/35 bg-white/10 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/15 sm:h-14"
                >
                  Share
                </button>
              ) : null}

              {onCreateInspired && !isCatalog ? (
                <button
                  type="button"
                  onClick={onCreateInspired}
                  className="h-12 w-full rounded-full border-2 border-white/25 bg-transparent text-sm font-bold text-white/95 transition hover:bg-white/10 sm:h-14"
                >
                  Create inspired version
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {nextEpisode ? (
        <div ref={nextEpisodeRef} className="bg-[#08040F] px-4 py-8 sm:px-6">
          <p className="text-center text-sm font-semibold text-white/90">
            Read next episode
          </p>

          <div className="mx-auto mt-4 max-w-[520px]">
            <button
              type="button"
              onClick={handleContinue}
              className="flex w-full items-center gap-3 rounded-[20px] bg-gradient-to-r from-[#5340FF] via-[#6B4FFF] to-[#7C3AED] p-2.5 text-left shadow-[0_8px_32px_rgba(83,64,255,0.35)] transition hover:brightness-105 sm:gap-4 sm:p-3"
            >
              <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 sm:h-20 sm:w-20">
                {nextEpisode.coverArtUrl ? (
                  <img
                    src={nextEpisode.coverArtUrl}
                    alt={`Episode ${nextEpisode.number} cover`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <CoverArt
                    gradient={nextEpisode.coverGradient}
                    genre={genre}
                    title={nextEpisode.title}
                    showOverlay={false}
                    className="h-full w-full"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-heading text-lg font-extrabold text-white sm:text-xl">
                  Episode {nextEpisode.number}
                </p>
                {showEpisodeTitle ? (
                  <p className="truncate text-sm font-medium text-white/75">
                    {nextEpisode.title}
                  </p>
                ) : null}
              </div>

              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-[#2A114B] sm:px-5 sm:py-3">
                {requiresSignup ? "Create account" : requiresSubscription ? "Unlock" : "Start reading"}
                <PlayIcon />
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PlayIcon() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden>
      <path d="M0 0v12l10-6L0 0z" />
    </svg>
  );
}
