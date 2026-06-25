export const LEAN_PANEL_COUNT = 1;

export const PIPELINE_CATEGORIES = [
  { value: "rise_and_fall", label: "Rise & Fall" },
  { value: "founder_stories", label: "Founder Stories" },
  { value: "business", label: "Business" },
] as const;

/** Lean preview pipeline: quick search → 1 panel → image */
export const PIPELINE_STEP_ORDER = [
  "research",
  "story",
  "prompts",
  "images",
  "complete",
] as const;

export type PipelineStepName = (typeof PIPELINE_STEP_ORDER)[number];

export interface PanelProgress {
  total: number;
  scripted: number;
  withPrompt: number;
  withImage: number;
  generating: number;
}

export interface PipelineRunStatus {
  seriesId: string;
  running: boolean;
  currentStep: string | null;
  lastError: string | null;
  completedSteps: string[];
  panelProgress: PanelProgress;
  runs: Array<{
    id: string;
    step: string;
    status: string;
    error: string | null;
    created_at: string;
    updated_at: string;
    usage?: PipelineStepUsage | null;
  }>;
  costs?: PipelineCostSummary;
}

export interface PipelineUsageLineItem {
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

export interface PipelineStepUsage {
  items: PipelineUsageLineItem[];
  total_usd: number;
  recorded_at?: string;
}

export interface PipelineCostSummary {
  by_step: Array<{ step: string; usage: PipelineStepUsage }>;
  total_usd: number;
}
