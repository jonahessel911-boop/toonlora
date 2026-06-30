import {
  formatCoverTitleLabel,
  findStoryByCoverTitle,
  normalizeCoverTitleSlug,
  prioritizeStoriesByCoverTitle,
} from "@/lib/lp3/coverTitleParam";
import type { LpStoryOption } from "@/lib/lp3/storyOptions";
import {
  catalogSeriesToStoryOption,
  mockStoryToStoryOption,
} from "@/lib/lp3/storyOptions";
import { resolveStoryIdFromCoverTitle } from "@/lib/lp/storyTeasers";
import {
  findMockStory,
  type MockCatalogStory,
} from "@/lib/mock/businessStoryCatalog";
import type { CatalogSeries } from "@/types/catalog";

function mockStoryToOption(mock: MockCatalogStory): LpStoryOption {
  return mockStoryToStoryOption(mock);
}

function attachCatalogCover(
  hero: LpStoryOption,
  catalog: CatalogSeries[]
): LpStoryOption {
  if (hero.coverArtUrl) return hero;
  const match = catalog.find(
    (s) => normalizeCoverTitleSlug(s.id) === normalizeCoverTitleSlug(hero.id)
  );
  if (!match?.coverArtUrl) return hero;
  return { ...hero, coverArtUrl: match.coverArtUrl };
}

export interface LpCoverStoryContext {
  coverTitleParam: string | null;
  canonicalStoryId: string;
  readerStoryId: string;
  storyName: string;
  heroStory: LpStoryOption;
  checkoutStories: LpStoryOption[];
  hasCoverTitle: boolean;
}

/** Shared `cover_title` resolution for LP/3, LP/5, and LP/6. */
export function resolveLpCoverStoryContext(
  stories: LpStoryOption[],
  coverTitleParam: string | null | undefined,
  fallbackStoryId = "elon-musk",
  catalog: CatalogSeries[] = []
): LpCoverStoryContext {
  const param = coverTitleParam?.trim() ? coverTitleParam.trim() : null;
  const coverCompany = param ? formatCoverTitleLabel(param) : null;
  const coverStory = findStoryByCoverTitle(stories, param);
  const teaserStoryId = resolveStoryIdFromCoverTitle(param);
  const canonicalStoryId =
    teaserStoryId ??
    (normalizeCoverTitleSlug(param ?? "") ||
      coverStory?.id ||
      stories[0]?.id ||
      fallbackStoryId);

  const readerStoryId =
    teaserStoryId ?? coverStory?.id ?? canonicalStoryId;

  const storyName =
    coverStory?.displayTitle ??
    (teaserStoryId ? formatCoverTitleLabel(teaserStoryId) : null) ??
    coverCompany ??
    (param ? formatCoverTitleLabel(param) : null) ??
    coverStory?.title ??
    stories[0]?.displayTitle ??
    "Business Story";

  let heroStory =
    coverStory ??
    stories.find((s) => s.id === canonicalStoryId) ??
    stories.find(
      (s) =>
        normalizeCoverTitleSlug(s.id) === normalizeCoverTitleSlug(canonicalStoryId)
    );

  if (!heroStory) {
    const mock = findMockStory(canonicalStoryId);
    if (mock) heroStory = mockStoryToOption(mock);
  }

  if (!heroStory) {
    if (param) {
      const mock = findMockStory(canonicalStoryId);
      const fromCatalog = catalog.find(
        (s) =>
          normalizeCoverTitleSlug(s.id) ===
          normalizeCoverTitleSlug(canonicalStoryId)
      );
      heroStory = mock
        ? mockStoryToOption(mock)
        : fromCatalog
          ? catalogSeriesToStoryOption(fromCatalog)
          : {
              id: canonicalStoryId,
              title: storyName,
              displayTitle: storyName,
              subtitle: "",
              coverGradient: "from-[#0A1628] via-[#1e3a5f] to-[#2F80ED]",
            };
    } else {
      heroStory = stories[0] ?? {
        id: canonicalStoryId,
        title: storyName,
        displayTitle: storyName,
        subtitle: "",
        coverGradient: "from-[#0A1628] via-[#1e3a5f] to-[#2F80ED]",
      };
    }
  }

  heroStory = attachCatalogCover(heroStory, catalog);

  const checkoutStories = param
    ? (() => {
        const prioritized = prioritizeStoriesByCoverTitle(stories, param);
        if (prioritized[0]?.id === heroStory.id) return prioritized;
        return [heroStory, ...stories.filter((s) => s.id !== heroStory.id)];
      })()
    : stories;

  return {
    coverTitleParam: param,
    canonicalStoryId,
    readerStoryId,
    storyName,
    heroStory,
    checkoutStories,
    hasCoverTitle: Boolean(param),
  };
}
