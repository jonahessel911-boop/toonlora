import type { EpisodeScript, StoryBible } from "@/types/pipeline";

export function buildPanelBreakdownPrompt(
  storyBible: StoryBible,
  episodeScript: EpisodeScript
): string {
  return `You are a vertical webtoon panel layout director.

Convert the episode script into a structured panel breakdown for a mobile-first vertical comic page.

Use 5 to 7 panels maximum. Each panel needs clear visual hierarchy for overlay text later.

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
      "layout_zone": "top / upper-mid / mid / lower-mid / bottom",
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
