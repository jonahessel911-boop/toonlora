import type { EpisodeScene } from "@/types/episode-builder";

/**
 * Smart continuity reference selection:
 * - Scene 1: no references
 * - Scene 2: scene 1
 * - Scene 3: scenes 1 + 2
 * - Scene 4+: previous two generated scenes (N-2, N-1)
 */
export function getReferenceImageUrls(
  sceneNumber: number,
  scenes: EpisodeScene[]
): string[] {
  const byNumber = new Map<number, string>();
  for (const scene of scenes) {
    if (scene.imageUrl) byNumber.set(scene.sceneNumber, scene.imageUrl);
  }

  if (sceneNumber <= 1) return [];

  if (sceneNumber === 2) {
    const first = byNumber.get(1);
    return first ? [first] : [];
  }

  if (sceneNumber === 3) {
    return [1, 2]
      .map((n) => byNumber.get(n))
      .filter((url): url is string => Boolean(url));
  }

  return [sceneNumber - 2, sceneNumber - 1]
    .map((n) => byNumber.get(n))
    .filter((url): url is string => Boolean(url));
}

/** Primary reference for image API (most recent prior scene). */
export function getPrimaryReferenceUrl(
  sceneNumber: number,
  scenes: EpisodeScene[]
): string | undefined {
  const refs = getReferenceImageUrls(sceneNumber, scenes);
  return refs.length > 0 ? refs[refs.length - 1] : undefined;
}

export function attachReferenceUrls(scenes: EpisodeScene[]): EpisodeScene[] {
  return scenes.map((scene) => ({
    ...scene,
    referenceImageUrls: getReferenceImageUrls(scene.sceneNumber, scenes),
  }));
}
