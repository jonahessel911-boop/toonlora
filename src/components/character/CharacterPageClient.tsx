"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StoryCard from "@/components/home/StoryCard";
import CharacterPortraitThumb from "@/components/reader/CharacterPortraitThumb";
import { enrichCharactersWithStudioPortraits } from "@/lib/characters/episodeCharacters";
import { storyFeaturesCharacter } from "@/lib/characters/episodeCharacters";
import { slugToDisplayName } from "@/lib/characters/characterSlug";
import { storyToSeriesDetail } from "@/lib/seriesCatalog";
import { useCreatorStore } from "@/store/useCreatorStore";
import { useStoryStore } from "@/store/useStoryStore";
import { catalogToCard, type CatalogSeries } from "@/types/catalog";
import type { EpisodeCharacterRef } from "@/lib/characters/episodeCharacters";

interface CharacterPageClientProps {
  slug: string;
}

interface CharacterApiResponse {
  character: {
    slug: string;
    name: string;
    role?: string;
    visualDescription?: string;
  };
  stories: CatalogSeries[];
}

export default function CharacterPageClient({ slug }: CharacterPageClientProps) {
  const { stories: localStories, hydrate, hydrated } = useStoryStore();
  const creatorCharacters = useCreatorStore((state) => state.characters);
  const studioCharacters = useMemo(
    () =>
      creatorCharacters.filter(
        (character) => !character.archivedPublicSnapshot
      ),
    [creatorCharacters]
  );
  const [profile, setProfile] = useState<CharacterApiResponse["character"] | null>(
    null
  );
  const [stories, setStories] = useState<CatalogSeries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/characters/${encodeURIComponent(slug)}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as CharacterApiResponse & { error?: string };
        if (!cancelled && res.ok) {
          setProfile(data.character);
          setStories(data.stories ?? []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const fallbackStories = useMemo(() => {
    if (stories.length > 0) return [];

    return localStories
      .filter(
        (story) =>
          (story.status === "published" || story.isPublic) &&
          storyFeaturesCharacter(story, slug)
      )
      .map((story) => {
        const detail = storyToSeriesDetail(story);
        return catalogToCard({
          id: story.id,
          title: story.title,
          genre: String(story.genre),
          coverGradient: story.coverGradient,
          coverArtUrl: detail.coverArtUrl,
          source: story.source ?? "creator",
          status: "published",
          creatorDisplayName: detail.creators[0] ?? "Toonlora Creator",
          synopsis: detail.synopsis,
          episodeCount: detail.episodes.length,
          viewsCount: story.viewsCount ?? 0,
          likesCount: story.likesCount ?? 0,
          featuredRank: story.featuredRank ?? null,
          publishedAt: story.publishedAt ?? null,
          createdAt: story.createdAt,
        });
      });
  }, [localStories, slug, stories.length]);

  const displayStories = stories.length > 0 ? stories : fallbackStories;
  const baseCharacter: EpisodeCharacterRef = {
    slug,
    name: profile?.name ?? slugToDisplayName(slug),
    role: profile?.role,
    visualDescription: profile?.visualDescription,
  };
  const character =
    enrichCharactersWithStudioPortraits([baseCharacter], studioCharacters)[0] ??
    baseCharacter;

  return (
    <div className="min-h-[100dvh] bg-[#FCFAFF] pb-16 pt-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold text-[#667085] transition hover:text-[#5340FF]"
        >
          ← Back to browse
        </Link>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
          <CharacterPortraitThumb character={character} size="lg" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#5340FF]">
              Character
            </p>
            <h1 className="font-heading text-3xl font-extrabold text-[#2A114B]">
              {character.name}
            </h1>
            {character.role ? (
              <p className="mt-2 text-sm font-semibold text-[#667085]">
                {character.role}
              </p>
            ) : null}
            {character.visualDescription ? (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#667085]">
                {character.visualDescription}
              </p>
            ) : null}
          </div>
        </div>

        <section className="mt-10">
          <h2 className="font-heading text-xl font-extrabold text-[#101828]">
            Stories with {character.name}
          </h2>
          <p className="mt-1 text-sm text-[#667085]">
            Open another series featuring this character.
          </p>

          {loading && !hydrated ? (
            <p className="mt-8 text-sm text-[#667085]">Loading stories…</p>
          ) : displayStories.length === 0 ? (
            <p className="mt-8 rounded-2xl border border-dashed border-[#E7D8FF] bg-white p-8 text-center text-sm text-[#667085]">
              No other published stories with this character yet.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {displayStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={catalogToCard(story)}
                  size="standard"
                  layout="grid"
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
