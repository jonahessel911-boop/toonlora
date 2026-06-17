"use client";

import type { ReactNode } from "react";
import EpisodeCommentsSection from "@/components/comments/EpisodeCommentsSection";
import type { SeriesDetail } from "@/lib/seriesCatalog";
import type { Story } from "@/types/story";

interface EpisodeReadLayoutProps {
  children: ReactNode;
  series: SeriesDetail;
  episodeNumber: number;
  story?: Story;
}

export default function EpisodeReadLayout({
  children,
  series,
  episodeNumber,
  story,
}: EpisodeReadLayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-[#08040F]">
      {children}
      <EpisodeCommentsSection
        series={series}
        episodeNumber={episodeNumber}
        story={story}
      />
    </div>
  );
}
