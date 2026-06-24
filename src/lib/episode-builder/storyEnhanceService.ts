import type { EpisodeBuilderInput } from "@/types/episode-builder";
import { fillTemplate, STORY_ENHANCE_PROMPT } from "@/lib/episode-builder/prompts";
import { clampEpisodeLength } from "@/lib/episode-builder/storyStructure";
import { callOpenAIChat, hasOpenAIKey } from "@/lib/engine/openai-client";

export interface EnhanceStoryResult {
  enhancedDescription: string;
}

function parseJsonResponse<T>(raw: string): T {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Enhancer returned invalid JSON");
  }
  return JSON.parse(trimmed.slice(start, end + 1)) as T;
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

  const parsed = parseJsonResponse<{ enhancedDescription?: string }>(raw);
  const enhancedDescription = parsed.enhancedDescription?.trim();

  if (!enhancedDescription) {
    throw new Error("Enhancer returned an empty description");
  }

  return { enhancedDescription };
}
