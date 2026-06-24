"use client";

import { useEffect, useState } from "react";
import HorizontalCarousel from "@/components/home/HorizontalCarousel";
import CategoryCarouselSection from "@/components/home/CategoryCarouselSection";
import { useCatalog } from "@/hooks/useCatalog";

const RANK_CHANGES = [35, 2, -1, 5, 12];

/** Read-first homepage — catalog sections linked from nav (#originals, #categories, etc.). */
export default function WebtoonCatalog() {
  const [trendTab, setTrendTab] = useState<"trending" | "popular">("trending");

  const { series: featured, loading: loadingFeatured } = useCatalog({
    sort: "featured",
    limit: 12,
  });
  const { series: popular, loading: loadingPopular } = useCatalog({
    sort: "popular",
    limit: 12,
  });
  const { series: newest, loading: loadingNewest } = useCatalog({
    sort: "newest",
    limit: 12,
  });
  const { series: community, loading: loadingCommunity } = useCatalog({
    source: "creator",
    sort: "newest",
    limit: 12,
  });

  const rankedStories = (trendTab === "trending" ? featured : popular).map(
    (s, i) => ({
      ...s,
      rank: i + 1,
    })
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

  const isEmpty =
    !loadingFeatured &&
    !loadingPopular &&
    !loadingNewest &&
    !loadingCommunity &&
    featured.length === 0 &&
    popular.length === 0 &&
    newest.length === 0 &&
    community.length === 0;

  if (isEmpty) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] bg-gs-bg pb-8">
        <section className="flex min-h-[50vh] items-center justify-center px-4 py-16 text-center">
          <div className="max-w-md">
            <h1 className="font-heading text-2xl font-bold text-gs-text">
              No published series yet
            </h1>
            <p className="mt-2 text-sm text-gs-muted">
              New comics will appear here once they are published.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-gs-bg pb-12">
      <section id="originals" className="scroll-mt-[7.5rem]">
        {!loadingNewest && newest.length > 0 ? (
          <HorizontalCarousel
            title="Newly Released Originals"
            stories={newest.map((s) => ({ ...s, isNew: true }))}
            variant="vertical"
            viewAllHref="/"
            mintBg
          />
        ) : (
          <div className="border-b border-gs-border bg-gs-surface-mint/60 py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="font-heading text-lg font-bold text-gs-text sm:text-2xl">
                Newly Released Originals
              </h2>
              <p className="mt-2 text-sm text-gs-muted">
                {loadingNewest
                  ? "Loading new releases…"
                  : "No new originals yet. Check back soon."}
              </p>
            </div>
          </div>
        )}
      </section>

      <CategoryCarouselSection />

      <section
        id="rankings"
        className="scroll-mt-[7.5rem] border-b border-gs-border bg-gs-surface py-5 sm:py-8"
      >
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-4 space-y-3 px-4 sm:mb-5 sm:flex sm:items-center sm:justify-between sm:space-y-0 sm:px-0">
            <div>
              <h2 className="font-heading text-lg font-bold leading-tight text-gs-text sm:text-2xl">
                Trending &amp; Popular Series
              </h2>
              <p className="mt-1 text-sm text-gs-muted">
                Published comics from Toonlora and creators
              </p>
            </div>
            <div className="inline-flex w-full rounded-full border border-gs-border bg-gs-bg p-1 sm:w-auto">
              <button
                type="button"
                onClick={() => setTrendTab("trending")}
                className={`min-h-[40px] flex-1 rounded-full px-4 py-2 text-sm font-bold transition touch-manipulation sm:flex-none sm:px-5 ${
                  trendTab === "trending"
                    ? "bg-lp-purple text-white shadow-sm"
                    : "text-gs-muted"
                }`}
              >
                Trending
              </button>
              <button
                type="button"
                onClick={() => setTrendTab("popular")}
                className={`min-h-[40px] flex-1 rounded-full px-4 py-2 text-sm font-bold transition touch-manipulation sm:flex-none sm:px-5 ${
                  trendTab === "popular"
                    ? "bg-lp-purple text-white shadow-sm"
                    : "text-gs-muted"
                }`}
              >
                Popular
              </button>
            </div>
          </div>

          {!loadingFeatured && rankedStories.length > 0 ? (
            <HorizontalCarousel
              title=""
              stories={rankedStories}
              variant="ranked"
              showRank
              rankChanges={RANK_CHANGES}
              hideHeader
              noBorder
            />
          ) : (
            <p className="px-4 text-sm text-gs-muted sm:px-0">
              {loadingFeatured || loadingPopular
                ? "Loading series…"
                : "No ranked series yet."}
            </p>
          )}
        </div>
      </section>

      <section id="community" className="scroll-mt-[7.5rem]">
        {!loadingCommunity && community.length > 0 ? (
          <HorizontalCarousel
            title="Canvas — stories from indie creators"
            stories={community}
            variant="square"
            viewAllHref="/"
          />
        ) : (
          <div className="border-b border-gs-border py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="font-heading text-lg font-bold text-gs-text sm:text-2xl">
                Canvas — stories from indie creators
              </h2>
              <p className="mt-2 text-sm text-gs-muted">
                {loadingCommunity
                  ? "Loading creator stories…"
                  : "No indie creator stories yet."}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
