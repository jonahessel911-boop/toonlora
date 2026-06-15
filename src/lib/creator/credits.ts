export const STUDIO_CREDIT_COSTS = {
  generateCharacter: 5,
  panels4: 8,
  panels8: 15,
  panels12: 22,
  panels16: 30,
  regeneratePanel: 3,
  generateCover: 4,
  inspiredEpisode: 12,
} as const;

export type PanelEpisodeLength = 4 | 8 | 12 | 16;

export function panelGenerationCost(count: PanelEpisodeLength): number {
  switch (count) {
    case 4:
      return STUDIO_CREDIT_COSTS.panels4;
    case 8:
      return STUDIO_CREDIT_COSTS.panels8;
    case 12:
      return STUDIO_CREDIT_COSTS.panels12;
    case 16:
      return STUDIO_CREDIT_COSTS.panels16;
    default:
      return STUDIO_CREDIT_COSTS.panels8;
  }
}

export function formatCreditCost(cost: number): string {
  return `${cost} credit${cost === 1 ? "" : "s"}`;
}
