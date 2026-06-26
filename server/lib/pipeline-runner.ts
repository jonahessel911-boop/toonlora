import { runLeanPipeline } from "../../pipeline/lean-pipeline.js";
import { runPipeline } from "../../pipeline/pipeline.js";
import { slugify } from "../../pipeline/lib/json.js";
import { createSeriesRecord, getSeries } from "../../pipeline/lib/supabase.js";
import type { PipelineQueueMode } from "./pipeline-queue.js";
import { linkQueueJobToSeries } from "./pipeline-queue.js";
import { configurePipelineEnv, loadServerEnv } from "./env.js";

export interface RunStoryOptions {
  topic: string;
  category?: string;
  mode?: PipelineQueueMode;
  seriesId?: string;
  resume?: boolean;
  maxPanels?: number;
  queueJobId?: string;
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

async function generateCoverForSeries(seriesId: string): Promise<void> {
  try {
    const { generateSeriesCover } = await import(
      "../../src/lib/services/series-cover-service.js"
    );
    await generateSeriesCover(seriesId);
    console.log(`[worker] ✓ Cover generated for ${seriesId}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[worker] Cover generation skipped: ${message}`);
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

  if (options.queueJobId) {
    await linkQueueJobToSeries(options.queueJobId, seriesId);
  }

  const runOptions = {
    topic,
    category,
    seriesId,
    resume,
  };

  try {
    if (mode === "lean") {
      await runLeanPipeline(runOptions);
    } else {
      const maxPanels = Math.min(
        40,
        Math.max(5, Math.floor(options.maxPanels ?? 36))
      );
      await runPipeline({
        ...runOptions,
        maxPanels,
        generateEpisodeNumbers: [1],
        generateCover: false,
      });
      await generateCoverForSeries(seriesId);
    }

    return { seriesId, mode, resumed: resume };
  } catch (err) {
    const message = err instanceof Error ? err : new Error(String(err));
    (message as Error & { seriesId?: string }).seriesId = seriesId;
    throw message;
  }
}
