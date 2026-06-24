"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SignupOnboardingFlow, {
  type SignupStoryContext,
} from "@/components/signup/SignupOnboardingFlow";
import { fetchPublishedStory } from "@/lib/fetchPublishedStory";
import {
  buildAuthHref,
  buildPaywallPath,
  sanitizeReturnTo,
} from "@/lib/reader/nextEpisodeGate";
import { storyToSeriesDetail } from "@/lib/seriesCatalog";
import { useStoryStore } from "@/store/useStoryStore";

export default function ContinueSignupPageClient() {
  const searchParams = useSearchParams();
  const storyId = searchParams.get("storyId") ?? "";
  const storyTitle = searchParams.get("storyTitle") ?? "this story";
  const nextEpisode = Math.max(2, Number(searchParams.get("ep") ?? 2) || 2);
  const returnTo =
    sanitizeReturnTo(searchParams.get("returnTo")) ??
    (storyId ? buildPaywallPath(storyId, nextEpisode, storyTitle) : null);
  const { getStoryById } = useStoryStore();
  const [storyContext, setStoryContext] = useState<SignupStoryContext | null>(
    storyId
      ? {
          storyId,
          storyTitle,
          nextEpisode,
        }
      : null
  );

  useEffect(() => {
    if (!storyId) return;

    const local = getStoryById(storyId);
    if (local) {
      const detail = storyToSeriesDetail(local);
      setStoryContext({
        storyId,
        storyTitle: detail.title,
        nextEpisode,
        coverArtUrl: detail.coverArtUrl,
        coverGradient: local.coverGradient,
        genre: detail.genre,
      });
      return;
    }

    let cancelled = false;
    void fetchPublishedStory(storyId).then((story) => {
      if (cancelled || !story) return;
      const detail = storyToSeriesDetail(story);
      setStoryContext({
        storyId,
        storyTitle: detail.title,
        nextEpisode,
        coverArtUrl: detail.coverArtUrl,
        coverGradient: story.coverGradient,
        genre: detail.genre,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [storyId, nextEpisode, getStoryById]);

  const readerHref = storyId ? `/story/${storyId}/read` : "/";
  const signinHref = returnTo
    ? buildAuthHref("/signin", returnTo)
    : "/signin";

  return (
    <SignupOnboardingFlow
      formType="reader_continue"
      returnTo={returnTo}
      signinHref={signinHref}
      backHref={readerHref}
      storyContext={storyContext ?? undefined}
    />
  );
}
