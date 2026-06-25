"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PIPELINE_STEP_ORDER,
  type PipelineRunStatus,
  type PipelineCostSummary,
} from "@/lib/content-pipeline/constants";
import ApiUsageDisplay from "@/components/creator-admin/ApiUsageDisplay";
import { formatUsd } from "@/lib/api-usage-cost";
import type { PipelineLiveState, PipelineResearchCountRange, PipelineResearchEpisodeOutline } from "@/types/creator-admin";

interface PipelineLiveFeedProps {
  seriesId: string | null;
  onArtifactsUpdated?: () => void;
}

const STEP_LABELS: Record<string, string> = {
  research: "Deep research + storyline",
  story: "Panel schrijven",
  prompts: "Image prompt",
  images: "Image genereren",
  complete: "Klaar",
};

function stepState(
  step: string,
  status: PipelineRunStatus
): "done" | "active" | "pending" | "failed" {
  if (status.completedSteps.includes(step)) return "done";
  if (status.running && status.currentStep === step) return "active";
  if (status.lastError && status.currentStep === step) return "failed";
  return "pending";
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

function liveFingerprint(live: PipelineLiveState): string {
  return JSON.stringify({
    running: live.status.running,
    step: live.status.currentStep,
    completed: live.status.completedSteps,
    webSearch: live.research?.web_search_raw?.length ?? 0,
    facts: live.research?.facts?.length ?? 0,
    episodes: live.research?.series_potential?.estimated_episodes?.recommended,
    storyline: live.research?.storyline?.logline?.slice(0, 40),
    panels: live.panels.length,
    visual: live.panels[0]?.visual_description?.slice(0, 40),
    prompt: live.panels[0]?.image_prompt?.slice(0, 40),
    image: live.panels[0]?.image_url,
    panelStatus: live.panels[0]?.status,
    error: live.status.lastError,
    costTotal: live.costs?.total_usd,
    bibleEpisodes: live.storylineBible?.total_episodes,
  });
}

export default function PipelineLiveFeed({
  seriesId,
  onArtifactsUpdated,
}: PipelineLiveFeedProps) {
  const [live, setLive] = useState<PipelineLiveState | null>(null);
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

  if (!seriesId || !live) return null;

  const panel = live.panels[0];
  const status = live.status;
  const costs: PipelineCostSummary | null = live.costs;

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[#07111F]">Live pipeline</h3>
        {status.running ? (
          <span className="animate-pulse text-xs font-semibold text-[#2F80ED]">
            Live · {STEP_LABELS[status.currentStep ?? ""] ?? status.currentStep}
          </span>
        ) : status.completedSteps.includes("complete") ? (
          <span className="text-xs font-semibold text-emerald-600">Voltooid</span>
        ) : status.lastError ? (
          <span className="text-xs font-semibold text-red-600">Gestopt met fout</span>
        ) : (
          <span className="text-xs text-[#667085]">Idle</span>
        )}
      </div>

      {costs?.by_step.length ? (
        <div className="rounded-xl border border-[#07111F]/10 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#07111F]">Pipeline kosten</h3>
            <span className="text-sm font-bold text-[#07111F]">
              {formatUsd(costs.total_usd)} totaal
            </span>
          </div>
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
        </div>
      ) : null}

      {live.storylineBible ? (
        <div className="rounded-xl border border-[#07111F]/10 bg-white p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-[#07111F]">Storyline bible</h3>
            <span className="text-xs text-[#667085]">
              {live.storylineBible.total_episodes} eps · ~
              {live.storylineBible.total_panels_estimated} panels
            </span>
          </div>
          <details className="mb-3">
            <summary className="cursor-pointer text-xs font-semibold text-[#07111F]">
              Volledige timeline
            </summary>
            <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-[11px] text-[#07111F]">
              {live.storylineBible.storyline_bible}
            </pre>
          </details>
          <div className="space-y-2">
            {live.storylineBible.episodes.map((ep) => (
              <div key={ep.episode_number} className="rounded-lg bg-[#F6F1E7]/80 p-2">
                <p className="font-semibold text-[#07111F]">
                  Ep {ep.episode_number}: {ep.title}
                  <span className="ml-2 text-[10px] font-normal text-[#667085]">
                    {ep.time_period} · ~{ep.panel_count_estimated} panels
                  </span>
                </p>
                <p className="mt-1 text-[11px] text-[#07111F]">{ep.narrative_arc}</p>
                <p className="mt-1 text-[10px] italic text-[#2F80ED]">
                  UGC: {ep.ugc_hook}
                </p>
                <ul className="mt-1 list-inside list-disc text-[10px] text-[#667085]">
                  {ep.story_beats.map((beat, i) => (
                    <li key={i}>{beat}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        {PIPELINE_STEP_ORDER.filter((s) => s !== "complete").map((step) => {
          const state = stepState(step, status);
          return (
            <details
              key={step}
              open={state === "active" || state === "done" || state === "failed"}
              className="rounded-xl border border-[#07111F]/10 bg-white"
            >
              <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold">
                <StepBadge state={state} />
                <span>{STEP_LABELS[step] ?? step}</span>
              </summary>
              <div className="border-t border-[#07111F]/8 px-4 py-3 text-xs text-[#667085]">
                {step === "research" && (
                  <>
                    {!live.research?.web_search_raw && !live.research?.facts?.length ? (
                      <p>Claude web search + research…</p>
                    ) : (
                      <div className="space-y-3">
                        {live.research?.web_search_raw ? (
                          <div>
                            <p className="mb-1 font-semibold text-[#07111F]">
                              Claude web search
                              {live.research.web_search_queries?.length ? (
                                <span className="font-normal text-[#667085]">
                                  {" "}
                                  · {live.research.web_search_queries.length} queries
                                </span>
                              ) : live.research.web_search_query ? (
                                <span className="font-normal text-[#667085]">
                                  {" "}
                                  · &quot;{live.research.web_search_query}&quot;
                                </span>
                              ) : null}
                            </p>
                            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-[#F6F1E7] p-2 text-[11px] text-[#07111F]">
                              {live.research.web_search_raw}
                            </pre>
                          </div>
                        ) : null}

                        {live.research?.storyline ? (
                          <div className="space-y-2 rounded-lg border border-[#2F80ED]/20 bg-[#2F80ED]/5 p-3">
                            <p className="font-semibold text-[#07111F]">Storyline</p>
                            <p className="text-sm font-medium text-[#07111F]">
                              {live.research.storyline.logline}
                            </p>
                            <p className="whitespace-pre-wrap text-[#07111F]">
                              {live.research.storyline.narrative_arc}
                            </p>
                            <p className="text-[#667085]">
                              Hook: {live.research.storyline.opening_hook}
                            </p>
                            {live.research.storyline.themes?.length ? (
                              <p className="text-[#667085]">
                                Thema&apos;s: {live.research.storyline.themes.join(", ")}
                              </p>
                            ) : null}
                          </div>
                        ) : null}

                        {live.research?.series_potential ? (
                          <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3">
                            <p className="font-semibold text-[#07111F]">
                              Series potentieel
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <p>
                                <span className="font-medium text-[#07111F]">Episodes: </span>
                                {formatRange(live.research.series_potential.estimated_episodes)}
                              </p>
                              <p>
                                <span className="font-medium text-[#07111F]">Chapters: </span>
                                {formatRange(live.research.series_potential.estimated_chapters)}
                              </p>
                              <p>
                                <span className="font-medium text-[#07111F]">Panels: </span>
                                {live.research.series_potential.estimated_panels.min}–
                                {live.research.series_potential.estimated_panels.max}
                              </p>
                              <p>
                                <span className="font-medium text-[#07111F]">Images: </span>
                                {live.research.series_potential.estimated_images.min}–
                                {live.research.series_potential.estimated_images.max}
                              </p>
                            </div>
                            <p className="text-[10px] text-[#667085]">
                              Rekenregel: {live.research.series_potential.panels_per_chapter}{" "}
                              panels/chapter · {live.research.series_potential.images_per_panel}{" "}
                              images/panel
                            </p>
                            {live.research.series_potential.reasoning ? (
                              <p className="whitespace-pre-wrap text-[#07111F]">
                                {live.research.series_potential.reasoning}
                              </p>
                            ) : null}
                            {live.research.series_potential.episode_outlines?.length ? (
                              <div className="space-y-2 pt-1">
                                <p className="font-medium text-[#07111F]">Episode-plan</p>
                                {live.research.series_potential.episode_outlines.map((ep) => (
                                  <div
                                    key={ep.episode_number}
                                    className="rounded-lg bg-white/80 p-2"
                                  >
                                    <p className="font-semibold text-[#07111F]">
                                      Ep {ep.episode_number}: {ep.title}
                                      <span className="ml-2 text-[10px] font-normal text-[#667085]">
                                        {depthLabel(ep.depth)} · {ep.suggested_chapters}{" "}
                                        {ep.suggested_chapters === 1 ? "chapter" : "chapters"}
                                      </span>
                                    </p>
                                    <p className="mt-0.5 text-[#07111F]">{ep.logline}</p>
                                    <p className="mt-1 text-[10px] text-[#667085]">
                                      {ep.why_compelling}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ) : live.research?.web_search_raw ? (
                          <p className="text-[#667085]">
                            Claude bouwt storyline + episode-schatting…
                          </p>
                        ) : null}

                        {live.research?.facts?.length ? (
                          <div className="space-y-2">
                            <p className="font-semibold text-[#07111F]">
                              {live.research.facts.length} feiten (Claude)
                            </p>
                            <ul className="space-y-1.5">
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
                              <p className="pt-1">
                                Personen:{" "}
                                {live.research.characters.map((c) => c.name).join(", ")}
                              </p>
                            ) : null}
                          </div>
                        ) : live.research?.web_search_raw && !live.research?.storyline ? (
                          <p className="text-[#667085]">Claude structureert research…</p>
                        ) : null}
                      </div>
                    )}
                  </>
                )}

                {step === "story" && (
                  <>
                    {!panel?.visual_description ? (
                      <p>Claude schrijft panel script…</p>
                    ) : (
                      <dl className="space-y-2">
                        <div>
                          <dt className="font-semibold text-[#07111F]">Visual</dt>
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
                        {panel.dialogue ? (
                          <div>
                            <dt className="font-semibold text-[#07111F]">Dialogue</dt>
                            <dd className="mt-0.5 text-[#07111F]">{panel.dialogue}</dd>
                          </div>
                        ) : null}
                      </dl>
                    )}
                  </>
                )}

                {step === "prompts" && (
                  <>
                    {!panel?.image_prompt ? (
                      <p>Claude bouwt image prompt…</p>
                    ) : (
                      <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-[#07111F] p-3 text-[11px] leading-relaxed text-[#F6F1E7]">
                        {panel.image_prompt}
                      </pre>
                    )}
                  </>
                )}

                {step === "images" && (
                  <>
                    {!panel?.image_url ? (
                      <p>
                        {panel?.status === "generating"
                          ? "gpt-image-1 genereert afbeelding…"
                          : "Wachten op image generatie…"}
                      </p>
                    ) : (
                      <div className="overflow-hidden rounded-lg border border-[#07111F]/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={panel.image_url}
                          alt="Generated panel"
                          className="w-full max-w-md object-contain"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </details>
          );
        })}
      </div>

      {status.lastError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
          <p className="font-semibold">Fout</p>
          <p className="mt-1 whitespace-pre-wrap">{status.lastError}</p>
        </div>
      ) : null}
    </div>
  );
}
