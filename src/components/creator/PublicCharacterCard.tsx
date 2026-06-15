"use client";

import type { StudioCharacter } from "@/types/creator";

interface PublicCharacterCardProps {
  character: StudioCharacter;
  onUse: () => void;
  onView: () => void;
  trending?: boolean;
}

export default function PublicCharacterCard({
  character,
  onUse,
  onView,
  trending,
}: PublicCharacterCardProps) {
  return (
    <article className="overflow-hidden rounded-[24px] border border-[#E7D8FF] bg-white shadow-[0_4px_20px_rgba(83,64,255,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(83,64,255,0.14)]">
      <div
        className={`relative aspect-square bg-gradient-to-br ${character.portraitGradient} p-6`}
      >
        <div className="flex h-full flex-col items-center justify-center text-center">
          <span className="font-heading text-5xl font-extrabold text-white/90 drop-shadow">
            {character.name.charAt(0)}
          </span>
          <p className="mt-2 font-heading text-lg font-extrabold text-white drop-shadow">
            {character.name}
          </p>
        </div>
        {trending ? (
          <span className="absolute left-3 top-3 rounded-full bg-[#FFE033] px-2 py-0.5 text-[10px] font-bold text-[#2A114B]">
            Trending
          </span>
        ) : null}
      </div>

      <div className="p-4">
        <p className="text-xs text-[#667085]">
          by{" "}
          <button
            type="button"
            onClick={onView}
            className="font-bold text-[#5340FF] hover:underline"
          >
            {character.creatorName}
          </button>
        </p>
        <p className="mt-1 line-clamp-2 text-sm text-[#667085]">
          {character.shortDescription}
        </p>
        <p className="mt-2 text-[10px] font-semibold text-[#667085]">
          {character.styleTheme} · Used in {character.usedInStories.length}{" "}
          stories
        </p>
        <p className="mt-2 rounded-xl bg-[#F3ECFF] px-3 py-2 text-[10px] text-[#5340FF]">
          This character will be credited in your story.
        </p>
        <button
          type="button"
          onClick={onUse}
          className="mt-3 w-full rounded-2xl bg-[#FF6847] py-2.5 text-sm font-bold text-white"
        >
          Use this character
        </button>
      </div>
    </article>
  );
}
