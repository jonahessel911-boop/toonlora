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
  return `You are a webtoon UI designer.

Create speech bubble and text overlay placement JSON for a vertical comic page.

The comic art has NO text — you place all dialogue, narration, and SFX as overlay elements.

Rules:
- Short readable text only
- Position bubbles using percentage x/y (0-100) relative to each panel
- width is percentage of panel width
- Mobile-first vertical layout
- Keep speaker names only in speech bubbles, not narration

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
          "position": { "x": 50, "y": 20, "width": 40 },
          "tail_direction": "bottom-left | bottom-right | top-left | top-right"
        }
      ]
    }
  ]
}`;
}
