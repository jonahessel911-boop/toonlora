"use client";

import { useEffect } from "react";
import BrowseByGenre from "@/components/home/BrowseByGenre";
import ContinueReadingSection from "@/components/home/ContinueReadingSection";
import HomeSection from "@/components/home/HomeSection";
import StoryRail from "@/components/home/StoryRail";
import { prioritizeCoverArt } from "@/components/home/StoryCard";
import { useCatalog } from "@/hooks/useCatalog";
import { useUserStore } from "@/store/useUserStore";

const RANK_CHANGES = [35, 2, -1, 5, 12, 8, 4, 3];

/** Premium read-first browse homepage. */
export default function BrowseHome() {
  const { email } = useUserStore();
  const loggedIn = Boolean(email);

  const { series: featured, loading: loadingFeatured } = useCatalog({
    sort: "featured",
    limit: 8,
  });
  const { series: trending, loading: loadingTrending } = useCatalog({
    sort: "popular",
    limit: 12,
  });
  const { series: community, loading: loadingCommunity } = useCatalog({
    source: "creator",
    sort: "newest",
    limit: 12,
  });

  const featuredStories = prioritizeCoverArt(featured).slice(0, 6);
  const trendingRanked = trending.map((s, i) => ({ ...s, rank: i + 1 }));

  const hasCatalog =
    loadingFeatured ||
    loadingTrending ||
    featured.length > 0 ||
    trending.length > 0;

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

  if (!hasCatalog) {
    return (
      <div className="min-h-[50vh] bg-[#FCFAFF]">
        <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E7D8FF] border-t-[#5340FF]" />
          <p className="mt-4 text-sm text-[#667085]">Loading stories…</p>
        </div>
      </div>
    );
  }

  const catalogEmpty =
    !loadingFeatured &&
    !loadingTrending &&
    featuredStories.length === 0 &&
    trendingRanked.length === 0;

  if (catalogEmpty) {
    return (
      <div className="min-h-[50vh] bg-[#FCFAFF] px-4 py-20 text-center">
        <h1 className="font-heading text-2xl font-extrabold text-[#101828]">
          Stories are on the way
        </h1>
        <p className="mt-2 text-sm text-[#667085]">
          New cartoon episodes publish here soon.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FCFAFF] pb-16 pt-6 md:pt-8">
      {loggedIn ? <ContinueReadingSection /> : null}

      {featuredStories.length > 0 || loadingFeatured ? (
        <HomeSection
          id="originals"
          title="Featured Toonlora Originals"
          subtitle="Handpicked stories to start reading."
          viewAllHref="/library"
        >
          <StoryRail
            stories={featuredStories}
            size="featured"
            loading={loadingFeatured}
            skeletonCount={6}
          />
        </HomeSection>
      ) : null}

      {trendingRanked.length > 0 || loadingTrending ? (
        <HomeSection
          id="trending"
          title="Trending Now"
          subtitle="What readers are opening this week."
          viewAllHref="/library"
          tone="soft"
        >
          <StoryRail
            stories={trendingRanked}
            size="ranked"
            showRank
            rankChanges={RANK_CHANGES}
            loading={loadingTrending}
          />
        </HomeSection>
      ) : null}

      <BrowseByGenre />

      {!loadingCommunity && community.length > 0 ? (
        <HomeSection
          id="community"
          title="Created by the Community"
          subtitle="Cartoon stories from indie creators on Toonlora."
          viewAllHref="/library"
        >
          <StoryRail stories={community} size="standard" />
        </HomeSection>
      ) : null}
    </div>
  );
}
