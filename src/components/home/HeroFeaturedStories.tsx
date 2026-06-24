"use client";

import AffiliateLink from "@/components/affiliate/AffiliateLink";
import { formatChapterShort, formatChapterTitle } from "@/lib/brand";
import { withRealCoverArt } from "@/components/home/StoryCard";
import CoverArt, { getCoverPreset } from "@/components/ui/CoverArt";
import { formatCatalogViews, type CatalogSeries } from "@/types/catalog";

function StoryCover({
  story,
  className = "",
}: {
  story: CatalogSeries;
  className?: string;
}) {
  if (story.coverArtUrl) {
    return (
      <img
        src={story.coverArtUrl}
        alt={story.title}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  const preset = getCoverPreset(story.genre);
  return (
    <CoverArt
      gradient={story.coverGradient || preset.gradient}
      genre={story.genre}
      showOverlay
      seed={story.id.charCodeAt(0)}
      className={`h-full w-full ${className}`}
    />
  );
}

interface HeroFeaturedStoriesProps {
  stories?: CatalogSeries[];
}

export default function HeroFeaturedStories({ stories = [] }: HeroFeaturedStoriesProps) {
  const list = withRealCoverArt(stories);
  const featured = list[0];
  if (!featured) return null;

  const sideStories = list.slice(1, 4);
  const featuredHref = `/story/${featured.id}`;
  const readHref = `/story/${featured.id}/read`;
  const views = featured.readers ?? formatCatalogViews(featured.viewsCount);
  const likes = featured.likes ?? formatCatalogViews(featured.likesCount);
  const chapters = featured.episodeCount ?? 1;
  const chapterThumbs = [
    { n: 1, label: formatChapterTitle(1), free: true },
    { n: 2, label: formatChapterTitle(2), free: false },
    { n: 3, label: formatChapterTitle(3), free: false },
  ].slice(0, Math.min(3, chapters));

  return (
    <div className="relative mx-auto w-full max-w-[min(100%,420px)] sm:max-w-[460px] lg:max-w-none">
      <div
        className="pointer-events-none absolute left-1/2 top-[42%] -z-10 h-[70%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-[40px] bg-[#8B7CFF]/35 blur-3xl"
        aria-hidden
      />

      <div className="relative px-2 sm:px-3">
        {sideStories[0] ? (
          <AffiliateLink
            href={`/story/${sideStories[0].id}`}
            className="absolute left-0 top-6 z-[1] w-[24%] min-w-[72px] max-w-[108px] overflow-hidden rounded-2xl shadow-[0_12px_32px_rgba(42,17,75,0.28)] ring-2 ring-white/30 transition hover:-translate-y-0.5 sm:top-8 sm:max-w-[120px]"
            style={{ transform: "rotate(-7deg)" }}
          >
            <div className="aspect-[3/4]">
              <StoryCover story={sideStories[0]} />
            </div>
            <span className="absolute left-1.5 top-1.5 rounded-md bg-black/45 px-1.5 py-0.5 text-[8px] font-bold text-white backdrop-blur-sm">
              {sideStories[0].genre}
            </span>
          </AffiliateLink>
        ) : null}

        {sideStories[1] ? (
          <AffiliateLink
            href={`/story/${sideStories[1].id}`}
            className="absolute right-0 top-10 z-[1] w-[22%] min-w-[68px] max-w-[100px] overflow-hidden rounded-2xl shadow-[0_12px_32px_rgba(42,17,75,0.28)] ring-2 ring-white/30 transition hover:-translate-y-0.5 sm:max-w-[112px]"
            style={{ transform: "rotate(6deg)" }}
          >
            <div className="aspect-[3/4]">
              <StoryCover story={sideStories[1]} />
            </div>
            <span className="absolute left-1.5 top-1.5 rounded-md bg-black/45 px-1.5 py-0.5 text-[8px] font-bold text-white backdrop-blur-sm">
              {sideStories[1].genre}
            </span>
          </AffiliateLink>
        ) : null}

        {sideStories[2] ? (
          <AffiliateLink
            href={`/story/${sideStories[2].id}`}
            className="absolute bottom-[88px] right-[4%] z-[1] hidden w-[20%] max-w-[92px] overflow-hidden rounded-xl shadow-[0_10px_28px_rgba(42,17,75,0.25)] ring-2 ring-white/25 sm:block"
            style={{ transform: "rotate(-4deg)" }}
          >
            <div className="aspect-[3/4]">
              <StoryCover story={sideStories[2]} />
            </div>
            <span className="absolute left-1 top-1 rounded-md bg-black/45 px-1 py-0.5 text-[7px] font-bold text-white">
              {sideStories[2].genre}
            </span>
          </AffiliateLink>
        ) : null}

        <AffiliateLink
          href={featuredHref}
          className="relative z-10 mx-auto block w-[min(88%,340px)] overflow-hidden rounded-[28px] shadow-[0_24px_56px_rgba(42,17,75,0.4)] ring-2 ring-white/25 transition hover:ring-white/40 sm:w-[82%] sm:max-w-[380px] sm:rounded-[32px]"
        >
          <div className="relative aspect-[3/4] w-full">
            <StoryCover story={featured} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a30]/95 via-[#2A114B]/25 to-transparent" />

            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 sm:left-4 sm:top-4">
              <span className="rounded-full bg-lp-purple px-2.5 py-1 text-[10px] font-bold text-white shadow-md sm:text-[11px]">
                Free chapter
              </span>
              <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-lp-purple-deep shadow-md sm:text-[11px]">
                {featured.featuredRank === 1 ? "Trending" : "New chapter"}
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
              <span className="inline-block rounded-lg bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                {featured.genre}
              </span>
              <h3 className="font-heading mt-2 line-clamp-2 text-lg font-extrabold leading-tight text-white drop-shadow-md sm:text-2xl">
                {featured.title}
              </h3>
              <p className="mt-1.5 text-[11px] font-medium text-white/80 sm:text-xs">
                {views} views · ♥ {likes} · {chapters} ch
              </p>
            </div>
          </div>
        </AffiliateLink>

        <div className="relative z-10 mx-auto mt-4 w-[min(94%,400px)] rounded-2xl bg-white/10 p-2.5 ring-1 ring-white/20 backdrop-blur-md sm:mt-5 sm:p-3">
          <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
            Continue reading
          </p>
          <div className="grid grid-cols-3 gap-2">
            {chapterThumbs.map((ep) => (
              <AffiliateLink
                key={ep.n}
                href={
                  ep.n === 1
                    ? readHref
                    : `/story/${featured.id}/read?ep=${ep.n}`
                }
                className="group overflow-hidden rounded-xl ring-1 ring-white/20 transition hover:ring-white/40"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <StoryCover story={featured} />
                  <div className="absolute inset-0 bg-[#2A114B]/30 transition group-hover:bg-[#2A114B]/15" />
                  <span className="absolute bottom-1 left-1.5 text-[9px] font-bold text-white drop-shadow">
                    {formatChapterShort(ep.n)}
                  </span>
                  {ep.free ? (
                    <span className="absolute right-1 top-1 rounded bg-lp-purple px-1 py-px text-[7px] font-bold text-white">
                      FREE
                    </span>
                  ) : null}
                </div>
                <p className="truncate px-1.5 py-1 text-[9px] font-semibold text-white/85">
                  {ep.label}
                </p>
              </AffiliateLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
