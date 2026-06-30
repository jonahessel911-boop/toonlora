"use client";

import { useEffect, useState } from "react";
import {
  fetchPublishedStory,
  getStoryCoverArtUrl,
} from "@/lib/fetchPublishedStory";
import { isStoryUuid } from "@/lib/lp/resolveCatalogByCoverTitle";

/** Load hero cover from the story API when catalog/mock omit coverArtUrl. */
export function useLpHeroCoverArt(
  storyId: string,
  initialCoverArtUrl?: string
): string | undefined {
  const [coverArtUrl, setCoverArtUrl] = useState(initialCoverArtUrl);
  const needsApiCover = Boolean(storyId) && !isStoryUuid(storyId);

  useEffect(() => {
    setCoverArtUrl(initialCoverArtUrl);
  }, [initialCoverArtUrl, storyId]);

  useEffect(() => {
    if (!storyId) return;
    if (!needsApiCover && coverArtUrl) return;

    let cancelled = false;
    void fetchPublishedStory(storyId).then((story) => {
      if (cancelled || !story) return;
      const url = getStoryCoverArtUrl(story);
      if (url) setCoverArtUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [storyId, coverArtUrl, needsApiCover]);

  return coverArtUrl;
}
