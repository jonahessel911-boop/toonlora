"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import EpisodeCompleteCard from "@/components/reader/EpisodeCompleteCard";
import PanelBlock from "@/components/reader/PanelBlock";
import ReaderBackButton from "@/components/reader/ReaderBackButton";
import { trackReadingProgress } from "@/components/analytics/AnalyticsProvider";
import {
  buildPaywallPath,
  buildReaderSignupPath,
} from "@/lib/reader/nextEpisodeGate";
import { saveReadingProgress } from "@/lib/readingHistory";
import { useUserStore } from "@/store/useUserStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import type { ReaderPanelData } from "@/lib/readerPanels";

interface WebtoonReaderProps {
  seriesId: string;
  seriesTitle: string;
  episodeNumber: number;
  episodeTitle: string;
  panels: ReaderPanelData[];
  genre?: string;
  coverGradient?: string;
  coverArtUrl?: string;
  creatorDisplayName?: string;
  episodes?: Array<{
    number: number;
    title: string;
    coverGradient: string;
    coverArtUrl?: string;
  }>;
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
  panels,
  genre = "Romance",
  coverGradient = "from-[#5340FF] via-[#7C3AED] to-[#8B5CF6]",
  coverArtUrl,
  creatorDisplayName,
  showControls = true,
  onShare,
  onGenerateNext,
  onCreateInspired,
  credits = 7,
  generating = false,
  isCatalog = false,
  episodes,
}: WebtoonReaderProps) {
  const [maxPanelIndex, setMaxPanelIndex] = useState(0);
  const [showEndCard, setShowEndCard] = useState(false);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const lastPanelRef = useRef<HTMLElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const { email } = useUserStore();
  const { isSubscriber, hydrate: hydrateSubscription } = useSubscriptionStore();
  const loggedIn = Boolean(email);
  const hasVipAccess = isSubscriber();
  const needsSignup = isCatalog && !loggedIn;
  const needsSubscription = isCatalog && loggedIn && !hasVipAccess;
  const gatedNextEpisode = needsSignup || needsSubscription;
  const returnPath = `/story/${seriesId}/read${episodeNumber > 1 ? `?ep=${episodeNumber}` : ""}`;
  const total = panels.length;

  const nextEpisodeFromList = episodes?.find((e) => e.number === episodeNumber + 1);
  const panelCoverUrl = panels.find((p) => p.imageUrl)?.imageUrl;
  const nextEpisode =
    nextEpisodeFromList ??
    (gatedNextEpisode
      ? {
          number: episodeNumber + 1,
          title: `Episode ${episodeNumber + 1}`,
          coverGradient,
          coverArtUrl:
            episodes?.[0]?.coverArtUrl ?? coverArtUrl ?? panelCoverUrl,
        }
      : undefined);

  const stripUrl = panelCoverUrl;

  const handleStartNextEpisode = useCallback(() => {
    if (needsSignup) {
      window.location.href = buildReaderSignupPath(
        seriesId,
        seriesTitle,
        episodeNumber
      );
      return;
    }
    if (needsSubscription) {
      window.location.href = buildPaywallPath(
        seriesId,
        episodeNumber + 1,
        seriesTitle
      );
      return;
    }
    if (nextEpisodeFromList) {
      const href = `/story/${seriesId}/read${nextEpisodeFromList.number > 1 ? `?ep=${nextEpisodeFromList.number}` : ""}`;
      window.location.href = href;
    }
  }, [
    needsSignup,
    needsSubscription,
    nextEpisodeFromList,
    seriesId,
    seriesTitle,
    episodeNumber,
  ]);

  useEffect(() => {
    void hydrateSubscription();
  }, [hydrateSubscription]);

  useEffect(() => {
    if (episodeNumber > 1 && needsSignup) {
      window.location.replace(
        buildReaderSignupPath(seriesId, seriesTitle, episodeNumber - 1)
      );
    }
  }, [episodeNumber, needsSignup, seriesId, seriesTitle]);

  useEffect(() => {
    if (episodeNumber > 1 && needsSubscription) {
      window.location.replace(
        buildPaywallPath(seriesId, episodeNumber, seriesTitle)
      );
    }
  }, [episodeNumber, needsSubscription, seriesId, seriesTitle]);

  useEffect(() => {
    if (stripUrl) return;

    const observers: IntersectionObserver[] = [];

    panelRefs.current.forEach((el, i) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setMaxPanelIndex((prev) => Math.max(prev, i));
          }
        },
        { threshold: 0.25, rootMargin: "0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [panels.length, stripUrl]);

  useEffect(() => {
    if (!stripUrl) return;

    const el = stripRef.current;
    if (!el || total === 0) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(window.innerHeight, rect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const ratio = visibleHeight / rect.height;
      const scrolled = Math.max(0, -rect.top) / Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(ratio * 0.5, scrolled));
      const index = Math.min(total - 1, Math.floor(progress * total));
      setMaxPanelIndex(index);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [stripUrl, total]);

  useEffect(() => {
    saveReadingProgress({
      seriesId,
      title: seriesTitle,
      genre,
      coverArtUrl,
      coverGradient,
      creatorDisplayName,
      episodeNumber,
      href: returnPath,
    });
  }, [
    seriesId,
    seriesTitle,
    genre,
    coverArtUrl,
    coverGradient,
    creatorDisplayName,
    episodeNumber,
    returnPath,
  ]);

  useEffect(() => {
    if (maxPanelIndex >= total - 1 && showControls) {
      setShowEndCard(true);
    }
  }, [maxPanelIndex, total, showControls]);

  useEffect(() => {
    trackReadingProgress({
      seriesId,
      episodeNumber,
      panelIndex: maxPanelIndex,
      totalPanels: total,
    });
  }, [seriesId, episodeNumber, maxPanelIndex, total]);

  const handleNextEpisode = () => {
    handleStartNextEpisode();
    if (!needsSignup && !needsSubscription) {
      onGenerateNext?.();
    }
  };

  const setPanelRef = (index: number, el: HTMLElement | null) => {
    panelRefs.current[index] = el;
    if (index === total - 1) lastPanelRef.current = el;
  };

  if (total === 0) return null;

  const panelsWithGenre = panels.map((p) => ({ ...p, genre: p.genre ?? genre }));

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#08040F]">
      <ReaderBackButton seriesId={seriesId} />

      <main className="mx-auto w-full max-w-[720px] pt-12">
        <div className="flex flex-col">
          {stripUrl ? (
            <div
              ref={(el) => {
                stripRef.current = el;
                lastPanelRef.current = el;
              }}
              className="relative w-full overflow-hidden"
            >
              <img
                src={stripUrl}
                alt={`${seriesTitle} — episode ${episodeNumber}`}
                className="block h-auto w-full"
                draggable={false}
              />
            </div>
          ) : (
            panelsWithGenre.map((panel, index) => (
              <PanelBlock
                key={panel.id}
                ref={(el) => setPanelRef(index, el)}
                panel={panel}
                panelIndex={index}
              />
            ))
          )}
        </div>

        {showEndCard && showControls && (
          <EpisodeCompleteCard
            seriesTitle={seriesTitle}
            episodeNumber={episodeNumber}
            isCatalog={isCatalog}
            genre={genre}
            nextEpisode={nextEpisode}
            requiresSignup={needsSignup}
            requiresSubscription={needsSubscription}
            credits={credits}
            generating={generating}
            onShare={onShare}
            onNextEpisode={onGenerateNext ? handleNextEpisode : undefined}
            onStartNextEpisode={handleStartNextEpisode}
            onContinueReading={handleStartNextEpisode}
            onCreateInspired={
              onCreateInspired ??
              (!isCatalog ? () => { window.location.href = "/create"; } : undefined)
            }
          />
        )}

        {!showEndCard && maxPanelIndex >= total - 1 && showControls && (
          <button
            type="button"
            onClick={() => setShowEndCard(true)}
            className="w-full bg-gradient-to-b from-[#08040F] to-[#2A114B] px-4 py-8 text-center text-sm font-semibold text-white/80 transition hover:text-white"
          >
            Episode complete — see what&apos;s next
          </button>
        )}
      </main>
    </div>
  );
}
