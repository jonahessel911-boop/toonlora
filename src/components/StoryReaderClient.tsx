"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FlipBookReader from "@/components/FlipBookReader";
import WebtoonReader from "@/components/WebtoonReader";
import EpisodeReadLayout from "@/components/reader/EpisodeReadLayout";
import EpisodeCommentsSection from "@/components/comments/EpisodeCommentsSection";
import GenerationLoading from "@/components/create/GenerationLoading";
import {
  getCatalogSeries,
  storyToSeriesDetail,
  type SeriesDetail,
} from "@/lib/seriesCatalog";
import {
  buildMockReaderPanels,
  episodeToReaderPanels,
} from "@/lib/readerPanels";
import { useStoryStore } from "@/store/useStoryStore";
import { useCreditsStore } from "@/store/useCreditsStore";
import type { Story } from "@/types/story";
import { apiFetch } from "@/lib/session";
import { isDatabaseEnabled } from "@/lib/config";

interface StoryReaderClientProps {
  id: string;
  isPublic?: boolean;
}

export default function StoryReaderClient({
  id,
  isPublic = false,
}: StoryReaderClientProps) {
  const searchParams = useSearchParams();
  const episodeFromUrl = Math.max(
    1,
    Number(searchParams.get("ep") ?? 1) || 1
  );

  const { hydrate, getStoryById, fetchStoryById, addStory, hydrated } =
    useStoryStore();
  const { canGenerate, consumeGeneration, credits, hydrate: hydrateCredits } =
    useCreditsStore();
  const [story, setStory] = useState<Story | undefined>();
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    void hydrate();
    void hydrateCredits();
  }, [hydrate, hydrateCredits]);

  useEffect(() => {
    if (!hydrated) return;

    const load = async () => {
      const local = getStoryById(id);
      if (local) {
        setStory(local);
        return;
      }

      const fetched = await fetchStoryById(id);
      if (fetched) {
        setStory(fetched);
      }
    };

    void load();
  }, [hydrated, id, getStoryById, fetchStoryById]);

  const handleShare = () => {
    const url = `${window.location.origin}/share/${id}`;
    navigator.clipboard?.writeText(url);
    alert("Share link copied!");
  };

  const handleNextEpisode = async () => {
    if (!story?.userInput || !story.continuityMemory) return;
    if (!canGenerate()) {
      alert("Not enough credits. Buy more in your library.");
      return;
    }

    setGenerating(true);
    const nextEpisode = (story.episodes?.length ?? 0) + 1;

    try {
      const response = await apiFetch("/api/pipeline/generate", {
        method: "POST",
        body: JSON.stringify({
          ...story.userInput,
          episode_number: nextEpisode,
          previous_summary: story.continuityMemory.last_episode_summary,
          episode_prompt: `Continue the story. ${story.continuityMemory.unresolved_threads[0] ?? ""}`,
          story_bible: story.storyBible,
          series_id: story.id,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      if (!isDatabaseEnabled()) {
        await consumeGeneration();
      } else {
        await hydrateCredits();
      }

      const updated: Story = isDatabaseEnabled()
        ? (data.story as Story)
        : {
            ...story,
            episodes: [
              ...(story.episodes ?? []),
              data.story.episodes?.[data.story.episodes.length - 1] ??
                data.story.episodes?.[0],
            ].filter(Boolean) as Story["episodes"],
            continuityMemory: data.story.continuityMemory,
            pages: [...story.pages, ...data.story.pages],
          };

      await addStory(updated);
      setStory(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to generate episode");
    } finally {
      setGenerating(false);
    }
  };

  const wrapWithComments = (
    reader: React.ReactNode,
    series: SeriesDetail,
    episodeNumber: number
  ) => (
    <EpisodeReadLayout series={series} episodeNumber={episodeNumber}>
      {reader}
    </EpisodeReadLayout>
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#FCFAFF]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E9D8FD] border-t-[#5340FF]" />
      </div>
    );
  }

  if (generating) {
    return (
      <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#FCFAFF]">
        <GenerationLoading />
      </div>
    );
  }

  const catalog = getCatalogSeries(id);

  if (!story && catalog) {
    const ep =
      catalog.episodes.find((e) => e.number === episodeFromUrl) ??
      catalog.episodes.find((e) => e.number === 1) ??
      catalog.episodes[0];

    return wrapWithComments(
      <WebtoonReader
        seriesId={id}
        seriesTitle={catalog.title}
        episodeNumber={ep?.number ?? 1}
        episodeTitle={ep?.title ?? "Episode 1"}
        panels={buildMockReaderPanels(catalog)}
        showControls={!isPublic}
        onShare={handleShare}
        isCatalog
      />,
      catalog,
      ep?.number ?? 1
    );
  }

  if (!story) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#FCFAFF] px-4 text-center">
        <h1 className="font-heading text-2xl font-bold text-[#2A114B]">
          Story not found
        </h1>
        <Link href="/" className="btn-coral mt-6 rounded-full px-6 py-3 text-sm">
          Back to home
        </Link>
      </div>
    );
  }

  const seriesDetail = storyToSeriesDetail(story);
  const episode =
    story.episodes?.find((e) => e.episodeNumber === episodeFromUrl) ??
    story.episodes?.[0];

  if (episode) {
    return wrapWithComments(
      <WebtoonReader
        seriesId={id}
        seriesTitle={story.title}
        episodeNumber={episode.episodeNumber}
        episodeTitle={episode.title}
        panels={episodeToReaderPanels(episode, story.coverGradient)}
        showControls={!isPublic}
        onShare={handleShare}
        onGenerateNext={
          !isPublic && story.continuityMemory ? handleNextEpisode : undefined
        }
        credits={credits}
      />,
      seriesDetail,
      episode.episodeNumber
    );
  }

  return (
    <div>
      <div className="bg-white">
        <FlipBookReader
          pages={story.pages}
          showShare={!isPublic}
          showLibraryLink={!isPublic}
          onShare={handleShare}
        />
      </div>
      <EpisodeCommentsSection series={seriesDetail} episodeNumber={1} />
    </div>
  );
}
