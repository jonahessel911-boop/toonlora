import type { EpisodeScript, StoryBible } from "@/types/pipeline";
import { VERTICAL_WEBTOON_LAYOUT_RULES } from "@/lib/promptHints";

export function buildPanelBreakdownPrompt(
  storyBible: StoryBible,
  episodeScript: EpisodeScript
): string {
  return `You are a vertical webtoon panel layout director.

Convert the episode script into a structured panel breakdown for ONE mobile-first vertical scroll page.

${VERTICAL_WEBTOON_LAYOUT_RULES}

GENRE: ${storyBible.genre} — visuals and mood must match this category.

COMPOSITION RULES:
- One clear moment per panel strip.
- Each strip is full width; describe scenes that work in a wide horizontal band.
- Leave room in sky/background corners for speech bubbles and narration baked into the art.
- Show reactions through faces and poses.
- Never describe side-by-side or grid arrangements.

Do not copy existing IP. Keep characters consistent with the Story Bible.

STORY BIBLE:
${JSON.stringify(storyBible, null, 2)}

EPISODE SCRIPT:
${JSON.stringify(episodeScript, null, 2)}

OUTPUT JSON ONLY:

{
  "episode_number": ${episodeScript.episode_number},
  "panel_count": 0,
  "panels": [
    {
      "panel_number": 1,
      "layout_zone": "top / upper / middle / lower / bottom",
      "visual": "",
      "emotion": "",
      "dialogue_text": "",
      "narration_text": "",
      "sfx_text": "",
      "camera": "",
      "background": ""
    }
  ]
}`;
}
