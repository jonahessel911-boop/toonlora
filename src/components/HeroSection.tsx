"use client";

import { useCatalog } from "@/hooks/useCatalog";
import StoryCarousel from "@/components/StoryCarousel";

/** Legacy hero — uses live catalog when mounted */
export default function HeroSection() {
  const { series: heroCovers } = useCatalog({ sort: "featured", limit: 3 });

  if (heroCovers.length === 0) return null;

  return (
    <StoryCarousel title="Featured" stories={heroCovers} />
  );
}
