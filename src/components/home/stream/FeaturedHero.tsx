"use client";

import Image from "next/image";
import { useMemo } from "react";
import AffiliateLink from "@/components/affiliate/AffiliateLink";
import CinematicStoryCover from "@/components/home/stream/CinematicStoryCover";
import { useMyList } from "@/hooks/useMyList";
import { FEATURED_HERO } from "@/lib/home/featuredHero";
import { formatCatalogCategoryLabel } from "@/lib/catalogCategoryLabel";
import { formatSagaFollowTitle } from "@/lib/library/preferences";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import type { CatalogSeries } from "@/types/catalog";

interface FeaturedHeroProps {
  featuredStory: CatalogSeries;
}

export default function FeaturedHero({ featuredStory }: FeaturedHeroProps) {
  const storyHref = `/story/${featuredStory.id}`;
  const keyArt = FEATURED_HERO.keyArtUrl ?? featuredStory.coverArtUrl;
  const sagaLabel =
    featuredStory.sagaLabel ?? formatCatalogCategoryLabel(featuredStory.genre);
  const subtitle = FEATURED_HERO.subtitle;
  const chapters = featuredStory.episodeCount ?? featuredStory.episodes ?? 1;
  const readMinutes = featuredStory.readMinutes ?? 8;
  const headline = FEATURED_HERO.headline;

  const listEntry = useMemo(
    () => ({
      seriesId: featuredStory.id,
      title: formatSagaFollowTitle(FEATURED_HERO.title, subtitle),
      scheduleLabel: "Weekly episodes",
      href: storyHref,
    }),
    [featuredStory.id, subtitle, storyHref]
  );

  const { onList, toggle } = useMyList(listEntry);

  const heroHeight =
    "min-h-[min(85vh,680px)] md:min-h-[min(58vh,580px)]";

  return (
    <section
      id="this-week"
      className={`relative ${heroHeight} w-full scroll-mt-0 bg-[#0a121c]`}
    >
      <div className="absolute inset-0 overflow-hidden">
        {keyArt ? (
          <Image
            src={keyArt}
            alt=""
            fill
            priority
            sizes="100vw"
            quality={92}
            className="object-cover object-[68%_42%] brightness-[0.94] contrast-[1.04] saturate-[1.03] md:object-[58%_36%]"
          />
        ) : (
          <CinematicStoryCover
            title={FEATURED_HERO.title}
            sagaLabel={sagaLabel}
            className="h-full w-full"
          />
        )}

        {/* Left readability scrim — lighter so the ship stays visible */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(7, 17, 31, 0.92) 0%, rgba(7, 17, 31, 0.78) 22%, rgba(7, 17, 31, 0.42) 46%, rgba(7, 17, 31, 0.08) 68%, transparent 82%)",
          }}
        />

        <div
          className="absolute inset-x-0 top-0 h-24"
          style={{
            background:
              "linear-gradient(to bottom, rgba(7, 17, 31, 0.55) 0%, transparent 100%)",
          }}
        />

        {/* Long soft fade into cream body */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(38vh,280px)] md:h-[min(30vh,220px)]"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(10, 18, 28, 0.15) 28%, rgba(246, 241, 231, 0.35) 62%, #F6F1E7 100%)",
          }}
        />
      </div>

      <div
        className={`${PAGE_CONTAINER_CLASS} relative flex ${heroHeight} flex-col justify-end pb-24 pt-28 md:justify-center md:pb-20 md:pt-20`}
      >
        <div className="relative max-w-[34rem]">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#5B9FFF]">
            {FEATURED_HERO.eyebrow}
          </p>

          <h1
            className="font-heading mt-3 text-white"
            style={{ textShadow: "0 2px 28px rgba(0,0,0,0.5)" }}
          >
            <span className="block text-[2rem] font-black leading-[1.02] tracking-[-0.02em] sm:text-[2.65rem] md:text-[3.1rem]">
              {headline[0]}
            </span>
            <span className="mt-1 block text-[1.65rem] font-bold leading-[1.08] tracking-[-0.01em] text-white/88 sm:text-[2.1rem] md:text-[2.45rem]">
              {headline[1]}
            </span>
          </h1>

          <p
            className="mt-3 max-w-[28rem] text-base font-medium leading-snug text-[#D8E2EC] sm:text-lg"
            style={{ textShadow: "0 1px 14px rgba(0,0,0,0.45)" }}
          >
            {subtitle}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[#B8C5D3]">
            <span className="font-bold uppercase tracking-wide text-white/95">
              {sagaLabel}
            </span>
            <span className="text-white/25" aria-hidden>
              ·
            </span>
            <span>{chapters} chapters</span>
            <span className="text-white/25" aria-hidden>
              ·
            </span>
            <span>{readMinutes} min read</span>
            {FEATURED_HERO.weeklyDrop ? (
              <>
                <span className="text-white/25" aria-hidden>
                  ·
                </span>
                <span className="font-bold uppercase tracking-wide text-[#5B9FFF]">
                  New
                </span>
              </>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <AffiliateLink
              href={`${storyHref}/read`}
              className="inline-flex h-11 items-center gap-2.5 rounded-[10px] bg-white px-6 text-sm font-extrabold text-[#111827] shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition hover:bg-[#F8FAFC]"
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full bg-[#111827] text-[10px] text-white"
                aria-hidden
              >
                ▶
              </span>
              Read Now
            </AffiliateLink>

            <AffiliateLink
              href={storyHref}
              className="inline-flex h-11 items-center rounded-[10px] border border-white/35 bg-black/20 px-6 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-black/30"
            >
              More Info
            </AffiliateLink>

            <button
              type="button"
              onClick={toggle}
              aria-pressed={onList}
              className="inline-flex h-11 items-center gap-1.5 px-2 text-sm font-semibold text-[#E8EDF4] transition hover:text-white"
            >
              <span
                className={`text-base leading-none ${onList ? "text-[#5B9FFF]" : ""}`}
                aria-hidden
              >
                {onList ? "✓" : "+"}
              </span>
              My List
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
