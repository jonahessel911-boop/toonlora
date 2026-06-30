import {
  formatCoverTitleLabel,
  findStoryByCoverTitle,
  prioritizeStoriesByCoverTitle,
} from "@/lib/lp3/coverTitleParam";
import { findCatalogSeriesByCoverTitle } from "@/lib/lp/resolveCatalogByCoverTitle";
import { isStoryUuid } from "@/lib/lp/resolveCatalogByCoverTitle";
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

export interface LpCoverStoryContext {
  coverTitleParam: string | null;
  /** Teaser / copy key (e.g. ferrari) — for i18n story intros. */
  canonicalStoryId: string;
  /** Published series id — usually a DB UUID for reader + cover API. */
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
  const teaserStoryId = resolveStoryIdFromCoverTitle(param);
  const catalogMatch = findCatalogSeriesByCoverTitle(catalog, param);
  const coverStory = findStoryByCoverTitle(stories, param);

  const canonicalStoryId =
    teaserStoryId ?? catalogMatch?.slug?.split("-")[0] ?? coverStory?.id ?? fallbackStoryId;

  const readerStoryId =
    catalogMatch?.id ??
    (coverStory && isStoryUuid(coverStory.id) ? coverStory.id : undefined) ??
    coverStory?.id ??
    teaserStoryId ??
    fallbackStoryId;

  const storyName =
    catalogMatch?.title ??
    coverStory?.displayTitle ??
    (teaserStoryId ? formatCoverTitleLabel(teaserStoryId) : null) ??
    (param ? formatCoverTitleLabel(param) : null) ??
    coverStory?.title ??
    stories[0]?.displayTitle ??
    "Business Story";

  let heroStory: LpStoryOption | undefined;

  if (catalogMatch) {
    heroStory = catalogSeriesToStoryOption(catalogMatch);
  } else if (coverStory) {
    heroStory = { ...coverStory, id: readerStoryId };
  } else {
    heroStory =
      stories.find((s) => s.id === readerStoryId) ??
      (() => {
        const mock = findMockStory(canonicalStoryId);
        return mock ? { ...mockStoryToOption(mock), id: readerStoryId } : undefined;
      })();
  }

  if (!heroStory) {
    if (param) {
      heroStory = {
        id: readerStoryId,
        title: storyName,
        displayTitle: storyName,
        subtitle: "",
        coverGradient: "from-[#0A1628] via-[#1e3a5f] to-[#2F80ED]",
      };
    } else {
      heroStory = stories[0] ?? {
        id: readerStoryId,
        title: storyName,
        displayTitle: storyName,
        subtitle: "",
        coverGradient: "from-[#0A1628] via-[#1e3a5f] to-[#2F80ED]",
      };
    }
  }

  const checkoutStories = param
    ? (() => {
        const prioritized = prioritizeStoriesByCoverTitle(stories, param);
        const heroInList = prioritized.some((s) => s.id === heroStory.id);
        if (heroInList) return prioritized;
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
