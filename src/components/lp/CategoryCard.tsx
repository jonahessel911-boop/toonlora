"use client";

import CoverArt from "@/components/ui/CoverArt";
import type { LPCategory } from "@/lib/lpStories";
import { LP_CATEGORY_META } from "@/lib/lpStories";

interface CategoryCardProps {
  category: LPCategory;
  selected: boolean;
  onSelect: (category: LPCategory) => void;
}

export default function CategoryCard({
  category,
  selected,
  onSelect,
}: CategoryCardProps) {
  const meta = LP_CATEGORY_META[category];

  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className={`overflow-hidden rounded-2xl text-left transition ${
        selected
          ? "ring-[3px] ring-lp-purple shadow-lg shadow-lp-purple/20"
          : "ring-1 ring-gray-100 hover:ring-lp-purple/30"
      }`}
    >
      <CoverArt
        gradient={meta.gradient}
        emoji={meta.emoji}
        className="aspect-[4/3] w-full"
      />
      <p
        className={`px-3 py-2.5 text-sm font-bold ${
          selected ? "bg-lp-purple text-white" : "bg-white text-gray-800"
        }`}
      >
        {category}
      </p>
    </button>
  );
}
