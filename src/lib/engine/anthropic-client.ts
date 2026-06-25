import Anthropic from "@anthropic-ai/sdk";

export function hasAnthropicKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export function requireAnthropicKey(): void {
  if (!hasAnthropicKey()) {
    throw new Error(
      "ANTHROPIC_API_KEY is not configured. Add your Anthropic API key to .env.local."
    );
  }
}

export function getAnthropicModel(): string {
  const raw = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-5";
  if (raw === "claude-sonnet-4-20250514" || raw === "claude-opus-4-20250514") {
    return "claude-sonnet-4-5";
  }
  return raw;
}

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  requireAnthropicKey();
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

/** Anthropic built-in web search — no third-party search API needed. */
export const CLAUDE_WEB_SEARCH_TOOL: Anthropic.Messages.WebSearchTool20250305 = {
  type: "web_search_20250305",
  name: "web_search",
  max_uses: 12,
};

export function extractWebSearchSources(
  content: Anthropic.Message["content"]
): string[] {
  const sources: string[] = [];

  for (const block of content) {
    if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
      for (const result of block.content) {
        if (result.type === "web_search_result" && result.url) {
          sources.push(result.url);
        }
      }
    }
  }

  return [...new Set(sources)];
}
