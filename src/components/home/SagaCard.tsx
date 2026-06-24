"use client";

import Link from "next/link";
import StoryCoverImage from "@/components/ui/StoryCoverImage";
import { getCoverPreset } from "@/components/ui/CoverArt";
import { trackStoryClick } from "@/lib/analytics/gtag";
import type { CatalogSeries, SagaBadge } from "@/types/catalog";

const BADGE_LABELS: Record<SagaBadge, string> = {
  trending: "Trending",
  "new-drop": "New Drop",
  "founder-saga": "Founder Saga",
  "billion-dollar": "Billion-Dollar Story",
  company: "Company",
  playbook: "Playbook",
};

interface SagaCardProps {
  story: CatalogSeries;
  listSection?: string;
  chapterProgress?: number;
  className?: string;
}

export default function SagaCard({
  story,
  listSection,
  chapterProgress,
  className = "",
}: SagaCardProps) {
  const preset = getCoverPreset(String(story.genre));
  const href = story.href ?? `/story/${story.id}`;
  const chapters = story.episodes ?? story.episodeCount ?? 1;
  const progress = chapterProgress ?? story.chapterProgress;
  const seed = story.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const badges = story.sagaBadges ?? [];
  const readMinutes = story.readMinutes ?? 8;

  return (
    <article
      className={`group flex h-full w-[200px] min-w-[200px] max-w-[200px] snap-start flex-col sm:w-[220px] sm:min-w-[220px] sm:max-w-[220px] md:w-[240px] md:min-w-[240px] md:max-w-[240px] ${className}`}
    >
      <Link
        href={href}
        className="flex h-full flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_4px_24px_rgba(10,22,40,0.06)] ring-1 ring-border transition duration-300 active:scale-[0.98] sm:group-hover:-translate-y-1 sm:group-hover:shadow-[0_12px_36px_rgba(10,22,40,0.1)]"
        onClick={() =>
          trackStoryClick({
            seriesId: story.id,
            title: story.title,
            genre: String(story.genre),
            listSection,
          })
        }
      >
        <div className="relative overflow-hidden">
          <StoryCoverImage
            coverArtUrl={story.coverArtUrl}
            title={story.title}
            genre={String(story.genre)}
            gradient={story.coverGradient || preset.gradient}
            seed={seed}
            className="aspect-[2/3]"
          />

          {badges.length > 0 ? (
            <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1">
              {badges.slice(0, 2).map((badge) => (
                <span
                  key={badge}
                  className={`rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm ${
                    badge === "trending"
                      ? "bg-orange-500"
                      : badge === "new-drop"
                        ? "bg-accent"
                        : "bg-primary/80"
                  }`}
                >
                  {badge === "trending" ? "🔥 Trending" : BADGE_LABELS[badge]}
                </span>
              ))}
            </div>
          ) : null}

          <span className="absolute right-2.5 top-2.5 rounded-md bg-white/90 px-2 py-0.5 text-[9px] font-bold text-primary shadow-sm">
            {readMinutes} min
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <p className="font-heading text-base font-extrabold leading-snug text-primary">
            {story.title}
          </p>
          {story.sagaSubtitle ? (
            <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-accent">
              {story.sagaSubtitle}
            </p>
          ) : null}

          <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {story.sagaLabel ?? story.genre} · {chapters} chapters
          </p>

          {progress && progress > 0 ? (
            <div className="mt-3">
              <div className="mb-1 text-[10px] font-medium text-muted">
                Chapter {progress} / {chapters}
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-surface-soft">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{
                    width: `${Math.min(100, (progress / chapters) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ) : null}

          <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-muted">
            {story.synopsis}
          </p>

          <span className="mt-3 inline-flex w-fit items-center rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-white transition group-hover:bg-accent-hover">
            Read Now
          </span>
        </div>
      </Link>
    </article>
  );
}
