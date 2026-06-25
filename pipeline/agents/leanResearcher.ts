import {
  callAnthropicJson,
  CLAUDE_WEB_SEARCH_TOOL,
} from "../lib/anthropic.js";
import type { WebSearchLog } from "../lib/anthropic.js";
import { parseJsonFromModel } from "../lib/json.js";
import { saveResearchJson } from "../lib/supabase.js";
import {
  IMAGES_PER_PANEL,
  PANELS_PER_CHAPTER,
  type ResearchJson,
  type ResearchSeriesPotential,
} from "../lib/types.js";

const LEAN_RESEARCH_SYSTEM = `You are a senior story researcher and narrative architect for Toonlora — cinematic business graphic novels.

Use Claude web search aggressively before writing JSON. Run multiple searches until you have deep, specific, verifiable material.

Your job is NOT a shallow fact dump. You must:
1. Extract rich, specific research (dates, dollar amounts, names, drama, lesser-known angles)
2. Invent a COMPELLING series storyline — not chronological episode-by-episode filler, but a mix of jaw-dropping highlights AND deep-dive episodes where the story truly earns depth
3. Estimate how many episodes and chapters this topic can sustain at HIGH quality (only count material that would be genuinely exciting to read)

Toonlora format constraints (use these for all estimates):
- 1 chapter ≈ ${PANELS_PER_CHAPTER.min}–${PANELS_PER_CHAPTER.max} panels (use ${PANELS_PER_CHAPTER.typical} for calculations)
- 1 panel ≈ ${IMAGES_PER_PANEL.min}–${IMAGES_PER_PANEL.max} images (use ${IMAGES_PER_PANEL.typical} for calculations)
- estimated_panels = estimated_chapters × panels_per_chapter
- estimated_images = estimated_panels × images_per_panel

Return ONLY valid JSON:
{
  "topic": string,
  "facts": [{ "fact": string, "source_hint": string, "category": string }],
  "timeline": [{ "date": string, "event": string, "significance": string }],
  "characters": [{ "name": string, "role": string, "description": string }],
  "turning_points": [{ "title": string, "description": string, "episode_hint": number }],
  "quotes": [{ "speaker": string, "quote": string, "context": string }],
  "storyline": {
    "logline": string,
    "narrative_arc": string,
    "opening_hook": string,
    "themes": string[],
    "tone": string
  },
  "series_potential": {
    "estimated_episodes": { "min": number, "max": number, "recommended": number },
    "estimated_chapters": { "min": number, "max": number, "recommended": number },
    "estimated_panels": { "min": number, "max": number },
    "estimated_images": { "min": number, "max": number },
    "panels_per_chapter": ${PANELS_PER_CHAPTER.typical},
    "images_per_panel": ${IMAGES_PER_PANEL.typical},
    "reasoning": string,
    "episode_outlines": [{
      "episode_number": number,
      "title": string,
      "logline": string,
      "focus": string,
      "depth": "highlight" | "deep_dive" | "mixed",
      "suggested_chapters": number,
      "why_compelling": string
    }]
  }
}

Guidelines:
- facts: 20–35 specific, verifiable facts with dates/numbers where possible
- timeline: 8–15 key events
- characters: up to 8 key people
- turning_points: 5–10 dramatic pivots mapped to episode hints
- quotes: up to 3 memorable quotes
- episode_outlines: propose EVERY episode you recommend
- Be honest: if the story only supports 3 great episodes, say 3 — do not inflate`;

function normalizeSeriesPotential(
  raw: Partial<ResearchSeriesPotential> | undefined
): ResearchSeriesPotential | undefined {
  if (!raw?.estimated_episodes) return undefined;

  const panelsPerChapter = raw.panels_per_chapter ?? PANELS_PER_CHAPTER.typical;
  const imagesPerPanel = raw.images_per_panel ?? IMAGES_PER_PANEL.typical;

  const epRec = raw.estimated_episodes.recommended ?? raw.estimated_episodes.min ?? 3;
  const chRec = raw.estimated_chapters?.recommended ?? epRec;
  const chMin = raw.estimated_chapters?.min ?? Math.max(1, chRec - 2);
  const chMax = raw.estimated_chapters?.max ?? chRec + 2;

  const panelMin = raw.estimated_panels?.min ?? chMin * PANELS_PER_CHAPTER.min;
  const panelMax = raw.estimated_panels?.max ?? chMax * PANELS_PER_CHAPTER.max;
  const imageMin = raw.estimated_images?.min ?? panelMin * IMAGES_PER_PANEL.min;
  const imageMax = raw.estimated_images?.max ?? panelMax * IMAGES_PER_PANEL.max;

  return {
    estimated_episodes: {
      min: raw.estimated_episodes.min ?? 1,
      max: raw.estimated_episodes.max ?? epRec,
      recommended: epRec,
    },
    estimated_chapters: {
      min: chMin,
      max: chMax,
      recommended: chRec,
    },
    estimated_panels: { min: panelMin, max: panelMax },
    estimated_images: { min: imageMin, max: imageMax },
    panels_per_chapter: panelsPerChapter,
    images_per_panel: imagesPerPanel,
    reasoning: raw.reasoning ?? "",
    episode_outlines: (raw.episode_outlines ?? []).slice(0, 20),
  };
}

export async function runLeanResearch(params: {
  seriesId: string;
  topic: string;
}): Promise<ResearchJson> {
  console.log(`[leanResearch] Claude web search + research for "${params.topic}"…`);

  const webSearchLog: WebSearchLog = { queries: [], raw: "", search_count: 0 };

  await saveResearchJson(params.seriesId, {
    topic: params.topic,
    facts: [],
    timeline: [],
    characters: [],
    turning_points: [],
    quotes: [],
    researched_at: new Date().toISOString(),
    web_search_query: params.topic,
    web_search_raw: "Claude web search in progress…",
  });

  const raw = await callAnthropicJson({
    system: LEAN_RESEARCH_SYSTEM,
    user: `Topic: "${params.topic}"

Research this business story thoroughly using web search (founding, money, scandal, collapse/triumph, cultural impact).
Then return the JSON research package for a Toonlora graphic novel series.
We still generate only 1 preview panel now — but plan the full series potential.`,
    maxTokens: 16000,
    tools: [CLAUDE_WEB_SEARCH_TOOL],
    webSearchLog,
  });

  const parsed = parseJsonFromModel<Omit<ResearchJson, "researched_at">>(raw);
  const seriesPotential = normalizeSeriesPotential(parsed.series_potential);

  const research: ResearchJson = {
    ...parsed,
    topic: parsed.topic || params.topic,
    facts: (parsed.facts ?? []).slice(0, 35),
    timeline: (parsed.timeline ?? []).slice(0, 15),
    characters: (parsed.characters ?? []).slice(0, 8),
    turning_points: (parsed.turning_points ?? []).slice(0, 10),
    quotes: (parsed.quotes ?? []).slice(0, 3),
    storyline: parsed.storyline,
    series_potential: seriesPotential,
    researched_at: new Date().toISOString(),
    web_search_query: webSearchLog.queries[0] ?? params.topic,
    web_search_queries: webSearchLog.queries,
    web_search_raw: webSearchLog.raw,
  };

  await saveResearchJson(params.seriesId, research);

  const epCount = research.series_potential?.estimated_episodes.recommended ?? "?";
  console.log(
    `[leanResearch] Saved ${research.facts.length} facts, ${webSearchLog.search_count} web searches, ${epCount} recommended episodes`
  );

  return research;
}
