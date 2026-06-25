import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  CreatorAdminPanel,
  CreatorAdminSeriesDetail,
  CreatorAdminSeriesSummary,
  PanelImageReview,
} from "@/types/creator-admin";

function parseIssues(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function rowToReview(row: Record<string, unknown>): PanelImageReview {
  return {
    id: row.id as string,
    panel_id: row.panel_id as string,
    review_type: row.review_type as "ai" | "human",
    score: typeof row.score === "number" ? row.score : null,
    passed: typeof row.passed === "boolean" ? row.passed : null,
    issues: parseIssues(row.issues),
    summary: (row.summary as string | null) ?? null,
    prompt_fix: (row.prompt_fix as string | null) ?? null,
    human_rating: (row.human_rating as "approve" | "reject" | null) ?? null,
    feedback_note: (row.feedback_note as string | null) ?? null,
    prompt_used: (row.prompt_used as string | null) ?? null,
    image_url: (row.image_url as string | null) ?? null,
    created_at: row.created_at as string,
  };
}

async function latestReviewsByPanelIds(
  panelIds: string[]
): Promise<Map<string, { ai: PanelImageReview | null; human: PanelImageReview | null }>> {
  const map = new Map<
    string,
    { ai: PanelImageReview | null; human: PanelImageReview | null }
  >();
  for (const id of panelIds) {
    map.set(id, { ai: null, human: null });
  }
  if (!panelIds.length) return map;

  const supabase = getSupabaseAdmin();
  if (!supabase) return map;

  const { data } = await supabase
    .from("panel_image_reviews")
    .select("*")
    .in("panel_id", panelIds)
    .order("created_at", { ascending: false });

  for (const row of data ?? []) {
    const entry = map.get(row.panel_id as string);
    if (!entry) continue;
    const review = rowToReview(row as Record<string, unknown>);
    if (review.review_type === "ai" && !entry.ai) entry.ai = review;
    if (review.review_type === "human" && !entry.human) entry.human = review;
  }

  return map;
}

function panelToAdminPanel(
  panel: Record<string, unknown>,
  episode: { id: string; episode_number: number; title: string },
  reviews: { ai: PanelImageReview | null; human: PanelImageReview | null }
): CreatorAdminPanel {
  return {
    id: panel.id as string,
    episode_id: episode.id,
    episode_number: episode.episode_number,
    episode_title: episode.title,
    panel_number: panel.panel_number as number,
    chapter_number: panel.chapter_number as number,
    visual_description: (panel.visual_description as string | null) ?? null,
    caption: (panel.caption as string | null) ?? null,
    dialogue: (panel.dialogue as string | null) ?? null,
    image_prompt: (panel.image_prompt as string | null) ?? null,
    image_url: (panel.image_url as string | null) ?? null,
    status: panel.status as string,
    latest_ai_review: reviews.ai,
    latest_human_review: reviews.human,
  };
}

export async function listPipelineSeriesAdmin(): Promise<CreatorAdminSeriesSummary[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data: seriesRows, error } = await supabase
    .from("series")
    .select("id, title, slug, category, status, display_title, cover_art_url, created_at")
    .not("slug", "is", null)
    .order("created_at", { ascending: false });

  if (error || !seriesRows?.length) return [];

  const summaries: CreatorAdminSeriesSummary[] = [];

  for (const series of seriesRows) {
    const { data: episodes } = await supabase
      .from("episodes")
      .select("id")
      .eq("series_id", series.id);

    const episodeIds = (episodes ?? []).map((ep) => ep.id as string);
    if (!episodeIds.length) {
      summaries.push({
        id: series.id as string,
        title: series.title as string,
        slug: (series.slug as string | null) ?? null,
        category: (series.category as string | null) ?? null,
        status: series.status as string,
        display_title: (series.display_title as string | null) ?? null,
        cover_art_url: (series.cover_art_url as string | null) ?? null,
        panel_count: 0,
        with_image_count: 0,
        approved_count: 0,
        needs_review_count: 0,
        created_at: series.created_at as string,
      });
      continue;
    }

    const { data: panels } = await supabase
      .from("panels")
      .select("id, image_url")
      .in("episode_id", episodeIds);

    const panelRows = panels ?? [];
    const panelIds = panelRows.map((p) => p.id as string);
    const reviewMap = await latestReviewsByPanelIds(panelIds);

    let withImage = 0;
    let approved = 0;
    let needsReview = 0;

    for (const panel of panelRows) {
      if (panel.image_url) withImage += 1;
      const reviews = reviewMap.get(panel.id as string);
      if (reviews?.human?.human_rating === "approve") {
        approved += 1;
      } else if (panel.image_url) {
        needsReview += 1;
      }
    }

    summaries.push({
      id: series.id as string,
      title: series.title as string,
      slug: (series.slug as string | null) ?? null,
      category: (series.category as string | null) ?? null,
      status: series.status as string,
      display_title: (series.display_title as string | null) ?? null,
      cover_art_url: (series.cover_art_url as string | null) ?? null,
      panel_count: panelRows.length,
      with_image_count: withImage,
      approved_count: approved,
      needs_review_count: needsReview,
      created_at: series.created_at as string,
    });
  }

  return summaries;
}

export async function getPipelineSeriesDetail(
  seriesId: string
): Promise<CreatorAdminSeriesDetail | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: series, error } = await supabase
    .from("series")
    .select("id, title, slug, category, status, display_title, cover_art_url, cover_image_prompt")
    .eq("id", seriesId)
    .maybeSingle();

  if (error || !series) return null;

  const { data: episodes } = await supabase
    .from("episodes")
    .select("id, episode_number, title")
    .eq("series_id", seriesId)
    .order("episode_number", { ascending: true });

  const episodeList = episodes ?? [];
  const episodeIds = episodeList.map((ep) => ep.id as string);

  const { data: panelRows } = episodeIds.length
    ? await supabase
        .from("panels")
        .select("*")
        .in("episode_id", episodeIds)
        .order("panel_number", { ascending: true })
    : { data: [] };

  const panelIds = (panelRows ?? []).map((p) => p.id as string);
  const reviewMap = await latestReviewsByPanelIds(panelIds);

  const panelsByEpisode = new Map<string, CreatorAdminPanel[]>();
  for (const ep of episodeList) {
    panelsByEpisode.set(ep.id as string, []);
  }

  for (const panel of panelRows ?? []) {
    const episode = episodeList.find((ep) => ep.id === panel.episode_id);
    if (!episode) continue;
    const reviews = reviewMap.get(panel.id as string) ?? { ai: null, human: null };
    const adminPanel = panelToAdminPanel(
      panel as Record<string, unknown>,
      {
        id: episode.id as string,
        episode_number: episode.episode_number as number,
        title: episode.title as string,
      },
      reviews
    );
    panelsByEpisode.get(episode.id as string)?.push(adminPanel);
  }

  return {
    id: series.id as string,
    title: series.title as string,
    display_title: (series.display_title as string | null) ?? null,
    cover_art_url: (series.cover_art_url as string | null) ?? null,
    cover_image_prompt: (series.cover_image_prompt as string | null) ?? null,
    slug: (series.slug as string | null) ?? null,
    category: (series.category as string | null) ?? null,
    status: series.status as string,
    episodes: episodeList.map((ep) => ({
      id: ep.id as string,
      episode_number: ep.episode_number as number,
      title: ep.title as string,
      panels: panelsByEpisode.get(ep.id as string) ?? [],
    })),
  };
}

export async function getPanelById(panelId: string): Promise<CreatorAdminPanel | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: panel } = await supabase
    .from("panels")
    .select("*")
    .eq("id", panelId)
    .maybeSingle();

  if (!panel) return null;

  const { data: episode } = await supabase
    .from("episodes")
    .select("id, episode_number, title, series_id")
    .eq("id", panel.episode_id)
    .maybeSingle();

  if (!episode) return null;

  const reviewMap = await latestReviewsByPanelIds([panelId]);
  const reviews = reviewMap.get(panelId) ?? { ai: null, human: null };

  return panelToAdminPanel(
    panel as Record<string, unknown>,
    {
      id: episode.id as string,
      episode_number: episode.episode_number as number,
      title: episode.title as string,
    },
    reviews
  );
}

export async function getPanelContext(panelId: string): Promise<{
  panel: CreatorAdminPanel;
  seriesId: string;
  seriesTitle: string;
  category: string | null;
} | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: panel } = await supabase
    .from("panels")
    .select("*")
    .eq("id", panelId)
    .maybeSingle();

  if (!panel) return null;

  const { data: episode } = await supabase
    .from("episodes")
    .select("id, episode_number, title, series_id")
    .eq("id", panel.episode_id)
    .maybeSingle();

  if (!episode) return null;

  const { data: series } = await supabase
    .from("series")
    .select("id, title, category")
    .eq("id", episode.series_id)
    .maybeSingle();

  if (!series) return null;

  const reviewMap = await latestReviewsByPanelIds([panelId]);
  const reviews = reviewMap.get(panelId) ?? { ai: null, human: null };

  return {
    panel: panelToAdminPanel(
      panel as Record<string, unknown>,
      {
        id: episode.id as string,
        episode_number: episode.episode_number as number,
        title: episode.title as string,
      },
      reviews
    ),
    seriesId: series.id as string,
    seriesTitle: series.title as string,
    category: (series.category as string | null) ?? null,
  };
}

export async function updatePanelFields(
  panelId: string,
  patch: {
    image_prompt?: string;
    visual_description?: string;
    status?: string;
    image_url?: string;
  }
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const { error } = await supabase.from("panels").update(patch).eq("id", panelId);
  if (error) throw new Error(error.message);
}

export async function insertPanelReview(
  review: Omit<PanelImageReview, "id" | "created_at">
): Promise<PanelImageReview> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const { data, error } = await supabase
    .from("panel_image_reviews")
    .insert({
      panel_id: review.panel_id,
      review_type: review.review_type,
      score: review.score,
      passed: review.passed,
      issues: review.issues,
      summary: review.summary,
      prompt_fix: review.prompt_fix,
      human_rating: review.human_rating,
      feedback_note: review.feedback_note,
      prompt_used: review.prompt_used,
      image_url: review.image_url,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save review");
  }

  return rowToReview(data as Record<string, unknown>);
}

export async function listApprovedPromptExamples(
  category: string | null,
  limit = 5
): Promise<Array<{ image_prompt: string; issues: string[] }>> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  let query = supabase
    .from("panel_image_reviews")
    .select("prompt_used, issues, panel_id")
    .eq("review_type", "human")
    .eq("human_rating", "approve")
    .not("prompt_used", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit * 3);

  const { data } = await query;
  if (!data?.length) return [];

  const examples: Array<{ image_prompt: string; issues: string[] }> = [];
  const seen = new Set<string>();

  for (const row of data) {
    const prompt = row.prompt_used as string;
    if (!prompt || seen.has(prompt)) continue;
    seen.add(prompt);
    examples.push({
      image_prompt: prompt,
      issues: parseIssues(row.issues),
    });
    if (examples.length >= limit) break;
  }

  void category;
  return examples;
}

export async function listCommonIssues(limit = 10): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  const { data } = await supabase
    .from("panel_image_reviews")
    .select("issues")
    .eq("review_type", "ai")
    .eq("passed", false)
    .order("created_at", { ascending: false })
    .limit(100);

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    for (const issue of parseIssues(row.issues)) {
      const key = issue.toLowerCase().trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([issue]) => issue);
}
