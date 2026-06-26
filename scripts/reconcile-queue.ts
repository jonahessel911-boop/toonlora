#!/usr/bin/env node
/**
 * One-off queue reconcile — fixes stale running/failed jobs without touching
 * an active pipeline run (e.g. Ferdinand Porsche image generation).
 */
import { loadServerEnv } from "../server/lib/env.js";
import {
  markQueueJobRunning,
  resetQueueJobToPending,
} from "../server/lib/pipeline-queue.js";
import {
  clearFailedPipelineRunErrors,
  clearStaleRunningPipelineRuns,
  hasActivePipelineRun,
} from "../pipeline/lib/queue-sync.js";

const PORSCHE_SERIES_ID = "a98161e9-807b-4884-92d3-d623669f93a8";
const PORSCHE_JOB_ID = "644240e9-13ff-4ce1-b027-ab401eb50e7a";
const ZARA_JOB_ID = "8830d38b-2585-4a34-9921-00d661262884";
const ZARA_SERIES_ID = "30ee045d-fade-459a-8d7d-6296f8f9b69b";

const RESET_TO_PENDING_JOB_IDS = [
  "f840d06a-5363-4a0f-bf32-ee2617e65ca8", // Rockefellers
  "d4b95967-555c-41ab-821c-9fff625d9186", // Theranos
  "4f1aba1f-b8dc-4d7d-a1af-60f03805cd95", // FTX
];

async function main(): Promise<void> {
  loadServerEnv();

  const pipelineBusy = await hasActivePipelineRun();
  console.log(`Pipeline busy (active run): ${pipelineBusy}`);

  console.log("Resetting stale Zara queue job → pending");
  await resetQueueJobToPending(ZARA_JOB_ID);
  await clearStaleRunningPipelineRuns(
    ZARA_SERIES_ID,
    "Stopped — worker picked wrong job while Porsche was resuming"
  );

  console.log("Marking Ferdinand Porsche queue job → running");
  await markQueueJobRunning(PORSCHE_JOB_ID, PORSCHE_SERIES_ID);

  for (const jobId of RESET_TO_PENDING_JOB_IDS) {
    console.log(`Reset failed job ${jobId.slice(0, 8)} → pending`);
    await resetQueueJobToPending(jobId);
  }

  console.log("Clearing old pipeline run error messages (except Porsche)");
  await clearFailedPipelineRunErrors(PORSCHE_SERIES_ID);

  console.log("Done — queue reconciled.");
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
