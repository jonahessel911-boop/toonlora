import type { Story, StoryEpisode } from "@/types/story";

export function episodeHasReadablePanels(episode: StoryEpisode): boolean {
  if (episode.comicPage?.artUrl) return true;
  return (episode.panelBreakdown?.panels ?? []).some((panel) =>
    Boolean(panel.artUrl)
  );
}

export function getReadableEpisodes(
  story: Story | null | undefined
): StoryEpisode[] {
  return (story?.episodes ?? []).filter(episodeHasReadablePanels);
}

export function countReadableEpisodes(
  story: Story | null | undefined
): number {
  return getReadableEpisodes(story).length;
}
