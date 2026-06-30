import { formatLp3StoryGridLabel } from "@/lib/lp3/story-labels";
import {
  findMockStory,
  MOCK_STORY_CATALOG,
  type MockCatalogStory,
} from "@/lib/mock/businessStoryCatalog";
import { normalizeCoverTitleSlug } from "@/lib/lp3/coverTitleParam";
import { findCatalogSeriesByCoverTitle } from "@/lib/lp/resolveCatalogByCoverTitle";
import type { CatalogSeries } from "@/types/catalog";

export interface LpStoryOption {
  id: string;
  title: string;
  displayTitle: string;
  subtitle: string;
  coverArtUrl?: string;
  coverGradient: string;
}

const DEFAULT_COVER_GRADIENT = "from-[#0A1628] via-[#1e3a5f] to-[#2F80ED]";

export function catalogSeriesToStoryOption(s: CatalogSeries): LpStoryOption {
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
}

export function mockStoryToStoryOption(
  mock: MockCatalogStory,
  genre = "founder-stories"
): LpStoryOption {
  return {
    id: mock.id,
    title: mock.title,
    displayTitle: formatLp3StoryGridLabel({
      id: mock.id,
      title: mock.title,
      fullTitle: mock.title,
      genre,
      sagaSubtitle: mock.subtitle,
    }),
    subtitle: mock.subtitle,
    coverArtUrl: mock.coverArtUrl,
    coverGradient: DEFAULT_COVER_GRADIENT,
  };
}

function storyOptionFromId(
  id: string,
  catalog: CatalogSeries[],
  merged: LpStoryOption[]
): LpStoryOption | undefined {
  const fromCatalogMatch = findCatalogSeriesByCoverTitle(catalog, id);
  if (fromCatalogMatch) return catalogSeriesToStoryOption(fromCatalogMatch);

  const slug = normalizeCoverTitleSlug(id);
  const fromMerged = merged.find(
    (s) => normalizeCoverTitleSlug(s.id) === slug
  );
  if (fromMerged) return fromMerged;

  const fromCatalog = catalog.find(
    (s) => normalizeCoverTitleSlug(s.id) === slug
  );
  if (fromCatalog) return catalogSeriesToStoryOption(fromCatalog);

  const mock = findMockStory(slug);
  if (mock) return mockStoryToStoryOption(mock);

  return undefined;
}

export function mergeStoryOptions(
  catalog: CatalogSeries[],
  pinStoryIds: string[] = []
): LpStoryOption[] {
  const fromCatalog = catalog
    .filter((s) => s.coverArtUrl)
    .map((s) => catalogSeriesToStoryOption(s));

  const seen = new Set(fromCatalog.map((s) => s.id));
  const fromMock = MOCK_STORY_CATALOG.flatMap((cat) =>
    cat.stories.map((s) => mockStoryToStoryOption(s, cat.id))
  ).filter((s) => !seen.has(s.id));

  const merged = [...fromCatalog, ...fromMock];

  const pinned: LpStoryOption[] = [];
  for (const id of pinStoryIds) {
    const option = storyOptionFromId(id, catalog, merged);
    if (option && !pinned.some((p) => p.id === option.id)) {
      pinned.push(option);
    }
  }

  const pinnedIds = new Set(pinned.map((s) => s.id));
  const rest = merged
    .filter((s) => !pinnedIds.has(s.id))
    .slice(0, Math.max(0, 12 - pinned.length));

  return [...pinned, ...rest];
}
