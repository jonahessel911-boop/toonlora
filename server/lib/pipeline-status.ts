import { getSupabase } from "../../pipeline/lib/supabase.js";

export interface StorySummary {
  id: string;
  title: string;
  slug: string | null;
  category: string | null;
  status: string;
  created_at: string;
  pipeline_running: boolean;
  last_step: string | null;
  last_error: string | null;
  panel_count: number;
  with_image_count: number;
}

export async function listPipelineStories(limit = 20): Promise<StorySummary[]> {
  const supabase = getSupabase();

  const { data: seriesRows, error } = await supabase
    .from("series")
    .select("id, title, slug, category, status, created_at")
    .not("slug", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  if (!seriesRows?.length) return [];

  const summaries: StorySummary[] = [];

  for (const series of seriesRows) {
    const seriesId = series.id as string;

    const { data: runs } = await supabase
      .from("pipeline_runs")
      .select("step, status, error, created_at")
      .eq("series_id", seriesId)
      .order("created_at", { ascending: false })
      .limit(5);

    const runRows = runs ?? [];
    const running = runRows.some((r) => r.status === "running");
    const latest = runRows[0];
    const failed = runRows.find((r) => r.status === "failed");

    const { data: episodes } = await supabase
      .from("episodes")
      .select("id")
      .eq("series_id", seriesId);

    const episodeIds = (episodes ?? []).map((e) => e.id as string);
    let panelCount = 0;
    let withImage = 0;

    if (episodeIds.length) {
      const { data: panels } = await supabase
        .from("panels")
        .select("image_url")
        .in("episode_id", episodeIds);

      panelCount = panels?.length ?? 0;
      withImage = panels?.filter((p) => p.image_url).length ?? 0;
    }

    summaries.push({
      id: seriesId,
      title: series.title as string,
      slug: (series.slug as string | null) ?? null,
      category: (series.category as string | null) ?? null,
      status: series.status as string,
      created_at: series.created_at as string,
      pipeline_running: running,
      last_step: (latest?.step as string | null) ?? null,
      last_error: (failed?.error as string | null) ?? null,
      panel_count: panelCount,
      with_image_count: withImage,
    });
  }

  return summaries;
}

export async function getStoryStatus(seriesId: string): Promise<StorySummary | null> {
  const all = await listPipelineStories(100);
  return all.find((s) => s.id === seriesId) ?? null;
}
