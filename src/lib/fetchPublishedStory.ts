import type { Story } from "@/types/story";

export function storyHasReadablePanels(story: Story): boolean {
  for (const episode of story.episodes ?? []) {
    if (episode.panelBreakdown?.panels?.some((panel) => Boolean(panel.artUrl))) {
      return true;
    }
  }
  return false;
}

/** Series visible on index / detail — published, public, cover, or pipeline panels. */
export function isStoryBrowsable(story: Story): boolean {
  return (
    story.status === "published" ||
    Boolean(story.isPublic) ||
    Boolean(story.coverArtUrl) ||
    storyHasReadablePanels(story)
  );
}

/** Load any browsable series by id (catalog / admin / other sessions). */
export async function fetchPublishedStory(id: string): Promise<Story | null> {
  try {
    const res = await fetch(`/api/stories/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { story?: Story };
    const story = data.story;
    if (!story) return null;
    if (!isStoryBrowsable(story)) return null;
    return story;
  } catch {
    return null;
  }
}

export function getStoryCoverArtUrl(story: Story): string | undefined {
  if (story.coverArtUrl) return story.coverArtUrl;

  const episode = story.episodes?.[0];
  if (!episode) return undefined;

  const fromBreakdown = [...(episode.panelBreakdown?.panels ?? [])]
    .sort((a, b) => a.panel_number - b.panel_number)
    .map((panel) => panel.artUrl)
    .find(Boolean);

  if (fromBreakdown) return fromBreakdown;
  return episode.comicPage?.artUrl ?? undefined;
}
