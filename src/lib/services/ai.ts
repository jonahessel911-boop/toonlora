import type { SeriesInput, StoryBible } from "@/types/pipeline";
import type { Story } from "@/types/story";
import { runStoryToWebtoonPipeline } from "@/lib/engine/pipeline";
import { pipelineResultToStory } from "@/lib/story-builder";

/**
 * Story-to-Webtoon Engine entry point.
 * Uses OpenAI when OPENAI_API_KEY is set, otherwise mock pipeline.
 */
export async function generateStory(input: SeriesInput): Promise<Story> {
  const result = await runStoryToWebtoonPipeline(input);
  return pipelineResultToStory(result);
}

export async function generateNextEpisode(
  input: SeriesInput,
  storyBible: StoryBible,
  episodeNumber: number,
  previousSummary: string,
  episodePrompt: string
): Promise<Story> {
  const result = await runStoryToWebtoonPipeline(input, {
    episodeNumber,
    previousEpisodeSummary: previousSummary,
    episodePrompt,
    existingStoryBible: storyBible,
  });
  return pipelineResultToStory(result);
}
