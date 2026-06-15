"use client";

import StoryCard, {
  type StoryCardSize,
} from "@/components/home/StoryCard";
import type { CatalogSeries } from "@/types/catalog";

export type WebtoonCardVariant = "ranked" | "vertical" | "square" | "grid";

interface WebtoonStoryCardProps {
  story: CatalogSeries;
  variant?: WebtoonCardVariant;
  rank?: number;
  rankChange?: number;
}

function variantToSize(variant: WebtoonCardVariant): StoryCardSize {
  if (variant === "ranked") return "ranked";
  if (variant === "vertical") return "featured";
  return "standard";
}

/** @deprecated Use StoryCard — adapter for legacy carousels (/old/home). */
export default function WebtoonStoryCard({
  story,
  variant = "vertical",
  rank,
  rankChange,
}: WebtoonStoryCardProps) {
  return (
    <StoryCard
      story={story}
      size={variantToSize(variant)}
      layout={variant === "grid" ? "grid" : "rail"}
      rank={rank}
      rankChange={rankChange}
    />
  );
}
