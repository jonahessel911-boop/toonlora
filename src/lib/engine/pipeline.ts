import {
  PIPELINE_MODELS,
  PIPELINE_STEP_LABELS,
  buildStoryBiblePrompt,
  buildEpisodeScriptPrompt,
  buildPanelBreakdownPrompt,
  buildImagePromptGeneratorPrompt,
  buildTextOverlayPrompt,
  buildContinuityMemoryPrompt,
  buildModerationInput,
} from "@/lib/prompts";
import {
  mockModeration,
  mockStoryBible,
  mockEpisodeScript,
  mockPanelBreakdown,
  mockImagePrompt,
  mockComicPage,
  mockImageQA,
  mockTextOverlay,
  mockContinuityMemory,
} from "@/lib/engine/mock-generators";
import {
  hasOpenAIKey,
  callOpenAIChat,
  callOpenAIModeration,
  callOpenAIImage,
} from "@/lib/engine/openai-client";
import type {
  PipelineResult,
  PipelineStepStatus,
  SeriesInput,
  StoryBible,
  EpisodeScript,
  PanelBreakdown,
  TextOverlay,
  ContinuityMemory,
} from "@/types/pipeline";

function createSteps(): PipelineStepStatus[] {
  return (Object.keys(PIPELINE_MODELS) as Array<keyof typeof PIPELINE_MODELS>).map(
    (id) => ({
      id,
      label: PIPELINE_STEP_LABELS[id],
      model: PIPELINE_MODELS[id],
      status: "pending" as const,
    })
  );
}

function updateStep(
  steps: PipelineStepStatus[],
  id: PipelineStepStatus["id"],
  status: PipelineStepStatus["status"],
  message?: string
): PipelineStepStatus[] {
  return steps.map((s) =>
    s.id === id ? { ...s, status, message } : s
  );
}

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseJSON<T>(raw: string): T {
  const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned) as T;
}

export interface PipelineOptions {
  episodeNumber?: number;
  previousEpisodeSummary?: string;
  episodePrompt?: string;
  existingStoryBible?: import("@/types/pipeline").StoryBible;
  onStepUpdate?: (steps: PipelineStepStatus[]) => void;
}

/**
 * Story-to-Webtoon Engine
 * Prompt → Story Bible → Episode Script → Panel Breakdown → Image Prompt → Comic Page → Text Overlay
 */
export async function runStoryToWebtoonPipeline(
  input: SeriesInput,
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  const {
    episodeNumber = 1,
    previousEpisodeSummary = "",
    episodePrompt = input.story_idea,
    existingStoryBible,
    onStepUpdate,
  } = options;

  let steps = createSteps();
  const notify = () => onStepUpdate?.([...steps]);

  const runStep = async <T>(
    id: PipelineStepStatus["id"],
    fn: () => Promise<T>
  ): Promise<T> => {
    steps = updateStep(steps, id, "running");
    notify();
    await delay(hasOpenAIKey() ? 200 : 400);
    try {
      const result = await fn();
      steps = updateStep(steps, id, "done");
      notify();
      return result;
    } catch (err) {
      steps = updateStep(
        steps,
        id,
        "error",
        err instanceof Error ? err.message : "Unknown error"
      );
      notify();
      throw err;
    }
  };

  // Step 0: Moderation
  await runStep("moderation", async () => {
    const modInput = buildModerationInput(input);
    if (hasOpenAIKey()) {
      const passed = await callOpenAIModeration(modInput);
      if (!passed) throw new Error("Content flagged by moderation");
    } else {
      mockModeration(input);
    }
    return true;
  });

  // Step 1: Story Bible
  const storyBible = await runStep("story_bible", async () => {
    if (existingStoryBible) return existingStoryBible;
    if (hasOpenAIKey()) {
      const prompt = buildStoryBiblePrompt(input);
      const raw = await callOpenAIChat({
        model: PIPELINE_MODELS.story_bible,
        prompt,
        json: true,
      });
      return parseJSON<StoryBible>(raw);
    }
    return mockStoryBible(input);
  });

  // Step 2: Episode Script
  const episodeScript = await runStep("episode_script", async () => {
    if (hasOpenAIKey()) {
      const prompt = buildEpisodeScriptPrompt(
        storyBible,
        episodeNumber,
        previousEpisodeSummary,
        episodePrompt,
        input.language
      );
      const raw = await callOpenAIChat({
        model: PIPELINE_MODELS.episode_script,
        prompt,
        json: true,
      });
      return parseJSON<EpisodeScript>(raw);
    }
    return mockEpisodeScript(input, storyBible, episodeNumber);
  });

  // Step 3: Panel Breakdown
  const panelBreakdown = await runStep("panel_breakdown", async () => {
    if (hasOpenAIKey()) {
      const prompt = buildPanelBreakdownPrompt(storyBible, episodeScript);
      const raw = await callOpenAIChat({
        model: PIPELINE_MODELS.panel_breakdown,
        prompt,
        json: true,
      });
      return parseJSON<PanelBreakdown>(raw);
    }
    return mockPanelBreakdown(episodeScript);
  });

  // Step 4: Image Prompt
  const imagePrompt = await runStep("image_prompt", async () => {
    if (hasOpenAIKey()) {
      const directorPrompt = buildImagePromptGeneratorPrompt(
        storyBible,
        episodeScript,
        input.style,
        input.language
      );
      const raw = await callOpenAIChat({
        model: PIPELINE_MODELS.image_prompt,
        prompt: directorPrompt,
      });
      return {
        prompt: raw,
        art_style: input.style,
        panel_count: panelBreakdown.panel_count,
      };
    }
    return mockImagePrompt(storyBible, episodeScript, panelBreakdown);
  });

  // Step 5: Comic Image (art only, no text)
  const comicPage = await runStep("comic_image", async () => {
    const page = mockComicPage(episodeScript, imagePrompt);
    if (hasOpenAIKey()) {
      const artUrl = await callOpenAIImage(
        imagePrompt.prompt,
        PIPELINE_MODELS.comic_image
      );
      if (artUrl) page.artUrl = artUrl;
    }
    return page;
  });

  // Step 6: Image QA
  await runStep("image_qa", async () => {
    if (hasOpenAIKey()) {
      // Future: vision model check
      return mockImageQA(comicPage);
    }
    return mockImageQA(comicPage);
  });

  // Step 7: Text Overlay
  const textOverlay = await runStep("text_overlay", async () => {
    if (hasOpenAIKey()) {
      const prompt = buildTextOverlayPrompt(
        storyBible,
        episodeScript,
        panelBreakdown
      );
      const raw = await callOpenAIChat({
        model: PIPELINE_MODELS.text_overlay,
        prompt,
        json: true,
      });
      return parseJSON<TextOverlay>(raw);
    }
    return mockTextOverlay(episodeScript, panelBreakdown);
  });

  // Step 8: Continuity Memory
  const continuityMemory = await runStep("continuity", async () => {
    if (hasOpenAIKey()) {
      const prompt = buildContinuityMemoryPrompt(storyBible, episodeScript);
      const raw = await callOpenAIChat({
        model: PIPELINE_MODELS.continuity,
        prompt,
        json: true,
      });
      return parseJSON<ContinuityMemory>(raw);
    }
    return mockContinuityMemory(storyBible, episodeScript);
  });

  return {
    userInput: input,
    storyBible,
    episodeScript,
    panelBreakdown,
    imagePrompt,
    comicPage,
    textOverlay,
    continuityMemory,
    steps,
  };
}

/** Convert pipeline output to legacy Story pages for library/flipbook fallback */
export function pipelineToLegacyPages(
  result: PipelineResult,
  storyId: string
) {
  return result.episodeScript.panels.map((panel) => ({
    id: `${storyId}-panel-${panel.panel_number}`,
    pageNumber: panel.panel_number,
    text: [
      panel.narration,
      ...panel.dialogue.map((d) => `${d.speaker}: ${d.text}`),
    ]
      .filter(Boolean)
      .join("\n\n"),
    imageGradient: result.comicPage.artGradient,
    imageCaption: panel.visual_description,
  }));
}
