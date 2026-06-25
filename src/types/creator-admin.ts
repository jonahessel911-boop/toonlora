import type { PipelineRunStatus } from "@/lib/content-pipeline/constants";
import type { PipelineCostSummary } from "@/lib/content-pipeline/constants";

export interface PanelImageReview {
  id: string;
  panel_id: string;
  review_type: "ai" | "human";
  score: number | null;
  passed: boolean | null;
  issues: string[];
  summary: string | null;
  prompt_fix: string | null;
  human_rating: "approve" | "reject" | null;
  feedback_note: string | null;
  prompt_used: string | null;
  image_url: string | null;
  created_at: string;
}

export interface CreatorAdminPanel {
  id: string;
  episode_id: string;
  episode_number: number;
  episode_title: string;
  panel_number: number;
  chapter_number: number;
  visual_description: string | null;
  caption: string | null;
  dialogue: string | null;
  image_prompt: string | null;
  image_url: string | null;
  status: string;
  latest_ai_review: PanelImageReview | null;
  latest_human_review: PanelImageReview | null;
}

export interface CreatorAdminSeriesSummary {
  id: string;
  title: string;
  slug: string | null;
  category: string | null;
  status: string;
  display_title: string | null;
  cover_art_url: string | null;
  panel_count: number;
  with_image_count: number;
  approved_count: number;
  needs_review_count: number;
  created_at: string;
}

export interface CreatorAdminSeriesDetail {
  id: string;
  title: string;
  display_title: string | null;
  cover_art_url: string | null;
  cover_image_prompt: string | null;
  slug: string | null;
  category: string | null;
  status: string;
  episodes: Array<{
    id: string;
    episode_number: number;
    title: string;
    panels: CreatorAdminPanel[];
  }>;
}

export interface ImageQaResult {
  score: number;
  passed: boolean;
  issues: string[];
  summary: string;
  prompt_fix: string | null;
}

export interface PipelineResearchFact {
  fact: string;
  source_hint?: string;
  category?: string;
}

export interface PipelineResearchStoryline {
  logline: string;
  narrative_arc: string;
  opening_hook: string;
  themes: string[];
  tone: string;
}

export interface PipelineResearchEpisodeOutline {
  episode_number: number;
  title: string;
  logline: string;
  focus: string;
  depth: "highlight" | "deep_dive" | "mixed";
  suggested_chapters: number;
  why_compelling: string;
}

export interface PipelineResearchCountRange {
  min: number;
  max: number;
  recommended: number;
}

export interface PipelineResearchSeriesPotential {
  estimated_episodes: PipelineResearchCountRange;
  estimated_chapters: PipelineResearchCountRange;
  estimated_panels: { min: number; max: number };
  estimated_images: { min: number; max: number };
  panels_per_chapter: number;
  images_per_panel: number;
  reasoning: string;
  episode_outlines: PipelineResearchEpisodeOutline[];
}

export interface PipelineResearchJson {
  topic: string;
  facts: PipelineResearchFact[];
  timeline: Array<{ date: string; event: string; significance?: string }>;
  characters: Array<{ name: string; role: string; description?: string }>;
  quotes: Array<{ speaker: string; quote: string; context?: string }>;
  researched_at?: string;
  web_search_query?: string;
  web_search_queries?: string[];
  web_search_raw?: string;
  storyline?: PipelineResearchStoryline;
  series_potential?: PipelineResearchSeriesPotential;
}

export interface PipelineStorylineBibleEpisode {
  episode_number: number;
  title: string;
  time_period: string;
  narrative_arc: string;
  story_beats: string[];
  panel_count_estimated: number;
  ugc_hook: string;
}

export interface PipelineStorylineBible {
  series_title: string;
  total_episodes: number;
  total_panels_estimated: number;
  storyline_bible: string;
  episodes: PipelineStorylineBibleEpisode[];
}

export interface PipelineLivePanel {
  id: string;
  panel_number: number;
  visual_description: string | null;
  caption: string | null;
  dialogue: string | null;
  image_prompt: string | null;
  image_url: string | null;
  status: string;
}


export interface PipelineLiveState {
  status: PipelineRunStatus;
  series: {
    id: string;
    title: string;
    category: string | null;
  };
  research: PipelineResearchJson | null;
  storylineBible: PipelineStorylineBible | null;
  panels: PipelineLivePanel[];
  costs: PipelineCostSummary | null;
}
