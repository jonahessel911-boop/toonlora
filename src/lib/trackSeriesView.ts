import { apiFetch } from "@/lib/session";
import { recordAnalyticsEvent } from "@/lib/analytics/recordEvent";

async function fetchSeriesViewCount(seriesId: string): Promise<number | null> {
  try {
    const res = await apiFetch(`/api/stories/${seriesId}/view`);
    const data = (await res.json()) as { viewsCount?: number; skipped?: boolean };
    if (!res.ok || data.skipped) return null;
    return data.viewsCount ?? null;
  } catch {
    return null;
  }
}

/** Increment view count for this page visit; returns the updated total. */
export async function trackSeriesView(
  seriesId: string
): Promise<number | null> {
  if (typeof window === "undefined") return null;

  try {
    const res = await apiFetch(`/api/stories/${seriesId}/view`, {
      method: "POST",
    });
    const data = (await res.json()) as { viewsCount?: number; skipped?: boolean };
    if (data.skipped) return null;
    if (!res.ok) return fetchSeriesViewCount(seriesId);

    recordAnalyticsEvent({ eventType: "series_view", seriesId });
    return data.viewsCount ?? null;
  } catch {
    return fetchSeriesViewCount(seriesId);
  }
}
