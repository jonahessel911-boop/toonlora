"use client";

import { useState } from "react";
import WebtoonStoryCard from "@/components/home/WebtoonStoryCard";
import { getGenreColors } from "@/lib/brand";
import { useCatalog } from "@/hooks/useCatalog";
import type { Category } from "@/types/story";

const CATEGORIES: Category[] = [
  "Romance",
  "Anime",
  "Fantasy",
  "Drama",
];

export default function CategorySection() {
  const [active, setActive] = useState<Category>("Romance");
  const { series: stories } = useCatalog({ genre: active, limit: 8 });

  return (
    <section className="py-8">
      <div className="mb-4 flex gap-2">
        {CATEGORIES.map((cat) => {
          const colors = getGenreColors(cat);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                active === cat
                  ? `${colors.bg} text-white`
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stories.map((story) => (
          <WebtoonStoryCard key={story.id} story={story} variant="grid" />
        ))}
      </div>
    </section>
  );
}
