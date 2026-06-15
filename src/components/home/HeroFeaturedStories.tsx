"use client";

import Link from "next/link";
import CoverArt, { getCoverPreset } from "@/components/ui/CoverArt";
import { formatCatalogViews, type CatalogSeries } from "@/types/catalog";

const FALLBACK_STORIES: CatalogSeries[] = [
  {
    id: "hero-featured",
    title: "Moonlit Hearts",
    genre: "Romance",
    coverGradient: "from-[#FF4FA3] via-[#FF6BB5] to-[#FF8CC8]",
    source: "admin",
    status: "published",
    creatorDisplayName: "Toonlora Official",
    synopsis: "A shy artist falls for the boy who sees her work differently.",
    episodeCount: 12,
    viewsCount: 24800,
    likesCount: 3200,
    featuredRank: 1,
    publishedAt: null,
    createdAt: "",
    href: "/#rankings",
  },
  {
    id: "hero-fantasy",
    title: "Starfall Academy",
    genre: "Fantasy",
    coverGradient: "from-[#5340FF] via-[#6D5BFF] to-[#8B7CFF]",
    source: "creator",
    status: "published",
    creatorDisplayName: "Luna K.",
    synopsis: "",
    episodeCount: 8,
    viewsCount: 18200,
    likesCount: 2100,
    featuredRank: 2,
    publishedAt: null,
    createdAt: "",
    href: "/#rankings",
  },
  {
    id: "hero-adventure",
    title: "Skybound Quest",
    genre: "Adventure",
    coverGradient: "from-[#22D3EE] via-[#38BDF8] to-[#60A5FA]",
    source: "creator",
    status: "published",
    creatorDisplayName: "Kai M.",
    synopsis: "",
    episodeCount: 6,
    viewsCount: 12400,
    likesCount: 980,
    featuredRank: 3,
    publishedAt: null,
    createdAt: "",
    href: "/#rankings",
  },
  {
    id: "hero-anime",
    title: "Neon After School",
    genre: "Anime",
    coverGradient: "from-[#8B5CF6] via-[#A78BFA] to-[#C4B5FD]",
    source: "creator",
    status: "published",
    creatorDisplayName: "Yuki T.",
    synopsis: "",
    episodeCount: 10,
    viewsCount: 9600,
    likesCount: 740,
    featuredRank: 4,
    publishedAt: null,
    createdAt: "",
    href: "/#rankings",
  },
];

function StoryCover({
  story,
  className = "",
  showTitle = false,
}: {
  story: CatalogSeries;
  className?: string;
  showTitle?: boolean;
}) {
  const preset = getCoverPreset(story.genre);
  if (story.coverArtUrl) {
    return (
      <img
        src={story.coverArtUrl}
        alt={story.title}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }
  return (
    <CoverArt
      gradient={story.coverGradient || preset.gradient}
      genre={story.genre}
      title={showTitle ? story.title : undefined}
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
  const list = stories.length > 0 ? stories : FALLBACK_STORIES;
  const featured = list[0];
  const sideStories = [
    list[1] ?? FALLBACK_STORIES[1],
    list[2] ?? FALLBACK_STORIES[2],
    list[3] ?? FALLBACK_STORIES[3],
  ];

  const isLive = !featured.id.startsWith("hero-");
  const featuredHref = isLive ? `/story/${featured.id}` : "/#rankings";
  const readHref = isLive ? `/story/${featured.id}/read` : "/#rankings";
  const views = featured.readers ?? formatCatalogViews(featured.viewsCount);
  const likes = featured.likes ?? formatCatalogViews(featured.likesCount);
  const episodes = featured.episodeCount ?? 1;

  const episodeThumbs = [
    { n: 1, label: "Episode 1", free: true },
    { n: 2, label: "Episode 2", free: false },
    { n: 3, label: "Episode 3", free: false },
  ];

  return (
    <div className="relative w-full max-w-[500px] lg:max-w-none">
      {/* Soft platform glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[42%] -z-10 h-[70%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-[40px] bg-[#8B7CFF]/35 blur-3xl"
        aria-hidden
      />

      <div className="relative px-1 sm:px-2">
        {/* Side cards — contained, not clipped */}
        <Link
          href={sideStories[0].href ?? `/#rankings`}
          className="absolute left-0 top-6 z-[1] w-[26%] max-w-[108px] overflow-hidden rounded-2xl shadow-[0_12px_32px_rgba(42,17,75,0.28)] ring-2 ring-white/30 transition hover:-translate-y-0.5 sm:top-8 sm:max-w-[120px]"
          style={{ transform: "rotate(-7deg)" }}
        >
          <div className="aspect-[3/4]">
            <StoryCover story={sideStories[0]} />
          </div>
          <span className="absolute left-1.5 top-1.5 rounded-md bg-black/45 px-1.5 py-0.5 text-[8px] font-bold text-white backdrop-blur-sm">
            {sideStories[0].genre}
          </span>
        </Link>

        <Link
          href={sideStories[1].href ?? `/#rankings`}
          className="absolute right-0 top-10 z-[1] w-[24%] max-w-[100px] overflow-hidden rounded-2xl shadow-[0_12px_32px_rgba(42,17,75,0.28)] ring-2 ring-white/30 transition hover:-translate-y-0.5 sm:max-w-[112px]"
          style={{ transform: "rotate(6deg)" }}
        >
          <div className="aspect-[3/4]">
            <StoryCover story={sideStories[1]} />
          </div>
          <span className="absolute left-1.5 top-1.5 rounded-md bg-black/45 px-1.5 py-0.5 text-[8px] font-bold text-white backdrop-blur-sm">
            {sideStories[1].genre}
          </span>
        </Link>

        <Link
          href={sideStories[2].href ?? `/#rankings`}
          className="absolute bottom-[88px] right-[4%] z-[1] hidden w-[22%] max-w-[92px] overflow-hidden rounded-xl shadow-[0_10px_28px_rgba(42,17,75,0.25)] ring-2 ring-white/25 sm:block"
          style={{ transform: "rotate(-4deg)" }}
        >
          <div className="aspect-[3/4]">
            <StoryCover story={sideStories[2]} />
          </div>
          <span className="absolute left-1 top-1 rounded-md bg-black/45 px-1 py-0.5 text-[7px] font-bold text-white">
            {sideStories[2].genre}
          </span>
        </Link>

        {/* Featured story — hero card */}
        <Link
          href={featuredHref}
          className="relative z-10 mx-auto block w-[78%] max-w-[340px] overflow-hidden rounded-[32px] shadow-[0_24px_56px_rgba(42,17,75,0.4)] ring-2 ring-white/25 transition hover:ring-white/40 sm:w-[82%] sm:max-w-[380px]"
        >
          <div className="relative aspect-[3/4] w-full">
            <StoryCover story={featured} showTitle />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a30]/95 via-[#2A114B]/25 to-transparent" />

            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 sm:left-4 sm:top-4">
              <span className="rounded-full bg-lp-purple px-2.5 py-1 text-[10px] font-bold text-white shadow-md sm:text-[11px]">
                Free episode
              </span>
              <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-lp-purple-deep shadow-md sm:text-[11px]">
                {featured.featuredRank === 1 ? "Trending" : "New episode"}
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
              <span className="inline-block rounded-lg bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                {featured.genre}
              </span>
              <h3 className="font-heading mt-2 line-clamp-2 text-xl font-extrabold leading-tight text-white drop-shadow-md sm:text-2xl">
                {featured.title}
              </h3>
              <p className="mt-1.5 text-[11px] font-medium text-white/80 sm:text-xs">
                {views} views · ♥ {likes} · {episodes} ep
              </p>
            </div>
          </div>
        </Link>

        {/* Episode preview strip */}
        <div className="relative z-10 mx-auto mt-4 w-[88%] max-w-[400px] rounded-2xl bg-white/10 p-2.5 ring-1 ring-white/20 backdrop-blur-md sm:mt-5 sm:p-3">
          <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
            Continue reading
          </p>
          <div className="grid grid-cols-3 gap-2">
            {episodeThumbs.map((ep) => (
              <Link
                key={ep.n}
                href={
                  isLive
                    ? ep.n === 1
                      ? readHref
                      : `/story/${featured.id}/read?ep=${ep.n}`
                    : "/#rankings"
                }
                className="group overflow-hidden rounded-xl ring-1 ring-white/20 transition hover:ring-white/40"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <StoryCover story={featured} />
                  <div className="absolute inset-0 bg-[#2A114B]/30 transition group-hover:bg-[#2A114B]/15" />
                  <span className="absolute bottom-1 left-1.5 text-[9px] font-bold text-white drop-shadow">
                    Ep. {ep.n}
                  </span>
                  {ep.free && (
                    <span className="absolute right-1 top-1 rounded bg-lp-purple px-1 py-px text-[7px] font-bold text-white">
                      FREE
                    </span>
                  )}
                </div>
                <p className="truncate px-1.5 py-1 text-[9px] font-semibold text-white/85">
                  {ep.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
