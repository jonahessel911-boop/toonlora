"use client";

import type { Category } from "@/types/story";

interface CategoryTabsProps {
  categories: Category[];
  active: Category;
  onChange: (category: Category) => void;
}

export default function CategoryTabs({
  categories,
  active,
  onChange,
}: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const isActive = category === active;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition ${
              isActive
                ? "bg-groen-deep text-white shadow-md shadow-primary/20"
                : "bg-white text-gray-600 ring-1 ring-border hover:bg-groen-mint hover:text-groen-deep"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
