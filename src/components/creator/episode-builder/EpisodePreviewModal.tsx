"use client";

import type { EpisodeStoryPlan } from "@/types/episode-builder";

interface EpisodePreviewModalProps {
  plan: EpisodeStoryPlan;
  open: boolean;
  onClose: () => void;
}

export default function EpisodePreviewModal({
  plan,
  open,
  onClose,
}: EpisodePreviewModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#2A114B]/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-[28px] bg-[#08040F] shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#A78BFA]">
              Preview
            </p>
            <h2 className="font-heading text-lg font-extrabold text-white">
              {plan.storyTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 px-3 py-1 text-sm text-white/80 hover:bg-white/10"
          >
            Close
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mx-auto flex max-w-[360px] flex-col gap-2">
            {plan.scenes.map((scene) => (
              <div
                key={scene.id}
                className="overflow-hidden rounded-xl border border-white/10 bg-[#12081F]"
              >
                {scene.imageUrl ? (
                  <img
                    src={scene.imageUrl}
                    alt={scene.title}
                    className="w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[5/8] items-center justify-center text-sm text-white/40">
                    Image {scene.sceneNumber} not ready
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
