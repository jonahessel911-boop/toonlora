"use client";

import Link from "next/link";
import StoryCoverImage from "@/components/ui/StoryCoverImage";
import { findMockStory } from "@/lib/mock/businessStoryCatalog";
import { mockStoryToCatalogSeries } from "@/lib/mock/mockCatalogCards";
import { getSimilarStoryIds } from "@/lib/mock/mockSeriesDetail";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";

interface SimilarStoriesProps {
  seriesId: string;
}

export default function SimilarStories({ seriesId }: SimilarStoriesProps) {
  const ids = getSimilarStoryIds(seriesId);

  return (
    <section className="mt-12 border-t border-border pt-10">
      <div className={`${PAGE_CONTAINER_CLASS} max-w-5xl`}>
        <h2 className="font-heading text-xl font-extrabold text-primary md:text-2xl">
          Similar stories
        </h2>
        <div className="mt-5 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {ids.map((id) => {
            const mock = findMockStory(id);
            if (!mock) return null;
            const card = mockStoryToCatalogSeries(mock);
            const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

            return (
              <Link
                key={id}
                href={`/story/${id}`}
                className="group w-[140px] min-w-[140px] flex-shrink-0 sm:w-[160px] sm:min-w-[160px]"
              >
                <div className="overflow-hidden rounded-xl bg-surface shadow-sm ring-1 ring-border transition group-hover:-translate-y-0.5 group-hover:shadow-md">
                  <StoryCoverImage
                    title={mock.title}
                    genre={mock.sagaLabel}
                    gradient={card.coverGradient}
                    seed={seed}
                    className="aspect-[2/3]"
                  />
                </div>
                <p className="mt-2 font-heading text-sm font-bold text-primary group-hover:text-accent">
                  {mock.title}
                </p>
                {mock.subtitle ? (
                  <p className="line-clamp-1 text-xs text-muted">{mock.subtitle}</p>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
