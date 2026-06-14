"use client";

import Link from "next/link";
import CoverArt, { getCoverPreset } from "@/components/ui/CoverArt";
import type { SampleStory } from "@/lib/sampleStories";

interface LPStoryCardProps {
  story: SampleStory;
}

export default function LPStoryCard({ story }: LPStoryCardProps) {
  const preset = getCoverPreset(String(story.genre));

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/story/${story.id}?from=lp`} className="block">
        <div className="relative">
          <CoverArt
            gradient={story.coverGradient || preset.gradient}
            emoji={story.coverEmoji ?? preset.emoji}
            className="aspect-[3/4] w-full"
          />
          <span className="absolute left-2 top-2 rounded-full bg-lp-blue px-2.5 py-0.5 text-[10px] font-bold text-white">
            {story.genre}
          </span>
        </div>
        <div className="p-3">
          <h3 className="line-clamp-2 text-sm font-black leading-snug text-gray-900">
            {story.title}
          </h3>
          {story.creator && (
            <p className="mt-1 text-[11px] text-gray-400">by {story.creator}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-2 text-[11px] text-gray-500">
            <span>{story.episodes ?? 1} ep</span>
            {story.readers && <span>👁 {story.readers}</span>}
            {story.likes && <span>♥ {story.likes}</span>}
          </div>
          <span className="lp-pill-btn mt-3 py-2.5 text-xs">
            Read episode 1
          </span>
        </div>
      </Link>
    </article>
  );
}
