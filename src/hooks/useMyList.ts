"use client";

import { useCallback, useEffect, useState } from "react";
import {
  followSeries,
  isFollowingSeries,
  unfollowSeries,
  type FollowingStory,
} from "@/lib/library/preferences";
import { useRequireAuth } from "@/hooks/useRequireAuth";

/** Sync My List / follow state with localStorage-backed preferences. */
export function useMyList(entry: FollowingStory) {
  const { requireAuth } = useRequireAuth();
  const [onList, setOnList] = useState(false);

  const sync = useCallback(() => {
    setOnList(isFollowingSeries(entry.seriesId));
  }, [entry.seriesId]);

  useEffect(() => {
    sync();
    window.addEventListener("tl-library-prefs", sync);
    return () => window.removeEventListener("tl-library-prefs", sync);
  }, [sync]);

  const toggle = useCallback(() => {
    if (!requireAuth(entry.href)) return;

    if (isFollowingSeries(entry.seriesId)) {
      unfollowSeries(entry.seriesId);
    } else {
      followSeries(entry);
    }
    sync();
  }, [entry, requireAuth, sync]);

  return { onList, toggle };
}
