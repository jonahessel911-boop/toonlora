"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SignupWall from "@/components/lp/SignupWall";
import ComicPanel from "@/components/reader/ComicPanel";
import EpisodeCompleteCard from "@/components/reader/EpisodeCompleteCard";
import ReaderProgress from "@/components/reader/ReaderProgress";
import ReaderTopBar from "@/components/reader/ReaderTopBar";
import { trackReadingProgress } from "@/components/analytics/AnalyticsProvider";
import { useUserStore } from "@/store/useUserStore";
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

const FLIP_MS = 520;

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
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [showEndCard, setShowEndCard] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { email } = useUserStore();
  const loggedIn = Boolean(email);
  const total = panels.length;
  const isLastPanel = index >= total - 1;
  const panel = panels[index];

  const shouldPromptSignup = isCatalog && !loggedIn;

  const openSignupIfNeeded = useCallback(() => {
    if (shouldPromptSignup) {
      setSignupOpen(true);
      return true;
    }
    if (showControls) setShowEndCard(true);
    return false;
  }, [shouldPromptSignup, showControls]);

  const goTo = useCallback(
    (nextIndex: number, dir: "next" | "prev") => {
      if (isFlipping || nextIndex < 0 || nextIndex >= total) return;
      setDirection(dir);
      setIsFlipping(true);
      setTimeout(() => {
        setIndex(nextIndex);
        setIsFlipping(false);
        setDirection(null);
      }, FLIP_MS);
    },
    [isFlipping, total]
  );

  const goPrev = useCallback(() => {
    if (showEndCard) {
      setShowEndCard(false);
      return;
    }
    if (index <= 0 || isFlipping) return;
    goTo(index - 1, "prev");
  }, [index, isFlipping, goTo, showEndCard]);

  const goNext = useCallback(() => {
    if (isFlipping) return;
    if (showEndCard) return;

    if (isLastPanel) {
      openSignupIfNeeded();
      return;
    }
    goTo(index + 1, "next");
  }, [isFlipping, isLastPanel, index, goTo, openSignupIfNeeded, showEndCard]);

  const jumpToPanel = useCallback(
    (i: number) => {
      if (isFlipping || i === index) return;
      if (i > index && isLastPanel && shouldPromptSignup) {
        openSignupIfNeeded();
        return;
      }
      goTo(i, i > index ? "next" : "prev");
    },
    [isFlipping, index, isLastPanel, shouldPromptSignup, goTo, openSignupIfNeeded]
  );

  // Show signup when user finishes panel 10 (last panel)
  useEffect(() => {
    if (!shouldPromptSignup || isFlipping || showEndCard) return;
    if (index !== total - 1) return;

    const timer = window.setTimeout(() => {
      setSignupOpen(true);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [index, total, shouldPromptSignup, isFlipping, showEndCard]);

  useEffect(() => {
    trackReadingProgress({
      seriesId,
      episodeNumber,
      panelIndex: index,
      totalPanels: total,
    });
  }, [seriesId, episodeNumber, index, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    const el = rootRef.current;
    if (!el) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await el.requestFullscreen();
    } catch {
      /* unsupported */
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 48) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
  };

  const handleNextEpisode = () => {
    if (isCatalog) {
      setSignupOpen(true);
      return;
    }
    onGenerateNext?.();
  };

  if (!panel || total === 0) return null;

  return (
    <div
      ref={rootRef}
      className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#12091F]"
    >
      {/* Focus glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(83,64,255,0.22),transparent_55%)]"
        aria-hidden
      />

      <ReaderTopBar
        seriesId={seriesId}
        seriesTitle={seriesTitle}
        episodeNumber={episodeNumber}
        episodeTitle={episodeTitle}
        onPrev={goPrev}
        onNext={goNext}
        canPrev={index > 0 || showEndCard}
        onShare={onShare}
        onFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        dark
      />

      <main
        className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-2 py-2 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-4 sm:pb-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Tap zones */}
        <button
          type="button"
          className="absolute inset-y-0 left-0 z-20 w-[28%] max-w-[140px] cursor-w-resize opacity-0"
          onClick={goPrev}
          aria-label="Previous page"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 z-20 w-[28%] max-w-[140px] cursor-e-resize opacity-0"
          onClick={goNext}
          aria-label="Next page"
        />

        {showEndCard && !shouldPromptSignup ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-[520px] overflow-y-auto max-h-full"
          >
            <EpisodeCompleteCard
              seriesTitle={seriesTitle}
              episodeNumber={episodeNumber}
              isCatalog={isCatalog}
              credits={credits}
              generating={generating}
              onShare={onShare}
              onNextEpisode={onGenerateNext ? handleNextEpisode : undefined}
              onCreateInspired={
                onCreateInspired ??
                (!isCatalog ? () => { window.location.href = "/create"; } : undefined)
              }
            />
          </motion.div>
        ) : (
          <div
            className="relative z-10 h-full w-full max-w-[min(100%,520px)]"
            style={{ perspective: "1400px" }}
          >
            <div className="relative mx-auto h-[min(100%,calc(100dvh-10rem-env(safe-area-inset-top)-env(safe-area-inset-bottom)))] w-full max-w-[480px]">
              <AnimatePresence mode="wait">
                {!isFlipping && (
                  <motion.div
                    key={`panel-${index}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 overflow-hidden rounded-2xl bg-white shadow-[0_32px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/15 sm:rounded-[20px]"
                  >
                    <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-r from-black/10 to-transparent" />
                    <ComicPanel
                      panel={panel}
                      index={index}
                      variant="flipbook"
                      onClick={goNext}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {isFlipping && direction === "next" && (
                <motion.div
                  className="absolute inset-0 origin-left overflow-hidden rounded-2xl bg-white shadow-[0_32px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/15 sm:rounded-[20px]"
                  style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
                  initial={{ rotateY: 0 }}
                  animate={{ rotateY: -180 }}
                  transition={{ duration: FLIP_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
                >
                  <ComicPanel panel={panels[index]} index={index} variant="flipbook" />
                </motion.div>
              )}

              {isFlipping && direction === "prev" && index > 0 && (
                <motion.div
                  className="absolute inset-0 origin-right overflow-hidden rounded-2xl bg-white shadow-[0_32px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/15 sm:rounded-[20px]"
                  style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
                  initial={{ rotateY: 180 }}
                  animate={{ rotateY: 0 }}
                  transition={{ duration: FLIP_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
                >
                  <ComicPanel
                    panel={panels[index - 1]}
                    index={index - 1}
                    variant="flipbook"
                  />
                </motion.div>
              )}
            </div>

            <p className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/35 sm:hidden">
              Swipe to turn the page
            </p>
            <p className="pointer-events-none absolute -bottom-1 left-1/2 hidden -translate-x-1/2 text-[11px] text-white/40 sm:block">
              Tap sides or swipe to turn the page
            </p>
          </div>
        )}
      </main>

      <ReaderProgress current={index} total={total} onSelect={jumpToPanel} dark />

      <SignupWall
        storyName={seriesTitle}
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
      />
    </div>
  );
}
