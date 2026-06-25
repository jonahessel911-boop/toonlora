"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

interface NetflixChapterRowProps {
  children: ReactNode;
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden>
      {direction === "left" ? (
        <path
          d="M10 3L5 8L10 13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M6 3L11 8L6 13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export default function NetflixChapterRow({ children }: NetflixChapterRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(() => updateScrollState());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, children]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "right" ? el.clientWidth * 0.8 : -el.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`group/row relative ${canScrollLeft ? "md:pl-10" : ""} ${canScrollRight ? "md:pr-10" : ""}`}
    >
      {canScrollLeft ? (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-0 top-[72px] z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white opacity-0 transition hover:bg-black group-hover/row:opacity-100 md:flex"
          aria-label="Scroll chapters left"
        >
          <Chevron direction="left" />
        </button>
      ) : null}

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory md:gap-5"
      >
        {children}
      </div>

      {canScrollRight ? (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-0 top-[72px] z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white opacity-0 transition hover:bg-black group-hover/row:opacity-100 md:flex"
          aria-label="Scroll chapters right"
        >
          <Chevron direction="right" />
        </button>
      ) : null}
    </div>
  );
}
