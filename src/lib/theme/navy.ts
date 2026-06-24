/** Concept D — Navy color schedule */
export const NAVY = {
  background: "#f4f4f0",
  header: "#0A1628",
  accent: "#3B9EFF",
  accentHover: "#2d8eef",
  card: "#ffffff",
  title: "#0A1628",
  subtext: "#888888",
  border: "#e2e2dc",
} as const;

/** Shared cover gradient for story cards (Concept D — Navy) */
export const NAVY_COVER_GRADIENT =
  "from-[#0A1628] via-[#1e3a5f] to-[#3B9EFF]" as const;

/** Category badges use the brand accent — no per-category color variants. */
export function getCategoryBadgeColor(_label?: string): string {
  return NAVY.accent;
}
