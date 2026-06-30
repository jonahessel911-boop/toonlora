import { formatLp3StoryGridLabel } from "@/lib/lp3/story-labels";
import { MOCK_STORY_CATALOG } from "@/lib/mock/businessStoryCatalog";
import type { CatalogSeries } from "@/types/catalog";

export interface LpStoryOption {
  id: string;
  title: string;
  displayTitle: string;
  subtitle: string;
  coverArtUrl?: string;
  coverGradient: string;
}

export function mergeStoryOptions(catalog: CatalogSeries[]): LpStoryOption[] {
  const fromCatalog = catalog
    .filter((s) => s.coverArtUrl)
    .map((s) => {
      const title = s.title.split("—")[0]?.trim() || s.title;
      return {
        id: s.id,
        title,
        displayTitle: formatLp3StoryGridLabel({
          id: s.id,
          title,
          fullTitle: s.title,
          genre: s.genre,
          sagaSubtitle: s.sagaSubtitle,
        }),
        subtitle: s.synopsis?.slice(0, 60) || s.sagaLabel || "Business story",
        coverArtUrl: s.coverArtUrl,
        coverGradient: s.coverGradient,
      };
    });

  const seen = new Set(fromCatalog.map((s) => s.id));
  const fromMock = MOCK_STORY_CATALOG.flatMap((cat) =>
    cat.stories.map((s) => ({
      id: s.id,
      title: s.title,
      displayTitle: formatLp3StoryGridLabel({
        id: s.id,
        title: s.title,
        fullTitle: s.title,
        genre: cat.id,
        sagaSubtitle: s.subtitle,
      }),
      subtitle: s.subtitle,
      coverArtUrl: s.coverArtUrl,
      coverGradient: "from-[#0A1628] via-[#1e3a5f] to-[#2F80ED]",
    }))
  ).filter((s) => !seen.has(s.id));

  return [...fromCatalog, ...fromMock].slice(0, 12);
}
