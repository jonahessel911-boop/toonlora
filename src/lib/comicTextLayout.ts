import type { EpisodeScript, TextBubble } from "@/types/pipeline";

const MAX_SPEECH_PER_PANEL = 4;
const MAX_NARRATION_CHARS = 140;
const MAX_SPEECH_CHARS = 120;
const MAX_SFX_CHARS = 12;

export interface NormalizedPanelBubbles {
  narrationTop?: TextBubble;
  narrationBottom?: TextBubble;
  speech: TextBubble[];
  sfx?: TextBubble;
}

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1).trimEnd();
  return `${cut}…`;
}

function inferTail(
  index: number,
  panelIndex: number,
  speaker?: string
): TextBubble["tail_direction"] {
  if (speaker) {
    const hash = speaker.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return hash % 2 === 0 ? "bottom-left" : "bottom-right";
  }
  return (panelIndex + index) % 2 === 0 ? "bottom-left" : "bottom-right";
}

/** Build overlay bubbles from episode script when none are stored. */
export function buildBubblesFromScriptPanel(
  panel: EpisodeScript["panels"][number],
  panelIndex: number
): TextBubble[] {
  const bubbles: TextBubble[] = [];

  if (panel.narration?.trim()) {
    bubbles.push({
      type: "narration",
      speaker: "",
      text: truncate(panel.narration, MAX_NARRATION_CHARS),
      position: { x: 50, y: 5, width: 88 },
    });
  }

  panel.dialogue.slice(0, MAX_SPEECH_PER_PANEL).forEach((line, i) => {
    if (!line.text?.trim()) return;
    const tail = inferTail(i, panelIndex, line.speaker);
    const isRight = tail === "bottom-right";
    bubbles.push({
      type: "speech",
      speaker: line.speaker?.trim() ?? "",
      text: truncate(line.text, MAX_SPEECH_CHARS),
      position: { x: isRight ? 72 : 28, y: 12 + i * 8, width: 44 },
      tail_direction: tail,
    });
  });

  if (panel.sfx?.trim()) {
    bubbles.push({
      type: "sfx",
      speaker: "",
      text: truncate(panel.sfx, MAX_SFX_CHARS),
      position: { x: 88, y: 10, width: 18 },
    });
  }

  return bubbles;
}

/** Enforce readable webtoon layout limits per panel. */
export function normalizePanelBubbles(
  bubbles: TextBubble[],
  panelIndex = 0
): NormalizedPanelBubbles {
  const narrations = bubbles
    .filter((b) => b.type === "narration" && b.text.trim())
    .map((b) => ({
      ...b,
      text: truncate(b.text, MAX_NARRATION_CHARS),
    }));

  const speech = bubbles
    .filter((b) => b.type === "speech" && b.text.trim())
    .slice(0, MAX_SPEECH_PER_PANEL)
    .map((b, i) => ({
      ...b,
      text: truncate(b.text, MAX_SPEECH_CHARS),
      tail_direction:
        b.tail_direction ?? inferTail(i, panelIndex, b.speaker),
    }));

  const sfxItems = bubbles
    .filter((b) => b.type === "sfx" && b.text.trim())
    .map((b) => ({
      ...b,
      text: truncate(b.text, MAX_SFX_CHARS),
    }));

  let narrationTop = narrations[0];
  let narrationBottom = narrations.length > 1 ? narrations[1] : undefined;

  if (narrations.length > 2) {
    narrationBottom = narrations[narrations.length - 1];
  }

  return {
    narrationTop,
    narrationBottom,
    speech,
    sfx: sfxItems[0],
  };
}
