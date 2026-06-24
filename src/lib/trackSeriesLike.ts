import { apiFetch } from "@/lib/session";

const LIKED_SERIES_KEY = "toonlora-liked-series";

function readLikedSeries(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LIKED_SERIES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function hasSeriesLike(seriesId: string): boolean {
  return readLikedSeries().includes(seriesId);
}

function markSeriesLiked(seriesId: string): void {
  if (typeof window === "undefined") return;
  const ids = readLikedSeries();
  if (ids.includes(seriesId)) return;
  localStorage.setItem(LIKED_SERIES_KEY, JSON.stringify([...ids, seriesId]));
}

/** Like a series once per browser; returns updated like count. */
export async function trackSeriesLike(
  seriesId: string
): Promise<number | null> {
  if (typeof window === "undefined") return null;
  if (hasSeriesLike(seriesId)) return null;

  try {
    const res = await apiFetch(`/api/stories/${seriesId}/like`, {
      method: "POST",
    });
    const data = (await res.json()) as { likesCount?: number; skipped?: boolean };
    if (data.skipped || !res.ok) return null;

    markSeriesLiked(seriesId);
    return data.likesCount ?? null;
  } catch {
    return null;
  }
}
