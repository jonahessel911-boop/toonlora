import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type PipelineQueueMode = "lean" | "full";
export type PipelineQueueStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface PipelineQueueJob {
  id: string;
  topic: string;
  category: string;
  mode: PipelineQueueMode;
  status: PipelineQueueStatus;
  series_id: string | null;
  error: string | null;
  priority: number;
  max_panels: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface PipelineQueueStats {
  pending: number;
  running: number;
  completed: number;
  failed: number;
}

function rowToJob(row: Record<string, unknown>): PipelineQueueJob {
  return {
    id: row.id as string,
    topic: row.topic as string,
    category: row.category as string,
    mode: row.mode as PipelineQueueMode,
    status: row.status as PipelineQueueStatus,
    series_id: (row.series_id as string | null) ?? null,
    error: (row.error as string | null) ?? null,
    priority: row.priority as number,
    max_panels:
      typeof row.max_panels === "number"
        ? row.max_panels
        : Number(row.max_panels) || 36,
    created_at: row.created_at as string,
    started_at: (row.started_at as string | null) ?? null,
    completed_at: (row.completed_at as string | null) ?? null,
  };
}

export async function listPipelineQueueJobs(
  limit = 50
): Promise<PipelineQueueJob[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const [{ data: running }, { data: rest, error }] = await Promise.all([
    supabase.from("pipeline_queue").select("*").eq("status", "running"),
    supabase
      .from("pipeline_queue")
      .select("*")
      .neq("status", "running")
      .order("created_at", { ascending: false })
      .limit(Math.max(limit - 10, 20)),
  ]);

  if (error) throw new Error(error.message);

  const merged = [
    ...(running ?? []).map((row) => rowToJob(row as Record<string, unknown>)),
    ...(rest ?? []).map((row) => rowToJob(row as Record<string, unknown>)),
  ];

  return merged.slice(0, limit);
}

/** Fix stale "running" jobs when the pipeline already finished (or died). */
export async function reconcilePipelineQueue(): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const { data: runningJobs } = await supabase
    .from("pipeline_queue")
    .select("id, series_id, started_at")
    .eq("status", "running");

  if (!runningJobs?.length) return;

  const { count: activeRunCount } = await supabase
    .from("pipeline_runs")
    .select("id", { count: "exact", head: true })
    .eq("status", "running");

  const pipelineBusy = (activeRunCount ?? 0) > 0;

  for (const job of runningJobs) {
    const seriesId = job.series_id as string | null;
    const startedAt = job.started_at as string | null;
    const jobId = job.id as string;

    if (seriesId) {
      const { data: runs } = await supabase
        .from("pipeline_runs")
        .select("step, status")
        .eq("series_id", seriesId);

      const hasActiveRun = runs?.some((run) => run.status === "running");
      const pipelineComplete = runs?.some(
        (run) => run.step === "complete" && run.status === "completed"
      );

      if (pipelineComplete && !hasActiveRun) {
        await supabase
          .from("pipeline_queue")
          .update({
            status: "completed",
            series_id: seriesId,
            completed_at: new Date().toISOString(),
            error: null,
          })
          .eq("id", jobId);
        continue;
      }
    }

    if (!pipelineBusy && startedAt) {
      const ageMs = Date.now() - new Date(startedAt).getTime();
      const staleMs = 20 * 60 * 1000;
      if (ageMs > staleMs) {
        await supabase
          .from("pipeline_queue")
          .update({
            status: "pending",
            error: "Worker timeout — opnieuw in wachtrij gezet",
            started_at: null,
            completed_at: null,
          })
          .eq("id", jobId);
      }
    }
  }
}

export async function getPipelineQueueStats(): Promise<PipelineQueueStats> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { pending: 0, running: 0, completed: 0, failed: 0 };
  }

  const statuses = ["pending", "running", "completed", "failed"] as const;
  const counts = { pending: 0, running: 0, completed: 0, failed: 0 };

  for (const status of statuses) {
    const { count } = await supabase
      .from("pipeline_queue")
      .select("id", { count: "exact", head: true })
      .eq("status", status);
    counts[status] = count ?? 0;
  }

  return counts;
}

export async function enqueuePipelineStory(params: {
  topic: string;
  category?: string;
  maxPanels?: number;
  mode?: PipelineQueueMode;
  priority?: number;
  seriesId?: string;
}): Promise<PipelineQueueJob> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const maxPanels = Math.min(
    40,
    Math.max(5, Math.floor(params.maxPanels ?? 36))
  );

  const { data, error } = await supabase
    .from("pipeline_queue")
    .insert({
      topic: params.topic.trim(),
      category: params.category?.trim() || "business",
      mode: params.mode ?? "full",
      max_panels: maxPanels,
      priority: params.priority ?? 0,
      status: "pending",
      ...(params.seriesId ? { series_id: params.seriesId } : {}),
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to enqueue story");
  }

  return rowToJob(data as Record<string, unknown>);
}

export async function cancelPipelineQueueJob(jobId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const { error } = await supabase
    .from("pipeline_queue")
    .update({ status: "cancelled", completed_at: new Date().toISOString() })
    .eq("id", jobId)
    .eq("status", "pending");

  if (error) throw new Error(error.message);
}

export async function deletePipelineQueueJob(jobId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const { data: job, error: fetchError } = await supabase
    .from("pipeline_queue")
    .select("status")
    .eq("id", jobId)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);
  if (!job) return;

  if (job.status === "running") {
    throw new Error("Een lopende story kan niet worden verwijderd");
  }

  const { error } = await supabase.from("pipeline_queue").delete().eq("id", jobId);

  if (error) throw new Error(error.message);
}
