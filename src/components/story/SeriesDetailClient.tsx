"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CoverArt, { getCoverPreset } from "@/components/ui/CoverArt";
import { CREDIT_COPY, getGenreColors } from "@/lib/brand";
import { APP_NAME } from "@/lib/constants";
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
      <div className="flex min-h-[50vh] items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-surface-soft border-t-lp-purple" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="font-heading text-2xl font-bold text-gs-text">Series not found</h1>
        <Link href="/" className="btn-coral mt-6 inline-flex rounded-full px-6 py-3 text-sm">
          Back to home
        </Link>
      </div>
    );
  }

  const preset = getCoverPreset(series.genre);
  const genreStyle = getGenreColors(series.genre);
  const readHref = `/story/${id}/read`;

  return (
    <div className="bg-white pb-16">
      {/* Purple hero — Toonlora brand */}
      <div className="relative overflow-x-clip bg-lp-purple pb-16 lp-hero-curve sm:pb-20">
        <CoverArt
          gradient={series.coverGradient || preset.gradient}
          genre={series.genre}
          showOverlay={false}
          className="absolute inset-0 h-full w-full opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-lp-purple/80 via-lp-purple/95 to-lp-purple" />

        <div className="relative mx-auto max-w-5xl px-4 pb-6 pt-8 text-center sm:px-6 sm:pt-10">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${genreStyle.bg} ${genreStyle.text} ring-2 ring-white/20`}
          >
            {series.genre}
          </span>

          <h1 className="font-heading mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-[2.75rem]">
            {series.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-white/90">
            {series.creators.map((name, i) => (
              <span key={name} className="inline-flex items-center gap-1">
                {i > 0 && <span className="text-white/40">•</span>}
                {name}
                <span className="text-lp-yellow" aria-hidden>
                  ✓
                </span>
              </span>
            ))}
          </div>

          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/60">
            {APP_NAME} Original
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="flex gap-2">
              {[
                { label: "Facebook", icon: "f" },
                { label: "X", icon: "𝕏" },
                { label: "Link", icon: "✉" },
              ].map(({ label, icon }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={`Share on ${label}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white ring-1 ring-white/10 transition hover:bg-white/25"
                >
                  {icon}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="rounded-full bg-white px-5 py-2 text-sm font-bold text-lp-purple-deep shadow-sm transition hover:bg-lp-yellow hover:text-lp-purple-deep"
            >
              + Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Content card */}
      <div className="relative mx-auto -mt-12 max-w-5xl px-4 sm:-mt-14 sm:px-6">
        <div className="card-shadow overflow-hidden rounded-2xl bg-white ring-1 ring-border/60">
          <div className="flex flex-col lg:flex-row">
            {/* Episodes */}
            <div className="flex-1 border-b border-border/50 lg:border-b-0 lg:border-r lg:border-border/50">
              <div className="border-b border-border/50 bg-surface-soft px-4 py-3 sm:px-6">
                <p className="text-xs leading-relaxed text-gs-muted">
                  <span className="font-bold text-lp-purple-deep">Note</span>{" "}
                  Episode 1 is free to read. {CREDIT_COPY}
                </p>
              </div>

              <ul className="divide-y divide-border/40">
                {series.episodes.map((ep) => (
                  <EpisodeRow
                    key={ep.number}
                    episode={ep}
                    seriesId={id}
                    genre={series.genre}
                  />
                ))}
              </ul>

              <div className="flex justify-center py-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lp-purple text-sm font-bold text-white shadow-[0_4px_12px_rgba(83,64,255,0.35)]">
                  1
                </span>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="w-full flex-shrink-0 lg:w-72 xl:w-80">
              <div className="border-b border-border/50 p-5 sm:p-6">
                <div className="flex gap-10">
                  <div>
                    <p className="font-heading text-2xl font-bold text-lp-purple">
                      {series.views}
                    </p>
                    <p className="text-xs font-medium text-gs-muted">Views</p>
                  </div>
                  <div>
                    <p className="font-heading text-2xl font-bold text-lp-purple">
                      {series.likes}
                    </p>
                    <p className="text-xs font-medium text-gs-muted">Likes</p>
                  </div>
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.1em] text-lp-coral">
                  {series.schedule}
                </p>
              </div>

              <div className="border-b border-border/50 p-5 sm:p-6">
                <p className="text-sm leading-relaxed text-gs-muted">{series.synopsis}</p>
              </div>

              <div className="space-y-2.5 p-5 sm:p-6">
                <Link
                  href={readHref}
                  className="btn-coral flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm"
                >
                  Start reading
                  <span aria-hidden>›</span>
                </Link>
                <Link
                  href="/create"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-lp-yellow py-3.5 text-sm font-bold text-lp-purple-deep transition hover:brightness-105 active:scale-[0.98]"
                >
                  Create your story
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
  genre,
}: {
  episode: SeriesEpisodeListing;
  seriesId: string;
  genre: string;
}) {
  const href = `/story/${seriesId}/read`;
  const genreStyle = getGenreColors(genre);
  const isFree = episode.number <= 1;

  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-3 px-4 py-3 transition hover:bg-surface-soft sm:gap-4 sm:px-6 sm:py-4"
      >
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl ring-1 ring-border/60 sm:h-16 sm:w-16">
          <CoverArt
            gradient={episode.coverGradient}
            genre={genre}
            showOverlay={false}
            className="h-full w-full"
          />
          <span
            className={`absolute left-1 top-1 rounded-md px-1 py-0.5 text-[8px] font-bold uppercase ${genreStyle.bg} ${genreStyle.text}`}
          >
            Story
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gs-text transition group-hover:text-lp-purple">
            {episode.title}
          </p>
          {isFree && (
            <span className="mt-0.5 inline-block rounded-full bg-lp-coral/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-lp-coral">
              Free
            </span>
          )}
        </div>
        <div className="hidden flex-shrink-0 items-center gap-4 text-xs text-gs-muted sm:flex">
          <span>{episode.date}</span>
          <span className="flex items-center gap-1 font-semibold text-lp-coral">
            ♥ {episode.likes.toLocaleString()}
          </span>
          <span className="font-medium text-lp-purple">
            #{episode.number === 0 ? "Prologue" : episode.number}
          </span>
        </div>
      </Link>
    </li>
  );
}
