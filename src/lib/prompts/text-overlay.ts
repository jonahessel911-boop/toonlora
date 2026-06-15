import type {
  EpisodeScript,
  PanelBreakdown,
  StoryBible,
} from "@/types/pipeline";

export function buildTextOverlayPrompt(
  storyBible: StoryBible,
  episodeScript: EpisodeScript,
  panelBreakdown: PanelBreakdown
): string {
  return `You are a professional vertical webtoon text layout designer.

Create speech bubble and narration placement JSON for a vertical comic page.
The comic art has NO text — you place all dialogue, narration, and SFX as overlay metadata.

LAYOUT RULES (critical):
- Vertical webtoon format with clear top-to-bottom reading flow.
- Each panel must feel clean with intentional empty space for characters.
- Do NOT place text in the center of a panel.
- Do NOT overlay narration across faces, bodies, or key action.
- Narration boxes: top or bottom of panel only (y 4–10 for top, y 88–94 for bottom). Max 1 narration per panel. Max 1 short sentence each.
- Speech bubbles: upper-left or upper-right only (y 10–35). Near the speaking character. Max 4 speech bubbles per panel. Max 1–2 short sentences each.
- SFX: small sound effects only, upper-right corner (x 80–92, y 8–14). Never large cinematic words in the center. Max 12 characters.
- Avoid crossing bubbles. Alternate left/right for multiple speakers.
- Use tail_direction so tails point toward the speaker below (bottom-left or bottom-right).

DIALOGUE RULES:
- type "speech" for character dialogue only.
- Include speaker name in speech bubbles when multiple characters speak in one panel.
- Keep text short, natural, and grammatically correct.

NARRATION RULES:
- type "narration" for scene-setting or emotional transitions only.
- No speaker name on narration.
- Never use semi-transparent or floating narration — the app renders solid boxes.

TEXT HIERARCHY:
1. Character art readability
2. Clear emotion
3. Minimal effective text — premium, not cluttered

Position fields use percentage x/y (0–100) relative to each panel. width is % of panel width.

STORY BIBLE:
${JSON.stringify(storyBible, null, 2)}

EPISODE SCRIPT:
${JSON.stringify(episodeScript, null, 2)}

PANEL BREAKDOWN:
${JSON.stringify(panelBreakdown, null, 2)}

OUTPUT JSON ONLY:

{
  "episode_number": ${episodeScript.episode_number},
  "panels": [
    {
      "panel_number": 1,
      "bubbles": [
        {
          "type": "speech | narration | sfx",
          "speaker": "",
          "text": "",
          "position": { "x": 28, "y": 14, "width": 42 },
          "tail_direction": "bottom-left | bottom-right"
        }
      ]
    }
  ]
}`;
}
