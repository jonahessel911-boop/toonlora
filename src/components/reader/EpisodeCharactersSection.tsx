"use client";

import { useMemo } from "react";
import HorizontalScrollRail from "@/components/home/HorizontalScrollRail";
import { CharacterPortraitLink } from "@/components/reader/CharacterPortraitThumb";
import {
  enrichCharactersWithStudioPortraits,
  extractEpisodeCharacters,
  type EpisodeCharacterRef,
} from "@/lib/characters/episodeCharacters";
import { useCreatorStore } from "@/store/useCreatorStore";
import type { Story } from "@/types/story";

interface EpisodeCharactersSectionProps {
  story: Story;
  episodeNumber: number;
}

export default function EpisodeCharactersSection({
  story,
  episodeNumber,
}: EpisodeCharactersSectionProps) {
  const creatorCharacters = useCreatorStore((state) => state.characters);

  const studioCharacters = useMemo(
    () =>
      creatorCharacters.filter(
        (character) => !character.archivedPublicSnapshot
      ),
    [creatorCharacters]
  );

  const characters = useMemo(() => {
    const extracted = extractEpisodeCharacters(story, episodeNumber);
    return enrichCharactersWithStudioPortraits(extracted, studioCharacters);
  }, [story, episodeNumber, studioCharacters]);

  if (characters.length === 0) return null;

  return (
    <section className="border-b border-[#E8E8E8] bg-white px-4 py-5 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl">
        <h3 className="text-sm font-bold text-[#222]">Characters in this Episode</h3>
        <p className="mt-1 text-xs text-[#888]">
          Tap a character to see other stories they appear in.
        </p>
        <div className="mt-4">
          <HorizontalScrollRail className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
            {characters.map((character: EpisodeCharacterRef) => (
              <CharacterPortraitLink key={character.slug} character={character} />
            ))}
          </HorizontalScrollRail>
        </div>
      </div>
    </section>
  );
}
