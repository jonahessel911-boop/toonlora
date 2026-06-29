"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SubscriptionPaywall from "@/components/reader/SubscriptionPaywall";
import { fetchPublishedStory } from "@/lib/fetchPublishedStory";
import { checkEpisodeReadAccess } from "@/lib/reader/episodeAccessGate";
import { storyToSeriesDetail } from "@/lib/seriesCatalog";
import { useStoryStore } from "@/store/useStoryStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";

export default function SubscribePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const changePlan = searchParams.get("change") === "1";
  const storyId = searchParams.get("storyId") ?? "";
  const storyTitleParam = searchParams.get("storyTitle");
  const nextEpisode = Math.max(2, Number(searchParams.get("ep") ?? 2) || 2);
  const weeklyLimitReached = searchParams.get("reason") === "weekly_limit";
  const fastPass = searchParams.get("reason") === "fast_pass";
  const { getStoryById } = useStoryStore();
  const { status, hydrate: hydrateSubscription, isSubscriber } =
    useSubscriptionStore();
  const [storyTitle, setStoryTitle] = useState(storyTitleParam ?? "");
  const [coverArtUrl, setCoverArtUrl] = useState<string | undefined>();
  const [weeklyFreeResetsAt, setWeeklyFreeResetsAt] = useState<string | null>(
    null
  );

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
    if (!weeklyLimitReached || !storyId) return;
    void checkEpisodeReadAccess(storyId, Math.max(2, nextEpisode)).then(
      (access) => {
        setWeeklyFreeResetsAt(access.weeklyFreeResetsAt ?? null);
      }
    );
  }, [weeklyLimitReached, storyId, nextEpisode]);

  useEffect(() => {
    if (changePlan) return;
    if (status !== "active" && !isSubscriber()) return;

    if (storyId) {
      router.replace(
        `/story/${storyId}/read${nextEpisode > 1 ? `?ep=${nextEpisode}` : ""}`
      );
      return;
    }

    router.replace("/profile");
  }, [changePlan, status, storyId, nextEpisode, router, isSubscriber]);

  const displayTitle =
    storyTitle || storyTitleParam || "Toonlora Originals";
  const returnPath = changePlan
    ? "/profile?tab=subscription"
    : storyId
      ? `/story/${storyId}/read?ep=${nextEpisode}`
      : "/profile";
  const closePath = changePlan
    ? "/profile?tab=subscription"
    : storyId
      ? `/story/${storyId}/read`
      : "/profile";

  return (
    <SubscriptionPaywall
      variant="page"
      storyName={displayTitle}
      open
      onClose={() => router.push(closePath)}
      returnPath={returnPath}
      coverArtUrl={coverArtUrl}
      storyId={storyId || undefined}
      episodeNumber={storyId ? nextEpisode : undefined}
      weeklyLimitReached={weeklyLimitReached}
      weeklyFreeResetsAt={weeklyFreeResetsAt}
      fastPass={fastPass}
      changePlan={changePlan}
      onPlanChanged={() => {
        router.push("/profile?tab=subscription&planChanged=1");
      }}
    />
  );
}
