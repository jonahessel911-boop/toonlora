"use client";

import { useState } from "react";
import Link from "next/link";
import HomeHero from "@/components/home/HomeHero";
import HorizontalCarousel from "@/components/home/HorizontalCarousel";
import CategoryCarouselSection from "@/components/home/CategoryCarouselSection";
import CreatorCTACard from "@/components/home/CreatorCTACard";
import {
  TRENDING_STORIES,
  COMMUNITY_STORIES,
} from "@/lib/sampleStories";
import {
  BRAND_TAGLINE,
  CREDIT_COPY,
} from "@/lib/brand";

const RANK_CHANGES = [35, 2, -1, 5, 12];
const POPULAR_STORIES = [...TRENDING_STORIES].reverse();
const NEW_ORIGINALS = TRENDING_STORIES.slice(0, 6).map((s, i) => ({
  ...s,
  id: `new-${i}`,
  isNew: true,
}));

export default function WebtoonHome() {
  const [trendTab, setTrendTab] = useState<"trending" | "popular">("trending");
  const rankedStories =
    trendTab === "trending" ? TRENDING_STORIES : POPULAR_STORIES;

  return (
    <div className="bg-gs-bg pb-20 sm:pb-0">
      <HomeHero />

      {/* Trending */}
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
                Read free cartoon stories from the community
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

          <HorizontalCarousel
            title=""
            stories={rankedStories.map((s, i) => ({ ...s, rank: i + 1 }))}
            variant="ranked"
            showRank
            rankChanges={RANK_CHANGES}
            hideHeader
            noBorder
          />
        </div>
      </section>

      <CreatorCTACard />
      <CategoryCarouselSection />

      <HorizontalCarousel
        id="originals"
        title="Newly Released Originals"
        stories={NEW_ORIGINALS}
        variant="vertical"
        viewAllHref="/library"
        mintBg
      />

      <HorizontalCarousel
        id="community"
        title="More stories from indie creators"
        stories={COMMUNITY_STORIES}
        variant="square"
        viewAllHref="/lp/1"
      />

      <section className="border-y border-gs-border bg-gs-surface py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm leading-relaxed text-gs-text">
            <span className="font-bold">Notice</span>{" "}
            <Link href="/create" className="text-gs-primary hover:underline">
              {CREDIT_COPY}
            </Link>
          </p>
          <p className="mt-1 text-xs text-gs-muted sm:mt-0 sm:text-right">
            Jun 14, 2026
          </p>
        </div>
      </section>

      <footer className="hidden border-t border-gs-border bg-gs-surface pb-10 pt-10 sm:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-gs-muted">
            {BRAND_TAGLINE}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gs-muted sm:gap-6">
            {["About", "Feedback", "Help", "Terms", "Privacy", "Contact"].map(
              (link) => (
                <Link key={link} href="#" className="hover:text-gs-primary-dark">
                  {link}
                </Link>
              )
            )}
          </div>
          <div className="mx-auto mt-8 max-w-xs overflow-hidden rounded-xl shadow-sm">
            <div className="flex items-center justify-center bg-lp-purple py-4">
              <span className="font-heading text-base font-bold tracking-wide text-white">
                TOONLORA
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile sticky create CTA */}
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
