import { runImageGenerator } from "./agents/imageGenerator.js";
import { runPromptGenerator } from "./agents/promptGenerator.js";
import { runResearcher } from "./agents/researcher.js";
import { runScriptWriter } from "./agents/scriptWriter.js";
import { runStoryArchitect } from "./agents/storyArchitect.js";
import { runStorylineBible } from "./agents/storylineBible.js";
import { PIPELINE_STEPS } from "./lib/types.js";
import type { PipelineRunOptions, PipelineStep } from "./lib/types.js";
import {
  completePipelineRun,
  createSeriesRecord,
  failPipelineRun,
  getCompletedSteps,
  getSeries,
  startPipelineRun,
} from "./lib/supabase.js";
import { slugify } from "./lib/json.js";

async function runStep(
  step: PipelineStep,
  seriesId: string,
  topic: string
): Promise<void> {
  switch (step) {
    case "research":
      await runResearcher({ seriesId, topic });
      break;
    case "bible":
      await runStorylineBible(seriesId);
      break;
    case "architect":
      await runStoryArchitect(seriesId);
      break;
    case "script":
      await runScriptWriter(seriesId);
      break;
    case "prompts":
      await runPromptGenerator(seriesId);
      break;
    case "images":
      await runImageGenerator(seriesId);
      break;
    default:
      throw new Error(`Unknown pipeline step: ${step}`);
  }
}

function nextStepsToRun(completed: PipelineStep[]): PipelineStep[] {
  return PIPELINE_STEPS.filter((step) => !completed.includes(step));
}

export async function runPipeline(
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
    console.log(`[pipeline] Created series ${seriesId} (${slug})`);
  } else {
    const series = await getSeries(seriesId);
    console.log(`[pipeline] Resuming series ${seriesId} ("${series.title}")`);
  }

  const completed = options.resume ? await getCompletedSteps(seriesId) : [];
  const steps = nextStepsToRun(completed);

  if (steps.length === 0) {
    console.log("[pipeline] All steps already completed");
    return { seriesId };
  }

  console.log(`[pipeline] Steps to run: ${steps.join(" → ")}`);

  const topic =
    options.topic || (seriesId ? (await getSeries(seriesId)).title : "Untitled");

  for (const step of steps) {
    const runId = await startPipelineRun(seriesId, step);
    console.log(`\n[pipeline] ▶ ${step}`);

    try {
      await runStep(step, seriesId, topic);
      await completePipelineRun(runId, { finished_at: new Date().toISOString() });
      console.log(`[pipeline] ✓ ${step} complete`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await failPipelineRun(runId, message);
      console.error(`[pipeline] ✗ ${step} failed: ${message}`);
      throw err;
    }
  }

  const completeRunId = await startPipelineRun(seriesId, "complete");
  await completePipelineRun(completeRunId);
  console.log(`\n[pipeline] Done — series ${seriesId}`);

  return { seriesId };
}
