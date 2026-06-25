"use client";

import { useCallback, useEffect, useState } from "react";
import type { CatalogSeries } from "@/types/catalog";
import { catalogToCard } from "@/types/catalog";

export interface UseCatalogOptions {
  genre?: string;
  source?: "admin" | "creator";
  sort?: "featured" | "newest" | "popular";
  limit?: number;
  enabled?: boolean;
  /** Include draft pipeline series that have a cover_art_url */
  index?: boolean;
}

function catalogCacheKey(options: UseCatalogOptions): string {
  return JSON.stringify({
    genre: options.genre ?? "",
    source: options.source ?? "",
    sort: options.sort ?? "featured",
    limit: options.limit ?? 48,
    index: options.index ?? false,
  });
}

const catalogCache = new Map<string, CatalogSeries[]>();
const inflight = new Map<string, Promise<CatalogSeries[]>>();

async function fetchCatalog(options: UseCatalogOptions): Promise<CatalogSeries[]> {
  const key = catalogCacheKey(options);
  const cached = catalogCache.get(key);
  if (cached) return cached;

  const pending = inflight.get(key);
  if (pending) return pending;

  const request = (async () => {
    const params = new URLSearchParams();
    if (options.genre) params.set("genre", options.genre);
    if (options.source) params.set("source", options.source);
    if (options.sort) params.set("sort", options.sort);
    if (options.limit) params.set("limit", String(options.limit));
    if (options.index) params.set("index", "1");

    const res = await fetch(`/api/catalog?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to load catalog");

    const series = (data.series ?? []).map((s: CatalogSeries) => catalogToCard(s));
    catalogCache.set(key, series);
    return series;
  })();

  inflight.set(key, request);
  try {
    return await request;
  } finally {
    inflight.delete(key);
  }
}

export function useCatalog(options: UseCatalogOptions = {}) {
  const enabled = options.enabled ?? true;
  const [series, setSeries] = useState<CatalogSeries[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!enabled) {
      setSeries([]);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const next = await fetchCatalog(options);
      setSeries(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load catalog");
      setSeries([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, options.genre, options.source, options.sort, options.limit, options.index]);

  useEffect(() => {
    void load();
  }, [load]);

  return { series, loading, error, reload: load };
}
