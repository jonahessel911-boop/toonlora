"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface StreamRailScrollerProps {
  children: ReactNode;
  className?: string;
  dense?: boolean;
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
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

export default function StreamRailScroller({
  children,
  className = "",
  dense = false,
}: StreamRailScrollerProps) {
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
    const onScroll = () => updateScrollState();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => updateScrollState());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [updateScrollState, children]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "right" ? el.clientWidth * 0.75 : -el.clientWidth * 0.75,
      behavior: "smooth",
    });
  };

  const arrowClass =
    "absolute top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E7DDCC] bg-[#FFFDF7] text-[#0E1726] shadow-[0_2px_12px_rgba(14,23,38,0.08)] transition hover:border-[#2F80ED]/40 md:flex";

  return (
    <div
      className={`group/rail relative ${canScrollLeft ? "md:pl-12" : ""} ${canScrollRight ? "md:pr-12" : ""}`}
    >
      {canScrollLeft ? (
        <button
          type="button"
          onClick={() => scroll("left")}
          className={`${arrowClass} left-0 opacity-0 group-hover/rail:opacity-100`}
          aria-label="Scroll left"
        >
          <ChevronIcon direction="left" />
        </button>
      ) : null}

      <div
        ref={scrollRef}
        className={`flex overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory ${
          dense ? "gap-1.5" : "gap-3 md:gap-3.5"
        } ${className}`}
      >
        {children}
      </div>

      {canScrollRight ? (
        <button
          type="button"
          onClick={() => scroll("right")}
          className={`${arrowClass} right-0 opacity-0 group-hover/rail:opacity-100`}
          aria-label="Scroll right"
        >
          <ChevronIcon direction="right" />
        </button>
      ) : null}
    </div>
  );
}
