import {
  PIPELINE_MODELS,
  PIPELINE_STEP_LABELS,
  buildStoryBiblePrompt,
  buildEpisodeScriptPrompt,
  buildPanelBreakdownPrompt,
  buildContinuityMemoryPrompt,
  buildModerationInput,
} from "@/lib/prompts";
import {
  buildFinalImagePrompt,
  buildPanelImagePromptInputs,
} from "@/lib/prompts/image-prompt";
import { resolvePanelCount } from "@/lib/panelCount";
import { resolveArtStyleHint } from "@/lib/promptHints";
import {
  mockModeration,
  mockStoryBible,
  mockEpisodeScript,
  mockPanelBreakdown,
  mockComicPage,
  mockImageQA,
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
  /** When true, refuse to run without OPENAI_API_KEY (no mock fallback). */
  requireAI?: boolean;
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
    requireAI = false,
  } = options;

  if (requireAI && !hasOpenAIKey()) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add your OpenAI API key to .env.local and restart the dev server."
    );
  }

  const useAI = hasOpenAIKey();
  const panelCount = resolvePanelCount(input);

  let steps = createSteps();
  const notify = () => onStepUpdate?.([...steps]);

  const runStep = async <T>(
    id: PipelineStepStatus["id"],
    fn: () => Promise<T>
  ): Promise<T> => {
    steps = updateStep(steps, id, "running");
    notify();
    await delay(useAI ? 200 : 400);
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
    if (useAI) {
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
    if (useAI) {
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
    if (useAI) {
      const prompt = buildEpisodeScriptPrompt(
        storyBible,
        episodeNumber,
        previousEpisodeSummary,
        episodePrompt,
        input.language,
        panelCount
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
    if (useAI) {
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
    const characterBible = storyBible.main_characters
      .map(
        (c) =>
          `${c.name}: ${c.visual_design}. Outfit: ${c.signature_outfit}.`
      )
      .join("\n");

    const artStyleHint = resolveArtStyleHint(input.style);

    const prompt = buildFinalImagePrompt({
      episodeNumber: episodeScript.episode_number,
      seriesTitle: storyBible.series_title,
      genre: input.genre || storyBible.genre,
      tone: input.tone || storyBible.tone,
      artStyleHint,
      characterBible,
      episodeSummary: episodeScript.episode_summary,
      panels: buildPanelImagePromptInputs(episodeScript, panelBreakdown),
      cliffhanger: episodeScript.cliffhanger,
    });

    return {
      prompt,
      art_style: input.style,
      panel_count: panelBreakdown.panel_count,
    };
  });

  // Step 5: Comic Image (vertical webtoon with baked-in bubbles)
  const comicPage = await runStep("comic_image", async () => {
    const page = mockComicPage(episodeScript, imagePrompt);
    if (useAI) {
      page.artUrl = await callOpenAIImage(
        imagePrompt.prompt,
        episodeScript.episode_number,
        PIPELINE_MODELS.comic_image
      );
    }
    return page;
  });

  // Step 6: Image QA
  await runStep("image_qa", async () => {
    return mockImageQA(comicPage);
  });

  // Step 7: Text overlay metadata (empty — text is baked into comic art)
  const textOverlay = await runStep("text_overlay", async () => ({
    episode_number: episodeScript.episode_number,
    panels: episodeScript.panels.map((p) => ({
      panel_number: p.panel_number,
      bubbles: [],
    })),
  } satisfies TextOverlay));

  // Step 8: Continuity Memory
  const continuityMemory = await runStep("continuity", async () => {
    if (useAI) {
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
