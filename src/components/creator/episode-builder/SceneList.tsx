"use client";

import type { EpisodeScene, PromptTweakAction } from "@/types/episode-builder";
import SceneCard from "@/components/creator/episode-builder/SceneCard";

interface SceneListProps {
  scenes: EpisodeScene[];
  loadingPromptId: string | null;
  loadingImageId: string | null;
  onUpdateScene: (sceneId: string, patch: Partial<EpisodeScene>) => void;
  onRegeneratePrompt: (sceneId: string, tweaks: PromptTweakAction[]) => void;
  onGenerateImage: (sceneId: string) => void;
  onReorder: (sceneId: string, direction: "up" | "down") => void;
}

export default function SceneList({
  scenes,
  loadingPromptId,
  loadingImageId,
  onUpdateScene,
  onRegeneratePrompt,
  onGenerateImage,
  onReorder,
}: SceneListProps) {
  if (scenes.length === 0) {
    return (
      <section className="rounded-[28px] border border-dashed border-[#E7D8FF] bg-[#FCFAFF]/80 px-6 py-12 text-center">
        <p className="font-heading text-lg font-extrabold text-[#2A114B]">
          No scenes yet
        </p>
        <p className="mt-2 text-sm text-[#667085]">
          Enter a story description and generate a plan to see 10 scene cards here.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-extrabold text-[#2A114B]">
            Scene plan
          </h2>
          <p className="text-sm text-[#667085]">
            {scenes.length} scenes · edit prompts, generate images with continuity
          </p>
        </div>
      </div>

      {scenes.map((scene) => (
        <SceneCard
          key={scene.id}
          scene={scene}
          totalScenes={scenes.length}
          loadingPrompt={loadingPromptId === scene.id}
          loadingImage={loadingImageId === scene.id}
          onUpdate={(patch) => onUpdateScene(scene.id, patch)}
          onRegeneratePrompt={(tweaks) => onRegeneratePrompt(scene.id, tweaks)}
          onGenerateImage={() => onGenerateImage(scene.id)}
          onReorder={(dir) => onReorder(scene.id, dir)}
        />
      ))}
    </section>
  );
}
