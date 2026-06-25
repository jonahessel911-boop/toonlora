"use client";

import { useState } from "react";
import AffiliateLink from "@/components/affiliate/AffiliateLink";
import CinematicStoryCover from "@/components/home/stream/CinematicStoryCover";
import { FEATURED_HERO } from "@/lib/home/featuredHero";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import type { CatalogSeries } from "@/types/catalog";

interface FeaturedHeroProps {
  featuredStory?: CatalogSeries;
}

export default function FeaturedHero({ featuredStory }: FeaturedHeroProps) {
  const [onList, setOnList] = useState(false);
  const storyHref = `/story/${FEATURED_HERO.storyId}`;
  const keyArt =
    FEATURED_HERO.keyArtUrl ?? featuredStory?.coverArtUrl ?? undefined;

  return (
    <section
      id="this-week"
      className="relative min-h-[680px] w-full scroll-mt-0 bg-[#1a2332] md:min-h-[620px]"
    >
      <div className="absolute inset-0 overflow-hidden">
        {keyArt ? (
          <img
            src={keyArt}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[center_top] brightness-[1.06] contrast-[1.04] saturate-[1.08] md:object-[right_center]"
          />
        ) : (
          <CinematicStoryCover
            title={FEATURED_HERO.title}
            sagaLabel={FEATURED_HERO.sagaLabel}
            className="h-full w-full"
          />
        )}

        {/* Soft left scrim — readable but image stays visible */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(7, 17, 31, 0.9) 0%, rgba(7, 17, 31, 0.72) 28%, rgba(7, 17, 31, 0.38) 52%, rgba(7, 17, 31, 0.12) 72%, transparent 88%)",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 65% 50% at 80% 40%, transparent 0%, rgba(0,0,0,0.18) 100%)",
          }}
        />

        <div
          className="absolute inset-x-0 top-0 h-20"
          style={{
            background:
              "linear-gradient(to bottom, rgba(7, 17, 31, 0.5) 0%, transparent 100%)",
          }}
        />

        {/* Short bottom fade — only the last ~140px into cream body */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[140px]"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, transparent 42%, rgba(246, 241, 231, 0.45) 78%, #F6F1E7 100%)",
          }}
        />
      </div>

      <div
        className={`${PAGE_CONTAINER_CLASS} relative flex min-h-[680px] flex-col justify-center pb-24 pt-28 md:min-h-[620px] md:pb-28 md:pt-28`}
      >
        <div className="relative max-w-[540px]">
          {/* Localized scrim behind copy — keeps text out of the bottom fade */}
          <div
            className="pointer-events-none absolute -left-6 -right-4 -top-4 bottom-0 rounded-2xl md:-left-10 md:-right-8"
            style={{
              background:
                "radial-gradient(ellipse 90% 85% at 12% 55%, rgba(7, 17, 31, 0.55) 0%, transparent 72%)",
            }}
            aria-hidden
          />

          <div className="relative">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#E8C06A]">
            {FEATURED_HERO.eyebrow}
          </p>

          <h1
            className="font-heading mt-1.5 text-[2.25rem] font-black uppercase leading-[0.95] tracking-[0.02em] text-white sm:text-5xl md:text-[3.5rem] lg:text-[4.25rem]"
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.45)" }}
          >
            {FEATURED_HERO.title}
          </h1>

          <p
            className="mt-2 max-w-[520px] text-lg font-medium leading-[1.3] text-[#E8EDF4] md:text-xl"
            style={{ textShadow: "0 1px 12px rgba(0,0,0,0.4)" }}
          >
            {FEATURED_HERO.subtitle}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-[#D1DAE6]">
            <span className="text-[11px] font-bold uppercase tracking-wide text-white">
              {FEATURED_HERO.sagaLabel}
            </span>
            <span className="text-white/30" aria-hidden>
              ·
            </span>
            <span>{FEATURED_HERO.chapters} Chapters</span>
            <span className="text-white/30" aria-hidden>
              ·
            </span>
            <span>{FEATURED_HERO.readMinutes} min episodes</span>
            {FEATURED_HERO.weeklyDrop ? (
              <>
                <span className="text-white/30" aria-hidden>
                  ·
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#F0D48A]">
                  New this week
                </span>
              </>
            ) : null}
          </div>

          <p className="mt-3 max-w-[520px] text-sm leading-[1.55] text-[#C5D0DC] md:text-[15px]">
            {FEATURED_HERO.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <AffiliateLink
              href={`${storyHref}/read`}
              className="inline-flex h-11 items-center gap-2.5 rounded-[10px] bg-white px-6 text-sm font-extrabold text-[#111827] shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition hover:bg-[#F8FAFC]"
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
              className="inline-flex h-11 items-center rounded-[10px] border border-white/40 bg-white/15 px-6 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/25"
            >
              More Info
            </AffiliateLink>

            <button
              type="button"
              onClick={() => setOnList((v) => !v)}
              className="inline-flex h-11 items-center gap-1.5 px-2 text-sm font-semibold text-[#E8EDF4] transition hover:text-white"
            >
              <span
                className={`text-base leading-none ${onList ? "text-[#F0D48A]" : ""}`}
                aria-hidden
              >
                {onList ? "✓" : "+"}
              </span>
              My List
            </button>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
