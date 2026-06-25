import {
  PANELS_PER_CHAPTER_MAX,
  PANELS_PER_CHAPTER_MIN,
  PANELS_PER_EPISODE_MAX,
  PANELS_PER_EPISODE_MIN,
} from "../lib/config.js";
import { callAnthropicJson } from "../lib/anthropic.js";
import { parseJsonFromModel } from "../lib/json.js";
import { saveStorylineBible } from "../lib/supabase.js";
import type { StorylineBible } from "../lib/types.js";
import { loadResearch } from "./researcher.js";

const BIBLE_SYSTEM = `You are the master story architect for Toonlora — cinematic business graphic novels.

Before ANY panel scripts are written, you must create a complete STORYLINE BIBLE for the series.

Toonlora format context:
- One panel = one full screen the reader swipes through (1 image with text baked in)
- One episode = exactly ${PANELS_PER_EPISODE_MIN}–${PANELS_PER_EPISODE_MAX} panels
- Chapters within an episode = 5–8 story beats, each becoming ${PANELS_PER_CHAPTER_MIN}–${PANELS_PER_CHAPTER_MAX} panels later

You must complete THREE steps in your output:

STEP 1 — FULL STORY TIMELINE (in storyline_bible field)
Write a complete chronological narrative from beginning to end. Include:
- Every major event with exact dates and dollar amounts
- All key characters with their role in the story
- Every turning point, crisis moment, and resolution
- Lesser-known details and behind-the-scenes facts
- The aftermath and long-term impact
This should read like a definitive documentary narrative — rich, specific, 1500–3000 words.

STEP 2 — EPISODE BREAKDOWN
Divide the full timeline into episodes of ${PANELS_PER_EPISODE_MIN}–${PANELS_PER_EPISODE_MAX} panels each.
For each episode:
- episode_number, title, time_period (e.g. "1998-2001")
- narrative_arc: one paragraph on the central arc of this episode
- story_beats: 5–8 key beats that will become chapters (one string per beat)
- panel_count_estimated: ${PANELS_PER_EPISODE_MIN}–${PANELS_PER_EPISODE_MAX}
- ugc_hook: one punchy sentence for UGC ads

STEP 3 — SERIES SUMMARY
Set total_episodes and total_panels_estimated (sum of all episode panel_count_estimated values).

Return ONLY valid JSON:
{
  "series_title": string,
  "total_episodes": number,
  "total_panels_estimated": number,
  "storyline_bible": string,
  "episodes": [{
    "episode_number": number,
    "title": string,
    "time_period": string,
    "narrative_arc": string,
    "story_beats": string[],
    "panel_count_estimated": number,
    "ugc_hook": string
  }]
}

Rules:
- Episodes must cover the FULL story chronologically with no gaps
- story_beats must be 5–8 items per episode
- panel_count_estimated must be ${PANELS_PER_EPISODE_MIN}–${PANELS_PER_EPISODE_MAX} per episode
- total_panels_estimated MUST equal sum of episode panel_count_estimated
- Use research facts, dates, dollar amounts — be specific not vague
- Mix dramatic highlight episodes with deeper in-depth episodes where the story earns it`;

function validateStorylineBible(bible: StorylineBible): void {
  if (!bible.storyline_bible?.trim()) {
    throw new Error("Storyline bible missing storyline_bible narrative");
  }
  if (!bible.episodes?.length) {
    throw new Error("Storyline bible returned no episodes");
  }
  if (bible.total_episodes !== bible.episodes.length) {
    throw new Error(
      `total_episodes (${bible.total_episodes}) ≠ episodes array length (${bible.episodes.length})`
    );
  }

  let panelSum = 0;
  for (const ep of bible.episodes) {
    if (
      ep.panel_count_estimated < PANELS_PER_EPISODE_MIN ||
      ep.panel_count_estimated > PANELS_PER_EPISODE_MAX
    ) {
      throw new Error(
        `Episode ${ep.episode_number}: panel_count_estimated ${ep.panel_count_estimated} out of range`
      );
    }
    if (ep.story_beats.length < 5 || ep.story_beats.length > 8) {
      throw new Error(
        `Episode ${ep.episode_number}: expected 5–8 story_beats, got ${ep.story_beats.length}`
      );
    }
    if (!ep.narrative_arc?.trim() || !ep.ugc_hook?.trim()) {
      throw new Error(`Episode ${ep.episode_number}: missing narrative_arc or ugc_hook`);
    }
    panelSum += ep.panel_count_estimated;
  }

  if (bible.total_panels_estimated !== panelSum) {
    throw new Error(
      `total_panels_estimated (${bible.total_panels_estimated}) ≠ sum of episodes (${panelSum})`
    );
  }
}

export async function runStorylineBible(seriesId: string): Promise<StorylineBible> {
  const research = await loadResearch(seriesId);

  console.log(`[storylineBible] Writing complete storyline bible for "${research.topic}"…`);

  const raw = await callAnthropicJson({
    system: BIBLE_SYSTEM,
    user: `Series topic: "${research.topic}"

Full research (use ALL of this for the timeline narrative):
${JSON.stringify(
  {
    topic: research.topic,
    facts: research.facts,
    timeline: research.timeline,
    characters: research.characters,
    turning_points: research.turning_points,
    quotes: research.quotes,
    storyline: research.storyline,
    series_potential: research.series_potential,
  },
  null,
  2
)}

Create the complete storyline bible — full chronological narrative + episode breakdown.`,
    maxTokens: 20000,
  });

  const bible = parseJsonFromModel<StorylineBible>(raw);
  bible.series_title = bible.series_title || research.topic;
  bible.total_episodes = bible.episodes?.length ?? bible.total_episodes;

  validateStorylineBible(bible);
  await saveStorylineBible(seriesId, bible);

  console.log(
    `[storylineBible] Saved ${bible.total_episodes} episodes, ${bible.total_panels_estimated} panels estimated`
  );

  return bible;
}
