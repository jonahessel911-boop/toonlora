export type SceneStatus =
  | "waiting"
  | "planning"
  | "prompt_ready"
  | "generating"
  | "done"
  | "failed";

export type EpisodePipelinePhase =
  | "idle"
  | "planning"
  | "creating_prompts"
  | "generating_images"
  | "ready"
  | "error";

export type StyleMode =
  | "auto"
  | "cinematic-comic"
  | "soft-romantic-webtoon"
  | "anime-inspired-drama"
  | "painterly-historical-comic"
  | "bright-adventure-comic"
  | "cozy-slice-of-life"
  | "dark-dramatic-comic";

export interface EpisodeBuilderInput {
  title?: string;
  description: string;
  genre?: string;
  tone?: string;
  styleMode?: StyleMode | string;
  episodeLength: number;
  /** When true, narration boxes are rendered inside generated images. */
  addTextInImage?: boolean;
  /** Series subject for Claude in-depth script generation. */
  seriesTopic?: string;
  /** Episode number for in-depth script generation. */
  episodeNumber?: number;
  /** Episode title for in-depth script generation. */
  episodeTitle?: string;
}

export interface EpisodeCharacter {
  name: string;
  description: string;
  role: string;
  appearanceNotes?: string;
}

export interface EpisodeDialogueLine {
  character: string;
  text: string;
}

export interface EpisodeQualityScores {
  hookStrength: number;
  readability: number;
  emotionalStakes: number;
  sceneVariety: number;
  textSpecificity: number;
  cliffhangerStrength: number;
  conversionPotential: number;
}

export interface EpisodeScene {
  id: string;
  sceneNumber: number;
  title: string;
  /** @deprecated use storyPhase */
  storyRole: string;
  storyPhase: string;
  sceneType: string;
  concreteEvent: string;
  whatChanges: string;
  protagonistEmotion: string;
  location: string;
  keyObject?: string;
  summary: string;
  narration: string[];
  dialogue?: EpisodeDialogueLine[];
  continuityNotes: string[];
  visualMood: string;
  cameraSuggestion: string;
  imagePrompt: string;
  whyThisSceneWorks?: string;
  status: SceneStatus;
  promptLocked?: boolean;
  imageUrl?: string;
  referenceImageUrls?: string[];
  errorMessage?: string;
}

export interface EpisodeStoryPlan {
  id: string;
  storyTitle: string;
  logline: string;
  genre: string;
  tone: string;
  styleMode: string;
  symbolicObject?: string;
  pressureSource?: string;
  qualityScores?: EpisodeQualityScores;
  mainCharacters: EpisodeCharacter[];
  scenes: EpisodeScene[];
  input: EpisodeBuilderInput;
  createdAt: string;
  updatedAt: string;
}

export interface EpisodeBuilderDraft {
  plan: EpisodeStoryPlan | null;
  savedAt: string;
}

export type PromptTweakAction =
  | "lock-prompt"
  | "lock-character"
  | "more-background"
  | "closer-shot"
  | "wider-shot"
  | "more-emotional"
  | "more-dramatic"
  | "simpler-composition";

export interface EpisodeExportPackage {
  version: 1;
  exportedAt: string;
  story: {
    title: string;
    logline: string;
    genre: string;
    tone: string;
    styleMode: string;
    characters: EpisodeCharacter[];
  };
  scenes: {
    sceneNumber: number;
    title: string;
    storyRole: string;
    summary: string;
    narration: string[];
    dialogue?: EpisodeDialogueLine[];
    imagePrompt: string;
    imageUrl?: string;
  }[];
}

/** Map legacy persisted statuses to the current schema. */
export function normalizeSceneStatus(status: string): SceneStatus {
  if (status === "generated") return "done";
  if (status === "draft") return "waiting";
  if (
    status === "waiting" ||
    status === "planning" ||
    status === "prompt_ready" ||
    status === "generating" ||
    status === "done" ||
    status === "failed"
  ) {
    return status;
  }
  return "waiting";
}

export function sceneStatusLabel(status: SceneStatus): string {
  switch (status) {
    case "generating":
      return "Generating";
    case "done":
      return "Done";
    case "failed":
      return "Failed";
    case "planning":
      return "Planning";
    default:
      return "Waiting";
  }
}

export function isSceneComplete(status: SceneStatus): boolean {
  return status === "done";
}
