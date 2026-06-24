import type {
  EpisodeBuilderInput,
  EpisodeStoryPlan,
} from "@/types/episode-builder";
import {
  buildStoryPlannerPrompt,
  rawPlanToEpisodeStoryPlan,
  type RawStoryPlanResponse,
} from "@/lib/episode-builder/imagePromptService";
import { getDemoPlanForInput } from "@/lib/episode-builder/demoPlans";
import {
  evaluateStoryQuality,
  improveStoryPlan,
  type StoryQualityResult,
} from "@/lib/episode-builder/storyQualityService";
import { clampEpisodeLength } from "@/lib/episode-builder/storyStructure";
import { callOpenAIChat, hasOpenAIKey } from "@/lib/engine/openai-client";
import { EPISODE_LLM_QUALITY_IMPROVE } from "@/lib/episode-builder/constants";

const MAX_QUALITY_PASSES = 2;

function parseJsonResponse<T>(raw: string): T {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Planner returned invalid JSON");
  }
  return JSON.parse(trimmed.slice(start, end + 1)) as T;
}

export function normalizeEpisodeInput(
  input: EpisodeBuilderInput
): EpisodeBuilderInput {
  return {
    ...input,
    episodeLength: clampEpisodeLength(input.episodeLength || 10),
    addTextInImage: Boolean(input.addTextInImage),
  };
}

export async function generateInitialStoryPlan(
  input: EpisodeBuilderInput
): Promise<EpisodeStoryPlan> {
  if (!input.description.trim()) {
    throw new Error("Story description is required");
  }

  const normalized = normalizeEpisodeInput(input);

  if (!hasOpenAIKey()) {
    return getDemoPlanForInput(normalized);
  }

  const prompt = buildStoryPlannerPrompt(normalized);
  const raw = await callOpenAIChat({ prompt, json: true });
  const parsed = parseJsonResponse<RawStoryPlanResponse>(raw);
  return rawPlanToEpisodeStoryPlan(parsed, normalized);
}

export async function runStoryQualityPass(
  plan: EpisodeStoryPlan,
  input: EpisodeBuilderInput
): Promise<{ plan: EpisodeStoryPlan; quality: StoryQualityResult }> {
  const normalized = normalizeEpisodeInput(input);
  let quality = await evaluateStoryQuality(plan);

  if (!quality.needsImprovement || !hasOpenAIKey() || !EPISODE_LLM_QUALITY_IMPROVE) {
    return { plan: { ...plan, qualityScores: quality.scores }, quality };
  }

  for (let pass = 0; pass < MAX_QUALITY_PASSES; pass++) {
    plan = await improveStoryPlan(plan, normalized, quality.weakAreas);
    quality = await evaluateStoryQuality(plan);
    plan = { ...plan, qualityScores: quality.scores };
    if (!quality.needsImprovement) break;
  }

  return { plan, quality };
}

/** Full plan + quality pipeline (single server call). */
export async function generateStoryPlan(
  input: EpisodeBuilderInput
): Promise<EpisodeStoryPlan> {
  let plan = await generateInitialStoryPlan(input);
  const result = await runStoryQualityPass(plan, input);
  return result.plan;
}
