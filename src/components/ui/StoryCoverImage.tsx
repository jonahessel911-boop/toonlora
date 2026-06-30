"use client";

import { useState } from "react";
import CoverArt from "@/components/ui/CoverArt";
import NextMondayEpisodeLabel from "@/components/ui/NextMondayEpisodeLabel";

interface StoryCoverImageProps {
  coverArtUrl?: string;
  title: string;
  genre: string;
  gradient: string;
  seed: number;
  className?: string;
}

/** Card cover — fixed 3:4 frame with reliable object-cover (Chrome-safe). */
export default function StoryCoverImage({
  coverArtUrl,
  title,
  genre,
  gradient,
  seed,
  className = "",
}: StoryCoverImageProps) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(coverArtUrl) && !failed;

  return (
    <div
      className={`relative aspect-[3/4] w-full overflow-hidden bg-[#F3ECFF] ${className}`}
    >
      {showPhoto ? (
        <img
          src={coverArtUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <CoverArt
          gradient={gradient}
          genre={genre}
          title={title}
          showOverlay={false}
          seed={seed}
          className="absolute inset-0 h-full w-full"
        />
      )}
      <div className="pointer-events-none absolute inset-x-2 bottom-2 z-10 flex justify-center">
        <NextMondayEpisodeLabel className="max-w-full" />
      </div>
    </div>
  );
}
