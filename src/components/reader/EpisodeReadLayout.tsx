"use client";

import type { ReactNode } from "react";
import EpisodeCommentsSection from "@/components/comments/EpisodeCommentsSection";
import type { SeriesDetail } from "@/lib/seriesCatalog";

interface EpisodeReadLayoutProps {
  children: ReactNode;
  series: SeriesDetail;
  episodeNumber: number;
}

export default function EpisodeReadLayout({
  children,
  series,
  episodeNumber,
}: EpisodeReadLayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-black">
      {children}
      <EpisodeCommentsSection series={series} episodeNumber={episodeNumber} />
    </div>
  );
}
