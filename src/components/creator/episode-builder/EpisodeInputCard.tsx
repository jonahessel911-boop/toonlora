"use client";

import type { EpisodeBuilderInput } from "@/types/episode-builder";
import {
  DEFAULT_EPISODE_LENGTH,
  EPISODE_BUILDER_PRESETS,
} from "@/lib/episode-builder/constants";
import {
  EPISODE_LENGTH_MAX,
  EPISODE_LENGTH_MIN,
} from "@/lib/episode-builder/storyStructure";

interface EpisodeInputCardProps {
  input: EpisodeBuilderInput;
  loading: boolean;
  enhancing: boolean;
  creatingInDepth: boolean;
  onChange: (patch: Partial<EpisodeBuilderInput>) => void;
  onGenerate: () => void;
  onEnhance: () => void;
  onCreateInDepth: () => void;
  onLoadPreset: (description: string) => void;
}

export default function EpisodeInputCard({
  input,
  loading,
  enhancing,
  creatingInDepth,
  onChange,
  onGenerate,
  onEnhance,
  onCreateInDepth,
  onLoadPreset,
}: EpisodeInputCardProps) {
  const busy = loading || enhancing || creatingInDepth;
  const hasTopic = Boolean((input.seriesTopic ?? input.description).trim());

  return (
    <section className="rounded-[28px] border border-[#E7D8FF] bg-white p-6 shadow-[0_4px_24px_rgba(83,64,255,0.06)]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-extrabold text-[#2A114B]">
            Story input
          </h2>
          <p className="mt-1 text-sm text-[#667085]">
            Describe your story, create an in-depth script with Claude, then
            generate a full episode automatically.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {EPISODE_BUILDER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onLoadPreset(preset.input.description)}
              disabled={busy}
              className="rounded-full border border-[#E7D8FF] bg-[#FCFAFF] px-3 py-1.5 text-xs font-semibold text-[#5340FF] transition hover:bg-[#F3ECFF] disabled:opacity-50"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#667085]">
            Story description *
          </span>
          <textarea
            value={input.description}
            onChange={(e) => onChange({ description: e.target.value })}
            rows={5}
            disabled={busy}
            placeholder="Elon Musk — episode about the PayPal war and founding of X.com"
            className="w-full resize-y rounded-2xl border border-[#E7D8FF] bg-[#FCFAFF] px-4 py-3 text-sm text-[#2A114B] outline-none ring-[#5340FF]/30 focus:ring-2 disabled:opacity-60"
          />
          <p className="mt-1.5 text-xs text-[#667085]">
            Use <strong className="font-semibold text-[#5340FF]">Create in-depth</strong> for
            a researched panel-by-panel script via Claude + web search. Use{" "}
            <strong className="font-semibold text-[#5340FF]">Enhance</strong> for a short
            story-ready premise.
          </p>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#667085]">
              Series topic (in-depth)
            </span>
            <input
              type="text"
              disabled={busy}
              value={input.seriesTopic ?? ""}
              onChange={(e) => onChange({ seriesTopic: e.target.value })}
              placeholder={input.description.trim() || "Elon Musk"}
              className="w-full rounded-2xl border border-[#E7D8FF] bg-[#FCFAFF] px-4 py-2.5 text-sm text-[#2A114B] outline-none ring-[#5340FF]/30 focus:ring-2 disabled:opacity-60"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#667085]">
              Episode title (in-depth)
            </span>
            <input
              type="text"
              disabled={busy}
              value={input.episodeTitle ?? ""}
              onChange={(e) => onChange({ episodeTitle: e.target.value })}
              placeholder="X.com and the PayPal War"
              className="w-full rounded-2xl border border-[#E7D8FF] bg-[#FCFAFF] px-4 py-2.5 text-sm text-[#2A114B] outline-none ring-[#5340FF]/30 focus:ring-2 disabled:opacity-60"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#667085]">
              Episode length
            </span>
            <input
              type="number"
              min={EPISODE_LENGTH_MIN}
              max={EPISODE_LENGTH_MAX}
              disabled={busy}
              value={input.episodeLength || DEFAULT_EPISODE_LENGTH}
              onChange={(e) =>
                onChange({
                  episodeLength: Number(e.target.value) || DEFAULT_EPISODE_LENGTH,
                })
              }
              className="w-full rounded-2xl border border-[#E7D8FF] bg-[#FCFAFF] px-4 py-2.5 text-sm text-[#2A114B] outline-none ring-[#5340FF]/30 focus:ring-2 disabled:opacity-60"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#667085]">
              Episode # (in-depth)
            </span>
            <input
              type="number"
              min={1}
              disabled={busy}
              value={input.episodeNumber ?? 1}
              onChange={(e) =>
                onChange({
                  episodeNumber: Math.max(1, Number(e.target.value) || 1),
                })
              }
              className="w-full rounded-2xl border border-[#E7D8FF] bg-[#FCFAFF] px-4 py-2.5 text-sm text-[#2A114B] outline-none ring-[#5340FF]/30 focus:ring-2 disabled:opacity-60"
            />
          </label>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#E7D8FF] bg-[#FCFAFF] px-4 py-3">
          <input
            type="checkbox"
            checked={Boolean(input.addTextInImage)}
            disabled={busy}
            onChange={(e) => onChange({ addTextInImage: e.target.checked })}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#E7D8FF] text-[#5340FF] focus:ring-[#5340FF]/30"
          />
          <span>
            <span className="block text-sm font-bold text-[#2A114B]">
              Add text in image
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-[#667085]">
              Off by default — panels are art-only and story notes appear in the
              draft reader. Turn on to burn narration boxes into each image.
            </span>
          </span>
        </label>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          disabled={busy || !hasTopic}
          onClick={onCreateInDepth}
          className="rounded-2xl border border-[#5340FF]/30 bg-[#F3ECFF] px-5 py-3 text-sm font-extrabold text-[#5340FF] transition hover:bg-[#E7D8FF] disabled:opacity-50"
        >
          {creatingInDepth ? "Creating in-depth…" : "Create in-depth"}
        </button>
        <button
          type="button"
          disabled={busy || !input.description.trim()}
          onClick={onEnhance}
          className="rounded-2xl border border-[#E7D8FF] bg-[#FCFAFF] px-5 py-3 text-sm font-extrabold text-[#5340FF] transition hover:bg-[#F3ECFF] disabled:opacity-50"
        >
          {enhancing ? "Enhancing…" : "Enhance"}
        </button>
        <button
          type="button"
          disabled={busy || !input.description.trim()}
          onClick={onGenerate}
          className="rounded-2xl bg-[#5340FF] px-6 py-3 text-sm font-extrabold text-white shadow-[0_4px_16px_rgba(83,64,255,0.35)] transition hover:bg-[#4330EF] disabled:opacity-50"
        >
          {loading ? "Generating episode…" : "Generate episode"}
        </button>
      </div>
    </section>
  );
}
