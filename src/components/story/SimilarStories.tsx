"use client";

import AffiliateLink from "@/components/affiliate/AffiliateLink";
import StoryCoverImage from "@/components/ui/StoryCoverImage";
import { findMockStory } from "@/lib/mock/businessStoryCatalog";
import { mockStoryToCatalogSeries } from "@/lib/mock/mockCatalogCards";
import { getSimilarStoryIds } from "@/lib/mock/mockSeriesDetail";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";

interface SimilarStoriesProps {
  seriesId: string;
  variant?: "light" | "dark";
}

export default function SimilarStories({
  seriesId,
  variant = "light",
}: SimilarStoriesProps) {
  const ids = getSimilarStoryIds(seriesId);
  const isDark = variant === "dark";

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
          {ids.map((id) => {
            const mock = findMockStory(id);
            if (!mock) return null;
            const card = mockStoryToCatalogSeries(mock);
            const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

            return (
              <AffiliateLink
                key={id}
                href={`/story/${id}`}
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
                    title={mock.title}
                    genre={mock.sagaLabel}
                    gradient={card.coverGradient}
                    seed={seed}
                    coverArtUrl={mock.coverArtUrl}
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
                  {mock.title}
                </p>
                {mock.subtitle ? (
                  <p
                    className={`line-clamp-2 text-sm sm:text-base ${
                      isDark ? "text-[#999]" : "text-muted"
                    }`}
                  >
                    {mock.subtitle}
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
