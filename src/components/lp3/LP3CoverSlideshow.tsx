"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import LP3CoverThumb from "@/components/lp3/LP3CoverThumb";

export interface LP3CoverSlide {
  id: string;
  coverArtUrl?: string;
  coverGradient: string;
}

function CoverTile({
  story,
  priority,
}: {
  story: LP3CoverSlide;
  priority?: boolean;
}) {
  return (
    <div className="aspect-[2/3] w-[6.25rem] shrink-0 overflow-hidden rounded-lg shadow-md ring-1 ring-[#0A1628]/10 sm:w-[7rem]">
      {story.coverArtUrl ? (
        <LP3CoverThumb
          src={story.coverArtUrl}
          priority={priority}
          width={140}
          height={210}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className={`h-full w-full bg-gradient-to-br ${story.coverGradient}`}
        />
      )}
    </div>
  );
}

export default function LP3CoverSlideshow({
  stories,
  label,
}: {
  stories: LP3CoverSlide[];
  label: string;
}) {
  const slides = useMemo(() => {
    const withCovers = stories.filter((s) => s.coverArtUrl);
    const pool = withCovers.length >= 6 ? withCovers : stories;
    const unique = Array.from(new Map(pool.map((s) => [s.id, s])).values());
    return unique.slice(0, 14);
  }, [stories]);

  const track = useMemo(() => {
    if (!slides.length) return [];
    return [...slides, ...slides];
  }, [slides]);

  if (!slides.length) return null;

  return (
    <div className="mt-4">
      <p className="text-center text-sm font-semibold text-[#0A1628]">
        {label}
      </p>
      <div className="relative mt-3 overflow-hidden py-0.5">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#F6F1E7] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#F6F1E7] to-transparent" />
        <motion.div
          className="flex w-max gap-3 px-1"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: Math.max(18, slides.length * 2.2),
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {track.map((story, i) => (
            <CoverTile
              key={`${story.id}-${i}`}
              story={story}
              priority={i < 6}
            />
          ))}
        </motion.div>
      </div>
      <p className="mt-3 text-center text-xs font-semibold leading-snug text-[#475569] sm:text-sm">
        +300 other verified business stories &amp; new episodes added every week
      </p>
    </div>
  );
}
