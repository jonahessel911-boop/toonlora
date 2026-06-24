"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import EpisodeCompleteCard from "@/components/reader/EpisodeCompleteCard";
import BeginnerLevelUpOverlay from "@/components/reader/BeginnerLevelUpOverlay";
import PanelBlock from "@/components/reader/PanelBlock";
import ReaderBackButton from "@/components/reader/ReaderBackButton";
import { trackReadingProgress } from "@/components/analytics/AnalyticsProvider";
import {
  trackEpisodeComplete,
  trackNextEpisodeClick,
} from "@/lib/analytics/gtag";
import { formatChapterTitle } from "@/lib/brand";
import {
  appendAffiliateToHref,
  getStoredAffiliateSlug,
} from "@/lib/affiliate/client-tracking";
import {
  buildPaywallPath,
  buildReaderSignupPath,
} from "@/lib/reader/nextEpisodeGate";
import {
  buildFreeEpisodeLimitSignupPath,
  checkEpisodeReadAccess,
  claimEpisodeRead,
} from "@/lib/reader/episodeAccessGate";
import { saveReadingProgress } from "@/lib/readingHistory";
import {
  markBeginnerCelebrationShown,
  recordEpisodeComplete,
  shouldShowBeginnerLevelUp,
} from "@/lib/readingProgress";
import { trackSeriesView } from "@/lib/trackSeriesView";
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
  const [showBeginnerLevelUp, setShowBeginnerLevelUp] = useState(false);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const lastPanelRef = useRef<HTMLElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const episodeCompleteTracked = useRef(false);
  const viewTracked = useRef(false);
  const { email } = useUserStore();
  const { getTier, hasPaidAccess, hydrate: hydrateSubscription } = useSubscriptionStore();
  const loggedIn = Boolean(email);
  const paidAccess = hasPaidAccess();
  const needsSignup = isCatalog && !loggedIn;
  const needsSubscription = isCatalog && loggedIn && !paidAccess;
  const gatedNextEpisode = needsSignup || needsSubscription;
  const returnPath = `/story/${seriesId}/read${episodeNumber > 1 ? `?ep=${episodeNumber}` : ""}`;
  const total = panels.length;

  const totalEpisodesInSeries = episodes?.length ?? episodeNumber;
  const nextEpisodeFromList = episodes?.find((e) => e.number === episodeNumber + 1);
  const panelsWithImages = panels.filter((p) => p.imageUrl);
  const isMultiPanelUpload = panelsWithImages.length > 1;
  const panelCoverUrl = panelsWithImages[0]?.imageUrl;
  const nextEpisode =
    nextEpisodeFromList ??
    (gatedNextEpisode
      ? {
          number: episodeNumber + 1,
          title: formatChapterTitle(episodeNumber + 1),
          coverGradient,
          coverArtUrl:
            episodes?.[0]?.coverArtUrl ?? coverArtUrl ?? panelCoverUrl,
        }
      : undefined);

  const stripUrl = isMultiPanelUpload ? undefined : panelCoverUrl;

  const navigateWithAffiliate = useCallback((path: string, replace = false) => {
    const url = appendAffiliateToHref(path, getStoredAffiliateSlug());
    if (replace) {
      window.location.replace(url);
      return;
    }
    window.location.href = url;
  }, []);

  const proceedToNextEpisode = useCallback(() => {
    if (needsSignup) {
      navigateWithAffiliate(
        buildReaderSignupPath(seriesId, seriesTitle, episodeNumber)
      );
      return;
    }
    if (needsSubscription) {
      navigateWithAffiliate(
        buildPaywallPath(seriesId, episodeNumber + 1, seriesTitle)
      );
      return;
    }
    if (nextEpisodeFromList) {
      const href = `/story/${seriesId}/read${nextEpisodeFromList.number > 1 ? `?ep=${nextEpisodeFromList.number}` : ""}`;
      navigateWithAffiliate(href);
    }
  }, [
    needsSignup,
    needsSubscription,
    nextEpisodeFromList,
    seriesId,
    seriesTitle,
    episodeNumber,
    navigateWithAffiliate,
  ]);

  const handleStartNextEpisode = useCallback(() => {
    if (isCatalog) {
      trackNextEpisodeClick({
        seriesId,
        title: seriesTitle,
        episodeNumber,
        nextEpisodeNumber: episodeNumber + 1,
        gate: needsSignup ? "signup" : needsSubscription ? "subscribe" : "open",
      });
    }

    if (
      shouldShowBeginnerLevelUp(episodeNumber, isCatalog, loggedIn)
    ) {
      setShowBeginnerLevelUp(true);
      return;
    }

    proceedToNextEpisode();
  }, [
    isCatalog,
    needsSignup,
    needsSubscription,
    seriesId,
    seriesTitle,
    episodeNumber,
    loggedIn,
    proceedToNextEpisode,
  ]);

  const handleCreateAccountFromLevelUp = useCallback(() => {
    markBeginnerCelebrationShown();
    setShowBeginnerLevelUp(false);
    proceedToNextEpisode();
  }, [proceedToNextEpisode]);

  useEffect(() => {
    void hydrateSubscription();
  }, [hydrateSubscription]);

  useEffect(() => {
    if (!isCatalog || viewTracked.current) return;
    viewTracked.current = true;
    void trackSeriesView(seriesId);
  }, [isCatalog, seriesId]);

  useEffect(() => {
    if (!isCatalog) return;

    let cancelled = false;
    void checkEpisodeReadAccess(seriesId, episodeNumber).then(async (result) => {
      if (cancelled) return;

      if (result.allowed) {
        if (result.tier === "free") {
          await claimEpisodeRead(seriesId, episodeNumber);
        }
        return;
      }

      if (result.reason === "weekly_free_used" || result.reason === "not_released") {
        if (!loggedIn) {
          navigateWithAffiliate(buildFreeEpisodeLimitSignupPath(seriesId, seriesTitle), true);
          return;
        }
        navigateWithAffiliate(
          buildPaywallPath(seriesId, episodeNumber, seriesTitle),
          true
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isCatalog, loggedIn, seriesId, episodeNumber, seriesTitle, navigateWithAffiliate]);

  useEffect(() => {
    if (episodeNumber > 1 && needsSignup) {
      navigateWithAffiliate(
        buildReaderSignupPath(seriesId, seriesTitle, episodeNumber - 1),
        true
      );
    }
  }, [episodeNumber, needsSignup, seriesId, seriesTitle, navigateWithAffiliate]);

  useEffect(() => {
    if (episodeNumber > 1 && needsSubscription) {
      navigateWithAffiliate(
        buildPaywallPath(seriesId, episodeNumber, seriesTitle),
        true
      );
    }
  }, [episodeNumber, needsSubscription, seriesId, seriesTitle, navigateWithAffiliate]);

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
      coverArtUrl: coverArtUrl ?? panelCoverUrl,
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
    panelCoverUrl,
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
    if (episodeCompleteTracked.current || total === 0) return;
    if (maxPanelIndex >= total - 1) {
      episodeCompleteTracked.current = true;
      recordEpisodeComplete(seriesId, episodeNumber, totalEpisodesInSeries);
      trackEpisodeComplete({
        seriesId,
        title: seriesTitle,
        episodeNumber,
        totalPanels: total,
        isCatalog: Boolean(isCatalog),
      });
    }
  }, [
    maxPanelIndex,
    total,
    seriesId,
    seriesTitle,
    episodeNumber,
    isCatalog,
    totalEpisodesInSeries,
  ]);

  useEffect(() => {
    trackReadingProgress({
      seriesId,
      episodeNumber,
      panelIndex: maxPanelIndex,
      totalPanels: total,
    });
  }, [seriesId, episodeNumber, maxPanelIndex, total]);

  const handleNextEpisode = () => {
    if (!isCatalog) {
      trackNextEpisodeClick({
        seriesId,
        title: seriesTitle,
        episodeNumber,
        nextEpisodeNumber: episodeNumber + 1,
        gate: "creator",
      });
    }
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
      <BeginnerLevelUpOverlay
        open={showBeginnerLevelUp}
        onCreateAccount={handleCreateAccountFromLevelUp}
      />
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
                alt={`${seriesTitle} — chapter ${episodeNumber}`}
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
            seriesId={seriesId}
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
            Chapter complete — see what&apos;s next
          </button>
        )}
      </main>
    </div>
  );
}
