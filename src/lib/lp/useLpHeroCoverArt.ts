"use client";

import { useEffect, useState } from "react";
import {
  fetchPublishedStory,
  getStoryCoverArtUrl,
} from "@/lib/fetchPublishedStory";

/** Load hero cover from the story API when catalog/mock omit coverArtUrl. */
export function useLpHeroCoverArt(
  storyId: string,
  initialCoverArtUrl?: string
): string | undefined {
  const [coverArtUrl, setCoverArtUrl] = useState(initialCoverArtUrl);

  useEffect(() => {
    setCoverArtUrl(initialCoverArtUrl);
  }, [initialCoverArtUrl, storyId]);

  useEffect(() => {
    if (coverArtUrl || !storyId) return;

    let cancelled = false;
    void fetchPublishedStory(storyId).then((story) => {
      if (cancelled || !story) return;
      const url = getStoryCoverArtUrl(story);
      if (url) setCoverArtUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [storyId, coverArtUrl]);

  return coverArtUrl;
}
