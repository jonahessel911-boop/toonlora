import type { ContinuityMemory, EpisodeScript, StoryBible } from "@/types/pipeline";

export function buildContinuityMemoryPrompt(
  storyBible: StoryBible,
  episodeScript: EpisodeScript,
  existingMemory?: ContinuityMemory
): string {
  return `You are a series continuity editor for a vertical webtoon platform.

Summarize continuity state after this episode so future episodes stay consistent.

STORY BIBLE:
${JSON.stringify(storyBible, null, 2)}

EPISODE SCRIPT:
${JSON.stringify(episodeScript, null, 2)}

PREVIOUS CONTINUITY:
${existingMemory ? JSON.stringify(existingMemory, null, 2) : "None — first episode."}

OUTPUT JSON ONLY:

{
  "series_title": "",
  "last_episode_number": ${episodeScript.episode_number},
  "last_episode_summary": "",
  "character_states": {},
  "unresolved_threads": [],
  "visual_consistency_notes": []
}`;
}
