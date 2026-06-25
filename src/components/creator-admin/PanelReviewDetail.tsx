"use client";

import { useEffect, useState } from "react";
import ApiUsageDisplay from "@/components/creator-admin/ApiUsageDisplay";
import type {
  CreatorAdminPanel,
  ImageQaResult,
} from "@/types/creator-admin";
import type { ApiUsageSummary } from "@/lib/api-usage-cost";

interface PanelReviewDetailProps {
  panel: CreatorAdminPanel;
  onClose: () => void;
  onUpdated: (panel: CreatorAdminPanel, qa?: ImageQaResult) => void;
  mobile?: boolean;
}

function scoreBadge(score: number | null, passed: boolean | null) {
  if (score == null) return null;
  const color =
    passed === true
      ? "bg-emerald-100 text-emerald-800"
      : passed === false
        ? "bg-red-100 text-red-800"
        : "bg-amber-100 text-amber-800";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${color}`}>
      {score}/100
    </span>
  );
}

export default function PanelReviewDetail({
  panel,
  onClose,
  onUpdated,
  mobile = false,
}: PanelReviewDetailProps) {
  const [prompt, setPrompt] = useState(panel.image_prompt ?? "");
  const [feedbackNote, setFeedbackNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [localError, setLocalError] = useState("");
  const [lastUsage, setLastUsage] = useState<ApiUsageSummary | null>(null);

  useEffect(() => {
    setPrompt(panel.image_prompt ?? "");
    setFeedbackNote("");
    setLocalError("");
  }, [panel.id, panel.image_prompt]);

  const ai = panel.latest_ai_review;
  const human = panel.latest_human_review;

  const runAction = async (
    label: string,
    url: string,
    options?: RequestInit
  ): Promise<Record<string, unknown> | null> => {
    setBusy(label);
    setLocalError("");
    try {
      const res = await fetch(url, options);
      const data = await res.json();
      if (!res.ok) {
        setLocalError(data.error ?? "Actie mislukt");
        return null;
      }
      return data as Record<string, unknown>;
    } catch {
      setLocalError("Actie mislukt");
      return null;
    } finally {
      setBusy(null);
    }
  };

  const handleAiReview = async () => {
    const data = await runAction("AI review…", `/api/creator-admin/panels/${panel.id}/review`, {
      method: "POST",
    });
    if (data?.panel) {
      if (data.usage) setLastUsage(data.usage as ApiUsageSummary);
      onUpdated(data.panel as CreatorAdminPanel, data.result as ImageQaResult | undefined);
    }
  };

  const handleFeedback = async (rating: "approve" | "reject") => {
    const data = await runAction(
      rating === "approve" ? "Goedkeuren…" : "Afkeuren…",
      `/api/creator-admin/panels/${panel.id}/feedback`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, note: feedbackNote }),
      }
    );
    if (data?.panel) {
      onUpdated(data.panel as CreatorAdminPanel);
      setFeedbackNote("");
    }
  };

  const handleSavePrompt = async () => {
    const data = await runAction(
      "Prompt opslaan…",
      `/api/creator-admin/panels/${panel.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_prompt: prompt }),
      }
    );
    if (data?.panel) {
      onUpdated(data.panel as CreatorAdminPanel);
    }
  };

  const handleRegenerate = async (applyAiFix: boolean) => {
    const data = await runAction(
      "Genereren…",
      `/api/creator-admin/panels/${panel.id}/regenerate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          applyAiFix,
          autoReview: true,
        }),
      }
    );
    if (data?.panel) {
      const updated = data.panel as CreatorAdminPanel;
      if (data.usage) setLastUsage(data.usage as ApiUsageSummary);
      setPrompt(updated.image_prompt ?? prompt);
      onUpdated(updated, data.qa as ImageQaResult | undefined);
    }
  };

  const containerClass = mobile
    ? "fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-[#07111F]/10 bg-white shadow-2xl"
    : "w-full shrink-0 border-t border-[#07111F]/10 bg-white xl:w-[420px] xl:border-l xl:border-t-0";

  return (
    <aside className={containerClass}>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#07111F]/10 bg-white px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#667085]">
            Ep {panel.episode_number} · Panel {panel.panel_number}
          </p>
          <p className="font-bold">Review & fix</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-sm text-[#667085] hover:bg-[#F6F1E7]"
        >
          Sluiten
        </button>
      </div>

      <div className="space-y-4 p-4">
        {localError ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
            {localError}
          </p>
        ) : null}

        <div className="overflow-hidden rounded-xl bg-[#07111F]/5">
          {panel.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={panel.image_url}
              alt={`Panel ${panel.panel_number}`}
              className="w-full object-contain"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-sm text-[#667085]">
              Nog geen image — genereer via pipeline of hieronder
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!panel.image_url || Boolean(busy)}
            onClick={() => void handleAiReview()}
            className="rounded-lg bg-[#07111F] px-3 py-2 text-sm font-semibold text-[#F6F1E7] disabled:opacity-50"
          >
            {busy === "AI review…" ? "Bezig…" : "AI check"}
          </button>
          <button
            type="button"
            disabled={Boolean(busy) || !prompt.trim()}
            onClick={() => void handleRegenerate(false)}
            className="rounded-lg bg-[#2F80ED] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy === "Genereren…" ? "Bezig…" : "Opnieuw genereren"}
          </button>
          {ai?.prompt_fix ? (
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => void handleRegenerate(true)}
              className="rounded-lg border border-[#2F80ED] px-3 py-2 text-sm font-semibold text-[#2F80ED] disabled:opacity-50"
            >
              Fix + regen
            </button>
          ) : null}
        </div>

        <ApiUsageDisplay usage={lastUsage} />

        {ai ? (
          <div className="rounded-xl border border-[#07111F]/10 p-3">
            <div className="mb-2 flex items-center gap-2">
              <p className="text-sm font-bold">AI review</p>
              {scoreBadge(ai.score, ai.passed)}
            </div>
            <p className="text-sm text-[#667085]">{ai.summary}</p>
            {ai.issues.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs text-red-700">
                {ai.issues.map((issue) => (
                  <li key={issue}>• {issue}</li>
                ))}
              </ul>
            ) : null}
            {ai.prompt_fix ? (
              <p className="mt-2 rounded-lg bg-[#F6F1E7] p-2 text-xs">
                <span className="font-semibold">Suggested fix: </span>
                {ai.prompt_fix}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="rounded-xl border border-[#07111F]/10 p-3">
          <p className="mb-2 text-sm font-bold">Jouw oordeel</p>
          {human ? (
            <p className="mb-2 text-xs text-[#667085]">
              Laatste:{" "}
              {human.human_rating === "approve" ? "Goedgekeurd" : "Afgekeurd"}
              {human.feedback_note ? ` — ${human.feedback_note}` : ""}
            </p>
          ) : null}
          <textarea
            value={feedbackNote}
            onChange={(e) => setFeedbackNote(e.target.value)}
            placeholder="Waarom goed of slecht? (optioneel)"
            rows={2}
            className="mb-2 w-full rounded-lg border border-[#07111F]/15 bg-[#F6F1E7]/50 px-3 py-2 text-sm outline-none focus:border-[#2F80ED]"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => void handleFeedback("approve")}
              className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              👍 Goed
            </button>
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => void handleFeedback("reject")}
              className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              👎 Slecht
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold">Image prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-[#07111F]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#2F80ED]"
          />
          <button
            type="button"
            disabled={Boolean(busy)}
            onClick={() => void handleSavePrompt()}
            className="mt-2 text-sm font-semibold text-[#2F80ED] disabled:opacity-50"
          >
            Prompt opslaan
          </button>
        </div>

        <details className="rounded-xl border border-[#07111F]/10 p-3 text-sm">
          <summary className="cursor-pointer font-bold">Script context</summary>
          <dl className="mt-2 space-y-2 text-xs text-[#667085]">
            <div>
              <dt className="font-semibold text-[#07111F]">Visual</dt>
              <dd>{panel.visual_description ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#07111F]">Caption</dt>
              <dd>{panel.caption ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[#07111F]">Dialogue</dt>
              <dd>{panel.dialogue ?? "—"}</dd>
            </div>
          </dl>
        </details>
      </div>
    </aside>
  );
}
