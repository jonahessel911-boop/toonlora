import type { StoryBible } from "@/types/pipeline";

export function buildEpisodeScriptPrompt(
  storyBible: StoryBible,
  episodeNumber: number,
  previousEpisodeSummary: string,
  episodePrompt: string,
  language: string
): string {
  return `You are a professional vertical webtoon episode writer.

Create one episode script based on the Story Bible.

The episode must work as a vertical scroll comic with strong visual moments, short dialogue, clear emotions, and a cliffhanger.

Keep the story original. Do not copy existing IP, characters, brands, anime, comics, movies, or copyrighted scenes.

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
