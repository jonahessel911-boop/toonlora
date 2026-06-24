"use client";

import { useState } from "react";
import HomeSection from "@/components/home/HomeSection";
import StoryRail from "@/components/home/StoryRail";
import {
  MOCK_STORY_CATALOG,
  type MockStoryCategory,
} from "@/lib/mock/businessStoryCatalog";
import { mockCategoryToCatalogSeries } from "@/lib/mock/mockCatalogCards";

export default function CategoryBrowseSection() {
  const [activeId, setActiveId] = useState(MOCK_STORY_CATALOG[0].id);

  const activeCategory: MockStoryCategory =
    MOCK_STORY_CATALOG.find((c) => c.id === activeId) ?? MOCK_STORY_CATALOG[0];

  const stories = mockCategoryToCatalogSeries(activeCategory);

  return (
    <HomeSection
      id="categories"
      title="Browse Categories"
      subtitle={`${activeCategory.subtitle} — sample stories in this lane`}
      tone="soft"
    >
      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {MOCK_STORY_CATALOG.map((category) => {
          const isActive = category.id === activeId;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveId(category.id)}
              className={`min-h-[40px] flex-shrink-0 snap-start rounded-full border px-4 py-2 text-sm font-bold transition touch-manipulation ${
                isActive
                  ? "border-transparent bg-accent text-white shadow-sm"
                  : "border-border bg-surface text-muted hover:border-accent/30 hover:text-primary"
              }`}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <StoryRail
        stories={stories}
        size="standard"
        listSection={`category_${activeCategory.id}`}
      />
    </HomeSection>
  );
}
