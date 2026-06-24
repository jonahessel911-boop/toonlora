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
  return process.env.ANTHROPIC_MODEL?.trim() || "claude-opus-4-20250514";
}

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  requireAnthropicKey();
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export const WEB_SEARCH_TOOL: Anthropic.Tool = {
  name: "web_search",
  description:
    "Search the web for detailed, factual information about a topic. Use this to find specific dates, quotes, events, and details needed to write an accurate and compelling story.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query to find specific facts and details",
      },
    },
    required: ["query"],
  },
};
