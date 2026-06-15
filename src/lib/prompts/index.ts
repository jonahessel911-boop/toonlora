import type { SeriesInput } from "@/types/pipeline";

export { buildStoryBiblePrompt } from "./story-bible";
export { buildEpisodeScriptPrompt } from "./episode-script";
export { buildPanelBreakdownPrompt } from "./panel-breakdown";
export {
  buildImagePromptGeneratorPrompt,
  buildFinalImagePrompt,
} from "./image-prompt";
export { buildTextOverlayPrompt } from "./text-overlay";
export { buildContinuityMemoryPrompt } from "./continuity";

export function buildModerationInput(input: SeriesInput): string {
  return [
    input.story_idea,
    input.genre,
    input.tone,
    input.main_character,
    input.love_interest,
  ].join("\n");
}

/** Model config per pipeline step */
export const PIPELINE_MODELS = {
  moderation: "omni-moderation-latest",
  story_bible: process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini",
  episode_script: process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini",
  panel_breakdown: process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini",
  image_prompt: process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini",
  comic_image: process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-1",
  image_qa: process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini",
  text_overlay: process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini",
  continuity: process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini",
} as const;

export const PIPELINE_STEP_LABELS: Record<
  keyof typeof PIPELINE_MODELS,
  string
> = {
  moderation: "Checking safety",
  story_bible: "Building Story Bible",
  episode_script: "Writing Episode Script",
  panel_breakdown: "Breaking down panels",
  image_prompt: "Crafting image prompt",
  comic_image: "Generating comic art",
  image_qa: "Reviewing art quality",
  text_overlay: "Finalizing episode layout",
  continuity: "Saving continuity memory",
};
