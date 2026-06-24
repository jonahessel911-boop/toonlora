"use client";

import type { EpisodeScene } from "@/types/episode-builder";
import { sceneStatusLabel } from "@/types/episode-builder";

const BADGE_STYLES: Record<string, string> = {
  Waiting: "bg-[#F3ECFF] text-[#667085]",
  Planning: "bg-[#E8E4FF] text-[#5340FF]",
  Generating: "bg-[#FFE033]/40 text-[#2A114B]",
  Done: "bg-[#D1FAE5] text-[#065F46]",
  Failed: "bg-[#FEE2E2] text-[#991B1B]",
};

interface SceneProgressCardProps {
  scene: EpisodeScene;
  onRetry: () => void;
  disabled?: boolean;
}

export default function SceneProgressCard({
  scene,
  onRetry,
  disabled,
}: SceneProgressCardProps) {
  const label = sceneStatusLabel(scene.status);
  const isGenerating = scene.status === "generating";

  return (
    <article className="flex items-center gap-3 rounded-2xl border border-[#E7D8FF] bg-white px-3 py-2.5">
      <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg border border-[#E7D8FF] bg-[#FCFAFF]">
        {scene.imageUrl ? (
          <img
            src={scene.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {isGenerating ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#5340FF]/20 border-t-[#5340FF]" />
            ) : (
              <span className="font-heading text-sm font-extrabold text-[#5340FF]/35">
                {scene.sceneNumber}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#5340FF]">
            {scene.sceneNumber}
          </p>
          <p className="truncate font-heading text-sm font-extrabold text-[#2A114B]">
            {scene.title}
          </p>
        </div>
        <p className="truncate text-xs text-[#667085]">{scene.summary}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${BADGE_STYLES[label] ?? BADGE_STYLES.Waiting}`}
        >
          {label}
        </span>
        {scene.status === "failed" ? (
          <button
            type="button"
            disabled={disabled}
            onClick={onRetry}
            className="rounded-lg bg-[#5340FF] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#4330EF] disabled:opacity-50"
          >
            Retry
          </button>
        ) : null}
      </div>
    </article>
  );
}
