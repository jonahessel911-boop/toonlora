"use client";

import Image from "next/image";
import { optimizeCoverImageUrl } from "@/lib/images/cover-image";
import { useLpHeroCoverArt } from "@/lib/lp/useLpHeroCoverArt";
import type { LpStoryTeaser } from "@/lib/lp/storyTeasers";
import type { LpStoryOption } from "@/lib/lp3/storyOptions";

const HERO_COVER_WIDTH = 320;
const HERO_COVER_HEIGHT = 480;

interface LpStoryTeaserIntroProps {
  teaser: LpStoryTeaser;
  story: LpStoryOption;
  className?: string;
  children?: React.ReactNode;
}

export default function LpStoryTeaserIntro({
  teaser,
  story,
  className = "",
  children,
}: LpStoryTeaserIntroProps) {
  const coverArtUrl = useLpHeroCoverArt(story.id, story.coverArtUrl);
  const coverSrc = coverArtUrl
    ? optimizeCoverImageUrl(coverArtUrl, {
        width: HERO_COVER_WIDTH * 2,
        height: HERO_COVER_HEIGHT * 2,
        quality: 88,
      })
    : undefined;

  return (
    <div className={`mx-auto w-full max-w-lg px-4 ${className}`}>
      <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[#2F80ED]">
        {teaser.category}
      </p>

      <h1 className="mt-3 text-center font-heading text-[1.45rem] font-extrabold leading-[1.18] text-[#0A1628] sm:text-[1.65rem]">
        {teaser.hook}
      </h1>

      <p className="mx-auto mt-3 max-w-md text-center text-[15px] leading-relaxed text-[#475569] sm:text-base">
        {teaser.description}
      </p>

      <div className="mt-5 flex justify-center px-1 sm:mt-6">
        <div
          className="w-full max-w-[min(82vw,280px)]"
          style={{ transform: "rotate(-1.25deg)" }}
        >
          <div className="overflow-hidden rounded-2xl shadow-[0_20px_48px_rgba(10,22,40,0.2)] ring-1 ring-[#0A1628]/10">
            <div className="aspect-[2/3] w-full bg-[#0A1628]">
              {coverSrc ? (
                <Image
                  src={coverSrc}
                  alt=""
                  width={HERO_COVER_WIDTH}
                  height={HERO_COVER_HEIGHT}
                  priority
                  quality={92}
                  className="h-full w-full object-cover object-center"
                  sizes="(max-width: 400px) 82vw, 280px"
                />
              ) : (
                <div
                  className={`h-full w-full bg-gradient-to-br ${story.coverGradient}`}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
