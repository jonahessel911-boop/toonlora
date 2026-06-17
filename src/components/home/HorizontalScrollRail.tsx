"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface HorizontalScrollRailProps {
  children: ReactNode;
  className?: string;
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
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

export default function HorizontalScrollRail({
  children,
  className = "",
}: HorizontalScrollRailProps) {
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

    const resizeObserver = new ResizeObserver(() => updateScrollState());
    resizeObserver.observe(el);
    for (const child of Array.from(el.children)) {
      resizeObserver.observe(child);
    }

    return () => {
      el.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
    };
  }, [updateScrollState, children]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(220, el.clientWidth * 0.72);
    el.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  const arrowClass =
    "absolute top-[34%] z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#E7D8FF] bg-white/95 text-[#5340FF] shadow-[0_4px_16px_rgba(42,17,75,0.12)] backdrop-blur-sm transition hover:border-[#5340FF]/30 hover:bg-white xl:h-9 xl:w-9";

  return (
    <div
      className={`relative -mx-4 sm:mx-0 ${canScrollLeft ? "sm:pl-11" : ""} ${canScrollRight ? "sm:pr-11" : ""}`}
    >
      {canScrollLeft ? (
        <button
          type="button"
          onClick={() => scroll("left")}
          className={`${arrowClass} left-1 sm:left-0`}
          aria-label="Scroll left"
        >
          <ChevronIcon direction="left" />
        </button>
      ) : null}

      <div ref={scrollRef} className={className}>
        {children}
      </div>

      {canScrollRight ? (
        <button
          type="button"
          onClick={() => scroll("right")}
          className={`${arrowClass} right-1 sm:right-0`}
          aria-label="Scroll right"
        >
          <ChevronIcon direction="right" />
        </button>
      ) : null}
    </div>
  );
}
