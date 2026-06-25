import Anthropic from "@anthropic-ai/sdk";
import { getAnthropicModel, requireEnv } from "./config.js";
import { getStepUsage } from "./usage.js";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: requireEnv("ANTHROPIC_API_KEY") });
  }
  return client;
}

export const CLAUDE_WEB_SEARCH_TOOL: Anthropic.Messages.WebSearchTool20250305 = {
  type: "web_search_20250305",
  name: "web_search",
  max_uses: 12,
};

export interface WebSearchLog {
  queries: string[];
  raw: string;
  search_count: number;
}

function extractText(content: Anthropic.Message["content"]): string {
  return content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

export function extractWebSearchLog(
  content: Anthropic.Message["content"]
): WebSearchLog {
  const queries: string[] = [];
  const sections: string[] = [];

  for (const block of content) {
    if (block.type === "server_tool_use" && block.name === "web_search") {
      const input = block.input as { query?: string };
      const query = input.query?.trim();
      if (query) queries.push(query);
    }

    if (block.type === "web_search_tool_result") {
      const results = block.content;
      if (Array.isArray(results)) {
        for (const result of results) {
          if (result.type === "web_search_result") {
            sections.push(
              [
                `Source: ${result.url}`,
                result.title ? `Title: ${result.title}` : "",
                result.page_age ? `Age: ${result.page_age}` : "",
              ]
                .filter(Boolean)
                .join("\n")
            );
          }
        }
      }
    }
  }

  return {
    queries,
    raw:
      sections.length > 0
        ? sections.join("\n\n---\n\n")
        : queries.length > 0
          ? `Claude web search queries:\n${queries.map((q) => `- ${q}`).join("\n")}`
          : "Claude web search (no result metadata in response)",
    search_count: queries.length,
  };
}

export interface AnthropicJsonOptions {
  system: string;
  user: string;
  maxTokens?: number;
  tools?: Anthropic.Messages.ToolUnion[];
  webSearchLog?: WebSearchLog;
}

function usesClaudeWebSearch(tools?: Anthropic.Messages.ToolUnion[]): boolean {
  return tools?.some((tool) => tool.type === "web_search_20250305") ?? false;
}

export async function callAnthropicJson(
  options: AnthropicJsonOptions
): Promise<string> {
  const client = getAnthropic();
  const model = getAnthropicModel();
  const withWebSearch = usesClaudeWebSearch(options.tools);

  const response = await client.messages.create({
    model,
    max_tokens: options.maxTokens ?? 16000,
    system: options.system,
    tools: options.tools,
    messages: [{ role: "user", content: options.user }],
  });

  getStepUsage()?.recordAnthropic(
    response,
    withWebSearch ? "claude_web_search" : "claude_json"
  );

  if (withWebSearch) {
    const log = extractWebSearchLog(response.content);
    const searchCount =
      response.usage?.server_tool_use?.web_search_requests ?? log.search_count;
    log.search_count = searchCount;
    if (options.webSearchLog) {
      options.webSearchLog.queries = log.queries;
      options.webSearchLog.raw = log.raw;
      options.webSearchLog.search_count = log.search_count;
    }
  }

  const text = extractText(response.content);
  if (!text.trim()) {
    throw new Error("Anthropic returned empty text");
  }
  return text;
}
