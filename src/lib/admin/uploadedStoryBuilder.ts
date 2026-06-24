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

export function buildEpisodeFromPanelUrls(params: {
  storyId: string;
  episodeNumber: number;
  episodeId?: string;
  episodeTitle?: string;
  synopsis?: string;
  coverGradient: string;
  panelImageUrls: string[];
}): StoryEpisode {
  const panelCount = params.panelImageUrls.length;
  const episodeNumber = params.episodeNumber;

  const script: EpisodeScript = {
    episode_title: params.episodeTitle ?? `Chapter ${episodeNumber}`,
    episode_number: episodeNumber,
    episode_summary: params.synopsis ?? "",
    emotional_goal: "",
    cliffhanger: "",
    panels: params.panelImageUrls.map((_, i) => emptyPanel(i + 1)),
  };

  const panelBreakdown: PanelBreakdown = {
    episode_number: episodeNumber,
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
    episode_number: episodeNumber,
    artUrl: params.panelImageUrls[0] ?? null,
    artGradient: params.coverGradient,
    width: 720,
    height: panelCount * 900,
    noTextInImage: false,
  };

  const textOverlay: TextOverlay = {
    episode_number: episodeNumber,
    panels: [],
  };

  return {
    id: params.episodeId ?? `story-upload-${params.storyId}-ep-${episodeNumber}`,
    episodeNumber,
    title: params.episodeTitle ?? `Chapter ${episodeNumber}`,
    script,
    panelBreakdown,
    imagePrompt,
    comicPage,
    textOverlay,
  };
}

export function getEpisodePanelUrls(episode: StoryEpisode): string[] {
  const fromBreakdown = [...episode.panelBreakdown.panels]
    .sort((a, b) => a.panel_number - b.panel_number)
    .map((panel) => panel.artUrl)
    .filter((url): url is string => Boolean(url));

  if (fromBreakdown.length > 0) return fromBreakdown;
  if (episode.comicPage.artUrl) return [episode.comicPage.artUrl];
  return [];
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
  const episode = buildEpisodeFromPanelUrls({
    storyId: params.id,
    episodeNumber: 1,
    synopsis: params.synopsis,
    coverGradient: params.coverGradient,
    panelImageUrls: params.panelImageUrls,
  });

  return {
    id: params.id,
    title: params.title,
    genre: params.genre,
    coverGradient: params.coverGradient,
    chapters: [
      {
        id: `${params.id}-ch-1`,
        title: "Chapter 1",
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
