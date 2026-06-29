"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import LP3ReviewCard from "@/components/lp3/LP3ReviewCard";
import type { LP3Review } from "@/lib/lp3/content";

export default function LP3ReviewCarousel({
  reviews,
  alwaysCarousel = false,
}: {
  reviews: LP3Review[];
  alwaysCarousel?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    if (!children.length) return;

    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    children.forEach((child, i) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(center - childCenter);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActiveIndex(best);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateActiveIndex();
    el.addEventListener("scroll", updateActiveIndex, { passive: true });
    const ro = new ResizeObserver(() => updateActiveIndex());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateActiveIndex);
      ro.disconnect();
    };
  }, [updateActiveIndex, reviews]);

  if (reviews.length === 1) {
    return <LP3ReviewCard review={reviews[0]!} />;
  }

  const carouselClass = alwaysCarousel
    ? "-mx-4 flex gap-4 overflow-x-auto overscroll-x-contain px-4 pb-1 scrollbar-hide snap-x snap-mandatory"
    : "-mx-4 flex gap-4 overflow-x-auto overscroll-x-contain px-4 pb-1 scrollbar-hide snap-x snap-mandatory md:hidden";

  const dotsClass = alwaysCarousel
    ? "mt-3 flex justify-center gap-1.5"
    : "mt-3 flex justify-center gap-1.5 md:hidden";

  return (
    <div>
      <div
        ref={scrollRef}
        className={carouselClass}
        aria-label="Reader reviews"
      >
        {reviews.map((review) => (
          <div
            key={review.name}
            className="w-[calc(100vw-2.5rem)] max-w-md shrink-0 snap-center"
          >
            <LP3ReviewCard review={review} />
          </div>
        ))}
      </div>

      <div
        className={dotsClass}
        role="tablist"
        aria-label="Review slides"
      >
        {reviews.map((review, i) => (
          <button
            key={review.name}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Review ${i + 1} of ${reviews.length}`}
            onClick={() => {
              const el = scrollRef.current;
              const child = el?.children[i] as HTMLElement | undefined;
              child?.scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest",
              });
            }}
            className={`h-1.5 rounded-full transition-all ${
              i === activeIndex ? "w-5 bg-[#2F80ED]" : "w-1.5 bg-[#CBD5E1]"
            }`}
          />
        ))}
      </div>

      {!alwaysCarousel ? (
        <div className="hidden space-y-4 md:block">
          {reviews.map((review) => (
            <LP3ReviewCard key={review.name} review={review} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
