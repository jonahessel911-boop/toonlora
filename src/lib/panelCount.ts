import type { SeriesInput } from "@/types/pipeline";

const LENGTH_DEFAULTS: Record<SeriesInput["episode_length"], number> = {
  Short: 5,
  Normal: 6,
  Long: 8,
};

export const PANEL_COUNT_MIN = 4;
export const PANEL_COUNT_MAX = 14;

export function resolvePanelCount(input: SeriesInput): number {
  const n = input.panel_count;
  if (typeof n === "number" && n >= PANEL_COUNT_MIN && n <= PANEL_COUNT_MAX) {
    return Math.round(n);
  }
  return LENGTH_DEFAULTS[input.episode_length] ?? 6;
}
