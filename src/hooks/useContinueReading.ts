"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadContinueReading,
  type ContinueReadingItem,
} from "@/lib/reading/continueReading";
import { pruneReadingHistory } from "@/lib/readingHistory";
import { useUserStore } from "@/store/useUserStore";

export function useContinueReading(limit = 10) {
  const { email } = useUserStore();
  const loggedIn = Boolean(email);
  const [items, setItems] = useState<ContinueReadingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await loadContinueReading({ loggedIn, limit });
      setItems(next);
      if (!loggedIn) {
        pruneReadingHistory(next.map((item) => item.seriesId));
      }
    } finally {
      setLoading(false);
    }
  }, [loggedIn, limit]);

  useEffect(() => {
    void refresh();
    const onUpdate = () => void refresh();
    window.addEventListener("storage", onUpdate);
    window.addEventListener("tl-reading-history", onUpdate);
    return () => {
      window.removeEventListener("storage", onUpdate);
      window.removeEventListener("tl-reading-history", onUpdate);
    };
  }, [refresh]);

  return { items, loading, refresh };
}
