import type { EpisodeScript, PanelBreakdown } from "@/types/pipeline";
import {
  VERTICAL_WEBTOON_LAYOUT_RULES,
  getGenreImageHint,
} from "@/lib/promptHints";

export function buildPanelImagePromptInputs(
  script: EpisodeScript,
  breakdown: PanelBreakdown
): PanelImagePromptInput[] {
  return script.panels.map((sp, i) => {
    const bd =
      breakdown.panels.find((p) => p.panel_number === sp.panel_number) ??
      breakdown.panels[i];
    return {
      panelNumber: sp.panel_number,
      visual: bd?.visual || sp.visual_description,
      emotion: bd?.emotion || sp.character_emotion,
      dialogue: sp.dialogue,
      narration: sp.narration,
      sfx: sp.sfx,
    };
  });
}

export interface PanelImagePromptInput {
  panelNumber: number;
  visual: string;
  emotion: string;
  dialogue: import("@/types/pipeline").EpisodeDialogue[];
  narration: string;
  sfx: string;
}

function formatPanelTextBlock(panel: PanelImagePromptInput): string {
  const lines: string[] = [
    `STRIP ${panel.panelNumber} (full width, stacked below strip ${panel.panelNumber - 1 || "— start at top"}):`,
    `Scene: ${panel.visual}`,
    `Emotion: ${panel.emotion}`,
    `TEXT BAKED INTO THIS STRIP:`,
  ];

  if (panel.narration?.trim()) {
    lines.push(
      `- Narration box at top or bottom of strip (cream #FFF8E8, dark text): "${panel.narration.trim()}"`
    );
  }

  panel.dialogue.forEach((d) => {
    if (!d.text?.trim()) return;
    const speaker = d.speaker?.trim() || "Character";
    lines.push(
      `- Speech bubble, tail to ${speaker}. Label "${speaker.toUpperCase()}": "${d.text.trim()}"`
    );
  });

  if (panel.sfx?.trim()) {
    lines.push(`- Sound effect near action: "${panel.sfx.trim()}"`);
  }

  if (lines.length <= 4) {
    lines.push(`- No dialogue — visuals only.`);
  }

  return lines.join("\n");
}

export function buildFinalImagePrompt(params: {
  episodeNumber: number;
  seriesTitle: string;
  genre: string;
  tone: string;
  artStyleHint: string;
  characterBible: string;
  episodeSummary: string;
  panels: PanelImagePromptInput[];
  cliffhanger: string;
}): string {
  const panelBlocks = params.panels.map(formatPanelTextBlock).join("\n\n");
  const genreHint = getGenreImageHint(params.genre);

  return `CRITICAL — VERTICAL WEBTOON ONLY (read first):
Create ONE tall portrait comic page for mobile vertical scroll.
Exactly ${params.panels.length} full-width horizontal panel STRIPS in a SINGLE COLUMN from top to bottom.
DO NOT draw a grid. DO NOT place panels side by side. DO NOT use 2×2, 2×3, or any multi-column comic page layout.
Think Webtoon / Tapas / LINE Webtoon: one panel per row, stacked vertically.

${VERTICAL_WEBTOON_LAYOUT_RULES}

Episode ${params.episodeNumber} of "${params.seriesTitle}".

GENRE & CATEGORY: ${params.genre}
${genreHint}

TONE: ${params.tone}

ART STYLE:
${params.artStyleHint}

Original artwork only. Do not copy existing characters, brands, logos, anime, comics, movies, or copyrighted scenes.

TEXT IN IMAGE (mandatory):
- Render ALL speech bubbles, narration boxes, and sound effects inside the artwork.
- White speech bubbles, dark text, purple #5340FF speaker labels.
- Narration in cream #FFF8E8 boxes — never over faces.
- Use EXACT wording below.

CHARACTER BIBLE:
${params.characterBible}

STORY CONTEXT:
${params.episodeSummary}

VERTICAL STRIPS (top to bottom, one column):

${panelBlocks}

ENDING: ${params.cliffhanger}

REMINDER: Single vertical column only — NO GRID, NO SIDE-BY-SIDE PANELS.`;

}

export function buildImagePromptGeneratorPrompt(
  storyBible: import("@/types/pipeline").StoryBible,
  episodeScript: import("@/types/pipeline").EpisodeScript,
  artStyle: string,
  language: string
): string {
  return `You are an expert AI comic art director for vertical mobile webtoons.

Convert the episode script into one image generation prompt for a TALL PORTRAIT page.

${VERTICAL_WEBTOON_LAYOUT_RULES}

Genre: ${storyBible.genre}
All dialogue, narration, and SFX must be baked into the artwork as comic lettering.

STORY BIBLE:
${JSON.stringify(storyBible, null, 2)}

EPISODE SCRIPT:
${JSON.stringify(episodeScript, null, 2)}

ART STYLE:
${artStyle}

LANGUAGE:
${language}

OUTPUT:
One complete prompt for ${episodeScript.panels.length} vertically stacked full-width strips. NO grid layout.`;
}
