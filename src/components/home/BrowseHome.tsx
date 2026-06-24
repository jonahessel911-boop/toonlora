"use client";

import HomeBrandHero from "@/components/home/HomeBrandHero";
import HomeSection from "@/components/home/HomeSection";
import SagaRail from "@/components/home/SagaRail";
import { prioritizeCoverArt, withRealCoverArt } from "@/components/home/StoryCard";
import { useCatalog } from "@/hooks/useCatalog";
import { HOME_BROWSE_NAV } from "@/lib/homeBrowseNav";
import {
  getCompanyCategory,
  getEmpiresCategory,
  getFounderCategory,
  getHeistsAndFraudsCategory,
  getHistoryDropCategory,
  getRiseAndFallCategory,
} from "@/lib/mock/businessStoryCatalog";
import {
  mockCategoryToCatalogSeries,
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
import { useUserStore } from "@/store/useUserStore";

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

const SECTION_CATEGORIES = {
  "founder-stories": getFounderCategory,
  "rise-and-fall": getRiseAndFallCategory,
  empires: getEmpiresCategory,
  "heists-and-frauds": getHeistsAndFraudsCategory,
  "company-breakdowns": getCompanyCategory,
  "history-drop": getHistoryDropCategory,
} as const;

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

  const sectionStories = useMemo(() => {
    const catalogWithArt = withRealCoverArt(prioritizeCoverArt(catalogTrending));
    const catalogStories: CatalogSeries[] =
      catalogWithArt.length > 0
        ? catalogWithArt.map((s, i) => ({
            ...s,
            sagaLabel: s.genre,
            readMinutes: 8,
            sagaBadges: i < 3 ? (["trending"] as const) : undefined,
            rank: i + 1,
          }))
        : [];

    return Object.fromEntries(
      Object.entries(SECTION_CATEGORIES).map(([id, getCategory]) => {
        const category = getCategory();
        const mockStories = mockCategoryToCatalogSeries(category);
        const stories =
          id === "founder-stories" && catalogStories.length > 0
            ? catalogStories
            : mockStories;
        return [id, { category, stories }];
      })
    ) as Record<
      keyof typeof SECTION_CATEGORIES,
      { category: ReturnType<typeof getFounderCategory>; stories: CatalogSeries[] }
    >;
  }, [catalogTrending]);

  const continueProgress = useMemo(() => {
    const map: Record<string, number> = {};
    for (const story of continueStories) {
      if (story.chapterProgress) map[story.id] = story.chapterProgress;
    }
    return map;
  }, [continueStories]);

  const browseSections = HOME_BROWSE_NAV.filter((item) => item.id !== "this-week");

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

        {browseSections.map(({ id, label }) => {
          const section = sectionStories[id as keyof typeof SECTION_CATEGORIES];
          if (!section) return null;

          return (
            <HomeSection
              key={id}
              id={id}
              title={label}
              subtitle={section.category.subtitle}
              tone="clear"
            >
              <SagaRail
                stories={section.stories}
                loading={
                  id === "founder-stories" &&
                  loadingTrending &&
                  section.stories.length === 0
                }
                listSection={id.replace(/-/g, "_")}
              />
            </HomeSection>
          );
        })}
      </div>
    </div>
  );
}
