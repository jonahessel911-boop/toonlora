"use client";

import { useState } from "react";
import Link from "next/link";
import WebtoonStoryCard from "@/components/home/WebtoonStoryCard";
import { getGenreColors } from "@/lib/brand";
import { CATEGORY_STORIES } from "@/lib/sampleStories";
import type { Category } from "@/types/story";

const WEBTOON_CATEGORIES: Category[] = [
  "Drama",
  "Fantasy",
  "Comedy",
  "Adventure",
  "Slice of Life",
  "Romance",
  "Anime",
];

export default function CategoryCarouselSection() {
  const [active, setActive] = useState<Category>("Drama");
  const stories = CATEGORY_STORIES[active]?.slice(0, 8) ?? [];

  return (
    <section id="categories" className="border-b border-gs-border bg-white py-5 sm:py-9">
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-4 flex items-end justify-between px-4 sm:mb-5 sm:px-0">
          <h2 className="font-heading text-lg font-bold text-gs-text sm:text-2xl">
            Popular Series by Category
          </h2>
          <Link
            href="/lp/1"
            className="flex-shrink-0 text-sm font-semibold text-gs-muted hover:text-gs-primary-dark"
          >
            View all ›
          </Link>
        </div>

        <div className="mobile-rail sm-static mb-5 px-4 sm:mb-6 sm:gap-2 sm:px-0">
          {WEBTOON_CATEGORIES.map((cat) => {
            const colors = getGenreColors(cat);
            const isActive = active === cat;
            return (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={`min-h-[44px] snap-start rounded-full border px-4 py-2.5 text-sm font-bold transition touch-manipulation sm:min-h-0 ${
                isActive
                  ? `${colors.bg} border-transparent text-white shadow-sm`
                  : "border-gs-border bg-white text-gs-muted active:bg-gs-surface-mint"
              }`}
            >
              {cat}
            </button>
            );
          })}
        </div>

        {/* Mobile: horizontal rail · Desktop: grid */}
        <div className="mobile-rail px-4 sm:hidden">
          {stories.slice(0, 6).map((story) => (
            <WebtoonStoryCard key={story.id} story={story} variant="ranked" />
          ))}
        </div>

        <div className="hidden grid-cols-3 gap-4 sm:grid lg:grid-cols-4 lg:gap-5">
          {stories.slice(0, 8).map((story) => (
            <WebtoonStoryCard key={story.id} story={story} variant="grid" />
          ))}
        </div>
      </div>
    </section>
  );
}
