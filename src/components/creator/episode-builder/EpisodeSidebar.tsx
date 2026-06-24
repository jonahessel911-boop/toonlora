"use client";

import type { EpisodeStoryPlan } from "@/types/episode-builder";
import { styleModeToLabel } from "@/lib/episode-builder/constants";

interface EpisodeSidebarProps {
  plan: EpisodeStoryPlan | null;
  progress: { prompts: number; images: number; total: number };
  savedAt: string | null;
  loadingPromptAll: boolean;
  batchImages: boolean;
  onGenerateAllPrompts: () => void;
  onGenerateAllImages: () => void;
  onSaveDraft: () => void;
  onExportJson: () => void;
  onExportPackage: () => void;
  onPushToEditor: () => void;
}

export default function EpisodeSidebar({
  plan,
  progress,
  savedAt,
  loadingPromptAll,
  batchImages,
  onGenerateAllPrompts,
  onGenerateAllImages,
  onSaveDraft,
  onExportJson,
  onExportPackage,
  onPushToEditor,
}: EpisodeSidebarProps) {
  const pct =
    progress.total > 0
      ? Math.round((progress.images / progress.total) * 100)
      : 0;

  return (
    <aside className="rounded-[28px] border border-[#E7D8FF] bg-gradient-to-br from-white via-[#F3ECFF]/40 to-[#E9D8FD]/30 p-5 shadow-[0_4px_24px_rgba(83,64,255,0.06)] lg:sticky lg:top-6 lg:self-start">
      <h2 className="font-heading text-lg font-extrabold text-[#2A114B]">
        Episode summary
      </h2>

      {!plan ? (
        <p className="mt-3 text-sm text-[#667085]">
          Generate a story plan to see metadata, progress, and batch actions.
        </p>
      ) : (
        <div className="mt-4 space-y-4 text-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#667085]">
              Story
            </p>
            <p className="font-heading text-base font-extrabold text-[#2A114B]">
              {plan.storyTitle}
            </p>
            <p className="mt-1 text-[#667085]">{plan.logline}</p>
          </div>

          <dl className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-white/70 px-3 py-2">
              <dt className="font-bold text-[#667085]">Genre</dt>
              <dd className="font-semibold text-[#2A114B]">{plan.genre}</dd>
            </div>
            <div className="rounded-xl bg-white/70 px-3 py-2">
              <dt className="font-bold text-[#667085]">Tone</dt>
              <dd className="font-semibold text-[#2A114B]">{plan.tone}</dd>
            </div>
            <div className="col-span-2 rounded-xl bg-white/70 px-3 py-2">
              <dt className="font-bold text-[#667085]">Style</dt>
              <dd className="font-semibold text-[#2A114B]">
                {styleModeToLabel(plan.styleMode)}
              </dd>
              <dd className="mt-0.5 text-[10px] text-[#667085]">
                AI-selected from your description
              </dd>
            </div>
          </dl>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#667085]">
              Main characters
            </p>
            <ul className="mt-2 space-y-2">
              {plan.mainCharacters.map((c) => (
                <li
                  key={c.name}
                  className="rounded-xl border border-[#E7D8FF] bg-white/80 px-3 py-2"
                >
                  <p className="font-semibold text-[#2A114B]">{c.name}</p>
                  <p className="text-xs text-[#667085]">{c.role}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-xs font-semibold text-[#667085]">
              <span>Episode progress</span>
              <span>
                {progress.images}/{progress.total} images · {pct}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/80">
              <div
                className="h-full rounded-full bg-[#5340FF] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-[#667085]">
              {progress.prompts}/{progress.total} prompts ready
            </p>
          </div>
        </div>
      )}

      <div className="mt-5 space-y-2">
        <button
          type="button"
          disabled={!plan || loadingPromptAll}
          onClick={onGenerateAllPrompts}
          className="w-full rounded-2xl border border-[#5340FF]/30 bg-white px-4 py-2.5 text-sm font-bold text-[#5340FF] transition hover:bg-[#F3ECFF] disabled:opacity-50"
        >
          {loadingPromptAll ? "Refreshing prompts…" : "Generate all prompts"}
        </button>
        <button
          type="button"
          disabled={!plan || batchImages}
          onClick={onGenerateAllImages}
          className="w-full rounded-2xl bg-[#5340FF] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#4330EF] disabled:opacity-50"
        >
          {batchImages ? "Generating all images…" : "Generate all images"}
        </button>
        <button
          type="button"
          disabled={!plan}
          onClick={onSaveDraft}
          className="w-full rounded-2xl border border-[#E7D8FF] bg-white px-4 py-2.5 text-sm font-semibold text-[#2A114B] hover:bg-[#FCFAFF] disabled:opacity-50"
        >
          Save draft
        </button>
        <button
          type="button"
          disabled={!plan}
          onClick={onExportJson}
          className="w-full rounded-2xl border border-[#E7D8FF] bg-white px-4 py-2.5 text-sm font-semibold text-[#2A114B] hover:bg-[#FCFAFF] disabled:opacity-50"
        >
          Export JSON
        </button>
        <button
          type="button"
          disabled={!plan}
          onClick={onExportPackage}
          className="w-full rounded-2xl border border-[#E7D8FF] bg-white px-4 py-2.5 text-sm font-semibold text-[#2A114B] hover:bg-[#FCFAFF] disabled:opacity-50"
        >
          Export episode package
        </button>
        <button
          type="button"
          disabled={!plan}
          onClick={onPushToEditor}
          className="w-full rounded-2xl bg-[#FF6847] px-4 py-2.5 text-sm font-extrabold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          Push to story editor
        </button>
      </div>

      {savedAt ? (
        <p className="mt-3 text-center text-[11px] text-[#667085]">
          Draft saved {new Date(savedAt).toLocaleString()}
        </p>
      ) : null}
    </aside>
  );
}
