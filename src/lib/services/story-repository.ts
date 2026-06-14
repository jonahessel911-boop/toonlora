import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { EpisodeRow, SeriesRow } from "@/lib/supabase/types";
import type { Story, StoryEpisode } from "@/types/story";

function rowToStory(series: SeriesRow, episodeRows: EpisodeRow[]): Story {
  const episodes: StoryEpisode[] = episodeRows
    .sort((a, b) => a.episode_number - b.episode_number)
    .map((ep) => ({
      id: ep.id,
      episodeNumber: ep.episode_number,
      title: ep.title,
      script: ep.script as unknown as StoryEpisode["script"],
      panelBreakdown: ep.panel_breakdown as unknown as StoryEpisode["panelBreakdown"],
      imagePrompt: ep.image_prompt as unknown as StoryEpisode["imagePrompt"],
      comicPage: ep.comic_page as unknown as StoryEpisode["comicPage"],
      textOverlay: ep.text_overlay as unknown as StoryEpisode["textOverlay"],
    }));

  return {
    id: series.id,
    title: series.title,
    genre: series.genre,
    coverGradient: series.cover_gradient,
    chapters: (series.legacy_pages?.chapters ?? []) as Story["chapters"],
    pages: (series.legacy_pages?.pages ?? []) as Story["pages"],
    createdAt: series.created_at,
    mainCharacter: series.main_character ?? undefined,
    loveInterest: series.love_interest ?? undefined,
    prompt: series.story_idea ?? undefined,
    userInput: series.user_input as unknown as Story["userInput"],
    storyBible: series.story_bible as unknown as Story["storyBible"],
    continuityMemory: series.continuity_memory as unknown as Story["continuityMemory"],
    pipelineResult: series.pipeline_result as unknown as Story["pipelineResult"],
    episodes,
  };
}

async function upsertEpisodes(
  seriesId: string,
  episodes: StoryEpisode[]
): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase || episodes.length === 0) return;

  for (const ep of episodes) {
    const { error } = await supabase.from("episodes").upsert(
      {
        id: ep.id.startsWith("story-") ? undefined : ep.id,
        series_id: seriesId,
        episode_number: ep.episodeNumber,
        title: ep.title,
        script: ep.script as unknown as Record<string, unknown>,
        panel_breakdown: ep.panelBreakdown as unknown as Record<string, unknown>,
        image_prompt: ep.imagePrompt as unknown as Record<string, unknown>,
        comic_page: ep.comicPage as unknown as Record<string, unknown>,
        text_overlay: ep.textOverlay as unknown as Record<string, unknown>,
      },
      { onConflict: "series_id,episode_number" }
    );
    if (error) throw new Error(error.message);
  }
}

export async function ensureSession(sessionId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  const { error } = await supabase.from("user_sessions").upsert(
    { session_id: sessionId },
    { onConflict: "session_id", ignoreDuplicates: true }
  );
  if (error) throw new Error(error.message);
}

export async function saveStoryToDb(
  story: Story,
  sessionId: string
): Promise<Story> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  await ensureSession(sessionId);

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      story.id
    );

  const seriesPayload = {
    owner_session_id: sessionId,
    title: story.title,
    genre: String(story.genre),
    cover_gradient: story.coverGradient,
    main_character: story.mainCharacter ?? null,
    love_interest: story.loveInterest ?? null,
    story_idea: story.prompt ?? null,
    user_input: (story.userInput ?? null) as Record<string, unknown> | null,
    story_bible: (story.storyBible ?? null) as Record<string, unknown> | null,
    continuity_memory: (story.continuityMemory ?? null) as Record<
      string,
      unknown
    > | null,
    pipeline_result: (story.pipelineResult ?? null) as Record<
      string,
      unknown
    > | null,
    legacy_pages: {
      chapters: story.chapters,
      pages: story.pages,
    },
    is_public: true,
  };

  let seriesId = story.id;

  if (isUuid) {
    const { data: series, error: seriesError } = await supabase
      .from("series")
      .upsert({ ...seriesPayload, id: story.id }, { onConflict: "id" })
      .select()
      .single();

    if (seriesError || !series) {
      throw new Error(seriesError?.message ?? "Failed to save series");
    }
    seriesId = series.id;
  } else {
    const { data: series, error: seriesError } = await supabase
      .from("series")
      .insert(seriesPayload)
      .select()
      .single();

    if (seriesError || !series) {
      throw new Error(seriesError?.message ?? "Failed to insert series");
    }
    seriesId = series.id;
  }

  if (story.episodes?.length) {
    await upsertEpisodes(seriesId, story.episodes);
  }

  return getStoryFromDb(seriesId) as Promise<Story>;
}

export async function getStoryFromDb(id: string): Promise<Story | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data: series, error } = await supabase
    .from("series")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !series) return null;

  const { data: episodes } = await supabase
    .from("episodes")
    .select("*")
    .eq("series_id", id)
    .order("episode_number", { ascending: true });

  return rowToStory(series as SeriesRow, (episodes ?? []) as EpisodeRow[]);
}

export async function listStoriesFromDb(sessionId: string): Promise<Story[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  await ensureSession(sessionId);

  const { data: seriesList, error } = await supabase
    .from("series")
    .select("*")
    .eq("owner_session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error || !seriesList?.length) return [];

  const stories: Story[] = [];
  for (const series of seriesList) {
    const { data: episodes } = await supabase
      .from("episodes")
      .select("*")
      .eq("series_id", series.id)
      .order("episode_number", { ascending: true });

    stories.push(
      rowToStory(series as SeriesRow, (episodes ?? []) as EpisodeRow[])
    );
  }

  return stories;
}

export async function getCreditsFromDb(sessionId: string): Promise<{
  credits: number;
  freeUsed: boolean;
}> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { credits: 10, freeUsed: false };

  await ensureSession(sessionId);

  const { data } = await supabase
    .from("user_sessions")
    .select("credits, free_used")
    .eq("session_id", sessionId)
    .maybeSingle();

  return {
    credits: data?.credits ?? 10,
    freeUsed: data?.free_used ?? false,
  };
}

export async function consumeCreditInDb(sessionId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  const { credits, freeUsed } = await getCreditsFromDb(sessionId);

  if (!freeUsed) {
    await supabase
      .from("user_sessions")
      .update({ free_used: true })
      .eq("session_id", sessionId);
    return true;
  }

  if (credits <= 0) return false;

  await supabase
    .from("user_sessions")
    .update({ credits: credits - 1 })
    .eq("session_id", sessionId);

  return true;
}

export async function addCreditsInDb(
  sessionId: string,
  amount: number
): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;

  const { credits } = await getCreditsFromDb(sessionId);
  const next = credits + amount;

  await supabase
    .from("user_sessions")
    .update({ credits: next })
    .eq("session_id", sessionId);

  return next;
}
