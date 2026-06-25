import type { TextBubble } from "@/types/pipeline";
import type { PanelTextOverlay } from "@/lib/panelOverlayLayout";

export interface ReaderPanelData {
  id: string;
  panelNumber: number;
  imageUrl?: string;
  aspectRatio?: number;
  gradient: string;
  genre?: string;
  /** Empty for new episodes — text is baked into generated comic art. */
  textOverlays: PanelTextOverlay[];
  showStripImage?: boolean;
  artUrl?: string;
}

const PANEL_GRADIENTS = [
  "from-[#2A114B] via-[#4C1D95] to-[#1E0A35]",
  "from-[#5340FF] via-[#7C3AED] to-[#FF4FA3]",
  "from-[#0E7490] via-[#22D3EE] to-[#5340FF]",
  "from-[#5340FF] via-[#6D4CFF] to-[#2A114B]",
  "from-[#F3ECFF] via-[#E9D8FD] to-[#C4B5FD]",
  "from-[#2A114B] via-[#5340FF] to-[#22D3EE]",
];

/** Build reader panels — image only, no HTML text overlays. */
export function episodeToReaderPanels(
  episode: import("@/types/story").StoryEpisode,
  coverGradient: string,
  seriesId?: string
): ReaderPanelData[] {
  const stripUrl = episode.comicPage.artUrl ?? undefined;

  const breakdownByNumber = new Map(
    (episode.panelBreakdown?.panels ?? []).map((p) => [p.panel_number, p])
  );

  const scriptPanels =
    episode.script?.panels?.length > 0
      ? episode.script.panels
      : [...breakdownByNumber.values()]
          .sort((a, b) => a.panel_number - b.panel_number)
          .map((panel) => ({
            panel_number: panel.panel_number,
            visual_description: panel.visual,
          }));

  return scriptPanels.map((scriptPanel, panelIndex) => {
    const id = `${seriesId ?? "ep"}-panel-${scriptPanel.panel_number}`;
    const breakdownPanel = breakdownByNumber.get(scriptPanel.panel_number);
    const panelArtUrl = breakdownPanel?.artUrl;
    const imageUrl = panelArtUrl ?? (panelIndex === 0 ? stripUrl : undefined);

    return {
      id,
      panelNumber: scriptPanel.panel_number,
      imageUrl,
      showStripImage: panelIndex === 0 && Boolean(stripUrl) && !panelArtUrl,
      artUrl: imageUrl,
      gradient:
        PANEL_GRADIENTS[(scriptPanel.panel_number - 1) % PANEL_GRADIENTS.length] ||
        coverGradient,
      textOverlays: [],
    };
  });
}

export type LegacyReaderPanel = ReaderPanelData & {
  bubbles?: TextBubble[];
};
