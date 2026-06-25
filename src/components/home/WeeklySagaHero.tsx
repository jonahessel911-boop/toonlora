"use client";

import Link from "next/link";
import { useMemo } from "react";
import StoryCoverImage from "@/components/ui/StoryCoverImage";
import { useMyList } from "@/hooks/useMyList";
import { NAVY_COVER_GRADIENT } from "@/lib/theme/navy";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import { formatSagaFollowTitle } from "@/lib/library/preferences";
import { mockStoryToCatalogSeries } from "@/lib/mock/mockCatalogCards";
import {
  WEEKLY_HERO,
  type MockCatalogStory,
} from "@/lib/mock/businessStoryCatalog";

interface WeeklySagaHeroProps {
  /** Override with a published catalog story when available */
  featured?: MockCatalogStory;
}

export default function WeeklySagaHero({ featured = WEEKLY_HERO }: WeeklySagaHeroProps) {
  const saga = mockStoryToCatalogSeries(featured);
  const href = `/story/${featured.id}/read?ep=1`;
  const seed = featured.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  const listEntry = useMemo(
    () => ({
      seriesId: featured.id,
      title: formatSagaFollowTitle(featured.title, featured.subtitle),
      scheduleLabel: "New every Monday",
      href: `/story/${featured.id}`,
    }),
    [featured.id, featured.subtitle, featured.title]
  );

  const { onList: following, toggle } = useMyList(listEntry);

  return (
    <section
      id="this-week"
      className="relative scroll-mt-[7.5rem] overflow-hidden bg-[#060f1c] pb-12 pt-8 md:pb-16 md:pt-10"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(59,158,255,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_10%_80%,rgba(59,158,255,0.08),transparent_50%)]" />

      <div className={`${PAGE_CONTAINER_CLASS} relative`}>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-accent">
          This Week&apos;s Founder Story
        </p>

        <div className="grid items-center gap-8 lg:grid-cols-[1fr_340px] lg:gap-12 xl:grid-cols-[1fr_380px]">
          <div className="min-w-0">
            <h1 className="font-heading text-3xl font-extrabold leading-[1.1] tracking-tight text-white md:text-4xl lg:text-[2.75rem]">
              {featured.title}
              <span className="mt-1 block text-accent md:mt-2">
                {featured.subtitle}
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65 md:text-lg">
              {featured.hook}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={href}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-accent px-7 text-sm font-bold text-white shadow-[0_0_24px_rgba(59,158,255,0.35)] transition hover:bg-accent-hover"
              >
                Start Chapter 1
              </Link>
              <button
                type="button"
                onClick={toggle}
                aria-pressed={following}
                className={`inline-flex min-h-[48px] items-center justify-center rounded-full border px-7 text-sm font-bold transition ${
                  following
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-white/25 text-white hover:border-white/50"
                }`}
              >
                {following ? "Following ✓" : "Follow Series"}
              </button>
            </div>

            <p className="mt-5 text-sm font-medium text-white/45">
              {featured.sagaLabel} · {featured.chapters} chapters · New every
              Monday · {featured.readMinutes} min reads
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[340px] lg:mx-0 lg:max-w-none">
            <div className="overflow-hidden rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
              <StoryCoverImage
                coverArtUrl={saga.coverArtUrl}
                title={featured.title}
                genre={featured.sagaLabel}
                gradient={NAVY_COVER_GRADIENT}
                seed={seed}
                className="aspect-[3/4]"
              />
            </div>
            <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-accent/10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
