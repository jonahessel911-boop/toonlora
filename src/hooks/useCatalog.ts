"use client";

import { useCallback, useEffect, useState } from "react";
import type { CatalogSeries } from "@/types/catalog";
import { catalogToCard } from "@/types/catalog";

export interface UseCatalogOptions {
  genre?: string;
  source?: "admin" | "creator";
  sort?: "featured" | "newest" | "popular";
  limit?: number;
}

export function useCatalog(options: UseCatalogOptions = {}) {
  const [series, setSeries] = useState<CatalogSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (options.genre) params.set("genre", options.genre);
      if (options.source) params.set("source", options.source);
      if (options.sort) params.set("sort", options.sort);
      if (options.limit) params.set("limit", String(options.limit));

      const res = await fetch(`/api/catalog?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load catalog");
      setSeries((data.series ?? []).map((s: CatalogSeries) => catalogToCard(s)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load catalog");
      setSeries([]);
    } finally {
      setLoading(false);
    }
  }, [options.genre, options.source, options.sort, options.limit]);

  useEffect(() => {
    void load();
  }, [load]);

  return { series, loading, error, reload: load };
}
