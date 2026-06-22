import type {
  ComicPage,
  EpisodePanel,
  EpisodeScript,
  ImagePromptResult,
  PanelBreakdown,
  TextOverlay,
} from "@/types/pipeline";
import type { Story, StoryEpisode } from "@/types/story";

function emptyPanel(panelNumber: number): EpisodePanel {
  return {
    panel_number: panelNumber,
    panel_type: "establishing",
    visual_description: `Panel ${panelNumber}`,
    camera_angle: "medium",
    character_emotion: "",
    background: "",
    dialogue: [],
    narration: "",
    sfx: "",
  };
}

export function buildUploadedStory(params: {
  id: string;
  title: string;
  genre: string;
  synopsis: string;
  coverGradient: string;
  creatorDisplayName?: string;
  panelImageUrls: string[];
}): Story {
  const panelCount = params.panelImageUrls.length;

  const script: EpisodeScript = {
    episode_title: "Episode 1",
    episode_number: 1,
    episode_summary: params.synopsis,
    emotional_goal: "",
    cliffhanger: "",
    panels: params.panelImageUrls.map((_, i) => emptyPanel(i + 1)),
  };

  const panelBreakdown: PanelBreakdown = {
    episode_number: 1,
    panel_count: panelCount,
    panels: params.panelImageUrls.map((url, i) => ({
      panel_number: i + 1,
      layout_zone: "full",
      visual: `Panel ${i + 1}`,
      emotion: "",
      dialogue_text: "",
      narration_text: "",
      sfx_text: "",
      camera: "",
      background: "",
      artUrl: url,
    })),
  };

  const imagePrompt: ImagePromptResult = {
    prompt: "Admin uploaded panels",
    art_style: "uploaded",
    panel_count: panelCount,
  };

  const comicPage: ComicPage = {
    episode_number: 1,
    artUrl: params.panelImageUrls[0] ?? null,
    artGradient: params.coverGradient,
    width: 720,
    height: panelCount * 900,
    noTextInImage: false,
  };

  const textOverlay: TextOverlay = {
    episode_number: 1,
    panels: [],
  };

  const episode: StoryEpisode = {
    id: `story-upload-${params.id}-ep-1`,
    episodeNumber: 1,
    title: "Episode 1",
    script,
    panelBreakdown,
    imagePrompt,
    comicPage,
    textOverlay,
  };

  return {
    id: params.id,
    title: params.title,
    genre: params.genre,
    coverGradient: params.coverGradient,
    chapters: [
      {
        id: `${params.id}-ch-1`,
        title: "Episode 1",
        pageStart: 1,
      },
    ],
    pages: [],
    createdAt: new Date().toISOString(),
    prompt: params.synopsis,
    synopsis: params.synopsis,
    episodes: [episode],
    source: "admin",
    status: "published",
    isPublic: true,
    creatorDisplayName: params.creatorDisplayName ?? "Toonlora Official",
  };
}
