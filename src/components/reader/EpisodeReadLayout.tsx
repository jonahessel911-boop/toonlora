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
    <div className="bg-[#12091F]">
      <div className="h-[100dvh] w-full">{children}</div>
      <EpisodeCommentsSection series={series} episodeNumber={episodeNumber} />
    </div>
  );
}
