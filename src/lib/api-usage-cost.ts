/** Mirrors pipeline/lib/usage.ts pricing for Next.js API routes. */

export const API_PRICING = {
  openai: {
    "gpt-image-1": {
      textInputPerMillion: 5,
      imageInputPerMillion: 10,
      imageOutputPerMillion: 40,
    },
    "gpt-4o": { inputPerMillion: 2.5, outputPerMillion: 10 },
  },
} as const;

export interface ApiUsageLineItem {
  provider: "anthropic" | "openai";
  operation: string;
  model?: string;
  input_tokens?: number;
  output_tokens?: number;
  input_text_tokens?: number;
  input_image_tokens?: number;
  output_image_tokens?: number;
  web_search_requests?: number;
  cost_usd: number;
}

export interface ApiUsageSummary {
  items: ApiUsageLineItem[];
  total_usd: number;
}

function roundUsd(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

export function costOpenAIImageUsage(usage: {
  input_tokens?: number;
  output_tokens?: number;
  input_tokens_details?: { text_tokens?: number; image_tokens?: number };
  output_tokens_details?: { image_tokens?: number; text_tokens?: number };
}): ApiUsageLineItem {
  const textIn = usage.input_tokens_details?.text_tokens ?? 0;
  const imageIn = usage.input_tokens_details?.image_tokens ?? 0;
  const imageOut =
    usage.output_tokens_details?.image_tokens ?? usage.output_tokens ?? 0;
  const p = API_PRICING.openai["gpt-image-1"];
  const cost = roundUsd(
    (textIn / 1_000_000) * p.textInputPerMillion +
      (imageIn / 1_000_000) * p.imageInputPerMillion +
      (imageOut / 1_000_000) * p.imageOutputPerMillion
  );
  return {
    provider: "openai",
    operation: "image_generation",
    model: "gpt-image-1",
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    input_text_tokens: textIn,
    input_image_tokens: imageIn,
    output_image_tokens: imageOut,
    cost_usd: cost,
  };
}

export function costOpenAIChatTokens(
  model: string,
  inputTokens: number,
  outputTokens: number,
  operation: string
): ApiUsageLineItem {
  const p =
    API_PRICING.openai[model as keyof typeof API_PRICING.openai] ??
    API_PRICING.openai["gpt-4o"];
  const pricing = p as { inputPerMillion: number; outputPerMillion: number };
  const cost = roundUsd(
    (inputTokens / 1_000_000) * pricing.inputPerMillion +
      (outputTokens / 1_000_000) * pricing.outputPerMillion
  );
  return {
    provider: "openai",
    operation,
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd: cost,
  };
}

const ANTHROPIC_PRICING = {
  "claude-sonnet-4-5": { inputPerMillion: 3, outputPerMillion: 15 },
  "claude-sonnet-4": { inputPerMillion: 3, outputPerMillion: 15 },
} as const;

export function costAnthropicTokens(
  model: string,
  inputTokens: number,
  outputTokens: number,
  operation: string
): ApiUsageLineItem {
  const pricing =
    ANTHROPIC_PRICING[model as keyof typeof ANTHROPIC_PRICING] ??
    ANTHROPIC_PRICING["claude-sonnet-4-5"];
  const cost = roundUsd(
    (inputTokens / 1_000_000) * pricing.inputPerMillion +
      (outputTokens / 1_000_000) * pricing.outputPerMillion
  );
  return {
    provider: "anthropic",
    operation,
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd: cost,
  };
}

export function summarizeUsage(items: ApiUsageLineItem[]): ApiUsageSummary {
  return {
    items,
    total_usd: roundUsd(items.reduce((s, i) => s + i.cost_usd, 0)),
  };
}

export function formatUsd(amount: number): string {
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  return `$${amount.toFixed(2)}`;
}
