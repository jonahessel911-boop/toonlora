"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FlipBookReader from "@/components/FlipBookReader";
import WebtoonReader from "@/components/WebtoonReader";
import EpisodeReadLayout from "@/components/reader/EpisodeReadLayout";
import EpisodeCommentsSection from "@/components/comments/EpisodeCommentsSection";
import GenerationLoading from "@/components/create/GenerationLoading";
import { storyToSeriesDetail, type SeriesDetail } from "@/lib/seriesCatalog";
import { episodeToReaderPanels } from "@/lib/readerPanels";
import { fetchPublishedStory } from "@/lib/fetchPublishedStory";
import { useStoryStore } from "@/store/useStoryStore";
import { useCreditsStore } from "@/store/useCreditsStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
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

  const { hydrate, getStoryById, addStory, hydrated } = useStoryStore();
  const { canGenerate, consumeGeneration, credits, hydrate: hydrateCredits } =
    useCreditsStore();
  const { hydrate: hydrateSubscription, setSubscription } = useSubscriptionStore();
  const [story, setStory] = useState<Story | undefined>();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    void hydrate();
    void hydrateCredits();
    void hydrateSubscription();
  }, [hydrate, hydrateCredits, hydrateSubscription]);

  useEffect(() => {
    const subscribed = searchParams.get("subscribed");
    if (subscribed === "success") {
      void hydrateSubscription().then(() => {
        setSubscription({ status: "active" });
      });
    }
  }, [searchParams, hydrateSubscription, setSubscription]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const local = getStoryById(id);
        if (local && (local.status === "published" || local.isPublic)) {
          if (!cancelled) setStory(local);
          return;
        }

        const fetched = await fetchPublishedStory(id);
        if (!cancelled) setStory(fetched ?? undefined);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id, getStoryById]);

  const handleShare = () => {
    const url = `${window.location.origin}/share/${id}`;
    navigator.clipboard?.writeText(url);
    alert("Share link copied!");
  };

  const handleNextEpisode = async () => {
    if (!story?.userInput || !story.continuityMemory) return;
    if (!canGenerate()) {
      alert("Not enough credits. Buy more in your profile.");
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
    <EpisodeReadLayout series={series} episodeNumber={episodeNumber} story={story}>
      {reader}
    </EpisodeReadLayout>
  );

  if (loading || !hydrated) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-white" />
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

  if (!story) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-black px-4 text-center text-white">
        <h1 className="font-heading text-2xl font-bold">Series not found</h1>
        <p className="mt-2 text-sm text-white/60">
          This chapter may be unpublished or unavailable.
        </p>
        <Link href="/" className="btn-coral mt-6 rounded-full px-6 py-3 text-sm">
          Back to home
        </Link>
      </div>
    );
  }

  const isReadable = story.status !== "draft";

  if (!isReadable) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-black px-4 text-center text-white">
        <h1 className="font-heading text-2xl font-bold">Not published yet</h1>
        <p className="mt-2 text-sm text-white/60">
          This series is still a draft.
        </p>
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
        panels={episodeToReaderPanels(episode, story.coverGradient, id)}
        genre={seriesDetail.genre}
        coverGradient={story.coverGradient}
        coverArtUrl={seriesDetail.coverArtUrl}
        creatorDisplayName={seriesDetail.creators[0]}
        episodes={seriesDetail.episodes.map((e) => ({
          number: e.number,
          title: e.title,
          coverGradient: e.coverGradient,
          coverArtUrl: e.coverArtUrl,
        }))}
        showControls={!isPublic}
        onShare={handleShare}
        onGenerateNext={
          !isPublic && story.continuityMemory ? handleNextEpisode : undefined
        }
        credits={credits}
        isCatalog={story.status === "published"}
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
      <EpisodeCommentsSection series={seriesDetail} episodeNumber={1} story={story} />
    </div>
  );
}
