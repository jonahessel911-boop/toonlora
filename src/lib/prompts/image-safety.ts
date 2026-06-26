/** Softer prompt layers applied only after OpenAI rejects an image for safety. */
export const IMAGE_SAFETY_SOFTEN_LAYERS = [
  `\n\nSAFETY RETRY — soften the scene: remove all violence, weapons, blood, and physical harm. Show only emotional reaction, symbolic objects, or documentary implication.`,
  `\n\nSAFETY RETRY 2 — abstract the scene completely: no people in distress, no conflict action. Use metaphor only — empty office, torn contract, newspaper headline, silhouette in window.`,
] as const;

export function isImageSafetyViolation(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();
  return (
    lower.includes("safety") ||
    lower.includes("safety_violations") ||
    lower.includes("rejected by the safety system") ||
    lower.includes("content policy")
  );
}

export function softenImagePromptForSafety(
  prompt: string,
  attempt: number
): string {
  const layer = IMAGE_SAFETY_SOFTEN_LAYERS[attempt - 1];
  if (!layer) {
    return `${prompt}\n\nFINAL SAFETY PASS: Symbolic documentary still life only. No people, no violence, no weapons.`;
  }
  return `${prompt}${layer}`;
}
