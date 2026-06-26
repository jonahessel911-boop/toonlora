"use client";

import { useCallback, useEffect, useState } from "react";
import { PIPELINE_CATEGORIES } from "@/lib/content-pipeline/constants";
import { formatCatalogCategoryLabel } from "@/lib/catalogCategoryLabel";

export interface StoryQueueJob {
  id: string;
  topic: string;
  category: string;
  mode: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  series_id: string | null;
  error: string | null;
  max_panels: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

interface StoryQueueStats {
  pending: number;
  running: number;
  completed: number;
  failed: number;
}

interface StoryQueuePanelProps {
  onSelectSeries?: (seriesId: string) => void;
}

const STATUS_LABELS: Record<StoryQueueJob["status"], string> = {
  pending: "In wachtrij",
  running: "Bezig",
  completed: "Klaar",
  failed: "Mislukt",
  cancelled: "Geannuleerd",
};

const STATUS_COLORS: Record<StoryQueueJob["status"], string> = {
  pending: "bg-amber-100 text-amber-900",
  running: "bg-[#2F80ED]/15 text-[#2F80ED]",
  completed: "bg-emerald-100 text-emerald-900",
  failed: "bg-red-100 text-red-900",
  cancelled: "bg-[#667085]/10 text-[#667085]",
};

export default function StoryQueuePanel({ onSelectSeries }: StoryQueuePanelProps) {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("founder_stories");
  const [maxPanels, setMaxPanels] = useState(36);
  const [jobs, setJobs] = useState<StoryQueueJob[]>([]);
  const [stats, setStats] = useState<StoryQueueStats | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const loadQueue = useCallback(async () => {
    try {
      const res = await fetch("/api/creator-admin/queue");
      const data = await res.json();
      if (!res.ok) return;
      setJobs((data.jobs ?? []) as StoryQueueJob[]);
      setStats((data.stats ?? null) as StoryQueueStats | null);
    } catch {
      /* ignore background refresh errors */
    }
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    const hasActive = jobs.some(
      (j) => j.status === "pending" || j.status === "running"
    );
    if (!hasActive) return;

    const interval = setInterval(() => {
      void loadQueue();
    }, 8000);
    return () => clearInterval(interval);
  }, [jobs, loadQueue]);

  const addToQueue = async () => {
    if (!topic.trim()) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/creator-admin/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          category,
          maxPanels,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Kon niet toevoegen aan wachtrij");
      }
      setTopic("");
      await loadQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kon niet toevoegen");
    } finally {
      setAdding(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/creator-admin/queue/${jobId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Kon niet verwijderen");
      }
      await loadQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kon niet verwijderen");
    }
  };

  const retryJob = async (job: StoryQueueJob) => {
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/creator-admin/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: job.topic,
          category: job.category,
          maxPanels: job.max_panels,
          ...(job.series_id ? { seriesId: job.series_id } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Retry mislukt");
      }
      await loadQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Retry mislukt");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="mb-4 rounded-xl border border-emerald-600/25 bg-emerald-50/60 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-[#07111F]">Story queue</p>
          <p className="mt-1 text-xs text-[#667085]">
            Volledige pipeline per story — research, panels, images, cover. Eén
            story tegelijk op de worker.
          </p>
        </div>
        {stats ? (
          <div className="shrink-0 text-right text-[10px] font-semibold text-[#667085]">
            <p>{stats.pending} wacht</p>
            <p>{stats.running} bezig</p>
          </div>
        ) : null}
      </div>

      <div className="mt-3 space-y-2">
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Story beschrijving, bv. Enzo Ferrari — the man who let drivers die for perfection"
          rows={3}
          className="w-full resize-y rounded-lg border border-[#07111F]/15 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-[#07111F]/15 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
        >
          {PIPELINE_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        <label className="flex items-center justify-between gap-3 text-sm text-[#07111F]">
          <span className="font-medium">Max panels per story</span>
          <input
            type="number"
            min={5}
            max={40}
            value={maxPanels}
            onChange={(e) =>
              setMaxPanels(
                Math.min(40, Math.max(5, Number(e.target.value) || 36))
              )
            }
            className="w-20 rounded-lg border border-[#07111F]/15 bg-white px-2 py-1.5 text-center text-sm font-semibold outline-none focus:border-emerald-600"
          />
        </label>
      </div>

      <button
        type="button"
        disabled={adding || !topic.trim()}
        onClick={() => void addToQueue()}
        className="mt-3 w-full rounded-lg bg-emerald-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {adding ? "Toevoegen…" : "+ Add to queue"}
      </button>

      {error ? (
        <p className="mt-2 rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-3 rounded-lg border border-[#07111F]/10 bg-white/80 p-2.5 text-[11px] leading-relaxed text-[#667085]">
        <p className="font-semibold text-[#07111F]">Worker (laptop mag dicht)</p>
        <p className="mt-1">
          Start op een server of Mac die aan blijft:
        </p>
        <code className="mt-1 block rounded bg-[#07111F]/5 px-2 py-1 font-mono text-[10px] text-[#07111F]">
          npm run pipeline:worker
        </code>
      </div>

      {jobs.length > 0 ? (
        <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="rounded-lg border border-[#07111F]/10 bg-white p-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold text-[#07111F]">
                    {job.topic}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#667085]">
                    {formatCatalogCategoryLabel(job.category)} · max{" "}
                    {job.max_panels} panels
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[job.status]}`}
                >
                  {STATUS_LABELS[job.status]}
                </span>
              </div>

              {job.error ? (
                <p className="mt-1.5 text-[10px] text-red-700">{job.error}</p>
              ) : null}

              <div className="mt-2 flex flex-wrap gap-2">
                {job.status !== "running" ? (
                  <button
                    type="button"
                    onClick={() => void deleteJob(job.id)}
                    className="text-[10px] font-semibold text-[#667085] hover:text-red-700"
                  >
                    Verwijderen
                  </button>
                ) : null}
                {job.series_id &&
                (job.status === "running" || job.status === "failed") ? (
                  <button
                    type="button"
                    onClick={() => onSelectSeries?.(job.series_id!)}
                    className="rounded-lg bg-[#2F80ED] px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-[#2563c7]"
                  >
                    {job.status === "failed"
                      ? "Open pipeline & hervat →"
                      : "Bekijk live pipeline →"}
                  </button>
                ) : null}
                {job.series_id && job.status === "completed" ? (
                  <button
                    type="button"
                    onClick={() => onSelectSeries?.(job.series_id!)}
                    className="text-[10px] font-semibold text-[#2F80ED] hover:underline"
                  >
                    Open series →
                  </button>
                ) : null}
                {job.status === "failed" && job.series_id ? (
                  <button
                    type="button"
                    onClick={() => void retryJob(job)}
                    className="text-[10px] font-semibold text-emerald-700 hover:underline"
                  >
                    Opnieuw in wachtrij
                  </button>
                ) : null}
                {job.status === "failed" && !job.series_id ? (
                  <p className="text-[10px] text-[#667085]">
                    Zoek &quot;{job.topic}&quot; in de series-lijst hieronder.
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-center text-xs text-[#667085]">
          Nog geen stories in de wachtrij.
        </p>
      )}
    </div>
  );
}
