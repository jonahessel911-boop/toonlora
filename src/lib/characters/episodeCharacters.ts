import { characterSlug } from "@/lib/characters/characterSlug";
import type { StudioCharacter } from "@/types/creator";
import type { Story, StoryEpisode } from "@/types/story";
import type { StoryCharacter } from "@/types/pipeline";

export interface EpisodeCharacterRef {
  slug: string;
  name: string;
  role?: string;
  portraitUrl?: string;
  visualDescription?: string;
}

function addCharacter(
  map: Map<string, EpisodeCharacterRef>,
  name: string,
  partial?: Partial<EpisodeCharacterRef>
) {
  const trimmed = name.trim();
  if (!trimmed || trimmed.toLowerCase() === "narrator") return;

  const slug = characterSlug(trimmed);
  if (!slug) return;

  const existing = map.get(slug);
  if (existing) {
    map.set(slug, {
      ...existing,
      ...partial,
      name: existing.name,
      role: existing.role ?? partial?.role,
      portraitUrl: existing.portraitUrl ?? partial?.portraitUrl,
      visualDescription:
        existing.visualDescription ?? partial?.visualDescription,
    });
    return;
  }

  map.set(slug, {
    slug,
    name: trimmed,
    role: partial?.role,
    portraitUrl: partial?.portraitUrl,
    visualDescription: partial?.visualDescription,
  });
}

function addFromStoryCharacter(
  map: Map<string, EpisodeCharacterRef>,
  character: StoryCharacter
) {
  addCharacter(map, character.name, {
    role: character.role,
    visualDescription: character.visual_design,
  });
}

function addSpeakersFromEpisode(
  map: Map<string, EpisodeCharacterRef>,
  episode?: StoryEpisode
) {
  if (!episode) return;

  for (const panel of episode.script.panels) {
    for (const line of panel.dialogue) {
      addCharacter(map, line.speaker);
    }
  }
}

export function extractEpisodeCharacters(
  story: Story,
  episodeNumber: number
): EpisodeCharacterRef[] {
  const map = new Map<string, EpisodeCharacterRef>();

  for (const character of story.storyBible?.main_characters ?? []) {
    addFromStoryCharacter(map, character);
  }

  if (story.mainCharacter) {
    addCharacter(map, story.mainCharacter, { role: "Main character" });
  }
  if (story.loveInterest) {
    addCharacter(map, story.loveInterest, { role: "Love interest" });
  }

  const episode =
    story.episodes?.find((entry) => entry.episodeNumber === episodeNumber) ??
    story.episodes?.[0];

  addSpeakersFromEpisode(map, episode);

  return Array.from(map.values());
}

export function storyFeaturesCharacter(story: Story, slug: string): boolean {
  return extractEpisodeCharacters(story, 1).some(
    (character) => character.slug === slug
  );
}

export function enrichCharactersWithStudioPortraits(
  characters: EpisodeCharacterRef[],
  studioCharacters: StudioCharacter[]
): EpisodeCharacterRef[] {
  return characters.map((character) => {
    const match = studioCharacters.find(
      (studioCharacter) =>
        studioCharacter.name.toLowerCase() === character.name.toLowerCase() ||
        studioCharacter.id === character.slug
    );

    if (!match?.portraitUrl) return character;

    return {
      ...character,
      portraitUrl: match.portraitUrl,
      visualDescription:
        character.visualDescription ?? match.visualDescription,
      role: character.role ?? match.role,
    };
  });
}
