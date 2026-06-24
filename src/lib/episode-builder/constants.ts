import type { StyleMode } from "@/types/episode-builder";

export const DEFAULT_EPISODE_LENGTH = 10;

/** Always strict — character identity must match across all scenes. */
export const EPISODE_CHARACTER_CONSISTENCY =
  "Strict — preserve character face, hair, outfit, proportions, and visual tone across every scene.";

/** Generate images one-by-one so reference continuity works. */
export const EPISODE_PARALLEL_GENERATION = false;

/** Keep generating remaining images when one fails. */
export const EPISODE_CONTINUE_ON_ERROR = true;

/** Default: art-only panels; enable per episode via input.addTextInImage. */
export const DEFAULT_ADD_TEXT_IN_IMAGE = false;

/** LLM quality scoring adds latency; heuristic check is instant. */
export const EPISODE_USE_LLM_QUALITY_SCORING = false;

/** Rewrites the full plan via LLM — slow (1–3 min). Off by default. */
export const EPISODE_LLM_QUALITY_IMPROVE = false;

/** Client fetch timeouts (ms). */
export const EPISODE_PLAN_FETCH_TIMEOUT_MS = 180_000;
export const EPISODE_PROMPT_FETCH_TIMEOUT_MS = 60_000;
export const EPISODE_IMAGE_FETCH_TIMEOUT_MS = 300_000;
export const EPISODE_IN_DEPTH_FETCH_TIMEOUT_MS = 300_000;

export const GENRE_OPTIONS = [
  "Auto-detect",
  "Historical drama",
  "Romance",
  "Fantasy",
  "Adventure",
  "Slice of life",
  "Thriller",
  "Sci-fi",
  "Comedy",
  "Horror",
] as const;

export const TONE_OPTIONS = [
  "Auto-detect",
  "Reflective",
  "Warm",
  "Hopeful",
  "Melancholic",
  "Tense",
  "Whimsical",
  "Dark",
  "Lighthearted",
  "Epic",
] as const;

export const STYLE_MODE_OPTIONS: {
  id: StyleMode;
  label: string;
  description: string;
}[] = [
  {
    id: "auto",
    label: "Auto-select from story",
    description: "Let the planner pick the best Toonlora-compatible style.",
  },
  {
    id: "cinematic-comic",
    label: "Cinematic comic",
    description: "Film-like framing, dramatic lighting, polished comic panels.",
  },
  {
    id: "soft-romantic-webtoon",
    label: "Soft romantic webtoon",
    description: "Gentle colors, expressive faces, intimate emotional beats.",
  },
  {
    id: "anime-inspired-drama",
    label: "Anime-inspired drama",
    description: "Clean linework, expressive eyes, dynamic emotional staging.",
  },
  {
    id: "painterly-historical-comic",
    label: "Painterly historical comic",
    description: "Textured brushwork, period detail, grounded atmosphere.",
  },
  {
    id: "bright-adventure-comic",
    label: "Bright adventure comic",
    description: "Vivid palette, energetic motion, clear heroic readability.",
  },
  {
    id: "cozy-slice-of-life",
    label: "Cozy slice-of-life",
    description: "Warm everyday settings, soft humor, approachable charm.",
  },
  {
    id: "dark-dramatic-comic",
    label: "Dark dramatic comic",
    description: "Moody shadows, high contrast, intense emotional stakes.",
  },
];

export const STYLE_MODE_LABELS: Record<string, string> = Object.fromEntries(
  STYLE_MODE_OPTIONS.map((o) => [o.id, o.label])
);

export const EPISODE_BUILDER_STORAGE_KEY = "toonlora-episode-builder-draft";

export interface EpisodeBuilderPreset {
  id: string;
  label: string;
  description: string;
  input: {
    description: string;
  };
}

export const EPISODE_BUILDER_PRESETS: EpisodeBuilderPreset[] = [
  {
    id: "ww2-pilot",
    label: "WW2 pilot drama",
    description: "Historical drama preset",
    input: {
      description:
        "A young Japanese pilot in WW2 slowly realizes the emotional cost of war.",
    },
  },
  {
    id: "romantic-reunion",
    label: "Romantic reunion",
    description: "Warm reunion romance preset",
    input: {
      description:
        "A warm romantic story about two people who reconnect years later at a rainy train station.",
    },
  },
  {
    id: "luna-fish",
    label: "Luna the magical fish",
    description: "Whimsical fantasy preset",
    input: {
      description:
        "A fantasy story about a girl who becomes friends with a magical fish named Luna.",
    },
  },
];

export function styleModeToLabel(mode: string): string {
  return STYLE_MODE_LABELS[mode] ?? mode.replace(/-/g, " ");
}

export function resolveStyleMode(
  requested: string | undefined,
  recommended?: string
): string {
  if (requested && requested !== "auto") return requested;
  return recommended ?? "cinematic-comic";
}
