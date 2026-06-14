import { COVER_GRADIENTS } from "@/lib/constants";
import { pipelineToLegacyPages } from "@/lib/engine/pipeline";
import type { PipelineResult } from "@/types/pipeline";
import type { Story, StoryEpisode } from "@/types/story";

function generateId(): string {
  return `story-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pipelineResultToStory(result: PipelineResult): Story {
  const id = generateId();
  const { storyBible, episodeScript, userInput } = result;

  const episode: StoryEpisode = {
    id: `${id}-ep-${episodeScript.episode_number}`,
    episodeNumber: episodeScript.episode_number,
    title: episodeScript.episode_title,
    script: episodeScript,
    panelBreakdown: result.panelBreakdown,
    imagePrompt: result.imagePrompt,
    comicPage: result.comicPage,
    textOverlay: result.textOverlay,
  };

  const pages = pipelineToLegacyPages(result, id);

  return {
    id,
    title: storyBible.series_title,
    genre: userInput.genre,
    coverGradient: pickRandom(COVER_GRADIENTS),
    chapters: [
      {
        id: `${id}-ch-1`,
        title: episodeScript.episode_title,
        pageStart: 1,
      },
    ],
    pages,
    createdAt: new Date().toISOString(),
    mainCharacter: userInput.main_character,
    loveInterest: userInput.love_interest,
    prompt: userInput.story_idea,
    userInput,
    storyBible,
    episodes: [episode],
    continuityMemory: result.continuityMemory,
    pipelineResult: result,
  };
}
