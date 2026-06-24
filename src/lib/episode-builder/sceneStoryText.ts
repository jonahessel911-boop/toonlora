import type { EpisodeScene } from "@/types/episode-builder";

/** Primary story beat shown beside panels in the draft reader. */
export function getSceneStoryText(scene: EpisodeScene): string {
  return scene.concreteEvent?.trim() || scene.summary?.trim() || scene.title;
}

/** Optional second line: what shifts after this panel. */
export function getSceneChangeText(scene: EpisodeScene): string | null {
  const text = scene.whatChanges?.trim();
  return text || null;
}

/** Draft copy suggestions — not burned into generated images. */
export function getSceneSuggestedCopy(scene: EpisodeScene): string[] {
  return scene.narration.filter((line) => line.trim());
}

export function formatSceneStoryBlock(scene: EpisodeScene): string[] {
  const lines: string[] = [getSceneStoryText(scene)];
  const change = getSceneChangeText(scene);
  if (change) lines.push(`What changes: ${change}`);
  const copy = getSceneSuggestedCopy(scene);
  if (copy.length) {
    lines.push("Suggested copy:");
    copy.forEach((line, i) => lines.push(`${i + 1}. ${line}`));
  }
  return lines;
}
