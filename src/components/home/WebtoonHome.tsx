"use client";

import { useState } from "react";
import Link from "next/link";
import HomeHero from "@/components/home/HomeHero";
import HorizontalCarousel from "@/components/home/HorizontalCarousel";
import CategoryCarouselSection from "@/components/home/CategoryCarouselSection";
import CreatorCTACard from "@/components/home/CreatorCTACard";
import { useCatalog } from "@/hooks/useCatalog";
import { BRAND_TAGLINE, CREDIT_COPY } from "@/lib/brand";

const RANK_CHANGES = [35, 2, -1, 5, 12];

export default function WebtoonHome() {
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
    limit: 6,
  });
  const { series: community, loading: loadingCommunity } = useCatalog({
    source: "creator",
    sort: "newest",
    limit: 12,
  });

  const rankedStories =
    (trendTab === "trending" ? featured : popular).map((s, i) => ({
      ...s,
      rank: i + 1,
    }));

  const isEmpty =
    !loadingFeatured &&
    !loadingPopular &&
    featured.length === 0 &&
    popular.length === 0;

  return (
    <div className="bg-gs-bg pb-20 sm:pb-0">
      <HomeHero />

      {isEmpty ? (
        <section className="border-b border-gs-border bg-gs-surface py-12 text-center">
          <div className="mx-auto max-w-lg px-4">
            <h2 className="font-heading text-xl font-bold text-gs-text">
              No published series yet
            </h2>
            <p className="mt-2 text-sm text-gs-muted">
              Comics will appear here once they are published by Toonlora or
              creators. Admins can publish from the admin content panel.
            </p>
            <Link
              href="/create"
              className="btn-coral mt-6 inline-flex rounded-full px-6 py-3 text-sm"
            >
              Create a story
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section
            id="rankings"
            className="border-b border-gs-border bg-gs-surface py-5 sm:py-9"
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
                  {loadingFeatured ? "Loading series…" : "No ranked series yet."}
                </p>
              )}
            </div>
          </section>

          <CreatorCTACard />
          <CategoryCarouselSection />

          {!loadingNewest && newest.length > 0 && (
            <HorizontalCarousel
              id="originals"
              title="Newly Released Originals"
              stories={newest.map((s) => ({ ...s, isNew: true }))}
              variant="vertical"
              viewAllHref="/"
              mintBg
            />
          )}

          {!loadingCommunity && community.length > 0 && (
            <HorizontalCarousel
              id="community"
              title="More stories from indie creators"
              stories={community}
              variant="square"
              viewAllHref="/lp/1"
            />
          )}
        </>
      )}

      <section className="border-y border-gs-border bg-gs-surface py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm leading-relaxed text-gs-text">
            <span className="font-bold">Notice</span>{" "}
            <Link href="/create" className="text-gs-primary hover:underline">
              {CREDIT_COPY}
            </Link>
          </p>
        </div>
      </section>

      <footer className="hidden border-t border-gs-border bg-gs-surface pb-10 pt-10 sm:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-gs-muted">
            {BRAND_TAGLINE}
          </p>
        </div>
      </footer>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gs-border bg-white/95 px-4 py-3 backdrop-blur-md safe-bottom sm:hidden">
        <Link
          href="/create"
          className="btn-coral flex min-h-[48px] w-full items-center justify-center text-sm active:scale-[0.98]"
        >
          Create a story
        </Link>
      </div>
    </div>
  );
}
