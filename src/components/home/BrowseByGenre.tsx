"use client";

import { useMemo, useState } from "react";
import HomeSection from "@/components/home/HomeSection";
import StoryCard from "@/components/home/StoryCard";
import { useCatalog } from "@/hooks/useCatalog";
import type { Category } from "@/types/story";

const GENRES: Category[] = [
  "Romance",
  "Fantasy",
  "Drama",
  "Comedy",
  "Adventure",
  "Slice of Life",
  "Anime",
];

export default function BrowseByGenre() {
  const [active, setActive] = useState<Category>("Romance");

  const { series: genreStories, loading: loadingGenre } = useCatalog({
    genre: active,
    sort: "featured",
    limit: 8,
  });
  const { series: popularPicks, loading: loadingPopular } = useCatalog({
    sort: "popular",
    limit: 8,
  });

  const usingFallback = !loadingGenre && genreStories.length === 0;
  const displayStories = usingFallback ? popularPicks : genreStories;
  const loading = loadingGenre || (usingFallback && loadingPopular);

  const gridSubtitle = useMemo(() => {
    if (loading) return undefined;
    if (usingFallback) return "Popular picks across Toonlora";
    return `Stories in ${active}`;
  }, [active, loading, usingFallback]);

  return (
    <HomeSection
      id="categories"
      title="Browse by Genre"
      subtitle="Find your next favorite cartoon story."
      viewAllHref="/library"
    >
      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {GENRES.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={`min-h-[40px] flex-shrink-0 snap-start rounded-full border px-4 py-2 text-sm font-bold transition touch-manipulation ${
                isActive
                  ? "border-transparent bg-[#5340FF] text-white shadow-sm"
                  : "border-[#E7D8FF] bg-white text-[#667085] hover:border-[#5340FF]/30 hover:text-[#5340FF]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {gridSubtitle ? (
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#667085]">
          {gridSubtitle}
        </p>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] rounded-[18px] bg-[#E7D8FF]/60" />
              <div className="mt-3 h-3.5 w-4/5 rounded bg-[#E7D8FF]/50" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide sm:hidden">
            {displayStories.slice(0, 6).map((story) => (
              <StoryCard key={story.id} story={story} size="standard" />
            ))}
          </div>
          <div className="hidden grid-cols-3 gap-4 sm:grid md:grid-cols-4 lg:gap-5">
            {displayStories.slice(0, 8).map((story) => (
              <StoryCard key={story.id} story={story} size="standard" layout="grid" />
            ))}
          </div>
        </>
      )}
    </HomeSection>
  );
}
