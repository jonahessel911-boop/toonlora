import type {
  EpisodeBuilderInput,
  EpisodeQualityScores,
  EpisodeStoryPlan,
} from "@/types/episode-builder";
import {
  fillTemplate,
  STORY_QUALITY_CHECK_PROMPT,
  STORY_QUALITY_IMPROVE_PROMPT,
} from "@/lib/episode-builder/prompts";
import {
  buildPhaseAllocationGuide,
  clampEpisodeLength,
} from "@/lib/episode-builder/storyStructure";
import {
  type RawStoryPlanResponse,
  rawPlanToEpisodeStoryPlan,
} from "@/lib/episode-builder/imagePromptService";
import { callOpenAIChat, hasOpenAIKey } from "@/lib/engine/openai-client";
import {
  EPISODE_LLM_QUALITY_IMPROVE,
  EPISODE_USE_LLM_QUALITY_SCORING,
} from "@/lib/episode-builder/constants";

export interface StoryQualityResult {
  scores: EpisodeQualityScores;
  needsImprovement: boolean;
  weakAreas: string[];
  summary: string;
}

const SCORE_KEYS: (keyof EpisodeQualityScores)[] = [
  "hookStrength",
  "readability",
  "emotionalStakes",
  "sceneVariety",
  "textSpecificity",
  "cliffhangerStrength",
  "conversionPotential",
];

const VAGUE_WORDS =
  /\b(destiny|shadows|legacy|darkness|hope|ambition|storm|fate)\b/i;

function parseJsonResponse<T>(raw: string): T {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Quality check returned invalid JSON");
  }
  return JSON.parse(trimmed.slice(start, end + 1)) as T;
}

function normalizeScores(raw: Partial<EpisodeQualityScores>): EpisodeQualityScores {
  const scores = {} as EpisodeQualityScores;
  for (const key of SCORE_KEYS) {
    const value = raw[key];
    scores[key] =
      typeof value === "number" ? Math.min(10, Math.max(1, Math.round(value))) : 5;
  }
  return scores;
}

function heuristicQualityCheck(plan: EpisodeStoryPlan): StoryQualityResult {
  const weakAreas: string[] = [];
  let hookStrength = 8;
  let readability = 8;
  let emotionalStakes = 7;
  let sceneVariety = 7;
  let textSpecificity = 7;
  let cliffhangerStrength = 7;
  let conversionPotential = 7;

  const first = plan.scenes[0];
  const last = plan.scenes[plan.scenes.length - 1];

  if (!first?.narration.some((n) => /\b[A-Z][a-z]+\b/.test(n))) {
    hookStrength -= 2;
    weakAreas.push("Opening lacks a named protagonist in narration");
  }

  const vagueCount = plan.scenes.reduce(
    (acc, s) => acc + s.narration.filter((n) => VAGUE_WORDS.test(n)).length,
    0
  );
  if (vagueCount > 2) {
    textSpecificity -= 2;
    weakAreas.push("Too much vague poetic narration");
  }

  const locations = plan.scenes.map((s) => s.location?.toLowerCase() ?? "");
  const repeatedLocation = locations.some(
    (loc, i) => loc && locations.indexOf(loc) !== i && locations.lastIndexOf(loc) - locations.indexOf(loc) > 2
  );
  if (repeatedLocation) {
    sceneVariety -= 1;
    weakAreas.push("Locations repeat too often");
  }

  const abstractScenes = plan.scenes.filter(
    (s) => !s.concreteEvent?.trim() || !s.whatChanges?.trim()
  );
  if (abstractScenes.length > 0) {
    readability -= 2;
    weakAreas.push("Some scenes lack concrete events or consequences");
  }

  if (!plan.symbolicObject?.trim()) {
    emotionalStakes -= 1;
    weakAreas.push("Missing meaningful recurring object");
  }

  if (!last?.concreteEvent?.includes("?") && last?.narration.every((n) => VAGUE_WORDS.test(n))) {
    cliffhangerStrength -= 2;
    weakAreas.push("Ending cliffhanger is too vague");
  }

  const scores = normalizeScores({
    hookStrength,
    readability,
    emotionalStakes,
    sceneVariety,
    textSpecificity,
    cliffhangerStrength,
    conversionPotential,
  });

  const needsImprovement = SCORE_KEYS.some((k) => scores[k] < 7);

  return {
    scores,
    needsImprovement,
    weakAreas: weakAreas.length ? weakAreas : ["General pacing could be sharper"],
    summary: needsImprovement
      ? "Story needs more concrete beats and specificity"
      : "Story quality acceptable",
  };
}

export async function evaluateStoryQuality(
  plan: EpisodeStoryPlan
): Promise<StoryQualityResult> {
  if (!hasOpenAIKey() || !EPISODE_USE_LLM_QUALITY_SCORING) {
    return heuristicQualityCheck(plan);
  }

  try {
    const payload = JSON.stringify({
      storyTitle: plan.storyTitle,
      logline: plan.logline,
      symbolicObject: plan.symbolicObject,
      pressureSource: plan.pressureSource,
      mainCharacters: plan.mainCharacters,
      scenes: plan.scenes.map((s) => ({
        sceneNumber: s.sceneNumber,
        title: s.title,
        storyPhase: s.storyPhase,
        sceneType: s.sceneType,
        concreteEvent: s.concreteEvent,
        whatChanges: s.whatChanges,
        location: s.location,
        keyObject: s.keyObject,
        narration: s.narration,
      })),
    });

    const raw = await callOpenAIChat({
      prompt: `${STORY_QUALITY_CHECK_PROMPT}\n\nPLAN:\n${payload}`,
      json: true,
    });
    const parsed = parseJsonResponse<{
      scores: Partial<EpisodeQualityScores>;
      needsImprovement?: boolean;
      weakAreas?: string[];
      summary?: string;
    }>(raw);

    const scores = normalizeScores(parsed.scores ?? {});
    const needsImprovement =
      parsed.needsImprovement ?? SCORE_KEYS.some((k) => scores[k] < 7);

    return {
      scores,
      needsImprovement,
      weakAreas: parsed.weakAreas?.length
        ? parsed.weakAreas
        : ["Improve concrete events and text specificity"],
      summary: parsed.summary ?? "",
    };
  } catch {
    return heuristicQualityCheck(plan);
  }
}

function slimPlanForImprove(plan: EpisodeStoryPlan) {
  return {
    storyTitle: plan.storyTitle,
    logline: plan.logline,
    genre: plan.genre,
    tone: plan.tone,
    styleModeRecommendation: plan.styleMode,
    symbolicObject: plan.symbolicObject,
    pressureSource: plan.pressureSource,
    mainCharacters: plan.mainCharacters,
    scenes: plan.scenes.map((s) => ({
      sceneNumber: s.sceneNumber,
      title: s.title,
      storyPhase: s.storyPhase,
      sceneType: s.sceneType,
      concreteEvent: s.concreteEvent,
      whatChanges: s.whatChanges,
      protagonistEmotion: s.protagonistEmotion,
      location: s.location,
      keyObject: s.keyObject,
      summary: s.summary,
      narration: s.narration,
      dialogue: s.dialogue,
      continuityNotes: s.continuityNotes,
      cameraSuggestion: s.cameraSuggestion,
      visualMood: s.visualMood,
    })),
  };
}

const IMPROVE_TIMEOUT_MS = 90_000;

export async function improveStoryPlan(
  plan: EpisodeStoryPlan,
  input: EpisodeBuilderInput,
  weakAreas: string[]
): Promise<EpisodeStoryPlan> {
  const episodeLength = clampEpisodeLength(input.episodeLength);
  const improvePrompt = fillTemplate(STORY_QUALITY_IMPROVE_PROMPT, {
    WEAK_AREAS: weakAreas.join("; "),
    EPISODE_LENGTH: episodeLength,
    PHASE_ALLOCATION_GUIDE: buildPhaseAllocationGuide(episodeLength),
  });

  const payload = JSON.stringify({
    premise: input.description,
    currentPlan: slimPlanForImprove(plan),
  });

  const improveTask = callOpenAIChat({
    prompt: `${improvePrompt}\n\nCURRENT PLAN:\n${payload}`,
    json: true,
  });

  const timeoutTask = new Promise<never>((_, reject) => {
    setTimeout(
      () => reject(new Error("Story improvement timed out")),
      IMPROVE_TIMEOUT_MS
    );
  });

  const raw = await Promise.race([improveTask, timeoutTask]);
  const parsed = parseJsonResponse<RawStoryPlanResponse>(raw);
  return rawPlanToEpisodeStoryPlan(parsed, { ...input, episodeLength }, plan.id);
}

export function scoresNeedImprovement(scores: EpisodeQualityScores): boolean {
  return SCORE_KEYS.some((k) => scores[k] < 7);
}
