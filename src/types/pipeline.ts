/** User input — step 0 input */
export interface SeriesInput {
  story_idea: string;
  genre: string;
  style: string;
  tone: string;
  main_character: string;
  love_interest: string;
  language: string;
  episode_length: "Short" | "Normal" | "Long";
  target_audience: string;
  /** Override panel count per episode (4–14). Takes precedence over episode_length. */
  panel_count?: number;
}

export interface StoryCharacter {
  name: string;
  role: string;
  age_range: string;
  personality: string;
  visual_design: string;
  signature_outfit: string;
  emotional_arc: string;
}

export interface StoryBible {
  series_title: string;
  logline: string;
  genre: string;
  tone: string;
  target_audience: string;
  visual_style: string;
  main_characters: StoryCharacter[];
  world: {
    setting: string;
    mood: string;
    important_locations: string[];
  };
  story_rules: string[];
  season_arc: string;
  episode_1_hook: string;
  recurring_conflict: string;
  visual_keywords: string[];
}

export interface EpisodeDialogue {
  speaker: string;
  text: string;
}

export interface EpisodePanel {
  panel_number: number;
  panel_type:
    | "establishing"
    | "close-up"
    | "action"
    | "reaction"
    | "emotional"
    | "cliffhanger";
  visual_description: string;
  camera_angle: string;
  character_emotion: string;
  background: string;
  dialogue: EpisodeDialogue[];
  narration: string;
  sfx: string;
}

export interface EpisodeScript {
  episode_title: string;
  episode_number: number;
  episode_summary: string;
  emotional_goal: string;
  cliffhanger: string;
  panels: EpisodePanel[];
}

export interface PanelBreakdownItem {
  panel_number: number;
  layout_zone: string;
  visual: string;
  emotion: string;
  dialogue_text: string;
  narration_text: string;
  sfx_text: string;
  camera: string;
  background: string;
}

export interface PanelBreakdown {
  episode_number: number;
  panel_count: number;
  panels: PanelBreakdownItem[];
}

export interface ImagePromptResult {
  prompt: string;
  art_style: string;
  panel_count: number;
}

export interface ComicPage {
  episode_number: number;
  /** Vertical webtoon page with dialogue baked into the artwork */
  artUrl: string | null;
  artGradient: string;
  width: number;
  height: number;
  noTextInImage: false;
}

export interface BubblePosition {
  x: number;
  y: number;
  width: number;
}

export interface TextBubble {
  type: "speech" | "narration" | "sfx";
  speaker: string;
  text: string;
  position: BubblePosition;
  tail_direction?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
}

export interface PanelOverlay {
  panel_number: number;
  bubbles: TextBubble[];
}

export interface TextOverlay {
  episode_number: number;
  panels: PanelOverlay[];
}

export interface ContinuityMemory {
  series_title: string;
  last_episode_number: number;
  last_episode_summary: string;
  character_states: Record<string, string>;
  unresolved_threads: string[];
  visual_consistency_notes: string[];
}

export type PipelineStepId =
  | "moderation"
  | "story_bible"
  | "episode_script"
  | "panel_breakdown"
  | "image_prompt"
  | "comic_image"
  | "image_qa"
  | "text_overlay"
  | "continuity";

export interface PipelineStepStatus {
  id: PipelineStepId;
  label: string;
  model: string;
  status: "pending" | "running" | "done" | "error";
  message?: string;
}

export interface PipelineResult {
  userInput: SeriesInput;
  storyBible: StoryBible;
  episodeScript: EpisodeScript;
  panelBreakdown: PanelBreakdown;
  imagePrompt: ImagePromptResult;
  comicPage: ComicPage;
  textOverlay: TextOverlay;
  continuityMemory: ContinuityMemory;
  steps: PipelineStepStatus[];
}
