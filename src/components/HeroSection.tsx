import Link from "next/link";
import CoverArt from "@/components/ui/CoverArt";
import { TRENDING_STORIES } from "@/lib/sampleStories";
import {
  BRAND_HEADLINE,
  BRAND_SUBHEADLINE,
  BRAND_TAGLINE,
} from "@/lib/brand";

const TRUST_PILLS = [
  { icon: "📖", label: "Read for free" },
  { icon: "🎉", label: "First story free" },
  { icon: "↗", label: "Share instantly" },
  { icon: "✨", label: "Continue your series" },
];

export default function HeroSection() {
  const heroCovers = TRENDING_STORIES.slice(0, 3);

  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-gradient-to-b from-surface-soft/80 via-white to-white">
      <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-primary-soft/30 blur-3xl" />
      <div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-accent-pink/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-primary-dark shadow-sm ring-1 ring-border">
              ✦ {BRAND_TAGLINE}
            </span>
            <h1 className="font-heading text-4xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-5xl lg:text-[3.25rem]">
              {BRAND_HEADLINE}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
              {BRAND_SUBHEADLINE}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/#rankings"
                className="inline-flex items-center justify-center rounded-full bg-primary-dark px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/25 transition hover:opacity-90"
              >
                Start reading
              </Link>
              <Link
                href="/create"
                className="inline-flex items-center justify-center rounded-full border-2 border-primary bg-white px-8 py-4 text-base font-bold text-primary-dark transition hover:bg-surface-soft"
              >
                Create a story
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {TRUST_PILLS.map((pill) => (
                <span
                  key={pill.label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm ring-1 ring-border"
                >
                  <span>{pill.icon}</span>
                  {pill.label}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-md justify-center gap-3 sm:max-w-none">
            {heroCovers.map((story, i) => (
              <CoverArt
                key={story.id}
                gradient={story.coverGradient}
                genre={story.genre}
                title={story.title}
                className={`h-48 w-28 rounded-2xl shadow-xl sm:h-56 sm:w-32 ${
                  i === 1 ? "-mt-4 rotate-2" : i === 2 ? "mt-6 -rotate-3" : "-rotate-2"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
