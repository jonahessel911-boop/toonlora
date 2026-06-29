"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StoryPage } from "@/types/story";

interface FlipBookReaderProps {
  pages: StoryPage[];
  showShare?: boolean;
  showLibraryLink?: boolean;
  onShare?: () => void;
}

function PageContent({ page }: { page: StoryPage | undefined }) {
  if (!page) return null;

  return (
    <div className="flex h-full flex-col">
      {page.imageGradient && (
        <div
          className={`mb-4 aspect-video w-full flex-shrink-0 rounded-xl bg-gradient-to-br ${page.imageGradient} shadow-inner`}
        >
          {page.imageCaption && (
            <div className="flex h-full items-end p-3">
              <p className="rounded-lg bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                {page.imageCaption}
              </p>
            </div>
          )}
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <p className="font-serif text-base leading-relaxed text-gray-800 sm:text-lg sm:leading-8">
          {page.text}
        </p>
      </div>
    </div>
  );
}

export default function FlipBookReader({
  pages,
  showShare = true,
  showLibraryLink = true,
  onShare,
}: FlipBookReaderProps) {
  const validPages = pages.filter(
    (page): page is StoryPage => Boolean(page?.text?.trim())
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const totalPages = validPages.length;
  const currentPage = validPages[currentIndex];

  if (totalPages === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-heading text-lg font-bold text-groen-deep">
          No pages to read yet
        </p>
        <p className="mt-2 text-sm text-gray-500">
          This story has no readable content at the moment.
        </p>
      </div>
    );
  }

  const goNext = useCallback(() => {
    if (currentIndex >= totalPages - 1 || isFlipping) return;
    setDirection("next");
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentIndex((i) => i + 1);
      setIsFlipping(false);
      setDirection(null);
    }, 600);
  }, [currentIndex, totalPages, isFlipping]);

  const goPrev = useCallback(() => {
    if (currentIndex <= 0 || isFlipping) return;
    setDirection("prev");
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentIndex((i) => i - 1);
      setIsFlipping(false);
      setDirection(null);
    }, 600);
  }, [currentIndex, isFlipping]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-4 text-center">
        <p className="text-sm font-bold text-groen-deep">
          Page {currentIndex + 1} of {totalPages}
        </p>
      </div>

      <div
        className="relative mx-auto"
        style={{ perspective: "1200px" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative aspect-[3/4] w-full max-w-lg mx-auto sm:aspect-[4/5]">
          <AnimatePresence mode="wait">
            {!isFlipping && (
              <motion.div
                key={`page-${currentIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-2xl bg-[#FFFDF8] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-amber-100/80 sm:p-8"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute left-0 top-0 h-full w-3 rounded-l-2xl bg-gradient-to-r from-amber-100/60 to-transparent" />
                <PageContent page={currentPage} />
              </motion.div>
            )}
          </AnimatePresence>

          {isFlipping && direction === "next" && (
            <motion.div
              className="absolute inset-0 origin-left rounded-2xl bg-[#FFFDF8] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] ring-1 ring-amber-100/80 sm:p-8"
              style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
              initial={{ rotateY: 0 }}
              animate={{ rotateY: -180 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="absolute left-0 top-0 h-full w-3 rounded-l-2xl bg-gradient-to-r from-amber-100/60 to-transparent" />
              <PageContent page={validPages[currentIndex]} />
            </motion.div>
          )}

          {isFlipping && direction === "prev" && (
            <motion.div
              className="absolute inset-0 origin-right rounded-2xl bg-[#FFFDF8] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] ring-1 ring-amber-100/80 sm:p-8"
              style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
              initial={{ rotateY: -180 }}
              animate={{ rotateY: 0 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="absolute left-0 top-0 h-full w-3 rounded-l-2xl bg-gradient-to-r from-amber-100/60 to-transparent" />
              <PageContent page={validPages[currentIndex - 1]} />
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentIndex === 0 || isFlipping}
          className="rounded-full border-2 border-groen-primary px-6 py-2.5 text-sm font-bold text-groen-deep transition hover:bg-groen-mint disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous page
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={currentIndex >= totalPages - 1 || isFlipping}
          className="rounded-full bg-groen-deep px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next page
        </button>
      </div>

      {(showShare || showLibraryLink) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {showShare && (
            <button
              type="button"
              onClick={handleShare}
              className="rounded-full bg-white px-5 py-2 text-sm font-bold text-groen-deep ring-1 ring-border transition hover:bg-groen-mint"
            >
              Share story
            </button>
          )}
          {showLibraryLink && (
            <a
              href="/"
              className="rounded-full px-5 py-2 text-sm font-bold text-gray-500 transition hover:text-groen-deep"
            >
              Back to home
            </a>
          )}
        </div>
      )}
    </div>
  );
}
