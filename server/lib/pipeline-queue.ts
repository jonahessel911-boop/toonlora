import { getSupabase } from "../../pipeline/lib/supabase.js";

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
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
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
    created_at: row.created_at as string,
    started_at: (row.started_at as string | null) ?? null,
    completed_at: (row.completed_at as string | null) ?? null,
  };
}

export async function enqueueStory(params: {
  topic: string;
  category?: string;
  mode?: PipelineQueueMode;
  priority?: number;
}): Promise<PipelineQueueJob> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("pipeline_queue")
    .insert({
      topic: params.topic.trim(),
      category: params.category?.trim() || "business",
      mode: params.mode ?? "lean",
      priority: params.priority ?? 0,
      status: "pending",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to enqueue story");
  }

  return rowToJob(data as Record<string, unknown>);
}

export async function claimNextQueuedJob(): Promise<PipelineQueueJob | null> {
  const supabase = getSupabase();

  const { data: running } = await supabase
    .from("pipeline_queue")
    .select("id")
    .eq("status", "running")
    .limit(1);

  if (running?.length) return null;

  const { data: pending } = await supabase
    .from("pipeline_queue")
    .select("*")
    .eq("status", "pending")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1);

  const job = pending?.[0];
  if (!job) return null;

  const { data: claimed, error } = await supabase
    .from("pipeline_queue")
    .update({
      status: "running",
      started_at: new Date().toISOString(),
      error: null,
    })
    .eq("id", job.id)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (error || !claimed) return null;
  return rowToJob(claimed as Record<string, unknown>);
}

export async function markJobCompleted(
  jobId: string,
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
    .eq("id", jobId);

  if (error) throw new Error(error.message);
}

export async function markJobFailed(jobId: string, message: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("pipeline_queue")
    .update({
      status: "failed",
      error: message,
      completed_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  if (error) throw new Error(error.message);
}

export async function listQueueJobs(limit = 20): Promise<PipelineQueueJob[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("pipeline_queue")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => rowToJob(row as Record<string, unknown>));
}

export async function getQueueStats(): Promise<{
  pending: number;
  running: number;
  completed: number;
  failed: number;
}> {
  const supabase = getSupabase();
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

export async function getQueueJob(jobId: string): Promise<PipelineQueueJob | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("pipeline_queue")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  return data ? rowToJob(data as Record<string, unknown>) : null;
}
