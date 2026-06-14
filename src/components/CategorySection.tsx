"use client";

import { useState } from "react";
import CategoryTabs from "@/components/CategoryTabs";
import StoryCard from "@/components/StoryCard";
import { CATEGORIES } from "@/lib/constants";
import { CATEGORY_STORIES } from "@/lib/sampleStories";
import type { Category } from "@/types/story";

export default function CategorySection() {
  const [active, setActive] = useState<Category>("Romance");
  const stories = CATEGORY_STORIES[active];

  return (
    <section id="categories" className="py-10 sm:py-14">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 sm:text-3xl">
          Popular by Category
        </h2>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Discover stories across every mood
        </p>
      </div>

      <CategoryTabs
        categories={CATEGORIES}
        active={active}
        onChange={setActive}
      />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            id={story.id}
            title={story.title}
            genre={String(story.genre)}
            coverGradient={story.coverGradient}
            coverEmoji={story.coverEmoji}
            episodes={story.episodes}
            readers={story.readers}
            likes={story.likes}
            creator={story.creator}
            href={story.href ?? "/create"}
          />
        ))}
      </div>
    </section>
  );
}
