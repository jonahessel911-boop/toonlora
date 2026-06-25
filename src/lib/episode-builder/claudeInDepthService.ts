import type Anthropic from "@anthropic-ai/sdk";
import {
  CLAUDE_WEB_SEARCH_TOOL,
  extractWebSearchSources,
  getAnthropicClient,
  getAnthropicModel,
  hasAnthropicKey,
} from "@/lib/engine/anthropic-client";

export interface InDepthEpisodeRequest {
  topic: string;
  episode: number;
  episodeTitle: string;
  panels?: number;
  tone?: string;
}

export interface InDepthEpisodeResult {
  topic: string;
  episode: number;
  title: string;
  script: string;
  researchSources: string[];
  panelCount: number;
}

function extractText(content: Anthropic.Message["content"]): string {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

export async function generateInDepthEpisodeScript(
  request: InDepthEpisodeRequest
): Promise<InDepthEpisodeResult> {
  if (!hasAnthropicKey()) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const panels = request.panels ?? 45;
  const tone = request.tone ?? "cinematic, intense, inspiring";
  const client = getAnthropicClient();
  const model = getAnthropicModel();

  const systemPrompt = `You are a professional comic script writer for Toonlora —
in-depth business stories in a cartoon.

Your job is to write deeply researched, emotionally powerful episode scripts
for vertical webtoon format (panels stacked top to bottom).

SCRIPT FORMAT per panel:
[PANEL X]
VISUAL: [Detailed description of what to draw — lighting, composition, characters, emotion]
CAPTION: [Narration text, if any]
DIALOGUE: [Character name]: "[Spoken line]"

RULES:
- Always search the web FIRST before writing. Get real facts, dates, quotes.
- Each episode has exactly ${panels} panels.
- Make it feel like a Netflix documentary in comic form.
- Specific details > general descriptions. Name the exact year, the exact amount, the exact quote.
- Every 8-10 panels, there must be an emotional peak — shock, joy, devastation, triumph.
- Tone: ${tone}
- End every episode on a cliffhanger or a powerful emotional moment that makes the reader want more.
- Write dialogue that sounds like real people, not a history textbook.`;

  const userPrompt = `Write a complete ${panels}-panel vertical webtoon episode script.

SERIES: ${request.topic}
EPISODE ${request.episode}: "${request.episodeTitle}"

Before writing, search the web for:
1. Specific facts, dates, and events for this episode
2. Real quotes from ${request.topic} or people around them
3. Financial details, conflicts, and little-known details
4. The emotional high point of this episode

Then write the full ${panels}-panel script.`;

  const response = await client.messages.create({
    model,
    max_tokens: 16000,
    system: systemPrompt,
    tools: [CLAUDE_WEB_SEARCH_TOOL],
    messages: [{ role: "user", content: userPrompt }],
  });

  const script = extractText(response.content);
  if (!script.trim()) {
    throw new Error("Claude returned an empty episode script");
  }

  return {
    topic: request.topic,
    episode: request.episode,
    title: request.episodeTitle,
    script: script.trim(),
    researchSources: extractWebSearchSources(response.content),
    panelCount: panels,
  };
}

/** Format in-depth script for the Episode Builder description field. */
export function formatInDepthScriptForEpisodeBuilder(
  result: InDepthEpisodeResult
): string {
  const sources =
    result.researchSources.length > 0
      ? `\n\nResearch sources:\n${result.researchSources.map((s) => `- ${s}`).join("\n")}`
      : "";

  return `SERIES: ${result.topic}
EPISODE ${result.episode}: ${result.title}

${result.script}${sources}`;
}
