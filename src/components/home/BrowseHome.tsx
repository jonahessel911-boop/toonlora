"use client";

import ContinueReadingCard from "@/components/home/stream/ContinueReadingCard";
import SiteFooter from "@/components/layout/SiteFooter";
import FeaturedHero from "@/components/home/stream/FeaturedHero";
import FounderStoryCard from "@/components/home/stream/FounderStoryCard";
import StreamPosterCard from "@/components/home/stream/StreamPosterCard";
import StreamRail from "@/components/home/stream/StreamRail";
import TopTenCard from "@/components/home/stream/TopTenCard";
import { prioritizeCoverArt, withRealCoverArt } from "@/components/home/StoryCard";
import { useContinueReading } from "@/hooks/useContinueReading";
import { useCatalog } from "@/hooks/useCatalog";
import { HOME_BROWSE_NAV } from "@/lib/homeBrowseNav";
import {
  groupCatalogBySection,
  mergeCatalogById,
} from "@/lib/home/indexCatalog";
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
import { continueItemToCatalogCard } from "@/lib/reading/continueReading";
import type { CatalogSeries } from "@/types/catalog";
import { catalogToCard } from "@/types/catalog";
import { useEffect, useMemo } from "react";
import { useUserStore } from "@/store/useUserStore";

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

  const { series: indexCatalog, loading: loadingIndex } = useCatalog({
    index: true,
    limit: 32,
  });

  const { items: continueItems } = useContinueReading(10);

  const continueStories = useMemo(
    () => continueItems.map((item) => continueItemToCatalogCard(item)),
    [continueItems]
  );

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
    const indexWithArt = withRealCoverArt(prioritizeCoverArt(indexCatalog));
    const indexBySection = groupCatalogBySection(indexWithArt);

    const catalogWithArt = withRealCoverArt(
      prioritizeCoverArt(mergeCatalogById(indexWithArt, catalogTrending))
    );
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
        const fromIndex = indexBySection.get(id) ?? [];
        const stories =
          id === "founder-stories" && (catalogStories.length > 0 || fromIndex.length > 0)
            ? mergeCatalogById(fromIndex, catalogStories)
            : fromIndex.length > 0
              ? mergeCatalogById(fromIndex, mockStories)
              : mockStories;
        return [id, { category, stories }];
      })
    ) as Record<
      keyof typeof SECTION_CATEGORIES,
      { category: ReturnType<typeof getFounderCategory>; stories: CatalogSeries[] }
    >;
  }, [catalogTrending, indexCatalog]);

  const featuredStory = useMemo(() => {
    const indexWithArt = withRealCoverArt(indexCatalog);
    if (indexWithArt[0]) {
      return catalogToCard(indexWithArt[0]);
    }

    const founder = sectionStories["founder-stories"]?.stories ?? [];
    return (
      founder.find((s) => s.id === WEEKLY_HERO.id) ??
      mockCategoryToCatalogSeries(getFounderCategory()).find(
        (s) => s.id === WEEKLY_HERO.id
      )
    );
  }, [sectionStories, indexCatalog]);

  const topTen = useMemo(() => {
    const indexWithArt = withRealCoverArt(indexCatalog).map((s) => catalogToCard(s));
    const mockTrending = mockCategoryToCatalogSeries(
      getRiseAndFallCategory()
    ).concat(
      mockCategoryToCatalogSeries(getFounderCategory()).filter((s) =>
        getTrendingMockStories().some((m) => m.id === s.id)
      )
    );
    const seen = new Set<string>();
    const combined = mergeCatalogById(indexWithArt, mockTrending).filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });

    const withCovers = combined
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
  }, [indexCatalog]);

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
        {continueStories.length > 0 ? (
          <StreamRail
            id="continue"
            title="Continue Reading"
            subtitle={
              loggedIn ? "Pick up where you left off" : "Your recent reads"
            }
            noTopBorder
          >
            {continueStories.map((story) => (
              <ContinueReadingCard
                key={story.id}
                story={story}
                listSection="continue_reading"
                chapterProgress={story.chapterProgress}
                panelIndex={story.panelIndex}
                totalPanels={story.totalPanels}
              />
            ))}
          </StreamRail>
        ) : null}

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
            {loadingTrending && loadingIndex && founderSection.stories.length === 0
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
