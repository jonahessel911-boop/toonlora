export type PipelineStep =
  | "research"
  | "bible"
  | "architect"
  | "script"
  | "story"
  | "prompts"
  | "images"
  | "complete";

export const PIPELINE_STEPS: PipelineStep[] = [
  "research",
  "bible",
  "architect",
  "script",
  "prompts",
  "images",
];

export interface ResearchFact {
  fact: string;
  source_hint?: string;
  category?: string;
}

export interface ResearchTimelineEvent {
  date: string;
  event: string;
  significance?: string;
}

export interface ResearchCharacter {
  name: string;
  role: string;
  description?: string;
}

export interface ResearchTurningPoint {
  title: string;
  description: string;
  episode_hint?: number;
}

export interface ResearchQuote {
  speaker: string;
  quote: string;
  context?: string;
}

/** Toonlora format: ~30–40 panels/chapter, ~5–6 images/panel */
export const PANELS_PER_CHAPTER = { min: 30, max: 40, typical: 35 } as const;
export const IMAGES_PER_PANEL = { min: 5, max: 6, typical: 5 } as const;

export interface ResearchStoryline {
  logline: string;
  narrative_arc: string;
  opening_hook: string;
  themes: string[];
  tone: string;
}

export interface ResearchEpisodeOutline {
  episode_number: number;
  title: string;
  logline: string;
  focus: string;
  depth: "highlight" | "deep_dive" | "mixed";
  suggested_chapters: number;
  why_compelling: string;
}

export interface ResearchCountRange {
  min: number;
  max: number;
  recommended: number;
}

export interface ResearchSeriesPotential {
  estimated_episodes: ResearchCountRange;
  estimated_chapters: ResearchCountRange;
  estimated_panels: { min: number; max: number };
  estimated_images: { min: number; max: number };
  panels_per_chapter: number;
  images_per_panel: number;
  reasoning: string;
  episode_outlines: ResearchEpisodeOutline[];
}

export interface ResearchJson {
  topic: string;
  facts: ResearchFact[];
  timeline: ResearchTimelineEvent[];
  characters: ResearchCharacter[];
  turning_points: ResearchTurningPoint[];
  quotes: ResearchQuote[];
  researched_at: string;
  web_search_query?: string;
  web_search_queries?: string[];
  web_search_raw?: string;
  storyline?: ResearchStoryline;
  series_potential?: ResearchSeriesPotential;
}

export interface PanelOutline {
  panel_number: number;
  chapter_number: number;
  beat: string;
  visual_hint: string;
}

export type PanelType =
  | "scene"
  | "title_card"
  | "stat_card"
  | "dialogue"
  | "transition";

export type TextPlacement = "top" | "bottom" | "split";

export interface PanelScript {
  panel_number: number;
  chapter_number: number;
  chapter_title: string;
  panel_type: PanelType;
  visual_description: string;
  character_details: string;
  background_props: string;
  caption_text: string;
  dialogue_text: string | null;
  text_placement: TextPlacement;
  mood: string;
  era_details: string;
}

export interface StorylineBibleEpisode {
  episode_number: number;
  title: string;
  time_period: string;
  narrative_arc: string;
  story_beats: string[];
  panel_count_estimated: number;
  ugc_hook: string;
}

export interface StorylineBible {
  series_title: string;
  total_episodes: number;
  total_panels_estimated: number;
  storyline_bible: string;
  episodes: StorylineBibleEpisode[];
}

export interface StoryBibleChapter {
  chapter_number: number;
  title: string;
  description: string;
  panel_count: number;
}

export interface StoryBibleEpisode {
  episode_number: number;
  title: string;
  time_period: string;
  logline: string;
  target_panel_count: number;
  chapters: StoryBibleChapter[];
}

export interface StoryBible {
  series_title: string;
  logline: string;
  episodes: StoryBibleEpisode[];
}

export interface ChapterOutline {
  chapter_number: number;
  title: string;
  summary: string;
  panels: PanelOutline[];
}

export interface EpisodeStructure {
  episode_number: number;
  title: string;
  logline: string;
  chapters: ChapterOutline[];
}

export interface SeriesArchitecture {
  series_title: string;
  logline: string;
  episodes: EpisodeStructure[];
}

export interface PanelRow {
  id: string;
  episode_id: string;
  panel_number: number;
  chapter_number: number;
  chapter_title?: string | null;
  panel_type?: string | null;
  visual_description: string | null;
  character_details?: string | null;
  background_props?: string | null;
  caption: string | null;
  dialogue: string | null;
  text_placement?: string | null;
  mood?: string | null;
  era_details?: string | null;
  script_json?: PanelScript | null;
  image_prompt: string | null;
  image_url: string | null;
  status: string;
}

export interface EpisodeRow {
  id: string;
  series_id: string;
  episode_number: number;
  title: string;
  panel_breakdown: unknown;
}

export interface SeriesRow {
  id: string;
  title: string;
  slug: string | null;
  category: string | null;
  research_json: ResearchJson | null;
  storyline_bible_json: StorylineBible | null;
  status: string;
}

export interface PipelineRunOptions {
  topic: string;
  category: string;
  seriesId?: string;
  resume?: boolean;
  maxPanels?: number;
  singleEpisode?: boolean;
  generateCover?: boolean;
}
