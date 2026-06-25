import { runLeanPipeline } from "../../pipeline/lean-pipeline.js";
import { runPipeline } from "../../pipeline/pipeline.js";
import { slugify } from "../../pipeline/lib/json.js";
import { createSeriesRecord, getSeries } from "../../pipeline/lib/supabase.js";
import type { PipelineQueueMode } from "./pipeline-queue.js";
import { configurePipelineEnv, loadServerEnv } from "./env.js";

export interface RunStoryOptions {
  topic: string;
  category?: string;
  mode?: PipelineQueueMode;
  seriesId?: string;
  resume?: boolean;
}

export interface RunStoryResult {
  seriesId: string;
  mode: PipelineQueueMode;
  resumed: boolean;
}

let envLoaded = false;

function ensureEnv(): void {
  if (!envLoaded) {
    loadServerEnv();
    configurePipelineEnv();
    envLoaded = true;
  }
}

export async function runStoryPipeline(
  options: RunStoryOptions
): Promise<RunStoryResult> {
  ensureEnv();

  const mode = options.mode ?? "lean";
  const category = options.category?.trim() || "business";
  const topic = options.topic.trim();
  if (!topic) throw new Error("topic is required");

  let seriesId = options.seriesId;
  const resume = options.resume ?? Boolean(seriesId);

  if (!seriesId) {
    const slug = `${slugify(topic)}-${crypto.randomUUID().slice(0, 8)}`;
    const series = await createSeriesRecord({
      title: topic,
      slug,
      category,
    });
    seriesId = series.id;
  } else if (!resume) {
    await getSeries(seriesId);
  }

  const runOptions = {
    topic,
    category,
    seriesId,
    resume,
  };

  if (mode === "lean") {
    await runLeanPipeline(runOptions);
  } else {
    await runPipeline(runOptions);
  }

  return { seriesId, mode, resumed: resume };
}
