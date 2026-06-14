"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SignupWall from "@/components/lp/SignupWall";
import ComicPanel from "@/components/reader/ComicPanel";
import EpisodeCompleteCard from "@/components/reader/EpisodeCompleteCard";
import ReaderProgress from "@/components/reader/ReaderProgress";
import ReaderTopBar from "@/components/reader/ReaderTopBar";
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
  onCreateInspired?: () => void;
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
  onCreateInspired,
  credits = 7,
  generating = false,
  isCatalog = false,
}: WebtoonReaderProps) {
  const [index, setIndex] = useState(0);
  const [signupOpen, setSignupOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const total = panels.length;

  const scrollToPanel = useCallback((i: number) => {
    const el = panelRefs.current[i];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIndex(i);
  }, []);

  const goPrev = useCallback(() => {
    scrollToPanel(Math.max(0, index - 1));
  }, [index, scrollToPanel]);

  const goNext = useCallback(() => {
    if (index >= total - 1) {
      if (isCatalog) setSignupOpen(true);
      return;
    }
    scrollToPanel(Math.min(total - 1, index + 1));
  }, [index, total, isCatalog, scrollToPanel]);

  const handleContinueReading = () => setSignupOpen(true);

  const handleNextEpisode = () => {
    if (isCatalog) {
      setSignupOpen(true);
      return;
    }
    onGenerateNext?.();
  };

  // Track visible panel on scroll
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
            const idx = panelRefs.current.indexOf(entry.target as HTMLElement);
            if (idx >= 0) setIndex(idx);
          }
        }
      },
      { root: container, threshold: [0.4, 0.6] }
    );

    panelRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [panels.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  if (total === 0) return null;

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#FCFAFF]">
      {/* Soft Toonlora ambient background */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#F3ECFF]/80 via-[#FCFAFF] to-[#E9D8FD]/30"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 top-32 h-64 w-64 rounded-full bg-[#5340FF]/8 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-1/2 h-72 w-72 rounded-full bg-[#FF4FA3]/6 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-32 left-1/3 h-48 w-48 rounded-full bg-[#22D3EE]/6 blur-3xl"
        aria-hidden
      />

      <ReaderTopBar
        seriesId={seriesId}
        seriesTitle={seriesTitle}
        episodeNumber={episodeNumber}
        episodeTitle={episodeTitle}
        onPrev={goPrev}
        onNext={goNext}
        canPrev={index > 0}
        onShare={onShare}
      />

      <main
        ref={scrollRef}
        className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth pb-28"
      >
        <div className="relative mx-auto w-full max-w-[720px] px-0 sm:px-4 sm:py-4">
          <div className="overflow-hidden bg-white shadow-[0_24px_64px_rgba(83,64,255,0.14)] ring-1 ring-[#E7D8FF] sm:rounded-[18px]">
            {panels.map((panel, i) => (
              <div
                key={i}
                ref={(el) => {
                  panelRefs.current[i] = el;
                }}
              >
                <ComicPanel
                  panel={panel}
                  index={i}
                  isActive={i === index}
                  onClick={() => {
                    if (i === index) goNext();
                    else scrollToPanel(i);
                  }}
                />
              </div>
            ))}

            {showControls && (
              <EpisodeCompleteCard
                seriesTitle={seriesTitle}
                episodeNumber={episodeNumber}
                isCatalog={isCatalog}
                credits={credits}
                generating={generating}
                onShare={onShare}
                onNextEpisode={onGenerateNext ? handleNextEpisode : undefined}
                onContinueReading={isCatalog ? handleContinueReading : undefined}
                onCreateInspired={
                  onCreateInspired ??
                  (!isCatalog
                    ? () => {
                        window.location.href = "/create";
                      }
                    : undefined)
                }
              />
            )}
          </div>
        </div>
      </main>

      <ReaderProgress
        current={index}
        total={total}
        onSelect={scrollToPanel}
      />

      <SignupWall
        storyName={seriesTitle}
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
      />
    </div>
  );
}
