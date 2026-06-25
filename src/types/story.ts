import type {
  ContinuityMemory,
  EpisodeScript,
  PanelBreakdown,
  PipelineResult,
  SeriesInput,
  StoryBible,
  TextOverlay,
  ComicPage,
  ImagePromptResult,
} from "@/types/pipeline";
import type { StoryChapter, StoryPage } from "@/types/story-legacy";

export type Genre =
  | "Romance"
  | "Anime Romance"
  | "Fantasy Romance"
  | "Drama"
  | "Dark Romance"
  | "Office Romance";

export type StoryLength = "Short" | "Normal" | "Long";

export type Tone =
  | "Cute"
  | "Dramatic"
  | "Spicy but non-explicit"
  | "Emotional"
  | "Cinematic";

export type Category =
  | "Romance"
  | "Anime"
  | "Fantasy"
  | "Drama"
  | "Spicy"
  | "Slice of Life"
  | "Comedy"
  | "Adventure";

/** @deprecated Use SeriesInput — kept for backward compat */
export interface CreateStoryInput {
  title?: string;
  genre: Genre;
  mainCharacter: string;
  loveInterest: string;
  prompt: string;
  length: StoryLength;
  tone: Tone;
}

export interface StoryEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  script: EpisodeScript;
  panelBreakdown: PanelBreakdown;
  imagePrompt: ImagePromptResult;
  comicPage: ComicPage;
  textOverlay: TextOverlay;
}

export interface Story {
  id: string;
  title: string;
  genre: Genre | Category | string;
  coverGradient: string;
  chapters: StoryChapter[];
  pages: StoryPage[];
  createdAt: string;
  mainCharacter?: string;
  loveInterest?: string;
  prompt?: string;

  /** Story-to-Webtoon Engine data */
  userInput?: SeriesInput;
  storyBible?: StoryBible;
  episodes?: StoryEpisode[];
  continuityMemory?: ContinuityMemory;
  pipelineResult?: PipelineResult;

  /** Publishing metadata (from Supabase) */
  source?: "admin" | "creator";
  status?: "draft" | "published";
  publishedAt?: string | null;
  synopsis?: string;
  creatorDisplayName?: string;
  featuredRank?: number | null;
  viewsCount?: number;
  likesCount?: number;
  isPublic?: boolean;
  coverArtUrl?: string;
  displayTitle?: string;
}

/** @deprecated Use CatalogSeries from @/types/catalog */
export interface SampleStory {
  id: string;
  title: string;
  genre: Category;
  coverGradient: string;
  rank?: number;
}

/** Re-export legacy page types */
export type { StoryPage, StoryChapter } from "@/types/story-legacy";

/** Re-export pipeline input type */
export type { SeriesInput } from "@/types/pipeline";
