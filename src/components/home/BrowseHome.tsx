"use client";

import ContinueReadingCard from "@/components/home/stream/ContinueReadingCard";
import SiteFooter from "@/components/layout/SiteFooter";
import FeaturedHero from "@/components/home/stream/FeaturedHero";
import FounderStoryCard from "@/components/home/stream/FounderStoryCard";
import StreamPosterCard from "@/components/home/stream/StreamPosterCard";
import StreamRail from "@/components/home/stream/StreamRail";
import TopTenCard from "@/components/home/stream/TopTenCard";
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
  getTrendingMockStories,
  WEEKLY_HERO,
} from "@/lib/mock/businessStoryCatalog";
import { mockCategoryToCatalogSeries } from "@/lib/mock/mockCatalogCards";
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
    panelIndex: entry.panelIndex ?? 0,
    totalPanels: entry.totalPanels,
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

function PosterSkeleton() {
  return (
    <div className="h-[340px] w-[70vw] max-w-[240px] shrink-0 animate-pulse rounded-xl bg-[#E7DDCC]/60 sm:w-[220px] md:h-[360px] md:w-[240px]" />
  );
}

/** Netflix-style cinematic browse index. */
export default function BrowseHome() {
  const { email } = useUserStore();
  const loggedIn = Boolean(email);

  useEffect(() => {
    document.documentElement.classList.add("theme-cinematic");
    return () => document.documentElement.classList.remove("theme-cinematic");
  }, []);

  const { series: catalogTrending, loading: loadingTrending } = useCatalog({
    sort: "popular",
    limit: 8,
  });

  const [continueStories, setContinueStories] = useState<CatalogSeries[]>([]);

  const refreshContinue = useCallback(async () => {
    const entries = getReadingHistory().slice(0, 10);
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

  const featuredStory = useMemo(() => {
    const founder = sectionStories["founder-stories"]?.stories ?? [];
    return (
      founder.find((s) => s.id === WEEKLY_HERO.id) ??
      mockCategoryToCatalogSeries(getFounderCategory()).find(
        (s) => s.id === WEEKLY_HERO.id
      )
    );
  }, [sectionStories]);

  const trendingThisWeek = useMemo(() => {
    const mockTrending = mockCategoryToCatalogSeries(
      getRiseAndFallCategory()
    ).concat(
      mockCategoryToCatalogSeries(getFounderCategory()).filter((s) =>
        getTrendingMockStories().some((m) => m.id === s.id)
      )
    );
    const seen = new Set<string>();
    return mockTrending.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, []);

  const topTen = useMemo(() => {
    const withCovers = trendingThisWeek
      .filter((story) => Boolean(story.coverArtUrl))
      .slice(0, 10);

    return withCovers.map((story, index) => ({
      ...story,
      sagaBadges:
        story.sagaBadges ??
        (index === 0
          ? (["new-drop"] as const)
          : index < 4
            ? (["trending"] as const)
            : undefined),
    }));
  }, [trendingThisWeek]);

  const continueFallback = useMemo(() => {
    const rise = mockCategoryToCatalogSeries(getRiseAndFallCategory());
    const founder = mockCategoryToCatalogSeries(getFounderCategory());
    const wework = rise.find((s) => s.id === "wework");
    const elon = founder.find((s) => s.id === "elon-musk");
    return [wework, elon]
      .filter((s): s is CatalogSeries => Boolean(s))
      .map((story, index) => ({
        ...story,
        chapterProgress: index === 0 ? 3 : 5,
      }));
  }, []);

  const continueDisplay =
    continueStories.length > 0 ? continueStories : continueFallback;

  const continueProgress = useMemo(() => {
    const map: Record<
      string,
      { episode: number; panel: number; totalPanels?: number }
    > = {};
    for (const entry of getReadingHistory()) {
      map[entry.seriesId] = {
        episode: entry.episodeNumber,
        panel: entry.panelIndex ?? 0,
        totalPanels: entry.totalPanels,
      };
    }
    return map;
  }, [continueStories]);

  const browseSections = HOME_BROWSE_NAV.filter(
    (item) =>
      item.id !== "this-week" &&
      item.id !== "home" &&
      item.id !== "founder-stories"
  );

  const founderSection = sectionStories["founder-stories"];

  return (
    <div className="min-h-[100dvh] bg-[#0E1117]">
      <FeaturedHero featuredStory={featuredStory} />

      <div className="relative z-10 bg-[#F6F1E7] pt-6">
        <StreamRail
          id="continue"
          title="Continue Reading"
          subtitle={
            loggedIn && continueStories.length > 0
              ? "Pick up where you left off"
              : undefined
          }
          noTopBorder
        >
          {continueDisplay.map((story) => {
            const progress = continueProgress[story.id];
            return (
              <ContinueReadingCard
                key={story.id}
                story={story}
                listSection="continue_reading"
                chapterProgress={
                  progress?.episode ?? story.chapterProgress
                }
                panelIndex={progress?.panel ?? story.panelIndex}
                totalPanels={progress?.totalPanels ?? story.totalPanels}
              />
            );
          })}
        </StreamRail>

        <StreamRail
          id="top-10"
          title="Top 10 This Week"
          viewAllHref="/#top-10"
          compact
          dense
        >
          {topTen.map((story, index) => (
            <TopTenCard
              key={story.id}
              story={story}
              rank={index + 1}
              listSection="top_10"
            />
          ))}
        </StreamRail>

        {founderSection ? (
          <StreamRail
            id="founder-stories"
            title="Founder Stories"
            subtitle={founderSection.category.subtitle}
            viewAllHref="/#founder-stories"
          >
            {loadingTrending && founderSection.stories.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <PosterSkeleton key={i} />
                ))
              : founderSection.stories.map((story) => (
                  <FounderStoryCard
                    key={story.id}
                    story={story}
                    listSection="founder_stories"
                  />
                ))}
          </StreamRail>
        ) : null}

        {browseSections.map(({ id, label }) => {
          const section = sectionStories[id as keyof typeof SECTION_CATEGORIES];
          if (!section) return null;

          return (
            <StreamRail
              key={id}
              id={id}
              title={label}
              subtitle={section.category.subtitle}
              viewAllHref={`/#${id}`}
            >
              {section.stories.map((story) => (
                <StreamPosterCard
                  key={story.id}
                  story={story}
                  listSection={id.replace(/-/g, "_")}
                />
              ))}
            </StreamRail>
          );
        })}
        <SiteFooter />
      </div>
    </div>
  );
}
