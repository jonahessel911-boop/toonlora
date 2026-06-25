import {
  costAnthropicTokens,
  costOpenAIImageUsage,
  summarizeUsage,
  type ApiUsageLineItem,
  type ApiUsageSummary,
} from "@/lib/api-usage-cost";
import { getPipelineLiveState } from "@/lib/services/content-pipeline-service";
import { persistSeriesCoverArt } from "@/lib/services/comic-art-storage";
import {
  getAnthropicClient,
  getAnthropicModel,
  hasAnthropicKey,
  requireAnthropicKey,
} from "@/lib/engine/anthropic-client";
import { hasOpenAIKey, requireOpenAIKey } from "@/lib/engine/openai-client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const CATEGORY_LABELS: Record<string, string> = {
  rise_and_fall: "Rise & Fall",
  founder_stories: "Founder Stories",
  business: "Business",
  empires: "Empires",
  heists: "Heists & Frauds",
};

const TITLE_SYSTEM = `You are a Toonlora series title writer for cinematic business graphic novels.

Write ONE catchy catalog title in this exact format:
"[Subject] — [Punchy dramatic tagline]"

The tagline must be provocative, specific, and binge-worthy — not generic.

Examples of excellent titles:
- WeWork — The $47B Lie
- Enron — The Smartest Criminals in the Room
- Theranos — One Drop of Blood, One Billion in Fraud
- Ferrari — The Man Who Let Drivers Die for Glory
- LVMH — How One Man Bought Every Luxury Brand on Earth
- FTX — How SBF Lost $32B in 72 Hours
- Blockbuster — The Night They Said No to Netflix for $50M

Return ONLY JSON:
{
  "display_title": string,
  "tagline": string,
  "cover_subjects": [string, string],
  "iconic_visual": string
}

cover_subjects: 2 visual anchors for the poster (e.g. founder portrait + iconic product/vehicle/building)
iconic_visual: the single most recognizable object/symbol for this story (e.g. "Ferrari F40", "WeWork neon sign")`;

const COVER_PROMPT_SYSTEM = `You are a senior key-art director for Toonlora — ultra-realistic cinematic business graphic novel covers.

Write ONE complete gpt-image-1 prompt for a VERTICAL SERIES POSTER (2:3 portrait).

The cover must include:
OPENING — story tone, era, emotional register (2 sentences)
STYLE — verbatim: "Ultra-realistic cinematic graphic novel poster. Not cartoonish. Not anime. HBO / Netflix documentary drama key art. Dark, gritty, premium, film lighting, realistic faces and environments."
FORMAT — verbatim: "Tall vertical portrait poster, mobile catalog cover, single powerful composition."
HERO VISUAL — the main subject(s) from cover_subjects, specific clothing, age, expression, pose
ICONIC PROP — the iconic_visual integrated prominently (car, building, product, document, etc.)
BACKGROUND — cinematic environment, era-accurate, high contrast, mostly dark
TITLE TEXT — large readable title at top or center:
"Title line 1: [SUBJECT NAME in bold serif caps]
Title line 2: [TAGLINE in smaller serif]"
Category badge at top corner: small cream label reading "[CATEGORY LABEL]"
IMPORTANT — text on cover is required and intentional. No watermarks. No stock photo look. Must feel like premium streaming series key art.

Return ONLY JSON: { "image_prompt": string }
The image_prompt must be 350–500 words, one flowing paragraph ready for gpt-image-1.`;

interface CoverTitleResult {
  display_title: string;
  tagline: string;
  cover_subjects: string[];
  iconic_visual: string;
}

function parseJsonFromModel<T>(raw: string): T {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model returned invalid JSON");
  return JSON.parse(trimmed.slice(start, end + 1)) as T;
}

async function callAnthropicJson<T>(params: {
  system: string;
  user: string;
  operation: string;
}): Promise<{ result: T; usage: ApiUsageLineItem }> {
  requireAnthropicKey();
  const model = getAnthropicModel();
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: params.system,
    messages: [{ role: "user", content: params.user }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  if (!text.trim()) throw new Error("Claude returned empty response");

  return {
    result: parseJsonFromModel<T>(text),
    usage: costAnthropicTokens(
      model,
      response.usage.input_tokens,
      response.usage.output_tokens,
      params.operation
    ),
  };
}

async function generateCoverImage(prompt: string): Promise<{
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
    throw new Error(`Cover image generation failed: ${await response.text()}`);
  }

  const data = await response.json();
  const item = data.data?.[0];
  const url = item?.url as string | undefined;
  const b64 = item?.b64_json as string | undefined;
  const usage = costOpenAIImageUsage(data.usage ?? {});
  if (url) return { url, usage };
  if (b64) return { url: `data:image/png;base64,${b64}`, usage };
  throw new Error("Image model returned no cover data");
}

export interface SeriesCoverResult {
  seriesId: string;
  display_title: string;
  cover_art_url: string;
  cover_image_prompt: string;
  usage: ApiUsageSummary;
}

export async function generateSeriesCover(seriesId: string): Promise<SeriesCoverResult> {
  if (!hasAnthropicKey()) {
    throw new Error("ANTHROPIC_API_KEY is required for cover generation");
  }
  if (!hasOpenAIKey()) {
    throw new Error("OPENAI_API_KEY is required for cover generation");
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Database not configured");

  const live = await getPipelineLiveState(seriesId);
  if (!live) throw new Error("Series not found");

  const categoryLabel =
    CATEGORY_LABELS[live.series.category ?? ""] ??
    live.series.category ??
    "Business";

  const usageItems: ApiUsageLineItem[] = [];

  const titleUser = `Category: ${categoryLabel}
Research topic: ${live.research?.topic ?? live.series.title}
Storyline: ${live.research?.storyline?.logline ?? "—"}
Themes: ${live.research?.storyline?.themes?.join(", ") ?? "—"}
Narrative hook: ${live.research?.storyline?.opening_hook ?? "—"}

Key facts:
${(live.research?.facts ?? [])
  .slice(0, 10)
  .map((f) => `- ${f.fact}`)
  .join("\n")}

Key characters:
${(live.research?.characters ?? [])
  .slice(0, 5)
  .map((c) => `- ${c.name}: ${c.role}`)
  .join("\n")}

Write the catalog display_title and cover visual plan for this series.`;

  const { result: titlePlan, usage: titleUsage } =
    await callAnthropicJson<CoverTitleResult>({
      system: TITLE_SYSTEM,
      user: titleUser,
      operation: "series_cover_title",
    });
  usageItems.push(titleUsage);

  const [subjectName, taglinePart] = titlePlan.display_title.includes(" — ")
    ? titlePlan.display_title.split(" — ", 2)
    : [live.series.title, titlePlan.tagline];

  const { result: promptResult, usage: promptUsage } = await callAnthropicJson<{
    image_prompt: string;
  }>({
    system: COVER_PROMPT_SYSTEM,
    user: `Series: ${live.series.title}
Category label for badge: ${categoryLabel}
Display title: ${titlePlan.display_title}
Subject name for title line 1: ${subjectName.trim()}
Tagline for title line 2: ${taglinePart?.trim() ?? titlePlan.tagline}
Cover subjects: ${titlePlan.cover_subjects.join(" · ")}
Iconic visual: ${titlePlan.iconic_visual}
Tone: ${live.research?.storyline?.tone ?? "dark cinematic business thriller"}`,
    operation: "series_cover_prompt",
  });
  usageItems.push(promptUsage);

  const { url: tempUrl, usage: imageUsage } = await generateCoverImage(
    promptResult.image_prompt
  );
  usageItems.push(imageUsage);

  const publicUrl = await persistSeriesCoverArt(tempUrl, seriesId);

  const { error } = await supabase
    .from("series")
    .update({
      display_title: titlePlan.display_title,
      cover_art_url: publicUrl,
      cover_image_prompt: promptResult.image_prompt,
      synopsis:
        live.research?.storyline?.logline?.trim() ||
        titlePlan.tagline ||
        undefined,
    })
    .eq("id", seriesId);

  if (error) throw new Error(error.message);

  return {
    seriesId,
    display_title: titlePlan.display_title,
    cover_art_url: publicUrl,
    cover_image_prompt: promptResult.image_prompt,
    usage: summarizeUsage(usageItems),
  };
}
