#!/usr/bin/env node
/**
 * Autonomous pipeline worker — polls pipeline_queue and runs stories.
 *
 * Deploy on your server with pm2 or systemd:
 *   npm run pipeline:worker
 */
import {
  claimNextQueuedJob,
  getQueueStats,
  markJobCompleted,
  markJobFailed,
} from "./lib/pipeline-queue.js";
import { runStoryPipeline } from "./lib/pipeline-runner.js";
import { loadServerEnv } from "./lib/env.js";

const POLL_MS = Number(process.env.PIPELINE_WORKER_POLL_MS ?? "30000");

async function processOneJob(): Promise<boolean> {
  const job = await claimNextQueuedJob();
  if (!job) return false;

  console.log(
    `[worker] ▶ ${job.topic} (${job.mode}, max ${job.max_panels} panels) — job ${job.id}`
  );

  try {
    const result = await runStoryPipeline({
      topic: job.topic,
      category: job.category,
      mode: job.mode,
      seriesId: job.series_id ?? undefined,
      resume: Boolean(job.series_id),
      maxPanels: job.max_panels,
    });

    await markJobCompleted(job.id, result.seriesId);
    console.log(
      `[worker] ✓ Done — series ${result.seriesId} (${result.mode})`
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const seriesId =
      err && typeof err === "object" && "seriesId" in err
        ? String((err as { seriesId?: string }).seriesId ?? "")
        : job.series_id ?? undefined;
    await markJobFailed(
      job.id,
      message,
      seriesId || undefined
    );
    console.error(`[worker] ✗ Failed — ${message}`);
  }

  return true;
}

async function tick(): Promise<void> {
  const stats = await getQueueStats();
  if (stats.pending > 0 || stats.running > 0) {
    console.log(
      `[worker] Queue — pending: ${stats.pending}, running: ${stats.running}, completed: ${stats.completed}, failed: ${stats.failed}`
    );
  }

  await processOneJob();
}

async function main(): Promise<void> {
  loadServerEnv();
  console.log(`[worker] Toonlora pipeline worker started (poll every ${POLL_MS}ms)`);

  await tick();

  setInterval(() => {
    void tick().catch((err) => {
      console.error(
        "[worker] Tick error:",
        err instanceof Error ? err.message : err
      );
    });
  }, POLL_MS);
}

void main();
