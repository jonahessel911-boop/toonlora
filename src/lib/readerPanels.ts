import type { SeriesDetail } from "@/lib/seriesCatalog";
import type { TextBubble } from "@/types/pipeline";

export interface ReaderPanelData {
  panelNumber: number;
  gradient: string;
  emoji?: string;
  sfx?: string;
  bubbles?: TextBubble[];
  artUrl?: string;
}

const PANEL_GRADIENTS = [
  "from-[#2A114B] via-[#4C1D95] to-[#1E0A35]",
  "from-[#5340FF] via-[#7C3AED] to-[#FF4FA3]",
  "from-[#0E7490] via-[#22D3EE] to-[#5340FF]",
  "from-[#FF6847] via-[#FF4FA3] to-[#5340FF]",
  "from-[#F3ECFF] via-[#E9D8FD] to-[#C4B5FD]",
  "from-[#2A114B] via-[#5340FF] to-[#22D3EE]",
  "from-[#7C3AED] via-[#FF4FA3] to-[#FFE033]",
  "from-[#1E0A35] via-[#5340FF] to-[#2A114B]",
  "from-[#FF4FA3] via-[#5340FF] to-[#22D3EE]",
  "from-[#2A114B] via-[#3B1A68] to-[#5340FF]",
];

const MOCK_LINES: { sfx?: string; speaker?: string; text?: string }[] = [
  { sfx: "BAM" },
  { speaker: "Mira", text: "Wait — did you hear that?" },
  { speaker: "Kai", text: "Everyone stay close!" },
  { text: "Something magical was waking up..." },
  { sfx: "WHOOSH" },
  { speaker: "Luna", text: "Look at the sky!" },
  { text: "The adventure was only beginning." },
  { speaker: "Nova", text: "We can do this together." },
  { sfx: "GASP" },
  { text: "To be continued..." },
];

export function buildMockReaderPanels(series: SeriesDetail): ReaderPanelData[] {
  const emojis = ["🌸", "⚔️", "✨", "🐻", "🦉", "💫", "🎭", "📖", "🌙", "💕"];

  return MOCK_LINES.map((line, i) => {
    const bubbles: TextBubble[] = [];

    if (line.sfx) {
      bubbles.push({
        type: "sfx",
        speaker: "",
        text: line.sfx,
        position: { x: 50, y: 18, width: 30 },
      });
    } else if (line.text) {
      bubbles.push({
        type: "narration",
        speaker: "",
        text: line.text,
        position: { x: 50, y: 78, width: 70 },
      });
    } else if (line.speaker && line.text) {
      bubbles.push({
        type: "speech",
        speaker: line.speaker,
        text: line.text,
        position: { x: 50, y: 72, width: 65 },
        tail_direction: i % 2 === 0 ? "bottom-left" : "bottom-right",
      });
    }

    return {
      panelNumber: i + 1,
      gradient: PANEL_GRADIENTS[i % PANEL_GRADIENTS.length],
      emoji: emojis[i % emojis.length],
      sfx: line.sfx,
      bubbles,
    };
  });
}

export function episodeToReaderPanels(
  episode: import("@/types/story").StoryEpisode,
  coverGradient: string
): ReaderPanelData[] {
  return episode.script.panels.map((panel) => {
    const overlay =
      episode.textOverlay.panels.find(
        (p) => p.panel_number === panel.panel_number
      )?.bubbles ?? [];

    return {
      panelNumber: panel.panel_number,
      gradient:
        PANEL_GRADIENTS[(panel.panel_number - 1) % PANEL_GRADIENTS.length] ||
        coverGradient,
      bubbles: overlay.length
        ? overlay
        : panel.dialogue[0]
          ? [
              {
                type: "speech" as const,
                speaker: panel.dialogue[0].speaker ?? "",
                text: panel.dialogue[0].text,
                position: { x: 50, y: 75, width: 65 },
                tail_direction: "bottom-left" as const,
              },
            ]
          : [],
      artUrl: episode.comicPage.artUrl ?? undefined,
    };
  });
}
