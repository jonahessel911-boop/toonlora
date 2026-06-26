import { getSupabase } from "./supabase.js";

export async function hasActivePipelineRun(): Promise<boolean> {
  const supabase = getSupabase();
  const { count } = await supabase
    .from("pipeline_runs")
    .select("id", { count: "exact", head: true })
    .eq("status", "running");

  return (count ?? 0) > 0;
}

/** Mark matching queue job completed when a pipeline finishes outside the worker. */
export async function tryCompleteQueueJobForSeries(
  seriesId: string
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("pipeline_queue")
    .update({
      status: "completed",
      series_id: seriesId,
      completed_at: new Date().toISOString(),
      error: null,
    })
    .eq("series_id", seriesId)
    .eq("status", "running");

  if (error) {
    console.warn(`[queue] Could not complete queue job for ${seriesId}: ${error.message}`);
  }
}

export async function clearStaleRunningPipelineRuns(
  seriesId: string,
  message = "Stopped — queue reset"
): Promise<void> {
  const supabase = getSupabase();
  await supabase
    .from("pipeline_runs")
    .update({ status: "failed", error: message })
    .eq("series_id", seriesId)
    .eq("status", "running");
}

export async function clearFailedPipelineRunErrors(
  exceptSeriesId?: string
): Promise<void> {
  const supabase = getSupabase();
  let query = supabase
    .from("pipeline_runs")
    .update({ error: null })
    .eq("status", "failed");

  if (exceptSeriesId) {
    query = query.neq("series_id", exceptSeriesId);
  }

  await query;
}
