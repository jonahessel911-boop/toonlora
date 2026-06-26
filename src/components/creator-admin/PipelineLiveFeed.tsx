"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { PipelineRunStatus, PipelineCostSummary } from "@/lib/content-pipeline/constants";
import {
  STEP_LABELS,
  STEP_ACTIVITY,
  getPipelineProgressSummary,
  getPipelineSteps,
  stepState,
} from "@/lib/content-pipeline/pipeline-progress";
import ApiUsageDisplay from "@/components/creator-admin/ApiUsageDisplay";
import { formatUsd } from "@/lib/api-usage-cost";
import type {
  PipelineLiveState,
  PipelineResearchCountRange,
  PipelineResearchEpisodeOutline,
} from "@/types/creator-admin";

interface PipelineLiveFeedProps {
  seriesId: string | null;
  onArtifactsUpdated?: () => void;
  onPipelineResumed?: () => void;
}

function depthLabel(depth: PipelineResearchEpisodeOutline["depth"]): string {
  if (depth === "highlight") return "Highlight";
  if (depth === "deep_dive") return "Deep dive";
  return "Mixed";
}

function formatRange(range: PipelineResearchCountRange): string {
  if (range.min === range.max) return String(range.recommended);
  return `${range.min}–${range.max} (aanbevolen: ${range.recommended})`;
}

function StepBadge({ state }: { state: "done" | "active" | "pending" | "failed" }) {
  if (state === "done") return <span className="text-emerald-600">✓</span>;
  if (state === "active") return <span className="animate-pulse text-[#2F80ED]">●</span>;
  if (state === "failed") return <span className="text-red-600">✗</span>;
  return <span className="text-[#667085]">○</span>;
}

function CollapsibleSection({
  title,
  badge,
  summary,
  defaultOpen = false,
  highlight = false,
  children,
}: {
  title: string;
  badge?: ReactNode;
  summary?: string;
  defaultOpen?: boolean;
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      className={`rounded-xl border bg-white ${
        highlight
          ? "border-[#2F80ED]/40 ring-1 ring-[#2F80ED]/20"
          : "border-[#07111F]/10"
      }`}
      {...(defaultOpen ? { open: true } : {})}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-[#07111F]">
        {badge}
        <span className="min-w-0 flex-1">{title}</span>
        {summary ? (
          <span className="shrink-0 text-[10px] font-normal text-[#667085]">
            {summary}
          </span>
        ) : null}
      </summary>
      <div className="border-t border-[#07111F]/8 px-4 py-3 text-xs text-[#667085]">
        {children}
      </div>
    </details>
  );
}

function stepContentSummary(
  step: string,
  live: PipelineLiveState,
  status: PipelineRunStatus
): string | undefined {
  const progress = status.panelProgress;

  if (step === "research") {
    const facts = live.research?.facts?.length ?? 0;
    if (facts > 0) return `${facts} feiten`;
    if (live.research?.web_search_raw) return "web search klaar";
    return undefined;
  }
  if (step === "bible" && live.storylineBible) {
    return `${live.storylineBible.total_episodes} eps · ${live.storylineBible.total_panels_estimated} panels`;
  }
  if (step === "architect" && progress.total > 0) {
    return `${progress.total} panels gepland`;
  }
  if (step === "script" && progress.scripted > 0) {
    return `${progress.scripted}/${progress.total || "?"} scripts`;
  }
  if (step === "story" && live.panels[0]?.visual_description) {
    return "1 panel script";
  }
  if (step === "prompts" && progress.total > 0) {
    return `${progress.withPrompt}/${progress.total} prompts`;
  }
  if (step === "images" && progress.total > 0) {
    return `${progress.withImage}/${progress.total} images`;
  }
  return undefined;
}

function liveFingerprint(live: PipelineLiveState): string {
  return JSON.stringify({
    running: live.status.running,
    step: live.status.currentStep,
    completed: live.status.completedSteps,
    webSearch: live.research?.web_search_raw?.length ?? 0,
    facts: live.research?.facts?.length ?? 0,
    panels: live.panels.length,
    withPrompt: live.status.panelProgress.withPrompt,
    withImage: live.status.panelProgress.withImage,
    error: live.status.lastError,
    costTotal: live.costs?.total_usd,
    bibleEpisodes: live.storylineBible?.total_episodes,
  });
}

export default function PipelineLiveFeed({
  seriesId,
  onArtifactsUpdated,
  onPipelineResumed,
}: PipelineLiveFeedProps) {
  const [live, setLive] = useState<PipelineLiveState | null>(null);
  const [resuming, setResuming] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [tick, setTick] = useState(0);
  const lastFingerprintRef = useRef("");

  const loadLive = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/creator-admin/pipeline/${id}/live`);
      const data = await res.json();
      if (!res.ok) return null;
      return data.live as PipelineLiveState;
    } catch {
      return null;
    }
  }, []);

  const applyLive = useCallback(
    (next: PipelineLiveState) => {
      const fp = liveFingerprint(next);
      const changed = fp !== lastFingerprintRef.current;
      lastFingerprintRef.current = fp;
      setLive(next);
      if (changed) onArtifactsUpdated?.();
    },
    [onArtifactsUpdated]
  );

  useEffect(() => {
    if (!seriesId) {
      setLive(null);
      lastFingerprintRef.current = "";
      return;
    }
    void loadLive(seriesId).then((next) => {
      if (next) applyLive(next);
    });
  }, [seriesId, loadLive, applyLive]);

  useEffect(() => {
    if (!seriesId) return;
    const intervalMs = live?.status.running ? 3000 : 8000;
    const interval = setInterval(() => {
      void loadLive(seriesId).then((next) => {
        if (next) applyLive(next);
      });
    }, intervalMs);
    return () => clearInterval(interval);
  }, [seriesId, live?.status.running, loadLive, applyLive]);

  useEffect(() => {
    if (!live?.status.running) return;
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [live?.status.running]);

  const resumePipeline = useCallback(async () => {
    if (!seriesId) return;
    setResuming(true);
    setResumeError("");
    try {
      const res = await fetch("/api/creator-admin/pipeline/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seriesId, resume: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Pipeline hervatten mislukt");
      }
      onPipelineResumed?.();
      const next = await loadLive(seriesId);
      if (next) applyLive(next);
    } catch (err) {
      setResumeError(err instanceof Error ? err.message : "Pipeline hervatten mislukt");
    } finally {
      setResuming(false);
    }
  }, [seriesId, onPipelineResumed, loadLive, applyLive]);

  const restartPipeline = useCallback(async () => {
    if (!seriesId) return;
    const running = live?.status.running;
    const confirmed = window.confirm(
      running
        ? "Start over? De huidige pipeline wordt gestopt. Alle research, scripts, prompts en images worden gewist en de pipeline begint opnieuw met de nieuwste logica."
        : "Start over? Alle research, scripts, prompts en images worden gewist en de pipeline begint opnieuw met de nieuwste logica."
    );
    if (!confirmed) return;

    setRestarting(true);
    setResumeError("");
    try {
      const res = await fetch("/api/creator-admin/pipeline/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seriesId, restart: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Pipeline opnieuw starten mislukt");
      }
      onPipelineResumed?.();
      lastFingerprintRef.current = "";
      const next = await loadLive(seriesId);
      if (next) applyLive(next);
    } catch (err) {
      setResumeError(
        err instanceof Error ? err.message : "Pipeline opnieuw starten mislukt"
      );
    } finally {
      setRestarting(false);
    }
  }, [seriesId, live?.status.running, onPipelineResumed, loadLive, applyLive]);

  if (!seriesId || !live) return null;

  void tick;

  const status = live.status;
  const costs: PipelineCostSummary | null = live.costs;
  const progress = status.panelProgress;
  const isComplete = status.completedSteps.includes("complete");
  const canResume = !status.running && !isComplete;
  const canRestart = !restarting && !resuming;
  const failedRun = [...status.runs].reverse().find((run) => run.status === "failed");
  const failedStepLabel = failedRun
    ? STEP_LABELS[failedRun.step] ?? failedRun.step
    : null;
  const pipelineSteps = getPipelineSteps(status);
  const progressSummary = getPipelineProgressSummary(status);
  const panel = live.panels[0];
  const panelsWithPrompt = live.panels.filter((p) => p.image_prompt);
  const panelsWithImage = live.panels.filter((p) => p.image_url);

  return (
    <div className="mb-6 space-y-3">
      {/* Live voortgang — altijd zichtbaar */}
      <div
        className={`rounded-xl border p-4 ${
          status.running
            ? "border-[#2F80ED]/40 bg-[#2F80ED]/5"
            : status.lastError
              ? "border-red-200 bg-red-50"
              : isComplete
                ? "border-emerald-200 bg-emerald-50/60"
                : "border-[#07111F]/10 bg-white"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#07111F]">
              {status.running
                ? "Nu bezig"
                : status.lastError
                  ? "Pipeline gestopt"
                  : isComplete
                    ? "Pipeline voltooid"
                    : "Pipeline status"}
            </p>

            {status.running && progress.safetyViolation > 0 ? (
              <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800">
                Violation detected
                {progress.safetyViolationPanel
                  ? ` — panel ${progress.safetyViolationPanel}`
                  : ""}
                {" · "}
                prompt verzacht, automatisch opnieuw genereren…
              </p>
            ) : null}

            {status.running && progressSummary.activeLabel ? (
              <p className="mt-1 text-sm font-semibold text-[#2F80ED]">
                {progressSummary.activeLabel}
                {progressSummary.activeDetail ? (
                  <span className="font-normal text-[#07111F]">
                    {" "}
                    · {progressSummary.activeDetail}
                  </span>
                ) : null}
              </p>
            ) : null}

            {!status.running && status.lastError ? (
              <p className="mt-1 text-xs text-red-800">{status.lastError}</p>
            ) : null}

            {!status.running && !status.lastError && !isComplete ? (
              <p className="mt-1 text-xs text-[#667085]">
                {failedStepLabel
                  ? `Gestopt na: ${failedStepLabel}`
                  : "Nog niet afgerond — hervat om verder te gaan."}
              </p>
            ) : null}

            {status.running ? (
              <p className="mt-2 text-xs text-[#667085]">
                {STEP_ACTIVITY[status.currentStep ?? ""] ?? "Bezig…"}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-[#667085]">
              {status.running ? (
                <>
                  <span>
                    Bezig: <strong className="text-[#07111F]">{progressSummary.elapsedLabel}</strong>
                  </span>
                  <span>
                    Geschat resterend:{" "}
                    <strong className="text-[#07111F]">{progressSummary.remainingLabel}</strong>
                  </span>
                </>
              ) : null}
              {progress.total > 0 ? (
                <span>
                  Panels: {progress.withImage}/{progress.total} images ·{" "}
                  {progress.withPrompt}/{progress.total} prompts
                </span>
              ) : null}
            </div>

            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[10px] font-medium text-[#667085]">
                <span>
                  Stap {progressSummary.completedCount}/{progressSummary.totalSteps}
                </span>
                <span>{isComplete ? "100%" : `${progressSummary.percent}%`}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#07111F]/10">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    status.lastError
                      ? "bg-red-500"
                      : isComplete
                        ? "bg-emerald-500"
                        : "bg-[#2F80ED]"
                  }`}
                  style={{
                    width: `${isComplete ? 100 : progressSummary.percent}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {pipelineSteps.map((step) => {
                const state = stepState(step, status);
                return (
                  <span
                    key={step}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      state === "done"
                        ? "bg-emerald-100 text-emerald-800"
                        : state === "active"
                          ? "bg-[#2F80ED]/15 text-[#2F80ED]"
                          : state === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-[#07111F]/5 text-[#667085]"
                    }`}
                  >
                    <StepBadge state={state} />
                    {STEP_LABELS[step] ?? step}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {canRestart ? (
              <button
                type="button"
                disabled={restarting || resuming}
                onClick={() => void restartPipeline()}
                className="rounded-lg border border-[#07111F]/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#07111F] hover:bg-[#07111F]/5 disabled:opacity-50"
              >
                {restarting ? "Bezig…" : "Start over"}
              </button>
            ) : null}
            {canResume ? (
              <button
                type="button"
                disabled={resuming || restarting}
                onClick={() => void resumePipeline()}
                className="rounded-lg bg-[#2F80ED] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2563c7] disabled:opacity-50"
              >
                {resuming ? "Hervatten…" : "▶ Hervat"}
              </button>
            ) : null}
          </div>
        </div>

        {resumeError ? (
          <p className="mt-2 text-xs text-red-700">{resumeError}</p>
        ) : null}
      </div>

      {/* Pipeline stappen — standaard dicht */}
      <div className="space-y-2">
        {pipelineSteps.map((step) => {
          const state = stepState(step, status);
          const summary = stepContentSummary(step, live, status);

          return (
            <CollapsibleSection
              key={step}
              title={STEP_LABELS[step] ?? step}
              badge={<StepBadge state={state} />}
              summary={summary}
              highlight={state === "active"}
            >
              {step === "research" && (
                <div className="space-y-2">
                  {!live.research?.web_search_raw && !live.research?.facts?.length ? (
                    <p>{STEP_ACTIVITY.research}</p>
                  ) : (
                    <>
                      {live.research?.web_search_raw ? (
                        <CollapsibleSection title="Web search" summary={
                          live.research.web_search_queries?.length
                            ? `${live.research.web_search_queries.length} queries`
                            : undefined
                        }>
                          <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-[#F6F1E7] p-2 text-[11px] text-[#07111F]">
                            {live.research.web_search_raw}
                          </pre>
                        </CollapsibleSection>
                      ) : null}

                      {live.research?.storyline ? (
                        <CollapsibleSection title="Storyline" summary="logline + arc">
                          <div className="space-y-2 rounded-lg border border-[#2F80ED]/20 bg-[#2F80ED]/5 p-3">
                            <p className="text-sm font-medium text-[#07111F]">
                              {live.research.storyline.logline}
                            </p>
                            <p className="whitespace-pre-wrap text-[#07111F]">
                              {live.research.storyline.narrative_arc}
                            </p>
                            <p className="text-[#667085]">
                              Hook: {live.research.storyline.opening_hook}
                            </p>
                          </div>
                        </CollapsibleSection>
                      ) : null}

                      {live.research?.series_potential ? (
                        <CollapsibleSection
                          title="Series potentieel"
                          summary={`${live.research.series_potential.estimated_episodes.recommended} eps`}
                        >
                          <div className="grid gap-2 sm:grid-cols-2">
                            <p>
                              Episodes:{" "}
                              {formatRange(live.research.series_potential.estimated_episodes)}
                            </p>
                            <p>
                              Panels:{" "}
                              {live.research.series_potential.estimated_panels.min}–
                              {live.research.series_potential.estimated_panels.max}
                            </p>
                          </div>
                        </CollapsibleSection>
                      ) : null}

                      {live.research?.facts?.length ? (
                        <CollapsibleSection
                          title="Feiten"
                          summary={`${live.research.facts.length} stuks`}
                        >
                          <ul className="max-h-64 space-y-1.5 overflow-y-auto">
                            {live.research.facts.map((f, i) => (
                              <li key={i} className="rounded-lg bg-[#F6F1E7]/80 p-2">
                                <p className="text-[#07111F]">{f.fact}</p>
                                {f.source_hint ? (
                                  <p className="mt-0.5 text-[10px] text-[#667085]">
                                    bron: {f.source_hint}
                                  </p>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                          {live.research.characters?.length ? (
                            <p className="mt-2 pt-2 text-[#667085]">
                              Personen:{" "}
                              {live.research.characters.map((c) => c.name).join(", ")}
                            </p>
                          ) : null}
                        </CollapsibleSection>
                      ) : null}
                    </>
                  )}
                </div>
              )}

              {step === "bible" && live.storylineBible ? (
                <div className="space-y-2">
                  <CollapsibleSection title="Volledige timeline">
                    <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-[11px] text-[#07111F]">
                      {live.storylineBible.storyline_bible}
                    </pre>
                  </CollapsibleSection>
                  {live.storylineBible.episodes.map((ep) => (
                    <CollapsibleSection
                      key={ep.episode_number}
                      title={`Ep ${ep.episode_number}: ${ep.title}`}
                      summary={`~${ep.panel_count_estimated} panels`}
                    >
                      <p className="text-[#07111F]">{ep.narrative_arc}</p>
                      <ul className="mt-2 list-inside list-disc text-[10px]">
                        {ep.story_beats.map((beat, i) => (
                          <li key={i}>{beat}</li>
                        ))}
                      </ul>
                    </CollapsibleSection>
                  ))}
                </div>
              ) : null}

              {step === "bible" && !live.storylineBible ? (
                <p>{STEP_ACTIVITY.bible}</p>
              ) : null}

              {step === "architect" ? (
                <p>
                  {progress.total > 0
                    ? `${progress.total} panels verdeeld over hoofdstukken.`
                    : STEP_ACTIVITY.architect}
                </p>
              ) : null}

              {(step === "script" || step === "story") && (
                <>
                  {step === "script" && progress.total > 0 ? (
                    <p className="mb-2 font-medium text-[#07111F]">
                      {progress.scripted}/{progress.total} panels met script
                    </p>
                  ) : null}
                  {!panel?.visual_description ? (
                    <p>{STEP_ACTIVITY[step]}</p>
                  ) : (
                    <dl className="space-y-2">
                      <div>
                        <dt className="font-semibold text-[#07111F]">Voorbeeld panel 1</dt>
                        <dd className="mt-0.5 whitespace-pre-wrap text-[#07111F]">
                          {panel.visual_description}
                        </dd>
                      </div>
                      {panel.caption ? (
                        <div>
                          <dt className="font-semibold text-[#07111F]">Caption</dt>
                          <dd className="mt-0.5 text-[#07111F]">{panel.caption}</dd>
                        </div>
                      ) : null}
                    </dl>
                  )}
                </>
              )}

              {step === "prompts" && (
                <>
                  <p className="mb-2 font-medium text-[#07111F]">
                    {progress.withPrompt}/{progress.total || panelsWithPrompt.length} prompts klaar
                  </p>
                  {panelsWithPrompt.length > 0 ? (
                    <CollapsibleSection
                      title="Laatste prompt"
                      summary={`panel ${panelsWithPrompt[panelsWithPrompt.length - 1]?.panel_number ?? "?"}`}
                    >
                      <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-[#07111F] p-3 text-[11px] leading-relaxed text-[#F6F1E7]">
                        {panelsWithPrompt[panelsWithPrompt.length - 1]?.image_prompt}
                      </pre>
                    </CollapsibleSection>
                  ) : (
                    <p>{STEP_ACTIVITY.prompts}</p>
                  )}
                </>
              )}

              {step === "images" && (
                <>
                  <p className="mb-2 font-medium text-[#07111F]">
                    {progress.withImage}/{progress.total || live.panels.length} images klaar
                    {progress.safetyViolation > 0
                      ? " · Violation detected…"
                      : progress.generating > 0
                        ? " · genereren…"
                        : ""}
                  </p>
                  {panelsWithImage.length > 0 ? (
                    <CollapsibleSection title="Laatste image" summary="preview">
                      <div className="overflow-hidden rounded-lg border border-[#07111F]/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={panelsWithImage[panelsWithImage.length - 1]?.image_url ?? ""}
                          alt="Generated panel"
                          className="w-full max-w-md object-contain"
                        />
                      </div>
                    </CollapsibleSection>
                  ) : (
                    <p>
                      {progress.safetyViolation > 0
                        ? "Violation detected — prompt wordt verzacht en opnieuw gegenereerd…"
                        : progress.generating > 0
                          ? "gpt-image-1 genereert nu een panel…"
                          : STEP_ACTIVITY.images}
                    </p>
                  )}
                </>
              )}
            </CollapsibleSection>
          );
        })}
      </div>

      {live.storylineBible &&
      !pipelineSteps.includes("bible") &&
      status.completedSteps.includes("bible") ? (
        <CollapsibleSection
          title="Storyline bible"
          summary={`${live.storylineBible.total_episodes} eps`}
        >
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-[11px] text-[#07111F]">
            {live.storylineBible.storyline_bible.slice(0, 2000)}
            {live.storylineBible.storyline_bible.length > 2000 ? "…" : ""}
          </pre>
        </CollapsibleSection>
      ) : null}

      {costs?.by_step.length ? (
        <CollapsibleSection
          title="Pipeline kosten"
          summary={formatUsd(costs.total_usd)}
        >
          <div className="space-y-3">
            {costs.by_step.map((row) => (
              <div key={row.step}>
                <p className="mb-1 text-xs font-semibold text-[#07111F]">
                  {STEP_LABELS[row.step] ?? row.step}{" "}
                  <span className="font-normal text-[#667085]">
                    ({formatUsd(row.usage.total_usd)})
                  </span>
                </p>
                <ApiUsageDisplay
                  usage={{
                    items: row.usage.items,
                    total_usd: row.usage.total_usd,
                  }}
                  compact
                />
              </div>
            ))}
          </div>
        </CollapsibleSection>
      ) : null}
    </div>
  );
}
