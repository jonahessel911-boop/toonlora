import {
  costAnthropicTokens,
  costOpenAIImageUsage,
  summarizeUsage,
  type ApiUsageLineItem,
  type ApiUsageSummary,
} from "@/lib/api-usage-cost";
import { persistPipelinePanelArt } from "@/lib/services/comic-art-storage";
import { getPipelineLiveState } from "@/lib/services/content-pipeline-service";
import {
  getPanelById,
  getPipelineSeriesDetail,
  updatePanelFields,
} from "@/lib/services/pipeline-panels-repository";
import { runPanelImageQa } from "@/lib/services/panel-image-qa";
import {
  getAnthropicClient,
  getAnthropicModel,
  hasAnthropicKey,
  requireAnthropicKey,
} from "@/lib/engine/anthropic-client";
import { hasOpenAIKey, requireOpenAIKey } from "@/lib/engine/openai-client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { CreatorAdminPanel } from "@/types/creator-admin";

const SCRIPT_SYSTEM = `You are the Toonlora script writer. Write ONE additional panel that continues an existing episode.

The panel must fit the series research, episode plan, storyline bible, and existing panels in this episode.

Return ONLY valid JSON:
{
  "panel_number": number,
  "chapter_number": number,
  "panel_type": "scene" | "title_card" | "stat_card" | "dialogue" | "transition",
  "visual_description": string,
  "character_details": string,
  "background_props": string,
  "caption_text": string,
  "dialogue_text": string | null,
  "text_placement": "top" | "bottom" | "split",
  "mood": string,
  "era_details": string
}

RULES:
- Continue the narrative from the last existing panel — do not repeat what was already shown
- visual_description: exact scene with camera angle (different from the previous panel)
- caption_text: max 25 words, include a specific fact, number, name, or date
- dialogue_text: max 10 words per bubble, or null
- Pick the next story beat from the episode plan / bible that has not been covered yet`;

const PROMPT_SYSTEM = `You are a senior comic art director for Toonlora. Write ONE complete image generation prompt for a single panel.

Follow this structure:
OPENING (2 sentences) — story context, tone, era
STYLE — include verbatim: "Ultra-realistic cinematic graphic novel style. Not cartoonish. Not anime. Not flat illustration. Realistic faces, realistic lighting, realistic clothing, realistic environments. Dark, gritty, high-end business thriller atmosphere. Detailed shadows, film lighting. Premium HBO / Netflix documentary drama feeling."
FORMAT — include verbatim: "Tall vertical portrait panel, mobile-first, single cinematic scene."
CHARACTER — specific age, hair, clothing, expression, body language
SCENE — location, lighting, camera angle, background props with readable details
TEXT — exact caption and dialogue from the script in cream/parchment narration boxes
IMPORTANT RULES — cinematic, realistic, no watermarks, no borders

The image_prompt must be 300–500 words, one flowing paragraph ready for gpt-image-1.

Return ONLY JSON: { "image_prompt": string }`;

interface ExtraPanelScript {
  panel_number: number;
  chapter_number: number;
  panel_type: string;
  visual_description: string;
  character_details: string;
  background_props: string;
  caption_text: string;
  dialogue_text: string | null;
  text_placement: string;
  mood: string;
  era_details: string;
}

function parseJsonFromModel<T>(raw: string): T {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Model returned invalid JSON");
  }
  return JSON.parse(trimmed.slice(start, end + 1)) as T;
}

async function callAnthropicJson<T>(params: {
  system: string;
  user: string;
  operation: string;
  maxTokens?: number;
}): Promise<{ result: T; usage: ApiUsageLineItem }> {
  requireAnthropicKey();
  const model = getAnthropicModel();
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model,
    max_tokens: params.maxTokens ?? 4096,
    system: params.system,
    messages: [{ role: "user", content: params.user }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  if (!text.trim()) {
    throw new Error("Claude returned empty response");
  }

  const usage = costAnthropicTokens(
    model,
    response.usage.input_tokens,
    response.usage.output_tokens,
    params.operation
  );

  return { result: parseJsonFromModel<T>(text), usage };
}

async function generatePanelImage(prompt: string): Promise<{
  url: string;
  usage: ApiUsageLineItem;
}> {
  requireOpenAIKey();

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1024x1536",
      quality: "high",
      n: 1,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Image generation failed: ${err}`);
  }

  const data = await response.json();
  const item = data.data?.[0];
  const url = item?.url as string | undefined;
  const b64 = item?.b64_json as string | undefined;
  const usage = costOpenAIImageUsage(data.usage ?? {});
  if (url) return { url, usage };
  if (b64) return { url: `data:image/png;base64,${b64}`, usage };
  throw new Error("Image model returned no image data");
}

export async function createExtraPanel(
  episodeId: string,
  options: {
    direction?: string;
    generateImage?: boolean;
    autoReview?: boolean;
  } = {}
): Promise<{
  panel: CreatorAdminPanel;
  usage: ApiUsageSummary;
}> {
  if (!hasAnthropicKey()) {
    throw new Error("ANTHROPIC_API_KEY is required to write panel scripts");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const { data: episode } = await supabase
    .from("episodes")
    .select("id, episode_number, title, series_id, panel_breakdown")
    .eq("id", episodeId)
    .maybeSingle();

  if (!episode) throw new Error("Episode not found");

  const live = await getPipelineLiveState(episode.series_id as string);
  if (!live?.research) {
    throw new Error(
      "Geen research gevonden — run eerst de pipeline research-stap voor deze series"
    );
  }

  const { data: existingPanels } = await supabase
    .from("panels")
    .select("*")
    .eq("episode_id", episodeId)
    .order("panel_number", { ascending: true });

  const panels = existingPanels ?? [];
  const nextPanelNumber =
    panels.length > 0
      ? Math.max(...panels.map((p) => p.panel_number as number)) + 1
      : 1;
  const nextChapterNumber =
    panels.length > 0
      ? (panels[panels.length - 1].chapter_number as number)
      : 1;

  const episodeNumber = episode.episode_number as number;
  const episodeOutline = live.research.series_potential?.episode_outlines?.find(
    (ep) => ep.episode_number === episodeNumber
  );
  const bibleEpisode = live.storylineBible?.episodes.find(
    (ep) => ep.episode_number === episodeNumber
  );

  const existingContext = panels.map((p) => ({
    panel_number: p.panel_number,
    visual: p.visual_description,
    caption: p.caption,
    dialogue: p.dialogue,
  }));

  const scriptUser = `Series: ${live.series.title}
Category: ${live.series.category ?? "business history"}
Episode ${episodeNumber}: ${episode.title}

Research topic: ${live.research.topic}
Storyline logline: ${live.research.storyline?.logline ?? "—"}
Narrative arc: ${live.research.storyline?.narrative_arc ?? "—"}
Themes: ${live.research.storyline?.themes?.join(", ") ?? "—"}

Key facts:
${live.research.facts
  .slice(0, 12)
  .map((f) => `- ${f.fact}`)
  .join("\n")}

Characters:
${live.research.characters
  .slice(0, 6)
  .map((c) => `- ${c.name}: ${c.role}${c.description ? ` — ${c.description}` : ""}`)
  .join("\n")}

Episode plan:
${episodeOutline ? JSON.stringify(episodeOutline, null, 2) : bibleEpisode ? JSON.stringify(bibleEpisode, null, 2) : "Use research storyline and facts to pick the next beat"}

Existing panels in this episode (${panels.length}):
${existingContext.length ? JSON.stringify(existingContext, null, 2) : "None yet — open the episode with a strong hook"}

Write panel_number ${nextPanelNumber}, chapter_number ${nextChapterNumber}.
${options.direction?.trim() ? `Director note: ${options.direction.trim()}` : "Pick the next unshown story beat from the episode plan."}`;

  const usageItems: ApiUsageLineItem[] = [];

  const { result: script, usage: scriptUsage } = await callAnthropicJson<ExtraPanelScript>(
    {
      system: SCRIPT_SYSTEM,
      user: scriptUser,
      operation: "extra_panel_script",
    }
  );
  usageItems.push(scriptUsage);

  const { result: promptResult, usage: promptUsage } = await callAnthropicJson<{
    image_prompt: string;
  }>({
    system: PROMPT_SYSTEM,
    user: `Series: ${live.series.title}
Research topic: ${live.research.topic}

Panel script:
${JSON.stringify(script, null, 2)}

Previous panel visual (avoid repeating pose/angle):
${panels.length ? panels[panels.length - 1].visual_description ?? "—" : "—"}`,
    operation: "extra_panel_prompt",
  });
  usageItems.push(promptUsage);

  const scriptJson = {
    ...script,
    panel_number: nextPanelNumber,
    chapter_number: nextChapterNumber,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("panels")
    .insert({
      episode_id: episodeId,
      panel_number: nextPanelNumber,
      chapter_number: nextChapterNumber,
      panel_type: script.panel_type,
      visual_description: script.visual_description,
      character_details: script.character_details,
      background_props: script.background_props,
      caption: script.caption_text || null,
      dialogue: script.dialogue_text || null,
      text_placement: script.text_placement,
      mood: script.mood,
      era_details: script.era_details,
      script_json: scriptJson,
      image_prompt: promptResult.image_prompt,
      image_url: null,
      status: "scripted",
    })
    .select("*")
    .single();

  if (insertError || !inserted) {
    throw new Error(insertError?.message ?? "Failed to save panel");
  }

  const panelId = inserted.id as string;
  let panel = await getPanelById(panelId);
  if (!panel) throw new Error("Failed to load created panel");

  const generateImage = options.generateImage !== false;
  if (generateImage) {
    if (!hasOpenAIKey()) {
      throw new Error("OPENAI_API_KEY is required for image generation");
    }

    await updatePanelFields(panelId, { status: "generating" });

    const { url: tempUrl, usage: imageUsage } = await generatePanelImage(
      promptResult.image_prompt
    );
    usageItems.push(imageUsage);

    const publicUrl = await persistPipelinePanelArt(
      tempUrl,
      episode.series_id as string,
      panelId
    );

    await updatePanelFields(panelId, {
      image_url: publicUrl,
      status: "complete",
    });

    if (options.autoReview !== false) {
      const qa = await runPanelImageQa(panelId);
      usageItems.push(...qa.usage.items);
      panel = qa.panel;
    } else {
      panel = (await getPanelById(panelId))!;
    }
  }

  // Refresh series detail cache for callers
  void getPipelineSeriesDetail(episode.series_id as string);

  return {
    panel,
    usage: summarizeUsage(usageItems),
  };
}

const MAX_BATCH_PANELS = 20;

export async function createExtraPanels(
  episodeId: string,
  options: {
    count: number;
    direction?: string;
    generateImage?: boolean;
    autoReview?: boolean;
  }
): Promise<{
  panels: CreatorAdminPanel[];
  usage: ApiUsageSummary;
}> {
  const count = Math.min(
    MAX_BATCH_PANELS,
    Math.max(1, Math.floor(options.count))
  );

  const panels: CreatorAdminPanel[] = [];
  const usageItems: ApiUsageLineItem[] = [];

  for (let i = 0; i < count; i++) {
    const result = await createExtraPanel(episodeId, {
      direction: options.direction,
      generateImage: options.generateImage,
      autoReview:
        options.autoReview !== false && count === 1,
    });
    panels.push(result.panel);
    usageItems.push(...result.usage.items);
  }

  return {
    panels,
    usage: summarizeUsage(usageItems),
  };
}
