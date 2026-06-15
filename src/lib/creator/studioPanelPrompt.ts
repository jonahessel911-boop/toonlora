import { getGenreImageHint } from "@/lib/promptHints";

export interface CreatorCharacterInput {
  name: string;
  visualDescription: string;
  outfit: string;
  role: string;
}

export interface CreatorPanelScript {
  panel_number: number;
  visual: string;
  emotion: string;
  suggested_narration?: string;
  suggested_dialogue?: string;
  speaker?: string;
}

export interface CreatorPanelBreakdown {
  panels: CreatorPanelScript[];
}

export function buildCreatorEpisodeBreakdownPrompt(params: {
  title: string;
  genre: string;
  description: string;
  episodePrompt: string;
  panelCount: number;
  characters: CreatorCharacterInput[];
}): string {
  const characterBlock = params.characters
    .map(
      (c) =>
        `- ${c.name} (${c.role}): ${c.visualDescription}. Outfit: ${c.outfit}`
    )
    .join("\n");

  return `You are a vertical webtoon storyboard writer.

Break this episode into exactly ${params.panelCount} sequential panel moments for a mobile vertical webtoon.

SERIES: ${params.title}
GENRE: ${params.genre}
${getGenreImageHint(params.genre)}

STORY DESCRIPTION:
${params.description || "—"}

EPISODE PLOT:
${params.episodePrompt}

CHARACTERS:
${characterBlock}

RULES:
- One clear visual moment per panel, read top to bottom.
- Each panel should advance the episode plot.
- Describe what we SEE (poses, setting, action) — not camera jargon.
- suggested_narration: optional short narration box text (panel 1 often has one).
- suggested_dialogue: optional one line of dialogue for speech bubble.
- speaker: character name if dialogue is present.

OUTPUT JSON ONLY:
{
  "panels": [
    {
      "panel_number": 1,
      "visual": "",
      "emotion": "",
      "suggested_narration": "",
      "suggested_dialogue": "",
      "speaker": ""
    }
  ]
}`;
}

export function buildStudioPanelImagePrompt(params: {
  title: string;
  genre: string;
  visual: string;
  emotion: string;
  characters: CreatorCharacterInput[];
  panelNumber: number;
  totalPanels: number;
}): string {
  const characterBlock = params.characters
    .map((c) => `${c.name}: ${c.visualDescription}. Outfit: ${c.outfit}.`)
    .join("\n");

  return `Create ONE vertical webtoon panel illustration — a single scene for mobile scroll.

SERIES: ${params.title}
GENRE: ${params.genre}
${getGenreImageHint(params.genre)}

PANEL ${params.panelNumber} of ${params.totalPanels}

SCENE:
${params.visual}

EMOTION / MOOD:
${params.emotion}

CHARACTERS (keep consistent designs):
${characterBlock}

COMPOSITION:
- Portrait aspect ratio, one full-width horizontal panel strip
- Expressive cartoon/webtoon style matching the genre
- Dynamic poses, clear facial expressions
- Leave empty space in upper corners for speech bubbles later
- Do NOT draw text, speech bubbles, narration boxes, or sound effects
- Original artwork only — no copyrighted characters`;
}

export function buildAddPanelPrompt(params: {
  title: string;
  genre: string;
  episodePrompt: string;
  previousPanelsSummary: string;
  characters: CreatorCharacterInput[];
}): string {
  return `You are a vertical webtoon storyboard writer.

Continue this episode with ONE new panel that follows naturally after the previous panels.

SERIES: ${params.title}
GENRE: ${params.genre}

EPISODE PLOT:
${params.episodePrompt}

PREVIOUS PANELS:
${params.previousPanelsSummary}

CHARACTERS:
${params.characters.map((c) => `- ${c.name}: ${c.visualDescription}`).join("\n")}

OUTPUT JSON ONLY:
{
  "panel": {
    "panel_number": 0,
    "visual": "",
    "emotion": "",
    "suggested_narration": "",
    "suggested_dialogue": "",
    "speaker": ""
  }
}`;
}
