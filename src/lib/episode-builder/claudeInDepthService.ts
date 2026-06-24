import type Anthropic from "@anthropic-ai/sdk";
import {
  getAnthropicClient,
  getAnthropicModel,
  hasAnthropicKey,
  WEB_SEARCH_TOOL,
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

function hasTavilyKey(): boolean {
  return Boolean(process.env.TAVILY_API_KEY?.trim());
}

async function runWebSearch(query: string): Promise<{
  content: string;
  sources: string[];
}> {
  const apiKey = process.env.TAVILY_API_KEY?.trim();
  if (!apiKey) {
    return {
      content: "Web search unavailable — TAVILY_API_KEY not configured.",
      sources: [],
    };
  }

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "advanced",
      max_results: 5,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Tavily search failed: ${err}`);
  }

  const data = (await res.json()) as {
    results?: { url: string; content: string }[];
  };

  const results = data.results ?? [];
  const sources = results.map((r) => r.url);
  const content = results
    .map((r) => `Source: ${r.url}\n${r.content}`)
    .join("\n\n");

  return { content: content || "No results found.", sources };
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

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userPrompt },
  ];
  const allSources: string[] = [];
  const maxTurns = 12;
  let response: Anthropic.Message | null = null;

  for (let turn = 0; turn < maxTurns; turn++) {
    response = await client.messages.create({
      model,
      max_tokens: 16000,
      system: systemPrompt,
      tools: hasTavilyKey() ? [WEB_SEARCH_TOOL] : undefined,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") break;

    if (response.stop_reason === "tool_use") {
      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type === "tool_use" && block.name === "web_search") {
          const input = block.input as { query?: string };
          const query = input.query?.trim() || request.topic;
          const searchResult = await runWebSearch(query);
          allSources.push(...searchResult.sources);

          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: searchResult.content,
          });
        }
      }

      if (toolResults.length === 0) break;

      messages.push({ role: "user", content: toolResults });
      continue;
    }

    break;
  }

  const script = response ? extractText(response.content) : "";
  if (!script.trim()) {
    throw new Error("Claude returned an empty episode script");
  }

  return {
    topic: request.topic,
    episode: request.episode,
    title: request.episodeTitle,
    script: script.trim(),
    researchSources: [...new Set(allSources)],
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
