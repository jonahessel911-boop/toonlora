import type { EpisodeExportPackage, EpisodeStoryPlan } from "@/types/episode-builder";
import type { StudioPanel, StudioStory } from "@/types/creator";
import { createEmptyStory } from "@/lib/creator/mockData";
import { STUDIO_PANEL_GRADIENTS } from "@/lib/creator/studioPanelBuilder";

export function buildExportPackage(plan: EpisodeStoryPlan): EpisodeExportPackage {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    story: {
      title: plan.storyTitle,
      logline: plan.logline,
      genre: plan.genre,
      tone: plan.tone,
      styleMode: plan.styleMode,
      characters: plan.mainCharacters,
    },
    scenes: plan.scenes.map((scene) => ({
      sceneNumber: scene.sceneNumber,
      title: scene.title,
      storyRole: scene.storyRole,
      summary: scene.summary,
      narration: scene.narration,
      dialogue: scene.dialogue,
      imagePrompt: scene.imagePrompt,
      imageUrl: scene.imageUrl,
    })),
  };
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function storyFromEpisodePlan(
  plan: EpisodeStoryPlan,
  options?: { storyId?: string }
): StudioStory {
  const story = createEmptyStory({
    title: plan.storyTitle,
    description: plan.logline,
    genre: plan.genre,
    visibility: "private",
    audienceRating: "teen",
    characterIds: [],
  });

  if (options?.storyId) {
    story.id = options.storyId;
  }

  const episode = story.episodes[0];
  episode.title = "Episode 1";
  episode.panels = plan.scenes.map((scene, index): StudioPanel => {
    const panelId = `${episode.id}-panel-${scene.sceneNumber}`;
    const overlays = (scene.dialogue ?? []).map((line, i) => ({
      id: `bubble-${panelId}-d-${i}`,
      panelId,
      type: "speech" as const,
      text: line.text,
      x: 10,
      y: 55 + i * 14,
      width: 60,
      tail: "bottom-left" as const,
      style: "default" as const,
    }));

    return {
      id: panelId,
      episodeId: episode.id,
      imageUrl: scene.imageUrl,
      gradient: STUDIO_PANEL_GRADIENTS[index % STUDIO_PANEL_GRADIENTS.length],
      prompt: scene.imagePrompt,
      characterIds: [],
      overlays,
      order: scene.sceneNumber,
      status: scene.imageUrl ? "ready" : "draft",
    };
  });

  return story;
}
