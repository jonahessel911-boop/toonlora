export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-5";

const DEPRECATED_ANTHROPIC_MODELS: Record<string, string> = {
  "claude-sonnet-4-20250514": DEFAULT_ANTHROPIC_MODEL,
  "claude-sonnet-4-20241022": DEFAULT_ANTHROPIC_MODEL,
};

export function normalizeAnthropicModel(model: string): string {
  const trimmed = model.trim();
  return DEPRECATED_ANTHROPIC_MODELS[trimmed] ?? trimmed;
}

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getAnthropicModel(): string {
  const raw =
    process.env.PIPELINE_ANTHROPIC_MODEL?.trim() ||
    process.env.ANTHROPIC_MODEL?.trim() ||
    DEFAULT_ANTHROPIC_MODEL;
  return normalizeAnthropicModel(raw);
}

export function getPipelineOwnerSessionId(): string {
  return process.env.PIPELINE_OWNER_SESSION_ID?.trim() || "pipeline-system";
}

export const EPISODES_PER_SERIES = 6;

/** One swipeable screen = 1 panel = 1 image with baked-in text */
export const PANELS_PER_CHAPTER_MIN = 5;
export const PANELS_PER_CHAPTER_MAX = 6;
export const PANELS_PER_EPISODE_MIN = 30;
export const PANELS_PER_EPISODE_MAX = 40;

/** @deprecated use PANELS_PER_CHAPTER_MIN/MAX — kept for imports */
export const CHAPTERS_PER_EPISODE = 6;
/** @deprecated use PANELS_PER_CHAPTER_MIN */
export const PANELS_PER_CHAPTER = 6;
export const PANELS_PER_EPISODE = 36;

export const IMAGE_DELAY_MS = 2000;
