"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SubscriptionPaywall from "@/components/reader/SubscriptionPaywall";
import { fetchPublishedStory } from "@/lib/fetchPublishedStory";
import { storyToSeriesDetail } from "@/lib/seriesCatalog";
import { useStoryStore } from "@/store/useStoryStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";

export default function SubscribePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyId = searchParams.get("storyId") ?? "";
  const storyTitleParam = searchParams.get("storyTitle");
  const nextEpisode = Math.max(2, Number(searchParams.get("ep") ?? 2) || 2);
  const { getStoryById } = useStoryStore();
  const { status, hydrate: hydrateSubscription } = useSubscriptionStore();
  const [storyTitle, setStoryTitle] = useState(storyTitleParam ?? "");
  const [coverArtUrl, setCoverArtUrl] = useState<string | undefined>();

  useEffect(() => {
    void hydrateSubscription();
  }, [hydrateSubscription]);

  useEffect(() => {
    if (!storyId) return;

    const local = getStoryById(storyId);
    if (local) {
      const detail = storyToSeriesDetail(local);
      setStoryTitle(detail.title);
      setCoverArtUrl(detail.coverArtUrl);
      return;
    }

    let cancelled = false;
    void fetchPublishedStory(storyId).then((story) => {
      if (cancelled || !story) return;
      const detail = storyToSeriesDetail(story);
      setStoryTitle(detail.title);
      setCoverArtUrl(detail.coverArtUrl);
    });

    return () => {
      cancelled = true;
    };
  }, [storyId, getStoryById]);

  useEffect(() => {
    if (status === "active" && storyId) {
      router.replace(
        `/story/${storyId}/read${nextEpisode > 1 ? `?ep=${nextEpisode}` : ""}`
      );
    }
  }, [status, storyId, nextEpisode, router]);

  if (!storyId) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#08040F] text-white">
        <p className="text-sm text-white/70">Missing story. Go back and try again.</p>
      </div>
    );
  }

  const displayTitle = storyTitle || storyTitleParam || "this story";
  const returnPath = `/story/${storyId}/read?ep=${nextEpisode}`;

  return (
    <SubscriptionPaywall
      variant="page"
      storyName={displayTitle}
      open
      onClose={() => router.push(`/story/${storyId}/read`)}
      returnPath={returnPath}
      coverArtUrl={coverArtUrl}
    />
  );
}
