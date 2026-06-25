"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LEAN_PANEL_COUNT,
  PIPELINE_CATEGORIES,
  PIPELINE_STEP_ORDER,
  type PipelineRunStatus,
} from "@/lib/content-pipeline/constants";

interface PipelineStartPanelProps {
  selectedSeriesId: string | null;
  onStarted: (seriesId: string) => void;
  /** Silent background sync — only when pipeline data actually changes */
  onPipelineDataSync: (seriesId: string) => void;
}

const STEP_LABELS: Record<string, string> = {
  research: "Web search",
  story: "Panel schrijven",
  prompts: "Image prompts",
  images: "Images genereren",
  complete: "Klaar",
};

function statusFingerprint(status: PipelineRunStatus): string {
  return JSON.stringify({
    running: status.running,
    step: status.currentStep,
    completed: status.completedSteps,
    images: status.panelProgress.withImage,
    panels: status.panelProgress.total,
    error: status.lastError,
  });
}

export default function PipelineStartPanel({
  selectedSeriesId,
  onStarted,
  onPipelineDataSync,
}: PipelineStartPanelProps) {
  const [topic, setTopic] = useState("WeWork");
  const [category, setCategory] = useState("rise_and_fall");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<PipelineRunStatus | null>(null);
  const lastFingerprintRef = useRef<string>("");
  const wasRunningRef = useRef(false);

  const loadStatus = useCallback(async (seriesId: string) => {
    try {
      const res = await fetch(`/api/creator-admin/pipeline/${seriesId}/status`);
      const data = await res.json();
      if (!res.ok) return null;
      return data.status as PipelineRunStatus;
    } catch {
      return null;
    }
  }, []);

  const applyStatus = useCallback(
    (next: PipelineRunStatus, seriesId: string) => {
      const fingerprint = statusFingerprint(next);
      const dataChanged = fingerprint !== lastFingerprintRef.current;
      lastFingerprintRef.current = fingerprint;

      setStatus(next);

      const finishedRun = wasRunningRef.current && !next.running;
      wasRunningRef.current = next.running;

      if (dataChanged || finishedRun) {
        onPipelineDataSync(seriesId);
      }
    },
    [onPipelineDataSync]
  );

  useEffect(() => {
    if (!selectedSeriesId) {
      setStatus(null);
      lastFingerprintRef.current = "";
      wasRunningRef.current = false;
      return;
    }
    void loadStatus(selectedSeriesId).then((next) => {
      if (next) applyStatus(next, selectedSeriesId);
    });
  }, [selectedSeriesId, loadStatus, applyStatus]);

  useEffect(() => {
    if (!selectedSeriesId || !status?.running) return;

    const interval = setInterval(() => {
      void loadStatus(selectedSeriesId).then((next) => {
        if (next) applyStatus(next, selectedSeriesId);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedSeriesId, status?.running, loadStatus, applyStatus]);

  const startPipeline = async (resume: boolean) => {
    setStarting(true);
    setError("");
    try {
      const res = await fetch("/api/creator-admin/pipeline/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          resume && selectedSeriesId
            ? { seriesId: selectedSeriesId, resume: true }
            : { topic, category }
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Pipeline starten mislukt");
        return;
      }
      const seriesId = data.seriesId as string;
      onStarted(seriesId);
      const next = await loadStatus(seriesId);
      if (next) applyStatus(next, seriesId);
    } catch {
      setError("Pipeline starten mislukt");
    } finally {
      setStarting(false);
    }
  };

  const activeSeriesId = selectedSeriesId ?? status?.seriesId ?? null;
  const progress = status?.panelProgress;
  const imageTotal = progress?.total || LEAN_PANEL_COUNT;
  const imageDone = progress?.withImage ?? 0;
  const onImagesStep =
    status?.currentStep === "images" ||
    (status?.completedSteps.includes("prompts") &&
      !status?.completedSteps.includes("complete"));

  return (
    <div className="mb-4 rounded-xl border border-[#2F80ED]/30 bg-[#2F80ED]/5 p-4">
      <p className="text-sm font-bold text-[#07111F]">Preview pipeline</p>
      <p className="mt-1 text-xs text-[#667085]">
        Snelle web search → 1 panel → 1 image
      </p>

      <div className="mt-3 space-y-2">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Onderwerp, bv. WeWork"
          className="w-full rounded-lg border border-[#07111F]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#2F80ED]"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-[#07111F]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#2F80ED]"
        >
          {PIPELINE_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <button
          type="button"
          disabled={starting || !topic.trim() || status?.running}
          onClick={() => void startPipeline(false)}
          className="w-full rounded-lg bg-[#2F80ED] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#2563c7] disabled:opacity-50"
        >
          {starting ? "Starten…" : "▶ Genereer 1 panel"}
        </button>
        {selectedSeriesId ? (
          <button
            type="button"
            disabled={starting || status?.running}
            onClick={() => void startPipeline(true)}
            className="w-full rounded-lg border border-[#07111F]/15 bg-white px-3 py-2 text-sm font-semibold text-[#07111F] hover:border-[#2F80ED] disabled:opacity-50"
          >
            Hervat
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="mt-2 rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      {activeSeriesId && status ? (
        <div className="mt-4 border-t border-[#07111F]/10 pt-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#667085]">
              Voortgang
            </p>
            {status.running ? (
              <span className="animate-pulse text-xs font-semibold text-[#2F80ED]">
                Bezig…
              </span>
            ) : status.completedSteps.includes("complete") ? (
              <span className="text-xs font-semibold text-emerald-600">Klaar</span>
            ) : status.lastError ? (
              <span className="text-xs font-semibold text-red-600">Fout</span>
            ) : null}
          </div>

          <ul className="mt-2 space-y-1">
            {PIPELINE_STEP_ORDER.map((step) => {
              const done = status.completedSteps.includes(step);
              const active = status.running && status.currentStep === step;
              return (
                <li
                  key={step}
                  className={`flex items-center gap-2 text-xs ${
                    done
                      ? "text-emerald-700"
                      : active
                        ? "font-semibold text-[#2F80ED]"
                        : "text-[#667085]"
                  }`}
                >
                  <span className="w-4 text-center">
                    {done ? "✓" : active ? "●" : "○"}
                  </span>
                  {STEP_LABELS[step] ?? step}
                </li>
              );
            })}
          </ul>

          {(onImagesStep || imageDone > 0) && (
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs text-[#667085]">
                <span>Images</span>
                <span>
                  {imageDone}/{imageTotal}
                  {progress?.generating ? " · genereren…" : ""}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#07111F]/10">
                <div
                  className="h-full rounded-full bg-[#2F80ED] transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (imageDone / imageTotal) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {status.lastError ? (
            <p className="mt-2 rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-700">
              {status.lastError}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
