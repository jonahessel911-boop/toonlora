import type Anthropic from "@anthropic-ai/sdk";

/** Published API list prices (USD). Invoice remains source of truth. */
export const PRICING = {
  anthropic: {
    models: {
      "claude-sonnet-4-5": { inputPerMillion: 3, outputPerMillion: 15 },
      "claude-sonnet-4": { inputPerMillion: 3, outputPerMillion: 15 },
    },
    webSearchPer1000: 10,
  },
  openai: {
    "gpt-image-1": {
      textInputPerMillion: 5,
      imageInputPerMillion: 10,
      imageOutputPerMillion: 40,
    },
    "gpt-4o": { inputPerMillion: 2.5, outputPerMillion: 10 },
  },
} as const;

export interface UsageLineItem {
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

export interface StepUsageMetadata {
  usage: {
    items: UsageLineItem[];
    total_usd: number;
    recorded_at: string;
  };
}

function roundUsd(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function anthropicModelPricing(model: string): { inputPerMillion: number; outputPerMillion: number } {
  const key = model as keyof typeof PRICING.anthropic.models;
  return PRICING.anthropic.models[key] ?? PRICING.anthropic.models["claude-sonnet-4-5"];
}

export function costAnthropicTokens(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const p = anthropicModelPricing(model);
  return roundUsd(
    (inputTokens / 1_000_000) * p.inputPerMillion +
      (outputTokens / 1_000_000) * p.outputPerMillion
  );
}

export function costOpenAIImageUsage(usage: {
  input_tokens?: number;
  output_tokens?: number;
  input_tokens_details?: {
    text_tokens?: number;
    image_tokens?: number;
  };
  output_tokens_details?: {
    image_tokens?: number;
    text_tokens?: number;
  };
}): { cost_usd: number; line: Omit<UsageLineItem, "provider" | "operation"> } {
  const textIn = usage.input_tokens_details?.text_tokens ?? 0;
  const imageIn = usage.input_tokens_details?.image_tokens ?? 0;
  const imageOut =
    usage.output_tokens_details?.image_tokens ?? usage.output_tokens ?? 0;
  const p = PRICING.openai["gpt-image-1"];

  const cost = roundUsd(
    (textIn / 1_000_000) * p.textInputPerMillion +
      (imageIn / 1_000_000) * p.imageInputPerMillion +
      (imageOut / 1_000_000) * p.imageOutputPerMillion
  );

  return {
    cost_usd: cost,
    line: {
      model: "gpt-image-1",
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      input_text_tokens: textIn,
      input_image_tokens: imageIn,
      output_image_tokens: imageOut,
      cost_usd: cost,
    },
  };
}

export function costOpenAIChatTokens(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const p =
    PRICING.openai[model as keyof typeof PRICING.openai] ??
    PRICING.openai["gpt-4o"];
  if (!("inputPerMillion" in p)) return 0;
  return roundUsd(
    (inputTokens / 1_000_000) * p.inputPerMillion +
      (outputTokens / 1_000_000) * p.outputPerMillion
  );
}


export class StepUsageLedger {
  private items: UsageLineItem[] = [];

  get totalUsd(): number {
    return roundUsd(this.items.reduce((sum, i) => sum + i.cost_usd, 0));
  }

  get lineItems(): UsageLineItem[] {
    return [...this.items];
  }

  recordAnthropic(
    response: Anthropic.Message,
    operation: string
  ): void {
    const input = response.usage?.input_tokens ?? 0;
    const output = response.usage?.output_tokens ?? 0;
    const webSearches = response.usage?.server_tool_use?.web_search_requests ?? 0;

    if (input === 0 && output === 0 && webSearches === 0) return;

    let cost = costAnthropicTokens(response.model, input, output);
    if (webSearches > 0) {
      cost = roundUsd(cost + (webSearches / 1000) * PRICING.anthropic.webSearchPer1000);
    }

    this.items.push({
      provider: "anthropic",
      operation,
      model: response.model,
      input_tokens: input,
      output_tokens: output,
      cost_usd: cost,
      ...(webSearches > 0 ? { web_search_requests: webSearches } : {}),
    });
  }

  recordOpenAIImage(
    usage: Parameters<typeof costOpenAIImageUsage>[0] | undefined,
    operation: string
  ): void {
    if (!usage) return;
    const { cost_usd, line } = costOpenAIImageUsage(usage);
    this.items.push({
      provider: "openai",
      operation,
      ...line,
      cost_usd,
    });
  }

  recordOpenAIChat(
    model: string,
    operation: string,
    inputTokens: number,
    outputTokens: number
  ): void {
    if (inputTokens === 0 && outputTokens === 0) return;
    this.items.push({
      provider: "openai",
      operation,
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: costOpenAIChatTokens(model, inputTokens, outputTokens),
    });
  }

  toMetadata(): StepUsageMetadata {
    return {
      usage: {
        items: this.lineItems,
        total_usd: this.totalUsd,
        recorded_at: new Date().toISOString(),
      },
    };
  }
}

let activeLedger: StepUsageLedger | null = null;

export function beginStepUsage(): StepUsageLedger {
  activeLedger = new StepUsageLedger();
  return activeLedger;
}

export function getStepUsage(): StepUsageLedger | null {
  return activeLedger;
}

export function endStepUsage(): StepUsageLedger | null {
  const ledger = activeLedger;
  activeLedger = null;
  return ledger;
}
