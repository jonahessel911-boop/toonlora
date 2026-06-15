import type { StudioCharacter, StudioStory } from "@/types/creator";

export function getStoriesForCharacter(
  characterId: string,
  character: StudioCharacter,
  stories: StudioStory[]
): StudioStory[] {
  const ids = new Set([
    ...character.usedInStories,
    ...stories
      .filter((s) => s.characterIds.includes(characterId))
      .map((s) => s.id),
  ]);
  return stories.filter((s) => ids.has(s.id));
}

export function getCharacterDialogueInStory(
  characterId: string,
  story: StudioStory
): string[] {
  const lines: string[] = [];
  for (const episode of story.episodes) {
    for (const panel of episode.panels) {
      for (const bubble of panel.overlays) {
        if (bubble.characterId === characterId && bubble.text.trim()) {
          lines.push(bubble.text.trim());
        }
      }
    }
  }
  return lines;
}
