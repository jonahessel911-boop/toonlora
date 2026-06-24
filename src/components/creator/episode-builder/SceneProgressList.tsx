"use client";

import type { EpisodeScene } from "@/types/episode-builder";
import SceneProgressCard from "@/components/creator/episode-builder/SceneProgressCard";

interface SceneProgressListProps {
  scenes: EpisodeScene[];
  pipelineRunning: boolean;
  onRetry: (sceneId: string) => void;
}

export default function SceneProgressList({
  scenes,
  pipelineRunning,
  onRetry,
}: SceneProgressListProps) {
  if (scenes.length === 0) return null;

  return (
    <section className="space-y-2">
      {scenes.map((scene) => (
        <SceneProgressCard
          key={scene.id}
          scene={scene}
          disabled={pipelineRunning}
          onRetry={() => onRetry(scene.id)}
        />
      ))}
    </section>
  );
}
