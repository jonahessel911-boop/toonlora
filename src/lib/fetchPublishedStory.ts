import type { Story } from "@/types/story";

/** Load any published series by id (catalog / admin / other sessions). */
export async function fetchPublishedStory(id: string): Promise<Story | null> {
  try {
    const res = await fetch(`/api/stories/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { story?: Story };
    const story = data.story;
    if (!story) return null;
    const browsable =
      story.status === "published" ||
      story.isPublic ||
      Boolean(story.coverArtUrl);
    if (!browsable) return null;
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
