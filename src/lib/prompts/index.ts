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
  story_bible: "gpt-5.4-mini",
  episode_script: "gpt-5.4-mini",
  panel_breakdown: "gpt-5.4-mini",
  image_prompt: "gpt-5.5",
  comic_image: "gpt-image-2",
  image_qa: "gpt-5.4-mini",
  text_overlay: "gpt-5.4-mini",
  continuity: "gpt-5.4-mini",
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
  text_overlay: "Placing speech bubbles",
  continuity: "Saving continuity memory",
};
