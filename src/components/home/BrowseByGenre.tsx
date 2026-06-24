"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import HomeSection from "@/components/home/HomeSection";
import HorizontalScrollRail from "@/components/home/HorizontalScrollRail";
import StoryCard, { withRealCoverArt } from "@/components/home/StoryCard";
import { useCatalog } from "@/hooks/useCatalog";
import {
  PLATFORM_TOPICS,
  type PlatformTopicId,
} from "@/lib/platformTopics";
import type { CatalogSeries } from "@/types/catalog";

function isTopicId(value: string): value is PlatformTopicId {
  return PLATFORM_TOPICS.some((topic) => topic.id === value);
}

export default function BrowseByGenre({
  fallbackStories = [],
}: {
  fallbackStories?: CatalogSeries[];
}) {
  const searchParams = useSearchParams();
  const topicFromUrl = searchParams.get("topic") ?? "";
  const initialTopic = isTopicId(topicFromUrl) ? topicFromUrl : "business";

  const [activeId, setActiveId] = useState<PlatformTopicId>(initialTopic);
  const activeTopic =
    PLATFORM_TOPICS.find((topic) => topic.id === activeId) ?? PLATFORM_TOPICS[0];

  useEffect(() => {
    if (isTopicId(topicFromUrl)) {
      setActiveId(topicFromUrl);
    }
  }, [topicFromUrl]);

  const { series: topicStories, loading: loadingTopic } = useCatalog({
    genre: activeTopic.genre,
    sort: "featured",
    limit: 8,
  });
  const needsFallback = !loadingTopic && topicStories.length === 0;
  const { series: popularPicks, loading: loadingPopular } = useCatalog({
    sort: "popular",
    limit: 8,
    enabled: needsFallback && fallbackStories.length === 0,
  });

  const usingFallback = needsFallback;
  const displayStories = withRealCoverArt(
    usingFallback
      ? fallbackStories.length > 0
        ? fallbackStories
        : popularPicks
      : topicStories
  );
  const loading =
    loadingTopic ||
    (usingFallback && fallbackStories.length === 0 && loadingPopular);

  const gridSubtitle = useMemo(() => {
    if (loading) return undefined;
    if (usingFallback) return "Popular picks across Toonlora";
    return activeTopic.description;
  }, [activeTopic.description, loading, usingFallback]);

  return (
    <HomeSection
      id="categories"
      title="Browse by Topic"
      subtitle="In-depth business stories — pick your lane."
      viewAllHref="/"
    >
      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {PLATFORM_TOPICS.map((topic) => {
          const isActive = activeId === topic.id;
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => setActiveId(topic.id)}
              className={`min-h-[40px] flex-shrink-0 snap-start rounded-full border px-4 py-2 text-sm font-bold transition touch-manipulation ${
                isActive
                  ? "border-transparent bg-primary text-white shadow-sm"
                  : "border-border bg-surface text-muted hover:border-accent/30 hover:text-accent"
              }`}
            >
              {topic.label}
            </button>
          );
        })}
      </div>

      {gridSubtitle ? (
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
          {gridSubtitle}
        </p>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] rounded-xl bg-border/60" />
              <div className="mt-3 h-3.5 w-4/5 rounded bg-border/50" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="sm:hidden">
            <HorizontalScrollRail className="flex items-stretch gap-4 overflow-x-auto px-4 pb-1 scrollbar-hide snap-x snap-mandatory sm:gap-4 sm:px-0 md:gap-5 lg:gap-5 xl:gap-6">
              {displayStories.slice(0, 6).map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  size="standard"
                  listSection={`browse_by_topic:${activeTopic.id}`}
                />
              ))}
            </HorizontalScrollRail>
          </div>
          <div className="hidden grid-cols-3 gap-4 sm:grid md:grid-cols-4 lg:gap-5 xl:grid-cols-5 2xl:grid-cols-6">
            {displayStories.slice(0, 8).map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                size="standard"
                layout="grid"
                listSection={`browse_by_topic:${activeTopic.id}`}
              />
            ))}
          </div>
        </>
      )}
    </HomeSection>
  );
}
