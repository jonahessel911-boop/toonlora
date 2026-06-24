"use client";

import HomeBrandHero from "@/components/home/HomeBrandHero";
import HomeSection from "@/components/home/HomeSection";
import SagaRail from "@/components/home/SagaRail";
import { prioritizeCoverArt, withRealCoverArt } from "@/components/home/StoryCard";
import { useCatalog } from "@/hooks/useCatalog";
import { useUserStore } from "@/store/useUserStore";
import {
  getCompanyCategory,
  getFounderCategory,
  getTrendingMockStories,
  MOCK_PLAYBOOKS,
} from "@/lib/mock/businessStoryCatalog";
import {
  mockCategoryToCatalogSeries,
  mockPlaybookToCatalogSeries,
  mockStoryToCatalogSeries,
} from "@/lib/mock/mockCatalogCards";
import {
  fetchPublishedStory,
  getStoryCoverArtUrl,
} from "@/lib/fetchPublishedStory";
import {
  getReadingHistory,
  pruneReadingHistory,
  type ReadingHistoryEntry,
} from "@/lib/readingHistory";
import { catalogToCard } from "@/types/catalog";
import type { CatalogSeries } from "@/types/catalog";
import { useCallback, useEffect, useMemo, useState } from "react";

async function hydrateEntry(
  entry: ReadingHistoryEntry
): Promise<CatalogSeries | null> {
  const story = await fetchPublishedStory(entry.seriesId);
  if (!story) return null;

  const coverArtUrl = getStoryCoverArtUrl(story) ?? entry.coverArtUrl;
  if (!coverArtUrl) return null;

  return catalogToCard({
    id: story.id,
    title: story.title,
    genre: String(story.genre),
    coverGradient: story.coverGradient,
    source: story.source === "admin" ? "admin" : "creator",
    status: "published",
    creatorDisplayName:
      story.creatorDisplayName ?? entry.creatorDisplayName ?? "Toonlora",
    synopsis: story.synopsis ?? "",
    episodeCount: story.episodes?.length ?? entry.episodeNumber,
    viewsCount: story.viewsCount ?? 0,
    likesCount: story.likesCount ?? 0,
    featuredRank: story.featuredRank ?? null,
    publishedAt: story.publishedAt ?? null,
    createdAt: story.createdAt,
    coverArtUrl,
    href: entry.href,
    chapterProgress: entry.episodeNumber,
    sagaLabel: String(story.genre),
    readMinutes: 8,
  });
}

/** Light premium homepage — dark hero, white cards on beige. */
export default function BrowseHome() {
  const { email } = useUserStore();
  const loggedIn = Boolean(email);

  const { series: catalogTrending, loading: loadingTrending } = useCatalog({
    sort: "popular",
    limit: 8,
  });

  const [continueStories, setContinueStories] = useState<CatalogSeries[]>([]);

  const refreshContinue = useCallback(async () => {
    const entries = getReadingHistory().slice(0, 8);
    if (entries.length === 0) {
      setContinueStories([]);
      return;
    }
    const cards = (
      await Promise.all(entries.map((entry) => hydrateEntry(entry)))
    ).filter((card): card is CatalogSeries => card !== null);
    pruneReadingHistory(cards.map((card) => card.id));
    setContinueStories(cards);
  }, []);

  useEffect(() => {
    void refreshContinue();
    const onStorage = () => void refreshContinue();
    window.addEventListener("storage", onStorage);
    window.addEventListener("tl-reading-history", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("tl-reading-history", onStorage);
    };
  }, [refreshContinue]);

  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace("#", "");
      if (!id) return;
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  const trendingMock = useMemo(
    () => getTrendingMockStories().map((s) => mockStoryToCatalogSeries(s)),
    []
  );
  const founderSagas = useMemo(
    () => mockCategoryToCatalogSeries(getFounderCategory()),
    []
  );
  const companyBreakdowns = useMemo(
    () => mockCategoryToCatalogSeries(getCompanyCategory()),
    []
  );
  const playbooks = useMemo(
    () => MOCK_PLAYBOOKS.map((p) => mockPlaybookToCatalogSeries(p)),
    []
  );

  const catalogWithArt = withRealCoverArt(prioritizeCoverArt(catalogTrending));
  const trendingSagas: CatalogSeries[] =
    catalogWithArt.length > 0
      ? catalogWithArt.map((s, i) => ({
          ...s,
          sagaLabel: s.genre,
          readMinutes: 8,
          sagaBadges: i < 3 ? ["trending" as const] : undefined,
          rank: i + 1,
        }))
      : trendingMock;

  const continueProgress = useMemo(() => {
    const map: Record<string, number> = {};
    for (const story of continueStories) {
      if (story.chapterProgress) map[story.id] = story.chapterProgress;
    }
    return map;
  }, [continueStories]);

  return (
    <div className="bg-background pb-16">
      <HomeBrandHero />

      <div className="space-y-2 md:space-y-4">
        {loggedIn && continueStories.length > 0 ? (
          <HomeSection
            id="continue"
            title="Continue Reading"
            subtitle="Pick up where you left off."
            tone="clear"
          >
            <div className="rounded-2xl bg-surface p-5 shadow-[0_4px_24px_rgba(10,22,40,0.05)] ring-1 ring-border md:p-6">
              <SagaRail
                stories={continueStories}
                listSection="continue_reading"
                progressMap={continueProgress}
              />
            </div>
          </HomeSection>
        ) : null}

        <HomeSection
          id="sagas"
          title="Trending Business Stories"
          subtitle="The stories readers can't stop opening."
          tone="clear"
        >
          <SagaRail
            stories={trendingSagas}
            loading={loadingTrending && catalogWithArt.length === 0}
            listSection="trending_stories"
          />
        </HomeSection>

        <HomeSection
          id="founders"
          title="Founder Sagas"
          subtitle={getFounderCategory().subtitle}
          tone="clear"
        >
          <SagaRail stories={founderSagas} listSection="founder_sagas" />
        </HomeSection>

        <HomeSection
          id="companies"
          title="Company Breakdowns"
          subtitle={getCompanyCategory().subtitle}
          tone="clear"
        >
          <SagaRail stories={companyBreakdowns} listSection="company_breakdowns" />
        </HomeSection>

        <HomeSection
          id="playbooks"
          title="Business Playbooks"
          subtitle="Short strategy lessons distilled from the sagas."
          tone="clear"
        >
          <SagaRail stories={playbooks} listSection="playbooks" />
        </HomeSection>
      </div>
    </div>
  );
}
