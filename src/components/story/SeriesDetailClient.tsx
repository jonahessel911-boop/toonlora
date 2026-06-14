"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CoverArt, { getCoverPreset } from "@/components/ui/CoverArt";
import {
  getCatalogSeries,
  storyToSeriesDetail,
  type SeriesDetail,
  type SeriesEpisodeListing,
} from "@/lib/seriesCatalog";
import { useStoryStore } from "@/store/useStoryStore";

interface SeriesDetailClientProps {
  id: string;
}

export default function SeriesDetailClient({ id }: SeriesDetailClientProps) {
  const { hydrate, getStoryById, fetchStoryById, hydrated } = useStoryStore();
  const [series, setSeries] = useState<SeriesDetail | null>(null);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;

    const load = async () => {
      const local = getStoryById(id);
      if (local) {
        setSeries(storyToSeriesDetail(local));
        return;
      }

      const fetched = await fetchStoryById(id);
      if (fetched) {
        setSeries(storyToSeriesDetail(fetched));
        return;
      }

      setSeries(getCatalogSeries(id) ?? null);
    };

    void load();
  }, [hydrated, id, getStoryById, fetchStoryById]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-groen-mint border-t-groen-deep" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Series not found</h1>
        <Link href="/" className="mt-4 inline-block text-groen-deep hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const preset = getCoverPreset(series.genre);
  const readHref = `/story/${id}/read`;

  return (
    <div className="bg-white pb-16">
      {/* Hero */}
      <div className="relative overflow-hidden bg-lp-purple">
        <CoverArt
          gradient={series.coverGradient || preset.gradient}
          emoji={series.coverEmoji ?? preset.emoji}
          className="absolute inset-0 h-full w-full opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-lp-purple/80 via-lp-purple/90 to-lp-purple" />

        <div className="relative mx-auto max-w-5xl px-4 pb-28 pt-10 text-center sm:px-6 sm:pb-32 sm:pt-14">
          <p className="text-sm font-semibold text-blue-300">{series.genre}</p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl md:text-5xl">
            {series.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-white/90">
            {series.creators.map((name) => (
              <span key={name} className="inline-flex items-center gap-1">
                {name}
                <span className="text-groen-primary">✓</span>
              </span>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="flex gap-2">
              {["f", "𝕏", "✉"].map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm text-white hover:bg-white/25"
                >
                  {icon}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="rounded-full bg-white px-5 py-2 text-sm font-bold text-gray-900"
            >
              + Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Content card */}
      <div className="relative mx-auto -mt-20 max-w-5xl px-4 sm:-mt-24 sm:px-6">
        <div className="overflow-hidden rounded-sm bg-white shadow-xl ring-1 ring-gray-200">
          <div className="flex flex-col lg:flex-row">
            {/* Episodes */}
            <div className="flex-1 border-b border-gray-100 lg:border-b-0 lg:border-r">
              <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 sm:px-6">
                <p className="text-xs text-gray-600">
                  <span className="font-bold">Note</span> Episode 1 is free to
                  read. Create an account to continue.
                </p>
              </div>

              <ul className="divide-y divide-gray-100">
                {series.episodes.map((ep) => (
                  <EpisodeRow
                    key={ep.number}
                    episode={ep}
                    seriesId={id}
                  />
                ))}
              </ul>

              <div className="flex justify-center py-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-groen-primary text-sm font-bold text-white">
                  1
                </span>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="w-full flex-shrink-0 lg:w-72 xl:w-80">
              <div className="border-b border-gray-100 p-5 sm:p-6">
                <div className="flex gap-8">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {series.views}
                    </p>
                    <p className="text-xs text-gray-400">Views</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {series.likes}
                    </p>
                    <p className="text-xs text-gray-400">Likes</p>
                  </div>
                </div>
                <p className="mt-4 text-sm font-bold text-groen-primary">
                  {series.schedule}
                </p>
              </div>

              <div className="border-b border-gray-100 p-5 sm:p-6">
                <p className="text-sm leading-relaxed text-gray-600">
                  {series.synopsis}
                </p>
              </div>

              <div className="space-y-2 p-5 sm:p-6">
                <Link
                  href={readHref}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 py-3.5 text-sm font-bold text-white hover:bg-gray-800"
                >
                  Continue reading
                  <span aria-hidden>›</span>
                </Link>
                <Link
                  href={readHref}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 py-3.5 text-sm font-bold text-white hover:bg-gray-800"
                >
                  First episode
                  <span aria-hidden>›</span>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function EpisodeRow({
  episode,
  seriesId,
}: {
  episode: SeriesEpisodeListing;
  seriesId: string;
}) {
  const href = `/story/${seriesId}/read`;

  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50 sm:gap-4 sm:px-6 sm:py-4"
      >
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-sm sm:h-16 sm:w-16">
          <CoverArt
            gradient={episode.coverGradient}
            emoji={episode.coverEmoji ?? "📖"}
            className="h-full w-full"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-900">{episode.title}</p>
        </div>
        <div className="hidden flex-shrink-0 items-center gap-4 text-xs text-gray-400 sm:flex">
          <span>{episode.date}</span>
          <span className="flex items-center gap-1 text-groen-primary">
            ♥ {episode.likes.toLocaleString()}
          </span>
          <span>#{episode.number === 0 ? "Prologue" : episode.number}</span>
        </div>
      </Link>
    </li>
  );
}
