"use client";

import { useEffect, useState } from "react";
import AffiliateLink from "@/components/affiliate/AffiliateLink";
import StoryCoverImage from "@/components/ui/StoryCoverImage";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import type { CatalogSeries } from "@/types/catalog";

interface SimilarStoriesProps {
  seriesId: string;
  variant?: "light" | "dark";
}

export default function SimilarStories({
  seriesId,
  variant = "light",
}: SimilarStoriesProps) {
  const [stories, setStories] = useState<CatalogSeries[]>([]);
  const [loaded, setLoaded] = useState(false);
  const isDark = variant === "dark";

  useEffect(() => {
    let cancelled = false;

    async function loadSimilar() {
      try {
        const response = await fetch(`/api/stories/${seriesId}/similar`);
        if (!response.ok) {
          if (!cancelled) setStories([]);
          return;
        }

        const data = (await response.json()) as { series?: CatalogSeries[] };
        if (!cancelled) {
          setStories(
            (data.series ?? []).filter((story) => Boolean(story.coverArtUrl))
          );
        }
      } catch {
        if (!cancelled) setStories([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    setLoaded(false);
    setStories([]);
    void loadSimilar();

    return () => {
      cancelled = true;
    };
  }, [seriesId]);

  if (!loaded || stories.length === 0) {
    return null;
  }

  return (
    <section
      className={
        isDark
          ? "border-t border-[#333] py-10"
          : "border-t border-[#E6DFD1] py-10"
      }
    >
      <div className={`${PAGE_CONTAINER_CLASS} max-w-6xl`}>
        <h2
          className={`font-heading text-xl font-extrabold md:text-2xl ${
            isDark ? "text-white" : "text-[#111827]"
          }`}
        >
          More Like This
        </h2>
        <div className="mt-6 flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
          {stories.map((story) => {
            const seed = story.id
              .split("")
              .reduce((a, c) => a + c.charCodeAt(0), 0);
            const subtitle = story.synopsis?.trim() || story.sagaLabel;

            return (
              <AffiliateLink
                key={story.id}
                href={`/story/${story.id}`}
                className="group w-[min(44vw,200px)] min-w-[180px] flex-shrink-0 sm:w-[220px] sm:min-w-[220px] md:w-[240px] md:min-w-[240px]"
              >
                <div
                  className={`overflow-hidden rounded-lg transition group-hover:-translate-y-0.5 ${
                    isDark
                      ? "bg-[#2a2a2a] ring-1 ring-white/10 group-hover:ring-white/25"
                      : "bg-white shadow-sm ring-1 ring-[#E6DFD1] group-hover:shadow-md"
                  }`}
                >
                  <StoryCoverImage
                    title={story.title}
                    genre={story.sagaLabel ?? story.genre}
                    gradient={story.coverGradient}
                    seed={seed}
                    coverArtUrl={story.coverArtUrl}
                    className="aspect-[2/3]"
                  />
                </div>
                <p
                  className={`mt-2.5 font-heading text-base font-bold sm:text-lg ${
                    isDark
                      ? "text-white group-hover:text-[#D8A84E]"
                      : "text-[#111827] group-hover:text-[#2F80ED]"
                  }`}
                >
                  {story.title}
                </p>
                {subtitle ? (
                  <p
                    className={`line-clamp-2 text-sm sm:text-base ${
                      isDark ? "text-[#999]" : "text-muted"
                    }`}
                  >
                    {subtitle}
                  </p>
                ) : null}
              </AffiliateLink>
            );
          })}
        </div>
      </div>
    </section>
  );
}
