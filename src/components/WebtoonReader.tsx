"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import EpisodeCompleteCard from "@/components/reader/EpisodeCompleteCard";
import BeginnerLevelUpOverlay from "@/components/reader/BeginnerLevelUpOverlay";
import {
  EpisodePreviewGateShell,
  type EpisodePreviewGateMode,
} from "@/components/reader/EpisodePreviewGate";
import PanelBlock from "@/components/reader/PanelBlock";
import ReaderBackButton from "@/components/reader/ReaderBackButton";
import { trackReadingProgress } from "@/components/analytics/AnalyticsProvider";
import { trackEpisodeComplete, trackNextEpisodeClick, trackPaywallView } from "@/lib/analytics/gtag";
import { formatChapterTitle } from "@/lib/brand";
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
  /** Resume scroll at this panel (0-based) on mount. */
  initialPanelIndex?: number;
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
  initialPanelIndex = 0,
}: WebtoonReaderProps) {
  const [maxPanelIndex, setMaxPanelIndex] = useState(() =>
    Math.max(0, initialPanelIndex)
  );
  const [showEndCard, setShowEndCard] = useState(false);
  const [showBeginnerLevelUp, setShowBeginnerLevelUp] = useState(false);
  const [previewGate, setPreviewGate] = useState<EpisodePreviewGateMode | null>(
    null
  );
  const previewViewTracked = useRef(false);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const lastPanelRef = useRef<HTMLElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const episodeCompleteTracked = useRef(false);
  const viewTracked = useRef(false);
  const resumeScrollDone = useRef(false);
  const { email } = useUserStore();
  const { getTier, hasPaidAccess, hydrate: hydrateSubscription } = useSubscriptionStore();
  const loggedIn = Boolean(email);
  const paidAccess = hasPaidAccess();
  const needsSignup = isCatalog && !loggedIn;
  const needsSubscription = isCatalog && loggedIn && !paidAccess;
  const gatedNextEpisode = needsSignup || needsSubscription;
  const previewMode = Boolean(previewGate);
  const total = panels.length;
  const safeInitialPanel = Math.min(
    Math.max(0, initialPanelIndex),
    Math.max(0, total - 1)
  );

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

  const persistReadingProgress = useCallback(
    (panelIndex: number) => {
      saveReadingProgress({
        seriesId,
        title: seriesTitle,
        genre,
        coverArtUrl: coverArtUrl ?? panelCoverUrl,
        coverGradient,
        creatorDisplayName,
        episodeNumber,
        panelIndex,
        totalPanels: total,
      });
    },
    [
      seriesId,
      seriesTitle,
      genre,
      coverArtUrl,
      panelCoverUrl,
      coverGradient,
      creatorDisplayName,
      episodeNumber,
      total,
    ]
  );

  const navigateWithAffiliate = useCallback((path: string, replace = false) => {
    if (replace) {
      window.location.replace(path);
      return;
    }
    window.location.href = path;
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
    if (!isCatalog || episodeNumber < 2) {
      setPreviewGate(null);
      return;
    }
    if (!loggedIn) {
      setPreviewGate("signup");
      return;
    }
    if (!paidAccess) {
      setPreviewGate("upgrade");
    }
  }, [isCatalog, episodeNumber, loggedIn, paidAccess]);

  useEffect(() => {
    if (!isCatalog) return;

    let cancelled = false;
    void checkEpisodeReadAccess(seriesId, episodeNumber).then(async (result) => {
      if (cancelled) return;

      if (result.allowed) {
        setPreviewGate(null);
        if (result.tier === "free" && loggedIn && episodeNumber > 1) {
          await claimEpisodeRead(seriesId, episodeNumber);
        }
        return;
      }

      if (episodeNumber >= 2) {
        if (
          result.reason === "signup_required" ||
          (!loggedIn && episodeNumber > 1)
        ) {
          setPreviewGate("signup");
          return;
        }
        if (result.reason === "weekly_free_used") {
          setPreviewGate(loggedIn ? "upgrade_weekly" : "signup");
          return;
        }
        if (loggedIn) {
          setPreviewGate("upgrade");
          return;
        }
        setPreviewGate("signup");
        return;
      }

      if (result.reason === "signup_required" || (!loggedIn && episodeNumber > 1)) {
        navigateWithAffiliate(
          buildReaderSignupPath(seriesId, seriesTitle, Math.max(1, episodeNumber - 1)),
          true
        );
        return;
      }

      if (result.reason === "weekly_free_used") {
        if (!loggedIn) {
          navigateWithAffiliate(buildFreeEpisodeLimitSignupPath(seriesId, seriesTitle), true);
          return;
        }
        navigateWithAffiliate(
          buildPaywallPath(seriesId, episodeNumber, seriesTitle, {
            reason: "weekly_limit",
          }),
          true
        );
        return;
      }

      if (result.reason === "not_released") {
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
    if (!previewGate || previewViewTracked.current) return;
    previewViewTracked.current = true;
    trackPaywallView({
      storyId: seriesId,
      storyTitle: seriesTitle,
      variant: "inline_preview",
      episodeNumber,
    });
  }, [previewGate, seriesId, seriesTitle, episodeNumber]);

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
    if (resumeScrollDone.current || safeInitialPanel <= 0 || total === 0) return;

    const scrollToPanel = () => {
      if (stripUrl && stripRef.current) {
        const el = stripRef.current;
        const rect = el.getBoundingClientRect();
        const documentTop = window.scrollY + rect.top;
        const scrollable = Math.max(0, el.offsetHeight - window.innerHeight);
        const fraction =
          total > 1 ? safeInitialPanel / (total - 1) : 0;
        window.scrollTo({
          top: documentTop + scrollable * fraction,
          behavior: "auto",
        });
        setMaxPanelIndex((prev) => Math.max(prev, safeInitialPanel));
        resumeScrollDone.current = true;
        return;
      }

      const el = panelRefs.current[safeInitialPanel];
      if (el) {
        el.scrollIntoView({ block: "start", behavior: "auto" });
        setMaxPanelIndex((prev) => Math.max(prev, safeInitialPanel));
        resumeScrollDone.current = true;
      }
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToPanel);
    });
  }, [safeInitialPanel, total, stripUrl, panels.length]);

  useEffect(() => {
    persistReadingProgress(maxPanelIndex);
  }, [maxPanelIndex, persistReadingProgress]);

  useEffect(() => {
    const flush = () => persistReadingProgress(maxPanelIndex);

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      flush();
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [maxPanelIndex, persistReadingProgress]);

  useEffect(() => {
    if (!previewMode && maxPanelIndex >= total - 1 && showControls) {
      setShowEndCard(true);
    }
  }, [maxPanelIndex, total, showControls, previewMode]);

  useEffect(() => {
    if (previewMode || episodeCompleteTracked.current || total === 0) return;
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
      seriesTitle,
      genre,
    });
  }, [seriesId, seriesTitle, genre, episodeNumber, maxPanelIndex, total]);

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
  const previewLeadPanels =
    previewMode && total > 1 ? panelsWithGenre.slice(0, 1) : [];
  const previewPeekPanel =
    previewMode && total > 1 ? panelsWithGenre[1] : panelsWithGenre[0];

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#08040F]">
      <BeginnerLevelUpOverlay
        open={showBeginnerLevelUp}
        onCreateAccount={handleCreateAccountFromLevelUp}
      />
      <ReaderBackButton seriesId={seriesId} />

      <main className="mx-auto w-full max-w-[720px] pt-12">
        <div className="flex flex-col">
          {previewMode ? (
            stripUrl ? (
              <EpisodePreviewGateShell
                mode={previewGate!}
                seriesId={seriesId}
                seriesTitle={seriesTitle}
                episodeNumber={episodeNumber}
              >
                <img
                  src={stripUrl}
                  alt={`${seriesTitle} — chapter ${episodeNumber}`}
                  className="block h-auto w-full"
                  draggable={false}
                />
              </EpisodePreviewGateShell>
            ) : total > 1 ? (
              <>
                {previewLeadPanels.map((panel, index) => (
                  <PanelBlock
                    key={panel.id}
                    ref={(el) => setPanelRef(index, el)}
                    panel={panel}
                    panelIndex={index}
                  />
                ))}
                <EpisodePreviewGateShell
                  mode={previewGate!}
                  seriesId={seriesId}
                  seriesTitle={seriesTitle}
                  episodeNumber={episodeNumber}
                >
                  <PanelBlock panel={previewPeekPanel} panelIndex={1} />
                </EpisodePreviewGateShell>
              </>
            ) : (
              <EpisodePreviewGateShell
                mode={previewGate!}
                seriesId={seriesId}
                seriesTitle={seriesTitle}
                episodeNumber={episodeNumber}
              >
                <PanelBlock panel={previewPeekPanel} panelIndex={0} />
              </EpisodePreviewGateShell>
            )
          ) : stripUrl ? (
            <div
              ref={(el) => {
                stripRef.current = el;
                lastPanelRef.current = el;
              }}
              className="relative w-full overflow-hidden pb-[max(4.5rem,calc(env(safe-area-inset-bottom)+3rem))]"
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

        {showEndCard && showControls && !previewMode && (
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

        {!showEndCard && !previewMode && maxPanelIndex >= total - 1 && showControls && (
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
