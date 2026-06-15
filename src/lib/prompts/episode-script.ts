import type { StoryBible } from "@/types/pipeline";
import { VERTICAL_WEBTOON_LAYOUT_RULES } from "@/lib/promptHints";

export function buildEpisodeScriptPrompt(
  storyBible: StoryBible,
  episodeNumber: number,
  previousEpisodeSummary: string,
  episodePrompt: string,
  language: string,
  panelCount = 6
): string {
  return `You are a professional vertical webtoon episode writer.

Create one episode script based on the Story Bible.

GENRE: ${storyBible.genre} — story beats, tone, and visuals must fit this category.

${VERTICAL_WEBTOON_LAYOUT_RULES}

The episode is ONE vertically scrolling page: ${panelCount} panel strips read top to bottom.

Keep the story original. Do not copy existing IP.

TEXT RULES (rendered inside comic art, not as HTML):
- Each panel strip = one clear moment.
- Dialogue: 1–2 short sentences per line, max 4 lines per panel.
- Narration: max 1 short sentence per panel for scene-setting.
- SFX: small sound effects only (e.g. "Tap", "Whoosh") near the action.
- Prioritize readable storytelling — minimal clutter.

STORY BIBLE:
${JSON.stringify(storyBible, null, 2)}

EPISODE NUMBER:
${episodeNumber}

PREVIOUS EPISODE SUMMARY:
${previousEpisodeSummary || "None — this is the first episode."}

USER REQUEST FOR THIS EPISODE:
${episodePrompt}

LANGUAGE:
${language}

PANEL COUNT:
Create exactly ${panelCount} panels, numbered 1 through ${panelCount}, for a single vertical column.
The final panel should end on a cliffhanger when possible.

OUTPUT JSON ONLY:

{
  "episode_title": "",
  "episode_number": ${episodeNumber},
  "episode_summary": "",
  "emotional_goal": "",
  "cliffhanger": "",
  "panels": [
    {
      "panel_number": 1,
      "panel_type": "establishing / close-up / action / reaction / emotional / cliffhanger",
      "visual_description": "",
      "camera_angle": "",
      "character_emotion": "",
      "background": "",
      "dialogue": [{ "speaker": "", "text": "" }],
      "narration": "",
      "sfx": ""
    }
  ]
}`;
}
