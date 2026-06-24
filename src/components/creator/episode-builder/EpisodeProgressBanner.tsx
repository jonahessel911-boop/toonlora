"use client";

import type { EpisodePipelinePhase } from "@/types/episode-builder";

interface EpisodeProgressBannerProps {
  phase: EpisodePipelinePhase;
  step: string;
  storyTitle?: string;
  completed: number;
  total: number;
  failed: number;
  onEndGeneration?: () => void;
}

export default function EpisodeProgressBanner({
  phase,
  step,
  storyTitle,
  completed,
  total,
  failed,
  onEndGeneration,
}: EpisodeProgressBannerProps) {
  if (phase === "idle" && !storyTitle && !step) return null;

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isRunning =
    phase === "planning" ||
    phase === "creating_prompts" ||
    phase === "generating_images" ||
    (phase === "idle" && Boolean(step));

  return (
    <section className="rounded-[28px] border border-[#E7D8FF] bg-gradient-to-br from-white via-[#F3ECFF]/50 to-[#E9D8FD]/40 p-5 shadow-[0_4px_24px_rgba(83,64,255,0.06)]">
      {storyTitle ? (
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#5340FF]">
            {phase === "ready" ? "Episode ready" : "In production"}
          </p>
          <h2 className="font-heading text-xl font-extrabold text-[#2A114B]">
            {storyTitle}
          </h2>
        </div>
      ) : null}

      {isRunning ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="font-semibold text-[#2A114B]">{step}</p>
            <div className="flex shrink-0 items-center gap-2">
              {total > 0 ? (
                <p className="text-[#667085]">
                  {completed}/{total} images
                </p>
              ) : null}
              {phase === "generating_images" && onEndGeneration ? (
                <button
                  type="button"
                  onClick={onEndGeneration}
                  className="rounded-full border border-[#E7D8FF] bg-white px-3 py-1 text-xs font-bold text-[#5340FF] transition hover:bg-[#F3ECFF]"
                >
                  End generation
                </button>
              ) : null}
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/80">
            <div
              className="h-full rounded-full bg-[#5340FF] transition-all duration-500"
              style={{
                width: `${
                  phase === "generating_images"
                    ? pct
                    : phase === "creating_prompts"
                      ? 15
                      : 5
                }%`,
              }}
            />
          </div>
          {phase === "generating_images" && total > 0 ? (
            <p className="text-xs text-[#667085]">
              Generating episode: {completed}/{total} images completed
            </p>
          ) : null}
        </div>
      ) : phase === "ready" ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[#D1FAE5] px-3 py-1 text-xs font-bold text-[#065F46]">
            Episode ready
          </span>
          <p className="text-sm text-[#667085]">
            {completed} of {total} images ready
            {failed > 0 ? ` · ${failed} failed` : ""}
          </p>
        </div>
      ) : null}
    </section>
  );
}
