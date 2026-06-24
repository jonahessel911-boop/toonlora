"use client";

import { useEffect, useState } from "react";
import type { EpisodeScene, PromptTweakAction } from "@/types/episode-builder";
import PromptEditor from "@/components/creator/episode-builder/PromptEditor";
import ReferenceImageStrip from "@/components/creator/episode-builder/ReferenceImageStrip";
import SceneImagePreview from "@/components/creator/episode-builder/SceneImagePreview";

const TWEAK_CHIPS: { id: PromptTweakAction; label: string }[] = [
  { id: "lock-prompt", label: "Lock prompt" },
  { id: "lock-character", label: "Lock character" },
  { id: "more-background", label: "More background" },
  { id: "closer-shot", label: "Closer shot" },
  { id: "wider-shot", label: "Wider shot" },
  { id: "more-emotional", label: "More emotional" },
  { id: "more-dramatic", label: "More dramatic" },
  { id: "simpler-composition", label: "Simpler composition" },
];

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-[#F3ECFF] text-[#667085]",
  prompt_ready: "bg-[#E8E4FF] text-[#5340FF]",
  generating: "bg-[#FFE033]/30 text-[#2A114B]",
  generated: "bg-[#D1FAE5] text-[#065F46]",
  failed: "bg-[#FEE2E2] text-[#991B1B]",
};

interface SceneCardProps {
  scene: EpisodeScene;
  totalScenes: number;
  loadingPrompt: boolean;
  loadingImage: boolean;
  onUpdate: (patch: Partial<EpisodeScene>) => void;
  onRegeneratePrompt: (tweaks: PromptTweakAction[]) => void;
  onGenerateImage: () => void;
  onReorder: (direction: "up" | "down") => void;
}

export default function SceneCard({
  scene,
  totalScenes,
  loadingPrompt,
  loadingImage,
  onUpdate,
  onRegeneratePrompt,
  onGenerateImage,
  onReorder,
}: SceneCardProps) {
  const [draftPrompt, setDraftPrompt] = useState(scene.imagePrompt);

  useEffect(() => {
    setDraftPrompt(scene.imagePrompt);
  }, [scene.imagePrompt]);

  const handleTweak = (tweak: PromptTweakAction) => {
    if (tweak === "lock-prompt") {
      onUpdate({ promptLocked: !scene.promptLocked });
      return;
    }
    onRegeneratePrompt([tweak]);
  };

  return (
    <article className="rounded-[28px] border border-[#E7D8FF] bg-white p-5 shadow-[0_4px_20px_rgba(83,64,255,0.05)]">
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#5340FF]">
            Scene {scene.sceneNumber}
          </p>
          <h3 className="font-heading text-lg font-extrabold text-[#2A114B]">
            {scene.title}
          </h3>
          <p className="text-sm font-medium text-[#667085]">{scene.storyRole}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
            STATUS_STYLES[scene.status] ?? STATUS_STYLES.draft
          }`}
        >
          {scene.status.replace("_", " ")}
        </span>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#667085]">
              Summary
            </p>
            <p className="mt-1 text-sm text-[#2A114B]">{scene.summary}</p>
          </div>

          {scene.narration.length > 0 ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#667085]">
                Narration (overlay)
              </p>
              <ul className="mt-1 space-y-1 text-sm italic text-[#2A114B]">
                {scene.narration.map((line, i) => (
                  <li key={i} className="rounded-lg bg-[#FCFAFF] px-3 py-1.5">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {scene.dialogue && scene.dialogue.length > 0 ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#667085]">
                Dialogue (overlay)
              </p>
              <ul className="mt-1 space-y-1 text-sm text-[#2A114B]">
                {scene.dialogue.map((line, i) => (
                  <li key={i}>
                    <strong>{line.character}:</strong> {line.text}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#667085]">
                Continuity notes
              </p>
              <ul className="mt-1 list-disc pl-4 text-xs text-[#667085]">
                {scene.continuityNotes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#667085]">
                Camera / composition
              </p>
              <p className="mt-1 text-xs text-[#2A114B]">{scene.cameraSuggestion}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-[#667085]">
                Visual mood
              </p>
              <p className="mt-1 text-xs text-[#2A114B]">{scene.visualMood}</p>
            </div>
          </div>

          {scene.whyThisSceneWorks ? (
            <div className="rounded-2xl border border-dashed border-[#E7D8FF] bg-[#FCFAFF] px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[#5340FF]">
                Why this scene works
              </p>
              <p className="mt-1 text-sm text-[#667085]">{scene.whyThisSceneWorks}</p>
            </div>
          ) : null}

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#667085]">
              Quick tweaks
            </p>
            <div className="flex flex-wrap gap-2">
              {TWEAK_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  disabled={
                    loadingPrompt ||
                    (chip.id !== "lock-prompt" && scene.promptLocked)
                  }
                  onClick={() => handleTweak(chip.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition disabled:opacity-40 ${
                    chip.id === "lock-prompt" && scene.promptLocked
                      ? "bg-[#5340FF] text-white"
                      : "border border-[#E7D8FF] bg-[#FCFAFF] text-[#667085] hover:bg-[#F3ECFF]"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <PromptEditor
            value={draftPrompt}
            locked={scene.promptLocked}
            onChange={setDraftPrompt}
            onSave={() =>
              onUpdate({ imagePrompt: draftPrompt, status: "prompt_ready" })
            }
          />

          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[#667085]">
              Reference images
            </p>
            <ReferenceImageStrip urls={scene.referenceImageUrls} />
          </div>

          {scene.errorMessage ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {scene.errorMessage}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-center gap-3">
          <SceneImagePreview
            imageUrl={scene.imageUrl}
            sceneNumber={scene.sceneNumber}
            status={scene.status}
            loading={loadingImage}
          />

          <div className="flex w-full flex-col gap-2">
            <button
              type="button"
              disabled={loadingPrompt || scene.promptLocked}
              onClick={() => onRegeneratePrompt([])}
              className="w-full rounded-xl border border-[#5340FF]/30 px-3 py-2 text-xs font-bold text-[#5340FF] hover:bg-[#F3ECFF] disabled:opacity-50"
            >
              {loadingPrompt ? "Regenerating…" : "Regenerate prompt"}
            </button>
            <button
              type="button"
              disabled={loadingImage || !scene.imagePrompt.trim()}
              onClick={onGenerateImage}
              className="w-full rounded-xl bg-[#5340FF] px-3 py-2 text-xs font-bold text-white hover:bg-[#4330EF] disabled:opacity-50"
            >
              {loadingImage
                ? "Generating…"
                : scene.imageUrl
                  ? "Regenerate image"
                  : "Generate image"}
            </button>
            {scene.imageUrl ? (
              <a
                href={scene.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full rounded-xl border border-[#E7D8FF] px-3 py-2 text-center text-xs font-semibold text-[#2A114B] hover:bg-[#FCFAFF]"
              >
                Preview full size
              </a>
            ) : null}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={scene.sceneNumber <= 1}
                onClick={() => onReorder("up")}
                className="flex-1 rounded-xl border border-[#E7D8FF] px-2 py-1.5 text-xs font-semibold text-[#667085] disabled:opacity-40"
              >
                ↑ Reorder
              </button>
              <button
                type="button"
                disabled={scene.sceneNumber >= totalScenes}
                onClick={() => onReorder("down")}
                className="flex-1 rounded-xl border border-[#E7D8FF] px-2 py-1.5 text-xs font-semibold text-[#667085] disabled:opacity-40"
              >
                ↓ Reorder
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
