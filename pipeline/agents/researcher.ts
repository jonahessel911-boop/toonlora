import {
  callAnthropicJson,
  CLAUDE_WEB_SEARCH_TOOL,
} from "../lib/anthropic.js";
import type { WebSearchLog } from "../lib/anthropic.js";
import { parseJsonFromModel } from "../lib/json.js";
import { formatCategoryBriefForPrompt } from "../../src/lib/content-pipeline/category-briefs.js";
import { getSeries, saveResearchJson } from "../lib/supabase.js";
import type { ResearchJson } from "../lib/types.js";

const RESEARCH_SYSTEM = `You are a investigative research agent for Toonlora — cinematic business graphic novels.

Use Claude web search aggressively. Gather 50+ specific facts with dates, dollar amounts, names, lawsuits, product launches, betrayals, and lesser-known details.

Return ONLY valid JSON with this shape:
{
  "topic": string,
  "facts": [{ "fact": string, "source_hint": string, "category": string }],
  "timeline": [{ "date": string, "event": string, "significance": string }],
  "characters": [{ "name": string, "role": string, "description": string }],
  "turning_points": [{ "title": string, "description": string, "episode_hint": number }],
  "quotes": [{ "speaker": string, "quote": string, "context": string }]
}`;

export async function runResearcher(params: {
  seriesId: string;
  topic: string;
}): Promise<ResearchJson> {
  console.log(`[researcher] Researching "${params.topic}"…`);

  const series = await getSeries(params.seriesId);
  const categoryBrief = formatCategoryBriefForPrompt(series.category);

  const user = `Research the business story: "${params.topic}".${categoryBrief}

Run multiple web searches until you have at least 50 distinct, verifiable facts.
Prioritize: founding, fundraising, hype, fraud/conflict, collapse or triumph, comeback, cultural impact.
Include exact dates and dollar amounts wherever possible.`;

  const webSearchLog: WebSearchLog = { queries: [], raw: "", search_count: 0 };

  const raw = await callAnthropicJson({
    system: RESEARCH_SYSTEM,
    user,
    tools: [CLAUDE_WEB_SEARCH_TOOL],
    maxTokens: 16000,
    webSearchLog,
  });

  const parsed = parseJsonFromModel<Omit<ResearchJson, "researched_at">>(raw);
  const research: ResearchJson = {
    ...parsed,
    topic: parsed.topic || params.topic,
    facts: parsed.facts ?? [],
    timeline: parsed.timeline ?? [],
    characters: parsed.characters ?? [],
    turning_points: parsed.turning_points ?? [],
    quotes: parsed.quotes ?? [],
    researched_at: new Date().toISOString(),
    web_search_query: webSearchLog.queries[0] ?? params.topic,
    web_search_queries: webSearchLog.queries,
    web_search_raw: webSearchLog.raw,
  };

  if (research.facts.length < 20) {
    console.warn(
      `[researcher] Warning: only ${research.facts.length} facts collected (target 50+)`
    );
  }

  await saveResearchJson(params.seriesId, research);
  console.log(
    `[researcher] Saved ${research.facts.length} facts, ${research.timeline.length} timeline events`
  );

  return research;
}

export async function loadResearch(seriesId: string): Promise<ResearchJson> {
  const series = await getSeries(seriesId);
  if (!series.research_json) {
    throw new Error(`Series ${seriesId} has no research_json — run research step first`);
  }
  return series.research_json;
}
