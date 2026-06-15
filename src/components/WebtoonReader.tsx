"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import SignupWall from "@/components/lp/SignupWall";
import ComicPanel from "@/components/reader/ComicPanel";
import EpisodeCompleteCard from "@/components/reader/EpisodeCompleteCard";
import ReaderWebtoonFooter from "@/components/reader/ReaderWebtoonFooter";
import ReaderWebtoonHeader from "@/components/reader/ReaderWebtoonHeader";
import { trackReadingProgress } from "@/components/analytics/AnalyticsProvider";
import { isDatabaseEnabled } from "@/lib/config";
import {
  listCommentsFromClient,
} from "@/lib/services/comments-repository";
import { apiFetch } from "@/lib/session";
import { useUserStore } from "@/store/useUserStore";
import type { ReaderPanelData } from "@/lib/readerPanels";

interface EpisodeThumb {
  number: number;
  title: string;
  coverGradient: string;
}

interface WebtoonReaderProps {
  seriesId: string;
  seriesTitle: string;
  episodeNumber: number;
  episodeTitle: string;
  panels: ReaderPanelData[];
  genre?: string;
  episodes?: EpisodeThumb[];
  commentCount?: number;
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
  genre = "Romance",
  episodes = [],
  commentCount: commentCountProp,
  showControls = true,
  onShare,
  onGenerateNext,
  onCreateInspired,
  credits = 7,
  generating = false,
  isCatalog = false,
}: WebtoonReaderProps) {
  const [maxPanelIndex, setMaxPanelIndex] = useState(0);
  const [signupOpen, setSignupOpen] = useState(false);
  const [signupShown, setSignupShown] = useState(false);
  const [showEndCard, setShowEndCard] = useState(false);
  const [liked, setLiked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(commentCountProp ?? 0);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const lastPanelRef = useRef<HTMLElement | null>(null);
  const { email } = useUserStore();
  const loggedIn = Boolean(email);
  const total = panels.length;
  const shouldPromptSignup = isCatalog && !loggedIn;

  const scrollToComments = () => {
    document.getElementById("episode-comments")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const openSignupIfNeeded = useCallback(() => {
    if (shouldPromptSignup && !signupShown) {
      setSignupOpen(true);
      setSignupShown(true);
      return true;
    }
    if (showControls && !shouldPromptSignup) setShowEndCard(true);
    return false;
  }, [shouldPromptSignup, showControls, signupShown]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    panelRefs.current.forEach((el, i) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setMaxPanelIndex((prev) => Math.max(prev, i));
          }
        },
        { threshold: 0.35, rootMargin: "-48px 0px -120px 0px" }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [panels.length]);

  useEffect(() => {
    const loadCount = async () => {
      try {
        if (isDatabaseEnabled()) {
          const res = await apiFetch(
            `/api/comments?seriesId=${encodeURIComponent(seriesId)}&episodeNumber=${episodeNumber}`
          );
          const data = await res.json();
          if (res.ok) setCommentCount(data.count ?? 0);
        } else {
          setCommentCount(
            listCommentsFromClient(seriesId, episodeNumber).length
          );
        }
      } catch {
        /* ignore */
      }
    };
    void loadCount();
  }, [seriesId, episodeNumber]);

  useEffect(() => {
    const el = lastPanelRef.current;
    if (!el || !shouldPromptSignup || signupShown) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          timer = setTimeout(() => {
            setSignupOpen(true);
            setSignupShown(true);
          }, 600);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [shouldPromptSignup, signupShown, panels.length]);

  useEffect(() => {
    trackReadingProgress({
      seriesId,
      episodeNumber,
      panelIndex: maxPanelIndex,
      totalPanels: total,
    });
  }, [seriesId, episodeNumber, maxPanelIndex, total]);

  const handleNextEpisode = () => {
    if (isCatalog) {
      setSignupOpen(true);
      return;
    }
    onGenerateNext?.();
  };

  const episodeList =
    episodes.length > 0
      ? episodes
      : [{ number: episodeNumber, title: episodeTitle, coverGradient: "#5340FF" }];

  if (total === 0) return null;

  return (
    <div className="relative bg-black">
      <ReaderWebtoonHeader
        seriesId={seriesId}
        episodeNumber={episodeNumber}
        episodeTitle={episodeTitle}
        onShare={onShare}
        onMenu={() => setMenuOpen((v) => !v)}
      />

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          />
          <nav className="fixed left-0 top-0 z-50 h-full w-[min(100%,280px)] overflow-y-auto bg-[#1a1a1a] pt-[calc(env(safe-area-inset-top)+3rem)] shadow-2xl">
            <p className="px-4 pb-2 text-xs font-bold uppercase tracking-wide text-white/50">
              {seriesTitle}
            </p>
            <ul>
              {episodeList.map((ep) => (
                <li key={ep.number}>
                  <Link
                    href={`/story/${seriesId}/read${ep.number > 1 ? `?ep=${ep.number}` : ""}`}
                    onClick={() => setMenuOpen(false)}
                    className={`block border-b border-white/10 px-4 py-3 text-sm ${
                      ep.number === episodeNumber
                        ? "bg-white/10 font-semibold text-white"
                        : "text-white/75"
                    }`}
                  >
                    Ep. {ep.number} — {ep.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={`/story/${seriesId}`}
              className="mt-4 block px-4 py-2 text-sm text-white/60"
              onClick={() => setMenuOpen(false)}
            >
              ← Series info
            </Link>
          </nav>
        </>
      )}

      <main className="mx-auto w-full max-w-[720px] bg-black">
        <div className="flex flex-col">
          {panels.map((panel, index) => (
            <ComicPanel
              key={`panel-${index}`}
              ref={(el) => {
                panelRefs.current[index] = el;
                if (index === total - 1) lastPanelRef.current = el;
              }}
              panel={panel}
              index={index}
              variant="scroll"
            />
          ))}
        </div>

        {showEndCard && !shouldPromptSignup && showControls && (
          <div className="bg-white px-4 py-8">
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
                (!isCatalog
                  ? () => {
                      window.location.href = "/create";
                    }
                  : undefined)
              }
            />
          </div>
        )}

        {!showEndCard && maxPanelIndex >= total - 1 && showControls && !shouldPromptSignup && (
          <div className="bg-white px-4 py-6 text-center">
            <button
              type="button"
              onClick={() => setShowEndCard(true)}
              className="text-sm font-semibold text-[#5340FF]"
            >
              Episode complete — see what&apos;s next
            </button>
          </div>
        )}

        {!showEndCard && maxPanelIndex >= total - 1 && shouldPromptSignup && (
          <div className="bg-[#1a1a1a] px-4 py-6 text-center">
            <button
              type="button"
              onClick={() => openSignupIfNeeded()}
              className="text-sm font-semibold text-white"
            >
              Continue reading — create a free account
            </button>
          </div>
        )}

        <div className="h-28 bg-black sm:h-24" aria-hidden />
      </main>

      <ReaderWebtoonFooter
        seriesId={seriesId}
        episodeNumber={episodeNumber}
        episodes={episodeList}
        genre={genre}
        commentCount={commentCount}
        liked={liked}
        onLike={() => setLiked((v) => !v)}
        onComments={scrollToComments}
      />

      <SignupWall
        storyName={seriesTitle}
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
      />
    </div>
  );
}
