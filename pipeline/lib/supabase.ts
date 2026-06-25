import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPipelineOwnerSessionId, requireEnv } from "./config.js";
import type {
  EpisodeRow,
  PanelRow,
  PipelineStep,
  ResearchJson,
  SeriesRow,
  StorylineBible,
} from "./types.js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return client;
}

export async function ensurePipelineSession(): Promise<void> {
  const supabase = getSupabase();
  const sessionId = getPipelineOwnerSessionId();
  const { error } = await supabase.from("user_sessions").upsert(
    { session_id: sessionId },
    { onConflict: "session_id", ignoreDuplicates: true }
  );
  if (error) throw new Error(`Failed to ensure pipeline session: ${error.message}`);
}

export async function createSeriesRecord(params: {
  title: string;
  slug: string;
  category: string;
}): Promise<SeriesRow> {
  await ensurePipelineSession();
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("series")
    .insert({
      owner_session_id: getPipelineOwnerSessionId(),
      title: params.title,
      slug: params.slug,
      category: params.category,
      genre: params.category,
      cover_gradient: "from-[#07111F] via-[#1e3a5f] to-[#2F80ED]",
      source: "admin",
      status: "draft",
      is_public: false,
      legacy_pages: { chapters: [], pages: [] },
    })
    .select("id, title, slug, category, research_json, storyline_bible_json, status")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create series");
  }

  return data as SeriesRow;
}

export async function getSeries(seriesId: string): Promise<SeriesRow> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("series")
    .select("id, title, slug, category, research_json, storyline_bible_json, status")
    .eq("id", seriesId)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? `Series not found: ${seriesId}`);
  }

  return data as SeriesRow;
}

export async function saveResearchJson(
  seriesId: string,
  research: ResearchJson
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("series")
    .update({ research_json: research })
    .eq("id", seriesId);

  if (error) throw new Error(`Failed to save research_json: ${error.message}`);
}

export async function saveStorylineBible(
  seriesId: string,
  bible: StorylineBible
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("series")
    .update({ storyline_bible_json: bible })
    .eq("id", seriesId);

  if (error) throw new Error(`Failed to save storyline_bible_json: ${error.message}`);
}

export async function loadStorylineBible(seriesId: string): Promise<StorylineBible> {
  const series = await getSeries(seriesId);
  if (!series.storyline_bible_json) {
    throw new Error(
      `Series ${seriesId} has no storyline_bible_json — run bible step first`
    );
  }
  return series.storyline_bible_json;
}

const EMPTY_EPISODE_JSON = {
  script: { episode_number: 0, panels: [] },
  image_prompt: { panels: [] },
  comic_page: { artUrl: null },
  text_overlay: { panels: [] },
};

export async function upsertEpisodeStructure(params: {
  seriesId: string;
  episodeNumber: number;
  title: string;
  panelBreakdown: unknown;
}): Promise<EpisodeRow> {
  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from("episodes")
    .select("id")
    .eq("series_id", params.seriesId)
    .eq("episode_number", params.episodeNumber)
    .maybeSingle();

  const payload = {
    series_id: params.seriesId,
    episode_number: params.episodeNumber,
    title: params.title,
    panel_breakdown: params.panelBreakdown,
    ...EMPTY_EPISODE_JSON,
    script: {
      episode_number: params.episodeNumber,
      episode_title: params.title,
      panels: [],
    },
    image_prompt: { episode_number: params.episodeNumber, panels: [] },
    comic_page: { episode_number: params.episodeNumber, artUrl: null },
    text_overlay: { episode_number: params.episodeNumber, panels: [] },
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from("episodes")
      .update({
        title: params.title,
        panel_breakdown: params.panelBreakdown,
      })
      .eq("id", existing.id)
      .select("id, series_id, episode_number, title, panel_breakdown")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to update episode");
    }
    return data as EpisodeRow;
  }

  const { data, error } = await supabase
    .from("episodes")
    .insert(payload)
    .select("id, series_id, episode_number, title, panel_breakdown")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to insert episode");
  }

  return data as EpisodeRow;
}

export async function listEpisodes(seriesId: string): Promise<EpisodeRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("episodes")
    .select("id, series_id, episode_number, title, panel_breakdown")
    .eq("series_id", seriesId)
    .order("episode_number", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as EpisodeRow[];
}

export async function upsertPanelRow(
  panel: Omit<PanelRow, "id"> & {
    status?: string;
    chapter_title?: string | null;
    panel_type?: string | null;
    character_details?: string | null;
    background_props?: string | null;
    text_placement?: string | null;
    mood?: string | null;
    era_details?: string | null;
    script_json?: unknown;
  }
): Promise<PanelRow> {
  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from("panels")
    .select("id")
    .eq("episode_id", panel.episode_id)
    .eq("panel_number", panel.panel_number)
    .maybeSingle();

  const payload = {
    episode_id: panel.episode_id,
    panel_number: panel.panel_number,
    chapter_number: panel.chapter_number,
    chapter_title: panel.chapter_title ?? null,
    panel_type: panel.panel_type ?? null,
    visual_description: panel.visual_description,
    character_details: panel.character_details ?? null,
    background_props: panel.background_props ?? null,
    caption: panel.caption,
    dialogue: panel.dialogue,
    text_placement: panel.text_placement ?? null,
    mood: panel.mood ?? null,
    era_details: panel.era_details ?? null,
    script_json: panel.script_json ?? null,
    image_prompt: panel.image_prompt,
    image_url: panel.image_url,
    status: panel.status ?? "pending",
  };

  if (existing?.id) {
    const { data, error } = await supabase
      .from("panels")
      .update(payload)
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Panel update failed");
    return data as PanelRow;
  }

  const { data, error } = await supabase
    .from("panels")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Panel insert failed");
  return data as PanelRow;
}

export async function listPanelsForEpisode(episodeId: string): Promise<PanelRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("panels")
    .select("*")
    .eq("episode_id", episodeId)
    .order("panel_number", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as PanelRow[];
}

export async function updatePanel(
  panelId: string,
  patch: Partial<PanelRow>
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("panels").update(patch).eq("id", panelId);
  if (error) throw new Error(error.message);
}

export async function startPipelineRun(
  seriesId: string,
  step: PipelineStep
): Promise<string> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("pipeline_runs")
    .insert({ series_id: seriesId, step, status: "running" })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to start pipeline run");
  }
  return data.id as string;
}

export async function completePipelineRun(
  runId: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("pipeline_runs")
    .update({ status: "completed", metadata, error: null })
    .eq("id", runId);
  if (error) throw new Error(error.message);
}

export async function failPipelineRun(
  runId: string,
  errorMessage: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from("pipeline_runs")
    .update({ status: "failed", error: errorMessage, metadata })
    .eq("id", runId);
  if (error) throw new Error(error.message);
}

export async function getCompletedSteps(seriesId: string): Promise<PipelineStep[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("pipeline_runs")
    .select("step, status")
    .eq("series_id", seriesId)
    .eq("status", "completed")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const steps = new Set<PipelineStep>();
  for (const row of data ?? []) {
    if (row.step) steps.add(row.step as PipelineStep);
  }
  return [...steps];
}
