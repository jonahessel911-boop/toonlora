import type { EpisodeBuilderInput } from "@/types/episode-builder";
import { fillTemplate, STORY_ENHANCE_PROMPT } from "@/lib/episode-builder/prompts";
import { clampEpisodeLength } from "@/lib/episode-builder/storyStructure";
import { parseJsonFromModel } from "@/lib/parseModelJson";
import { callOpenAIChat, hasOpenAIKey } from "@/lib/engine/openai-client";

export interface EnhanceStoryResult {
  enhancedDescription: string;
}

export async function enhanceStoryDescription(
  input: Pick<EpisodeBuilderInput, "description" | "episodeLength">
): Promise<EnhanceStoryResult> {
  const description = input.description.trim();
  if (!description) {
    throw new Error("Story description is required");
  }

  if (!hasOpenAIKey()) {
    throw new Error("Story enhancement requires an OpenAI API key");
  }

  const episodeLength = clampEpisodeLength(input.episodeLength || 10);
  const prompt = fillTemplate(STORY_ENHANCE_PROMPT, {
    EPISODE_LENGTH: episodeLength,
  });

  const raw = await callOpenAIChat({
    prompt: `${prompt}

USER'S ROUGH IDEA:
${description}`,
    json: true,
  });

  const parsed = parseJsonFromModel<{ enhancedDescription?: string }>(raw);
  const enhancedDescription = parsed.enhancedDescription?.trim();

  if (!enhancedDescription) {
    throw new Error("Enhancer returned an empty description");
  }

  return { enhancedDescription };
}
