import {
  EPISODES_PER_SERIES,
  PANELS_PER_CHAPTER_MAX,
  PANELS_PER_CHAPTER_MIN,
  PANELS_PER_EPISODE_MAX,
  PANELS_PER_EPISODE_MIN,
} from "../lib/config.js";
import { callAnthropicJson } from "../lib/anthropic.js";
import { parseJsonFromModel } from "../lib/json.js";
import {
  getPipelineMaxPanels,
  isSeriesLaunchMode,
  isSingleEpisodeMode,
} from "../lib/pipeline-context.js";
import { formatCategoryBriefForPrompt } from "../../src/lib/content-pipeline/category-briefs.js";
import { getSeries, saveStorylineBible } from "../lib/supabase.js";
import type { StorylineBible } from "../lib/types.js";
import { loadResearch } from "./researcher.js";

function buildBibleSystem(maxPanels?: number, singleEpisode?: boolean): string {
  if (maxPanels && !singleEpisode) {
    const minBeats = Math.max(2, Math.ceil(maxPanels / PANELS_PER_CHAPTER_MAX));
    const maxBeats = Math.min(8, Math.floor(maxPanels / PANELS_PER_CHAPTER_MIN));

    return `You are the master story architect for Toonlora — cinematic business graphic novels.

This is a SERIES LAUNCH job: plan the FULL multi-episode series, but only episode 1 will be produced now.

Toonlora format:
- One panel = one full screen (1 image with baked-in text)
- Episode 1 must have EXACTLY ${maxPanels} panels total
- Episodes 2+ = ${PANELS_PER_EPISODE_MIN}–${PANELS_PER_EPISODE_MAX} panels each
- Chapters = story beats, each becomes ${PANELS_PER_CHAPTER_MIN}–${PANELS_PER_CHAPTER_MAX} panels

STEP 1 — FULL STORY TIMELINE (storyline_bible field)
Write the complete narrative from beginning to end (1500–3000 words). Rich, specific, documentary tone.

STEP 2 — EPISODE BREAKDOWN (aim for ${EPISODES_PER_SERIES} episodes, minimum 3)
Divide the timeline into episodes chronologically. CRITICAL rules for episode 1:
- episode_number: 1
- panel_count_estimated: ${maxPanels} (exact)
- story_beats: ${minBeats}–${maxBeats} beats
- Covers ONLY the opening act (~20–35% of the full timeline) — origin, first conflict, first major stakes
- narrative_arc MUST end UNRESOLVED — set up a cliffhanger, NOT a conclusion
- Do NOT reach the finale, bankruptcy, triumph, death, anniversary, or "years later" wrap-up in episode 1
- ugc_hook: tease the crisis that episode 2 will address

Episodes 2+:
- Continue chronologically until the full story is covered
- panel_count_estimated: ${PANELS_PER_EPISODE_MIN}–${PANELS_PER_EPISODE_MAX} each
- story_beats: 5–8 per episode
- Final episode may resolve the arc; all earlier episodes end on tension

STEP 3 — SERIES SUMMARY
- total_episodes: number of episodes in the breakdown (minimum 3)
- total_panels_estimated: sum of all episode panel_count_estimated values

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
}`;
  }

  if (singleEpisode && maxPanels) {
    const minBeats = Math.max(2, Math.ceil(maxPanels / PANELS_PER_CHAPTER_MAX));
    const maxBeats = Math.min(8, Math.floor(maxPanels / PANELS_PER_CHAPTER_MIN));

    return `You are the master story architect for Toonlora — cinematic business graphic novels.

This is a SINGLE-EPISODE production queue job (episode 1 only).

Toonlora format:
- One panel = one full screen (1 image with baked-in text)
- Episode 1 must have EXACTLY ${maxPanels} panels total
- Chapters = story beats, each becomes ${PANELS_PER_CHAPTER_MIN}–${PANELS_PER_CHAPTER_MAX} panels

STEP 1 — FULL STORY TIMELINE (storyline_bible field)
Write the complete narrative for this story (1500–3000 words). Rich, specific, documentary tone.

STEP 2 — EPISODE 1 ONLY
- episode_number: 1
- panel_count_estimated: ${maxPanels} (exact)
- story_beats: ${minBeats}–${maxBeats} beats covering the full story arc for this episode
- Include narrative_arc and ugc_hook

STEP 3 — SERIES SUMMARY
- total_episodes: 1
- total_panels_estimated: ${maxPanels}

Return ONLY valid JSON:
{
  "series_title": string,
  "total_episodes": 1,
  "total_panels_estimated": ${maxPanels},
  "storyline_bible": string,
  "episodes": [{
    "episode_number": 1,
    "title": string,
    "time_period": string,
    "narrative_arc": string,
    "story_beats": string[],
    "panel_count_estimated": ${maxPanels},
    "ugc_hook": string
  }]
}`;
  }

  return BIBLE_SYSTEM_MULTI;
}

const BIBLE_SYSTEM_MULTI = `You are the master story architect for Toonlora — cinematic business graphic novels.

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
  const maxPanels = getPipelineMaxPanels();
  const singleEpisode = isSingleEpisodeMode();
  const seriesLaunch = isSeriesLaunchMode();
  const panelMin = singleEpisode && maxPanels ? 5 : PANELS_PER_EPISODE_MIN;
  const panelMax = singleEpisode && maxPanels ? maxPanels : PANELS_PER_EPISODE_MAX;
  const beatMin = singleEpisode && maxPanels && maxPanels < 25 ? 2 : 5;

  if (!bible.storyline_bible?.trim()) {
    throw new Error("Storyline bible missing storyline_bible narrative");
  }
  if (!bible.episodes?.length) {
    throw new Error("Storyline bible returned no episodes");
  }
  if (singleEpisode && bible.episodes.length !== 1) {
    throw new Error(
      `Single-episode mode expected 1 episode, got ${bible.episodes.length}`
    );
  }
  if (seriesLaunch && bible.episodes.length < 2) {
    throw new Error(
      `Series launch mode expected at least 2 planned episodes, got ${bible.episodes.length}`
    );
  }
  if (bible.total_episodes !== bible.episodes.length) {
    throw new Error(
      `total_episodes (${bible.total_episodes}) ≠ episodes array length (${bible.episodes.length})`
    );
  }

  let panelSum = 0;
  for (const ep of bible.episodes) {
    const epPanelMin =
      seriesLaunch && ep.episode_number === 1 && maxPanels ? maxPanels : panelMin;
    const epPanelMax =
      seriesLaunch && ep.episode_number === 1 && maxPanels ? maxPanels : panelMax;

    if (
      ep.panel_count_estimated < epPanelMin ||
      ep.panel_count_estimated > epPanelMax
    ) {
      throw new Error(
        `Episode ${ep.episode_number}: panel_count_estimated ${ep.panel_count_estimated} out of range (${epPanelMin}–${epPanelMax})`
      );
    }
    if (seriesLaunch && maxPanels && ep.episode_number === 1) {
      ep.panel_count_estimated = maxPanels;
    }
    if (singleEpisode && maxPanels && ep.panel_count_estimated !== maxPanels) {
      ep.panel_count_estimated = maxPanels;
    }
    if (ep.story_beats.length < beatMin || ep.story_beats.length > 8) {
      throw new Error(
        `Episode ${ep.episode_number}: expected ${beatMin}–8 story_beats, got ${ep.story_beats.length}`
      );
    }
    if (!ep.narrative_arc?.trim() || !ep.ugc_hook?.trim()) {
      throw new Error(`Episode ${ep.episode_number}: missing narrative_arc or ugc_hook`);
    }
    panelSum += ep.panel_count_estimated;
  }

  if (singleEpisode && maxPanels) {
    bible.total_panels_estimated = maxPanels;
    bible.total_episodes = 1;
    return;
  }

  if (bible.total_panels_estimated !== panelSum) {
    throw new Error(
      `total_panels_estimated (${bible.total_panels_estimated}) ≠ sum of episodes (${panelSum})`
    );
  }
}

export async function runStorylineBible(seriesId: string): Promise<StorylineBible> {
  const research = await loadResearch(seriesId);
  const series = await getSeries(seriesId);
  const maxPanels = getPipelineMaxPanels();
  const singleEpisode = isSingleEpisodeMode();
  const seriesLaunch = isSeriesLaunchMode();
  const categoryBrief = formatCategoryBriefForPrompt(series.category);

  console.log(
    `[storylineBible] Writing storyline bible for "${research.topic}"` +
      (seriesLaunch ? ` (series launch — ep 1 only, ${maxPanels} panels)` : "") +
      "…"
  );

  const raw = await callAnthropicJson({
    system: buildBibleSystem(maxPanels, singleEpisode),
    user: `Series topic: "${research.topic}"${categoryBrief}

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

Create the complete storyline bible — full chronological narrative + episode breakdown.${
      seriesLaunch
        ? ` Episode 1 must stop early on a cliffhanger (${maxPanels} panels). Plan episodes 2+ for the rest of the story.`
        : ""
    }`,
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
