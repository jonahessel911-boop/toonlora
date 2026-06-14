import type { SeriesInput } from "@/types/pipeline";

export function buildStoryBiblePrompt(input: SeriesInput): string {
  return `You are a professional story architect for a vertical cartoon/webtoon platform.

Create a complete Story Bible based on the user's idea.

The story must be original, emotionally engaging, suitable for a cartoon/webtoon format, and easy to continue in future episodes.

Do not copy existing characters, brands, anime, comics, movies, or copyrighted stories.

USER INPUT:
Story idea: ${input.story_idea}
Genre: ${input.genre}
Tone: ${input.tone}
Main character: ${input.main_character}
Love interest / secondary character: ${input.love_interest}
Target audience: ${input.target_audience}
Language: ${input.language}

OUTPUT JSON ONLY:

{
  "series_title": "",
  "logline": "",
  "genre": "",
  "tone": "",
  "target_audience": "",
  "visual_style": "",
  "main_characters": [
    {
      "name": "",
      "role": "",
      "age_range": "",
      "personality": "",
      "visual_design": "",
      "signature_outfit": "",
      "emotional_arc": ""
    }
  ],
  "world": {
    "setting": "",
    "mood": "",
    "important_locations": []
  },
  "story_rules": [""],
  "season_arc": "",
  "episode_1_hook": "",
  "recurring_conflict": "",
  "visual_keywords": []
}`;
}
