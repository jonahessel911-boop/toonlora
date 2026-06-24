import type {
  EpisodeBuilderInput,
  EpisodeScene,
  EpisodeStoryPlan,
  PromptTweakAction,
} from "@/types/episode-builder";
import {
  fillTemplate,
  finalizeEpisodeImagePrompt,
  formatNarrationLinesForPrompt,
  genreHintFor,
  IMAGE_PROMPT_BASE_TEMPLATE,
  IMAGE_PROMPT_REFERENCE_SUFFIX,
  IMAGE_PROMPT_REFERENCE_WITH_TEXT_SUFFIX,
  IMAGE_PROMPT_REGENERATOR_PROMPT,
  imagePromptTextBlocks,
  PROMPT_TWEAK_HINTS,
  STORY_PLANNER_SYSTEM_PROMPT,
} from "@/lib/episode-builder/prompts";
import {
  DEFAULT_ADD_TEXT_IN_IMAGE,
  EPISODE_CHARACTER_CONSISTENCY,
  resolveStyleMode,
  styleModeToLabel,
} from "@/lib/episode-builder/constants";
import { attachReferenceUrls } from "@/lib/episode-builder/continuity";
import {
  buildPhaseAllocationGuide,
  clampEpisodeLength,
  maxRhetoricalQuestions,
  narrationBoxCountForLength,
} from "@/lib/episode-builder/storyStructure";

export interface RawStoryPlanResponse {
  storyTitle: string;
  logline: string;
  genre: string;
  tone: string;
  styleModeRecommendation?: string;
  symbolicObject?: string;
  pressureSource?: string;
  mainCharacters: {
    name: string;
    description: string;
    role: string;
    appearanceNotes?: string;
  }[];
  scenes: {
    sceneNumber: number;
    title: string;
    storyPhase?: string;
    storyRole?: string;
    sceneType?: string;
    concreteEvent?: string;
    whatChanges?: string;
    protagonistEmotion?: string;
    location?: string;
    keyObject?: string;
    summary: string;
    narration: string[];
    dialogue?: { character: string; text: string }[];
    continuityNotes: string[];
    visualMood: string;
    cameraSuggestion: string;
    whyThisSceneWorks?: string;
  }[];
}

function newSceneId(planId: string, sceneNumber: number): string {
  return `${planId}-scene-${sceneNumber}`;
}

function characterNotesBlock(plan: EpisodeStoryPlan): string {
  return plan.mainCharacters
    .map(
      (c) =>
        `${c.name} (${c.role}): ${c.description}${
          c.appearanceNotes ? `. Appearance: ${c.appearanceNotes}` : ""
        }`
    )
    .join("\n");
}

export function planAddsTextInImage(plan: EpisodeStoryPlan): boolean {
  return Boolean(plan.input?.addTextInImage ?? DEFAULT_ADD_TEXT_IN_IMAGE);
}

export function buildStoryPlannerPrompt(input: EpisodeBuilderInput): string {
  const episodeLength = clampEpisodeLength(input.episodeLength);
  const addTextInImage = Boolean(input.addTextInImage);
  const planner = fillTemplate(STORY_PLANNER_SYSTEM_PROMPT, {
    EPISODE_LENGTH: episodeLength,
    PHASE_ALLOCATION_GUIDE: buildPhaseAllocationGuide(episodeLength),
    NARRATION_BOX_RULES: narrationBoxCountForLength(episodeLength),
    MAX_RHETORICAL_QUESTIONS: maxRhetoricalQuestions(episodeLength),
  });

  return `${planner}

STORY DESCRIPTION (infer title, genre, tone, style mode, characters, and all scenes from this alone):
${input.description}

TECHNICAL SETTINGS (do not override story inference):
- Episode length: ${episodeLength} scenes
- Character consistency: ${EPISODE_CHARACTER_CONSISTENCY}
- Add text in image: ${addTextInImage ? "yes — narration will be rendered inside panels" : "no — art-only panels, narration is draft copy only"}`;
}

export function buildImagePromptFromScene(
  scene: EpisodeScene,
  plan: EpisodeStoryPlan
): string {
  const styleLabel = styleModeToLabel(plan.styleMode);
  const hasRefs = (scene.referenceImageUrls?.length ?? 0) > 0;
  const addTextInImage = planAddsTextInImage(plan);
  const textBlocks = imagePromptTextBlocks(addTextInImage, scene.narration);

  let prompt = fillTemplate(IMAGE_PROMPT_BASE_TEMPLATE, {
    TEXT_POLICY: textBlocks.textPolicy,
    IMAGE_NUMBER: scene.sceneNumber,
    STORY_PHASE: scene.storyPhase || scene.storyRole,
    EVENT_LABEL: textBlocks.eventLabel,
    CONCRETE_EVENT: scene.concreteEvent || scene.summary,
    WHAT_CHANGES: scene.whatChanges || "The story moves forward.",
    CHARACTERS: characterNotesBlock(plan),
    PROTAGONIST_EMOTION: scene.protagonistEmotion || scene.visualMood,
    KEY_OBJECT: scene.keyObject || plan.symbolicObject || "none",
    LOCATION: scene.location || "unspecified",
    COMPOSITION: scene.cameraSuggestion,
    STYLE_MODE: styleLabel,
    STYLE_STORYTELLING: textBlocks.styleStorytelling,
    REFERENCE_TEXT_RULE: textBlocks.referenceTextRule,
    TEXT_FOOTER: textBlocks.textFooter,
  });

  const genreHint = genreHintFor(plan.genre);
  if (genreHint) prompt += `\n${genreHint}`;

  if (hasRefs) {
    prompt += `\n${
      addTextInImage
        ? IMAGE_PROMPT_REFERENCE_WITH_TEXT_SUFFIX
        : IMAGE_PROMPT_REFERENCE_SUFFIX
    }`;
  }

  return finalizeEpisodeImagePrompt(prompt, addTextInImage);
}

export function buildScenePromptRegeneratorPrompt(params: {
  scene: EpisodeScene;
  plan: EpisodeStoryPlan;
  tweaks?: PromptTweakAction[];
  previousPrompt?: string;
}): string {
  const { scene, plan, previousPrompt } = params;
  const addTextInImage = planAddsTextInImage(plan);

  const referenceHint =
    (scene.referenceImageUrls?.length ?? 0) > 0
      ? `Reference images available from prior scenes: ${scene.referenceImageUrls!.length}. Preserve character identity only — do not copy pose or composition.`
      : "No reference images yet — this may be an early scene.";

  const textModeRequirements = addTextInImage
    ? `- Include readable English narration boxes with exact lines:\n${formatNarrationLinesForPrompt(scene.narration)}`
    : `- ZERO text in the image: no speech bubbles, captions, narration boxes, letters, or words
- Do not include scene narration or dialogue as visible text`;

  return fillTemplate(IMAGE_PROMPT_REGENERATOR_PROMPT, {
    SCENE_NUMBER: scene.sceneNumber,
    EPISODE_LENGTH: plan.scenes.length,
    STORY_TITLE: plan.storyTitle,
    GENRE: plan.genre,
    TONE: plan.tone,
    STYLE_MODE: styleModeToLabel(plan.styleMode),
    SCENE_TITLE: scene.title,
    STORY_PHASE: scene.storyPhase || scene.storyRole,
    CONCRETE_EVENT: scene.concreteEvent || scene.summary,
    WHAT_CHANGES: scene.whatChanges || "",
    LOCATION: scene.location || "",
    CAMERA_SUGGESTION: scene.cameraSuggestion,
    CONTINUITY_NOTES: scene.continuityNotes.join("; "),
    CHARACTER_BLOCK: characterNotesBlock(plan),
    GENRE_HINT: genreHintFor(plan.genre),
    REFERENCE_HINT: referenceHint,
    TEXT_MODE_REQUIREMENTS: textModeRequirements,
  }).concat(
    previousPrompt ? `\n\nPrevious prompt to improve:\n${previousPrompt}` : ""
  );
}

function mapRawScene(
  s: RawStoryPlanResponse["scenes"][number],
  planId: string
): EpisodeScene {
  const storyPhase = s.storyPhase || s.storyRole || "story beat";
  const concreteEvent = s.concreteEvent?.trim() || s.summary?.trim() || "";
  return {
    id: newSceneId(planId, s.sceneNumber),
    sceneNumber: s.sceneNumber,
    title: s.title,
    storyRole: storyPhase,
    storyPhase,
    sceneType: s.sceneType || "story moment",
    concreteEvent,
    whatChanges: s.whatChanges?.trim() || "",
    protagonistEmotion: s.protagonistEmotion?.trim() || s.visualMood || "",
    location: s.location?.trim() || "",
    keyObject: s.keyObject?.trim() || undefined,
    summary: concreteEvent || s.summary,
    narration: s.narration ?? [],
    dialogue: s.dialogue,
    continuityNotes: s.continuityNotes ?? [],
    visualMood: s.visualMood,
    cameraSuggestion: s.cameraSuggestion,
    whyThisSceneWorks: s.whyThisSceneWorks,
    imagePrompt: "",
    status: "waiting" as const,
  };
}

export function rawPlanToEpisodeStoryPlan(
  raw: RawStoryPlanResponse,
  input: EpisodeBuilderInput,
  existingPlanId?: string
): EpisodeStoryPlan {
  const planId = existingPlanId ?? `ep-${Date.now()}`;
  const episodeLength = clampEpisodeLength(input.episodeLength);
  const styleMode = resolveStyleMode(undefined, raw.styleModeRecommendation);
  const now = new Date().toISOString();

  let scenes: EpisodeScene[] = raw.scenes
    .slice(0, episodeLength)
    .map((s) => mapRawScene(s, planId));

  while (scenes.length < episodeLength) {
    const n = scenes.length + 1;
    scenes.push({
      id: newSceneId(planId, n),
      sceneNumber: n,
      title: `Scene ${n}`,
      storyRole: "choice consequence",
      storyPhase: "choice_consequence",
      sceneType: "decision scene",
      concreteEvent: "The protagonist makes a difficult choice.",
      whatChanges: "The situation becomes harder to reverse.",
      protagonistEmotion: "conflicted",
      location: "unspecified",
      summary: "The protagonist makes a difficult choice.",
      narration: [],
      continuityNotes: [],
      visualMood: raw.tone,
      cameraSuggestion: "Medium shot",
      imagePrompt: "",
      status: "waiting",
    });
  }

  const plan: EpisodeStoryPlan = {
    id: planId,
    storyTitle: raw.storyTitle?.trim() || "Untitled Episode",
    logline: raw.logline?.trim() || "",
    genre: raw.genre?.trim() || "Drama",
    tone: raw.tone?.trim() || "Reflective",
    styleMode,
    symbolicObject: raw.symbolicObject?.trim(),
    pressureSource: raw.pressureSource?.trim(),
    mainCharacters: raw.mainCharacters ?? [],
    scenes,
    input: {
      description: input.description,
      episodeLength,
      addTextInImage: Boolean(input.addTextInImage),
    },
    createdAt: now,
    updatedAt: now,
  };

  plan.scenes = plan.scenes.map((scene) => {
    const withRefs = attachReferenceUrls(plan.scenes).find(
      (s) => s.id === scene.id
    )!;
    const imagePrompt = buildImagePromptFromScene(withRefs, plan);
    return {
      ...withRefs,
      imagePrompt,
      status: "prompt_ready" as const,
    };
  });

  return plan;
}

export function applyPromptToAllScenes(plan: EpisodeStoryPlan): EpisodeStoryPlan {
  const linked = attachReferenceUrls(plan.scenes);
  const scenes = linked.map((scene) => ({
    ...scene,
    imagePrompt: scene.promptLocked
      ? scene.imagePrompt
      : buildImagePromptFromScene(scene, plan),
    status: scene.status === "done" ? scene.status : ("prompt_ready" as const),
  }));

  return {
    ...plan,
    scenes,
    updatedAt: new Date().toISOString(),
  };
}

export function applyTweakToPrompt(
  prompt: string,
  tweak: PromptTweakAction
): string {
  if (tweak === "lock-prompt" || tweak === "lock-character") return prompt;
  const hint = PROMPT_TWEAK_HINTS[tweak];
  if (!hint) return prompt;
  if (prompt.toLowerCase().includes(hint.slice(0, 24).toLowerCase())) return prompt;
  return `${prompt}\n${hint}`;
}

export function normalizeEpisodeScene(scene: EpisodeScene): EpisodeScene {
  const storyPhase = scene.storyPhase || scene.storyRole || "story beat";
  return {
    ...scene,
    storyPhase,
    storyRole: scene.storyRole || storyPhase,
    sceneType: scene.sceneType || "story moment",
    concreteEvent: scene.concreteEvent || scene.summary || "",
    whatChanges: scene.whatChanges || "",
    protagonistEmotion: scene.protagonistEmotion || scene.visualMood || "",
    location: scene.location || "",
  };
}

export function normalizeEpisodePlan(plan: EpisodeStoryPlan): EpisodeStoryPlan {
  return {
    ...plan,
    scenes: plan.scenes.map(normalizeEpisodeScene),
  };
}
