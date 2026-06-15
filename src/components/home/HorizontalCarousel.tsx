"use client";

import { useRef } from "react";
import Link from "next/link";
import WebtoonStoryCard from "@/components/home/WebtoonStoryCard";
import type { CatalogSeries } from "@/types/catalog";

interface HorizontalCarouselProps {
  title: string;
  stories: CatalogSeries[];
  variant?: "ranked" | "vertical" | "square" | "grid";
  showRank?: boolean;
  rankChanges?: number[];
  id?: string;
  viewAllHref?: string;
  hideHeader?: boolean;
  noBorder?: boolean;
  mintBg?: boolean;
}

export default function HorizontalCarousel({
  title,
  stories,
  variant = "vertical",
  showRank = false,
  rankChanges,
  id,
  viewAllHref = "#",
  hideHeader = false,
  noBorder = false,
  mintBg = false,
}: HorizontalCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "right" ? 320 : -320,
      behavior: "smooth",
    });
  };

  return (
    <section
      id={id}
      className={`${noBorder ? "py-0" : "border-b border-gs-border py-5 sm:py-9"} ${
        mintBg ? "bg-gs-surface-mint/60" : ""
      }`}
    >
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        {!hideHeader && (
          <div className="mb-4 flex items-end justify-between px-4 sm:mb-5 sm:px-0">
            <h2 className="font-heading text-lg font-bold text-gs-text sm:text-2xl">
              {title}
            </h2>
            <Link
              href={viewAllHref}
              className="flex-shrink-0 text-sm font-semibold text-gs-muted transition hover:text-gs-primary-dark"
            >
              View all ›
            </Link>
          </div>
        )}

        <div className="relative">
          {/* Full-bleed rail on mobile */}
          <div
            ref={scrollRef}
            className="mobile-rail desktop-grid px-4 sm:px-0"
          >
            {stories.map((story, i) => (
              <WebtoonStoryCard
                key={story.id}
                story={story}
                variant={variant}
                rank={showRank ? story.rank ?? i + 1 : undefined}
                rankChange={rankChanges?.[i]}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute -right-2 top-[28%] hidden h-10 w-10 items-center justify-center rounded-full border border-gs-border bg-white text-lg text-gs-text shadow-md transition hover:bg-gs-surface-mint sm:flex md:hidden"
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
