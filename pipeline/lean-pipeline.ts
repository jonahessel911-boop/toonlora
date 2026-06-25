import { runLeanResearch } from "./agents/leanResearcher.js";
import { LEAN_PANEL_COUNT, runLeanStory } from "./agents/leanStory.js";
import { runImageGenerator } from "./agents/imageGenerator.js";
import { runPromptGenerator } from "./agents/promptGenerator.js";
import type { PipelineRunOptions } from "./lib/types.js";
import {
  completePipelineRun,
  createSeriesRecord,
  failPipelineRun,
  getCompletedSteps,
  getSeries,
  startPipelineRun,
} from "./lib/supabase.js";
import { slugify } from "./lib/json.js";
import {
  beginStepUsage,
  endStepUsage,
} from "./lib/usage.js";

export const LEAN_PIPELINE_STEPS = [
  "research",
  "story",
  "prompts",
  "images",
] as const;

export type LeanPipelineStep = (typeof LEAN_PIPELINE_STEPS)[number];

async function runLeanStep(
  step: LeanPipelineStep,
  seriesId: string,
  topic: string
): Promise<void> {
  switch (step) {
    case "research":
      await runLeanResearch({ seriesId, topic });
      break;
    case "story":
      await runLeanStory(seriesId);
      break;
    case "prompts":
      await runPromptGenerator(seriesId, { episodeNumbers: [1] });
      break;
    case "images":
      await runImageGenerator(seriesId, {
        episodeNumbers: [1],
        skipExisting: true,
      });
      break;
    default:
      throw new Error(`Unknown lean pipeline step: ${step}`);
  }
}

function nextLeanStepsToRun(
  completed: string[]
): LeanPipelineStep[] {
  return LEAN_PIPELINE_STEPS.filter((step) => !completed.includes(step));
}

export async function runLeanPipeline(
  options: PipelineRunOptions
): Promise<{ seriesId: string }> {
  let seriesId = options.seriesId;

  if (!seriesId) {
    const slug = slugify(options.topic);
    const series = await createSeriesRecord({
      title: options.topic,
      slug,
      category: options.category,
    });
    seriesId = series.id;
    console.log(`[lean-pipeline] Created series ${seriesId} (${slug})`);
  } else {
    const series = await getSeries(seriesId);
    console.log(
      `[lean-pipeline] Resuming series ${seriesId} ("${series.title}")`
    );
  }

  const completed = options.resume ? await getCompletedSteps(seriesId) : [];
  const steps = nextLeanStepsToRun(completed);

  if (steps.length === 0) {
    console.log("[lean-pipeline] All steps already completed");
    return { seriesId };
  }

  console.log(
    `[lean-pipeline] ${LEAN_PANEL_COUNT}-panel preview — steps: ${steps.join(" → ")}`
  );

  const topic =
    options.topic || (seriesId ? (await getSeries(seriesId)).title : "Untitled");

  for (const step of steps) {
    const runId = await startPipelineRun(seriesId, step);
    beginStepUsage();
    console.log(`\n[lean-pipeline] ▶ ${step}`);

    try {
      await runLeanStep(step, seriesId, topic);
      const ledger = endStepUsage();
      await completePipelineRun(runId, {
        finished_at: new Date().toISOString(),
        mode: "lean",
        panel_count: LEAN_PANEL_COUNT,
        ...ledger?.toMetadata(),
      });
      console.log(
        `[lean-pipeline] ✓ ${step} complete ($${ledger?.totalUsd.toFixed(4) ?? "0"})`
      );
    } catch (err) {
      const ledger = endStepUsage();
      const message = err instanceof Error ? err.message : String(err);
      await failPipelineRun(runId, message, {
        ...(ledger?.toMetadata() ?? {}),
      });
      console.error(`[lean-pipeline] ✗ ${step} failed: ${message}`);
      throw err;
    }
  }

  const completeRunId = await startPipelineRun(seriesId, "complete");
  await completePipelineRun(completeRunId, { mode: "lean" });
  console.log(`\n[lean-pipeline] Done — ${LEAN_PANEL_COUNT} panels — ${seriesId}`);

  return { seriesId };
}
