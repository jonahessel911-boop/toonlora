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
import { HOME_BROWSE_NAV, HOME_SECTION_SUBTITLES } from "@/lib/homeBrowseNav";
import { FEATURED_HERO } from "@/lib/home/featuredHero";
import { groupCatalogBySection } from "@/lib/home/indexCatalog";
import { formatCatalogCategoryLabel } from "@/lib/catalogCategoryLabel";
import { continueItemToCatalogCard } from "@/lib/reading/continueReading";
import { NAVY_COVER_GRADIENT } from "@/lib/theme/navy";
import type { CatalogSeries } from "@/types/catalog";
import { catalogToCard } from "@/types/catalog";
import { useEffect, useMemo } from "react";
import { useUserStore } from "@/store/useUserStore";

const BROWSE_SECTION_IDS = [
  "founder-stories",
  "rise-and-fall",
  "empires",
  "heists-and-frauds",
  "company-breakdowns",
  "history-drop",
] as const;

function PosterSkeleton() {
  return (
    <div className="h-[380px] w-[78vw] max-w-[280px] shrink-0 animate-pulse rounded-xl bg-[#E7DDCC]/60 sm:w-[260px] md:h-[400px] md:w-[280px]" />
  );
}

function enrichCatalogCard(story: CatalogSeries, index?: number): CatalogSeries {
  return catalogToCard({
    ...story,
    sagaLabel: story.sagaLabel ?? formatCatalogCategoryLabel(story.genre),
    readMinutes: story.readMinutes ?? 8,
    sagaBadges:
      story.sagaBadges ??
      (index === 0
        ? (["new-drop"] as const)
        : index !== undefined && index < 4
          ? (["trending"] as const)
          : undefined),
    rank: index !== undefined ? index + 1 : story.rank,
  });
}

/** Netflix-style cinematic browse index — published catalog only. */
export default function BrowseHome() {
  const { email } = useUserStore();
  const loggedIn = Boolean(email);

  useEffect(() => {
    document.documentElement.classList.add("theme-cinematic");
    return () => document.documentElement.classList.remove("theme-cinematic");
  }, []);

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

  const catalogWithArt = useMemo(
    () => withRealCoverArt(prioritizeCoverArt(indexCatalog)),
    [indexCatalog]
  );

  const sectionStories = useMemo(() => {
    const indexBySection = groupCatalogBySection(catalogWithArt);
    return Object.fromEntries(
      BROWSE_SECTION_IDS.map((id) => [
        id,
        (indexBySection.get(id) ?? []).map((story) => enrichCatalogCard(story)),
      ])
    ) as Record<(typeof BROWSE_SECTION_IDS)[number], CatalogSeries[]>;
  }, [catalogWithArt]);

  const featuredStory = useMemo(() => {
    const fromCatalog = catalogWithArt.find((story) =>
      FEATURED_HERO.storyMatch.test(
        `${story.title} ${story.synopsis ?? ""} ${story.id}`
      )
    );

    return enrichCatalogCard(
      catalogToCard({
        id: fromCatalog?.id ?? FEATURED_HERO.storyId,
        title: FEATURED_HERO.title,
        genre: fromCatalog?.genre ?? "empires",
        coverGradient: fromCatalog?.coverGradient ?? NAVY_COVER_GRADIENT,
        source: fromCatalog?.source ?? "admin",
        status: fromCatalog?.status ?? "published",
        creatorDisplayName: fromCatalog?.creatorDisplayName ?? "Toonlora Original",
        synopsis: FEATURED_HERO.description,
        episodeCount: fromCatalog?.episodeCount ?? FEATURED_HERO.chapters,
        viewsCount: fromCatalog?.viewsCount ?? 0,
        likesCount: fromCatalog?.likesCount ?? 0,
        featuredRank: 1,
        publishedAt: fromCatalog?.publishedAt ?? null,
        createdAt: fromCatalog?.createdAt ?? new Date().toISOString(),
        coverArtUrl: FEATURED_HERO.keyArtUrl,
        sagaSubtitle: FEATURED_HERO.subtitle,
        sagaLabel: FEATURED_HERO.sagaLabel,
        readMinutes: FEATURED_HERO.readMinutes,
        sagaBadges: FEATURED_HERO.weeklyDrop ? (["new-drop"] as const) : undefined,
      })
    );
  }, [catalogWithArt]);

  const topTen = useMemo(
    () =>
      catalogWithArt
        .filter((story) => Boolean(story.coverArtUrl))
        .slice(0, 10)
        .map((story, index) => enrichCatalogCard(story, index)),
    [catalogWithArt]
  );

  const browseSections = HOME_BROWSE_NAV.filter(
    (item) =>
      item.id !== "this-week" &&
      item.id !== "home" &&
      item.id !== "founder-stories"
  );

  const founderStories = sectionStories["founder-stories"] ?? [];

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

        {topTen.length > 0 ? (
          <StreamRail
            id="top-10"
            title="Top 10 This Week"
            viewAllHref="/#top-10"
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
        ) : null}

        {founderStories.length > 0 || loadingIndex ? (
          <StreamRail
            id="founder-stories"
            title="Founder Stories"
            subtitle={HOME_SECTION_SUBTITLES["founder-stories"]}
            viewAllHref="/#founder-stories"
          >
            {loadingIndex && founderStories.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <PosterSkeleton key={i} />
                ))
              : founderStories.map((story) => (
                  <FounderStoryCard
                    key={story.id}
                    story={story}
                    listSection="founder_stories"
                  />
                ))}
          </StreamRail>
        ) : null}

        {browseSections.map(({ id, label }) => {
          const stories = sectionStories[id as keyof typeof sectionStories] ?? [];
          if (stories.length === 0) return null;

          return (
            <StreamRail
              key={id}
              id={id}
              title={label}
              subtitle={HOME_SECTION_SUBTITLES[id]}
              viewAllHref={`/#${id}`}
            >
              {stories.map((story) => (
                <StreamPosterCard
                  key={story.id}
                  story={story}
                  listSection={id.replace(/-/g, "_")}
                />
              ))}
            </StreamRail>
          );
        })}

        {!loadingIndex &&
        catalogWithArt.length === 0 &&
        continueStories.length === 0 ? (
          <div className="px-4 py-16 text-center sm:px-6">
            <p className="text-sm text-[#667085]">
              No published stories yet — check back soon.
            </p>
          </div>
        ) : null}

        <SiteFooter />
      </div>
    </div>
  );
}
