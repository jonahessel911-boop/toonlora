import { spawn } from "node:child_process";
import path from "node:path";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PanelProgress, PipelineRunStatus, PipelineCostSummary, PipelineStepUsage, PipelineUsageLineItem } from "@/lib/content-pipeline/constants";
import type { PipelineLiveState, PipelineResearchJson, PipelineResearchCountRange, PipelineResearchEpisodeOutline, PipelineStorylineBible } from "@/types/creator-admin";
import { getPipelineSeriesDetail } from "@/lib/services/pipeline-panels-repository";

export const PIPELINE_ANTHROPIC_MODEL = "claude-sonnet-4-5";

const STALE_RUN_MS = 15 * 60 * 1000;

export type { PanelProgress, PipelineRunStatus, PipelineCostSummary, PipelineStepUsage } from "@/lib/content-pipeline/constants";
export {
  PIPELINE_CATEGORIES,
  PIPELINE_STEP_ORDER,
} from "@/lib/content-pipeline/constants";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function ensurePipelineSession(): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const sessionId =
    process.env.PIPELINE_OWNER_SESSION_ID?.trim() || "pipeline-system";
  const { error } = await supabase.from("user_sessions").upsert(
    { session_id: sessionId },
    { onConflict: "session_id", ignoreDuplicates: true }
  );
  if (error) throw new Error(`Failed to ensure pipeline session: ${error.message}`);
}

export async function createPipelineSeries(
  topic: string,
  category: string
): Promise<{ seriesId: string; slug: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  await ensurePipelineSession();

  const sessionId =
    process.env.PIPELINE_OWNER_SESSION_ID?.trim() || "pipeline-system";
  const baseSlug = slugify(topic);
  const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;

  const { data, error } = await supabase
    .from("series")
    .insert({
      owner_session_id: sessionId,
      title: topic.trim(),
      slug,
      category,
      genre: category,
      cover_gradient: "from-[#07111F] via-[#1e3a5f] to-[#2F80ED]",
      source: "admin",
      status: "draft",
      is_public: false,
      legacy_pages: { chapters: [], pages: [] },
    })
    .select("id, slug")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create pipeline series");
  }

  return { seriesId: data.id as string, slug: data.slug as string };
}

export async function clearStalePipelineRuns(
  seriesId: string,
  message = "Stopped — new pipeline run started"
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  await supabase
    .from("pipeline_runs")
    .update({
      status: "failed",
      error: message,
    })
    .eq("series_id", seriesId)
    .eq("status", "running");
}

const STOP_MESSAGE = "Stopped — creation cancelled";

/** Halt active pipeline runs and queue jobs (creator admin "Stop creation"). */
export async function stopPipelineCreation(options: {
  seriesId?: string;
  stopAll?: boolean;
} = {}): Promise<{ stoppedRuns: number; stoppedJobs: number }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  let runsQuery = supabase
    .from("pipeline_runs")
    .update({ status: "failed", error: STOP_MESSAGE })
    .eq("status", "running");

  if (options.seriesId && !options.stopAll) {
    runsQuery = runsQuery.eq("series_id", options.seriesId);
  }

  const { data: stoppedRuns, error: runsError } = await runsQuery.select("id");
  if (runsError) throw new Error(runsError.message);

  let queueQuery = supabase
    .from("pipeline_queue")
    .update({
      status: "cancelled",
      completed_at: new Date().toISOString(),
      error: STOP_MESSAGE,
    })
    .eq("status", "running");

  if (options.seriesId && !options.stopAll) {
    queueQuery = queueQuery.eq("series_id", options.seriesId);
  }

  const { data: stoppedJobs, error: queueError } = await queueQuery.select("id");
  if (queueError) throw new Error(queueError.message);

  return {
    stoppedRuns: stoppedRuns?.length ?? 0,
    stoppedJobs: stoppedJobs?.length ?? 0,
  };
}

function buildPipelineSpawnEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    PIPELINE_ANTHROPIC_MODEL,
    ANTHROPIC_MODEL: PIPELINE_ANTHROPIC_MODEL,
  };
}

const FULL_PIPELINE_STEPS = new Set(["bible", "architect", "script"]);

export function isFullPipelineSeries(status: PipelineRunStatus): boolean {
  if (status.panelProgress.total > 1) return true;
  return (
    status.completedSteps.some((step) => FULL_PIPELINE_STEPS.has(step)) ||
    status.runs.some((run) => FULL_PIPELINE_STEPS.has(run.step))
  );
}

export function spawnContentPipeline(options: {
  topic: string;
  category: string;
  seriesId: string;
  lean?: boolean;
  resume?: boolean;
  maxPanels?: number;
}): void {
  const script = path.join(process.cwd(), "pipeline", "run.ts");
  const args = [
    "tsx",
    script,
    "--series-id",
    options.seriesId,
    "--topic",
    options.topic,
    "--category",
    options.category,
  ];

  if (options.resume !== false) {
    args.push("--resume");
  }

  if (options.lean !== false) {
    args.push("--lean");
  } else {
    args.push("--full");
  }

  if (options.maxPanels) {
    args.push("--max-panels", String(options.maxPanels));
  }

  const child = spawn("npx", args, {
    cwd: process.cwd(),
    detached: true,
    stdio: "ignore",
    env: buildPipelineSpawnEnv(),
  });
  child.unref();
}

export async function resumePipelineSeries(seriesId: string): Promise<void> {
  const series = await getSeriesBasics(seriesId);
  if (!series) throw new Error("Series not found");

  const status = await getPipelineRunStatus(seriesId);
  const isFull = isFullPipelineSeries(status);

  await clearStalePipelineRuns(seriesId);
  spawnContentPipeline({
    seriesId: series.id,
    topic: series.title,
    category: series.category ?? "business",
    lean: !isFull,
    resume: true,
    maxPanels: isFull ? await getMaxPanelsForSeries(seriesId) : undefined,
  });
}

async function getMaxPanelsForSeries(seriesId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: job } = await supabase
      .from("pipeline_queue")
      .select("max_panels")
      .eq("series_id", seriesId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (job?.max_panels) {
      return Math.min(40, Math.max(5, Number(job.max_panels) || 36));
    }
  }

  const progress = await getPanelProgress(seriesId);
  if (progress.total > 0) return progress.total;

  return 36;
}

/** Wipe pipeline artifacts so a full rerun uses the latest pipeline logic. */
export async function resetPipelineSeries(seriesId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  await clearStalePipelineRuns(seriesId);

  const { error: runsError } = await supabase
    .from("pipeline_runs")
    .delete()
    .eq("series_id", seriesId);
  if (runsError) throw new Error(runsError.message);

  const { error: episodesError } = await supabase
    .from("episodes")
    .delete()
    .eq("series_id", seriesId);
  if (episodesError) throw new Error(episodesError.message);

  const { error: seriesError } = await supabase
    .from("series")
    .update({
      research_json: null,
      storyline_bible_json: null,
      cover_art_url: null,
    })
    .eq("id", seriesId);
  if (seriesError) throw new Error(seriesError.message);
}

export async function restartPipelineSeries(seriesId: string): Promise<void> {
  const series = await getSeriesBasics(seriesId);
  if (!series) throw new Error("Series not found");

  const maxPanels = await getMaxPanelsForSeries(seriesId);
  await resetPipelineSeries(seriesId);

  spawnContentPipeline({
    seriesId: series.id,
    topic: series.title,
    category: series.category ?? "business",
    lean: false,
    resume: false,
    maxPanels,
  });
}

async function getPanelProgress(seriesId: string): Promise<PanelProgress> {
  const supabase = getSupabaseAdmin();
  const empty: PanelProgress = {
    total: 0,
    scripted: 0,
    withPrompt: 0,
    withImage: 0,
    generating: 0,
    safetyViolation: 0,
    safetyViolationPanel: null,
  };
  if (!supabase) return empty;

  const { data: episode } = await supabase
    .from("episodes")
    .select("id")
    .eq("series_id", seriesId)
    .eq("episode_number", 1)
    .maybeSingle();

  if (!episode?.id) return empty;

  const { data: panels } = await supabase
    .from("panels")
    .select("status, image_prompt, image_url, panel_number")
    .eq("episode_id", episode.id);

  const rows = panels ?? [];
  const violating = rows.find((p) => p.status === "safety_violation");
  return {
    total: rows.length,
    scripted: rows.filter((p) =>
      [
        "scripted",
        "prompt_ready",
        "generating",
        "safety_violation",
        "complete",
        "approved",
        "needs_fix",
      ].includes(p.status as string)
    ).length,
    withPrompt: rows.filter((p) => p.image_prompt).length,
    withImage: rows.filter((p) => p.image_url).length,
    generating: rows.filter((p) => p.status === "generating").length,
    safetyViolation: rows.filter((p) => p.status === "safety_violation").length,
    safetyViolationPanel: violating
      ? (violating.panel_number as number)
      : null,
  };
}

export async function getPipelineRunStatus(
  seriesId: string
): Promise<PipelineRunStatus> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Database not configured");
  }

  const { data, error } = await supabase
    .from("pipeline_runs")
    .select("id, step, status, error, metadata, created_at, updated_at")
    .eq("series_id", seriesId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const runs = (data ?? []).map((row) => ({
    id: row.id as string,
    step: row.step as string,
    status: row.status as string,
    error: (row.error as string | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    usage: parseRunUsage(row.metadata),
  }));

  const costs = aggregatePipelineCosts(runs);

  const now = Date.now();
  const staleRunningIds = runs
    .filter(
      (r) =>
        r.status === "running" &&
        now - new Date(r.updated_at).getTime() > STALE_RUN_MS
    )
    .map((r) => r.id);

  if (staleRunningIds.length > 0) {
    await supabase
      .from("pipeline_runs")
      .update({
        status: "failed",
        error: "Timed out — click Hervat to retry",
      })
      .in("id", staleRunningIds);

    for (const run of runs) {
      if (staleRunningIds.includes(run.id)) {
        run.status = "failed";
        run.error = "Timed out — click Hervat to retry";
      }
    }
  }

  const runningRun = [...runs]
    .reverse()
    .find((r) => r.status === "running");
  const latestRun = runs.length ? runs[runs.length - 1] : null;
  const lastError =
    runningRun || latestRun?.status !== "failed" ? null : latestRun.error;
  const completedSteps = [
    ...new Set(
      runs.filter((r) => r.status === "completed").map((r) => r.step)
    ),
  ];

  const panelProgress = await getPanelProgress(seriesId);

  return {
    seriesId,
    running: Boolean(runningRun),
    currentStep: runningRun?.step ?? null,
    lastError,
    completedSteps,
    panelProgress,
    runs,
    costs,
  };
}

function parseRunUsage(metadata: unknown): PipelineStepUsage | null {
  if (!metadata || typeof metadata !== "object") return null;
  const raw = metadata as Record<string, unknown>;
  const usage = raw.usage;
  if (!usage || typeof usage !== "object") return null;
  const u = usage as Record<string, unknown>;
  if (!Array.isArray(u.items) || typeof u.total_usd !== "number") return null;

  const items = u.items
    .filter((item): item is PipelineUsageLineItem => {
      if (!item || typeof item !== "object") return false;
      const row = item as Record<string, unknown>;
      return (
        typeof row.provider === "string" &&
        typeof row.operation === "string" &&
        typeof row.cost_usd === "number"
      );
    })
    .map((item) => item as PipelineUsageLineItem);

  return {
    items,
    total_usd: u.total_usd as number,
    recorded_at: typeof u.recorded_at === "string" ? u.recorded_at : undefined,
  };
}

function aggregatePipelineCosts(
  runs: Array<{ step: string; usage?: PipelineStepUsage | null }>
): PipelineCostSummary {
  const byStep: PipelineCostSummary["by_step"] = [];
  let total = 0;

  for (const run of runs) {
    if (!run.usage?.items.length) continue;
    byStep.push({ step: run.step, usage: run.usage });
    total += run.usage.total_usd;
  }

  return {
    by_step: byStep,
    total_usd: Math.round(total * 1_000_000) / 1_000_000,
  };
}

function parseResearchJson(value: unknown): PipelineResearchJson | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  return {
    topic: typeof raw.topic === "string" ? raw.topic : "",
    facts: Array.isArray(raw.facts)
      ? raw.facts.filter((f): f is { fact: string; source_hint?: string } =>
          typeof f === "object" && f !== null && typeof (f as { fact?: string }).fact === "string"
        ).map((f) => ({
          fact: f.fact,
          source_hint: f.source_hint,
          category: (f as { category?: string }).category,
        }))
      : [],
    timeline: Array.isArray(raw.timeline) ? (raw.timeline as PipelineResearchJson["timeline"]) : [],
    characters: Array.isArray(raw.characters) ? (raw.characters as PipelineResearchJson["characters"]) : [],
    quotes: Array.isArray(raw.quotes) ? (raw.quotes as PipelineResearchJson["quotes"]) : [],
    researched_at: typeof raw.researched_at === "string" ? raw.researched_at : undefined,
    web_search_query:
      typeof raw.web_search_query === "string" ? raw.web_search_query : undefined,
    web_search_queries: Array.isArray(raw.web_search_queries)
      ? raw.web_search_queries.filter((q): q is string => typeof q === "string")
      : undefined,
    web_search_raw:
      typeof raw.web_search_raw === "string" ? raw.web_search_raw : undefined,
    storyline: parseStoryline(raw.storyline),
    series_potential: parseSeriesPotential(raw.series_potential),
  };
}

function parseStoryline(value: unknown): PipelineResearchJson["storyline"] {
  if (!value || typeof value !== "object") return undefined;
  const s = value as Record<string, unknown>;
  if (typeof s.logline !== "string") return undefined;
  return {
    logline: s.logline,
    narrative_arc: typeof s.narrative_arc === "string" ? s.narrative_arc : "",
    opening_hook: typeof s.opening_hook === "string" ? s.opening_hook : "",
    themes: Array.isArray(s.themes)
      ? s.themes.filter((t): t is string => typeof t === "string")
      : [],
    tone: typeof s.tone === "string" ? s.tone : "",
  };
}

function parseCountRange(value: unknown): PipelineResearchCountRange | undefined {
  if (!value || typeof value !== "object") return undefined;
  const r = value as Record<string, unknown>;
  if (typeof r.recommended !== "number") return undefined;
  return {
    min: typeof r.min === "number" ? r.min : r.recommended,
    max: typeof r.max === "number" ? r.max : r.recommended,
    recommended: r.recommended,
  };
}

function parseSeriesPotential(
  value: unknown
): PipelineResearchJson["series_potential"] {
  if (!value || typeof value !== "object") return undefined;
  const sp = value as Record<string, unknown>;
  const episodes = parseCountRange(sp.estimated_episodes);
  const chapters = parseCountRange(sp.estimated_chapters);
  if (!episodes || !chapters) return undefined;

  const panels =
    sp.estimated_panels && typeof sp.estimated_panels === "object"
      ? (sp.estimated_panels as { min?: number; max?: number })
      : {};
  const images =
    sp.estimated_images && typeof sp.estimated_images === "object"
      ? (sp.estimated_images as { min?: number; max?: number })
      : {};

  return {
    estimated_episodes: episodes,
    estimated_chapters: chapters,
    estimated_panels: {
      min: typeof panels.min === "number" ? panels.min : 0,
      max: typeof panels.max === "number" ? panels.max : 0,
    },
    estimated_images: {
      min: typeof images.min === "number" ? images.min : 0,
      max: typeof images.max === "number" ? images.max : 0,
    },
    panels_per_chapter:
      typeof sp.panels_per_chapter === "number" ? sp.panels_per_chapter : 35,
    images_per_panel:
      typeof sp.images_per_panel === "number" ? sp.images_per_panel : 5,
    reasoning: typeof sp.reasoning === "string" ? sp.reasoning : "",
    episode_outlines: Array.isArray(sp.episode_outlines)
      ? sp.episode_outlines
          .filter(
            (e): e is PipelineResearchEpisodeOutline =>
              typeof e === "object" &&
              e !== null &&
              typeof (e as { title?: string }).title === "string"
          )
          .map((e) => ({
            episode_number: (e as PipelineResearchEpisodeOutline).episode_number ?? 0,
            title: (e as PipelineResearchEpisodeOutline).title,
            logline: (e as PipelineResearchEpisodeOutline).logline ?? "",
            focus: (e as PipelineResearchEpisodeOutline).focus ?? "",
            depth: (e as PipelineResearchEpisodeOutline).depth ?? "mixed",
            suggested_chapters:
              (e as PipelineResearchEpisodeOutline).suggested_chapters ?? 1,
            why_compelling:
              (e as PipelineResearchEpisodeOutline).why_compelling ?? "",
          }))
      : [],
  };
}

function parseStorylineBible(value: unknown): PipelineStorylineBible | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.storyline_bible !== "string" || !Array.isArray(raw.episodes)) {
    return null;
  }
  return {
    series_title: typeof raw.series_title === "string" ? raw.series_title : "",
    total_episodes:
      typeof raw.total_episodes === "number" ? raw.total_episodes : raw.episodes.length,
    total_panels_estimated:
      typeof raw.total_panels_estimated === "number" ? raw.total_panels_estimated : 0,
    storyline_bible: raw.storyline_bible,
    episodes: raw.episodes
      .filter(
        (e): e is PipelineStorylineBible["episodes"][0] =>
          typeof e === "object" &&
          e !== null &&
          typeof (e as { title?: string }).title === "string"
      )
      .map((e) => ({
        episode_number: (e as PipelineStorylineBible["episodes"][0]).episode_number ?? 0,
        title: (e as PipelineStorylineBible["episodes"][0]).title,
        time_period: (e as PipelineStorylineBible["episodes"][0]).time_period ?? "",
        narrative_arc: (e as PipelineStorylineBible["episodes"][0]).narrative_arc ?? "",
        story_beats: Array.isArray((e as PipelineStorylineBible["episodes"][0]).story_beats)
          ? (e as PipelineStorylineBible["episodes"][0]).story_beats
          : [],
        panel_count_estimated:
          (e as PipelineStorylineBible["episodes"][0]).panel_count_estimated ?? 0,
        ugc_hook: (e as PipelineStorylineBible["episodes"][0]).ugc_hook ?? "",
      })),
  };
}

export async function getPipelineLiveState(
  seriesId: string
): Promise<PipelineLiveState | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: series } = await supabase
    .from("series")
    .select("id, title, category, research_json, storyline_bible_json")
    .eq("id", seriesId)
    .maybeSingle();

  if (!series) return null;

  const status = await getPipelineRunStatus(seriesId);
  const detail = await getPipelineSeriesDetail(seriesId);

  const panels =
    detail?.episodes.flatMap((ep) =>
      ep.panels.map((p) => ({
        id: p.id,
        panel_number: p.panel_number,
        visual_description: p.visual_description,
        caption: p.caption,
        dialogue: p.dialogue,
        image_prompt: p.image_prompt,
        image_url: p.image_url,
        status: p.status,
      }))
    ) ?? [];

  return {
    status,
    series: {
      id: series.id as string,
      title: series.title as string,
      category: (series.category as string | null) ?? null,
    },
    research: parseResearchJson(series.research_json),
    storylineBible: parseStorylineBible(series.storyline_bible_json),
    panels,
    costs: status.costs?.by_step.length ? status.costs : null,
  };
}

export async function getSeriesBasics(seriesId: string): Promise<{
  id: string;
  title: string;
  category: string | null;
} | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from("series")
    .select("id, title, category")
    .eq("id", seriesId)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id as string,
    title: data.title as string,
    category: (data.category as string | null) ?? null,
  };
}
