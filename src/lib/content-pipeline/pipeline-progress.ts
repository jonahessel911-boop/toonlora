import type { PanelProgress, PipelineRunStatus } from "@/lib/content-pipeline/constants";
import { PIPELINE_STEP_ORDER } from "@/lib/content-pipeline/constants";

export const FULL_PIPELINE_STEP_ORDER = [
  "research",
  "bible",
  "architect",
  "script",
  "prompts",
  "images",
  "complete",
] as const;

export const STEP_LABELS: Record<string, string> = {
  research: "Deep research",
  bible: "Storyline bible",
  architect: "Chapter structuur",
  script: "Panel scripts",
  story: "Panel schrijven",
  prompts: "Image prompts",
  images: "Images genereren",
  complete: "Klaar",
};

export const STEP_ACTIVITY: Record<string, string> = {
  research: "Claude doorzoekt het web en verzamelt feiten…",
  bible: "Claude schrijft de volledige storyline bible…",
  architect: "Hoofdstukken en panel-structuur worden opgebouwd…",
  script: "Claude schrijft panel scripts per hoofdstuk…",
  story: "Claude schrijft het panel script…",
  prompts: "Claude bouwt gedetailleerde image prompts…",
  images: "gpt-image-1 genereert panel-afbeeldingen…",
};

/** Rough per-step minutes for ETA (full pipeline). */
const STEP_ETA_MINUTES: Record<string, number> = {
  research: 4,
  bible: 4,
  architect: 1,
  script: 10,
  story: 2,
  prompts: 0.6,
  images: 0.8,
};

const FULL_PIPELINE_STEPS = new Set(["bible", "architect", "script"]);

export function isFullPipelineStatus(status: PipelineRunStatus): boolean {
  if (status.panelProgress.total > 1) return true;
  return (
    status.completedSteps.some((step) => FULL_PIPELINE_STEPS.has(step)) ||
    status.runs.some((run) => FULL_PIPELINE_STEPS.has(run.step))
  );
}

export function getPipelineSteps(status: PipelineRunStatus): string[] {
  if (isFullPipelineStatus(status)) {
    return FULL_PIPELINE_STEP_ORDER.filter((s) => s !== "complete");
  }
  return PIPELINE_STEP_ORDER.filter((s) => s !== "complete");
}

export function stepState(
  step: string,
  status: PipelineRunStatus
): "done" | "active" | "pending" | "failed" {
  if (status.completedSteps.includes(step)) return "done";
  if (status.running && status.currentStep === step) return "active";
  const failed = status.runs.some((r) => r.status === "failed" && r.step === step);
  if (!status.running && failed) return "failed";
  return "pending";
}

function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec}s`;
  return `${min}m ${sec}s`;
}

function estimateRemainingMinutes(
  steps: string[],
  status: PipelineRunStatus
): number {
  const progress = status.panelProgress;
  let remaining = 0;

  for (const step of steps) {
    const state = stepState(step, status);
    if (state === "done") continue;

    if (step === "prompts" && progress.total > 0) {
      const left = Math.max(0, progress.total - progress.withPrompt);
      remaining += left * STEP_ETA_MINUTES.prompts;
      continue;
    }

    if (step === "images" && progress.total > 0) {
      const left = Math.max(0, progress.total - progress.withImage);
      remaining += left * STEP_ETA_MINUTES.images;
      continue;
    }

    if (state === "active") {
      remaining += (STEP_ETA_MINUTES[step] ?? 2) * 0.6;
      continue;
    }

    remaining += STEP_ETA_MINUTES[step] ?? 2;
  }

  return Math.max(1, Math.round(remaining));
}

export function getActiveStepDetail(
  step: string | null,
  progress: PanelProgress
): string | null {
  if (!step) return null;

  if (step === "prompts" && progress.total > 0) {
    return `${progress.withPrompt}/${progress.total} prompts klaar`;
  }
  if (step === "images" && progress.total > 0) {
    if (progress.safetyViolation > 0) {
      const panelLabel = progress.safetyViolationPanel ?? progress.withImage + 1;
      return `Violation detected — panel ${panelLabel} opnieuw genereren met verzachte prompt…`;
    }
    if (progress.generating > 0) {
      return `Panel ${progress.withImage + 1}/${progress.total} wordt gegenereerd…`;
    }
    return `${progress.withImage}/${progress.total} images klaar`;
  }
  if (step === "script" && progress.total > 0) {
    return `${progress.scripted}/${progress.total} panels geschreven`;
  }

  return STEP_ACTIVITY[step] ?? null;
}

export interface PipelineProgressSummary {
  steps: string[];
  completedCount: number;
  totalSteps: number;
  percent: number;
  elapsedMs: number;
  elapsedLabel: string;
  remainingMinutes: number;
  remainingLabel: string;
  activeStep: string | null;
  activeLabel: string | null;
  activeDetail: string | null;
  isRunning: boolean;
}

export function getPipelineProgressSummary(
  status: PipelineRunStatus
): PipelineProgressSummary {
  const steps = getPipelineSteps(status);
  const completedCount = steps.filter((s) => stepState(s, status) === "done").length;
  const totalSteps = steps.length;
  const runningRun = [...status.runs].reverse().find((r) => r.status === "running");
  const elapsedMs = runningRun
    ? Date.now() - new Date(runningRun.created_at).getTime()
    : 0;
  const remainingMinutes = estimateRemainingMinutes(steps, status);
  const activeStep = status.running ? status.currentStep : null;

  let percent = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  if (status.running && activeStep && status.panelProgress.total > 0) {
    if (activeStep === "prompts") {
      const p = status.panelProgress.withPrompt / status.panelProgress.total;
      percent += (p / totalSteps) * 100;
    } else if (activeStep === "images") {
      const p = status.panelProgress.withImage / status.panelProgress.total;
      percent += (p / totalSteps) * 100;
    } else if (activeStep === "script") {
      const p = status.panelProgress.scripted / status.panelProgress.total;
      percent += (p / totalSteps) * 100;
    } else {
      percent += (0.35 / totalSteps) * 100;
    }
  }

  return {
    steps,
    completedCount,
    totalSteps,
    percent: Math.min(99, Math.round(percent)),
    elapsedMs,
    elapsedLabel: formatDuration(elapsedMs),
    remainingMinutes,
    remainingLabel: `~${remainingMinutes} min`,
    activeStep,
    activeLabel: activeStep ? STEP_LABELS[activeStep] ?? activeStep : null,
    activeDetail: getActiveStepDetail(activeStep, status.panelProgress),
    isRunning: status.running,
  };
}
