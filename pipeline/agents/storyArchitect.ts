import {
  PANELS_PER_CHAPTER_MAX,
  PANELS_PER_CHAPTER_MIN,
  PANELS_PER_EPISODE_MAX,
  PANELS_PER_EPISODE_MIN,
} from "../lib/config.js";
import { loadStorylineBible, upsertEpisodeStructure } from "../lib/supabase.js";
import type { StoryBible, StoryBibleChapter, StorylineBibleEpisode } from "../lib/types.js";

/** Distribute episode panel count across chapters (5–6 panels each). */
export function distributePanelsAcrossChapters(
  totalPanels: number,
  chapterCount: number
): number[] {
  if (chapterCount < 1) {
    throw new Error("chapterCount must be at least 1");
  }

  const minTotal = chapterCount * PANELS_PER_CHAPTER_MIN;
  const maxTotal = chapterCount * PANELS_PER_CHAPTER_MAX;
  if (totalPanels < minTotal || totalPanels > maxTotal) {
    throw new Error(
      `Cannot distribute ${totalPanels} panels across ${chapterCount} chapters (need ${minTotal}–${maxTotal})`
    );
  }

  const counts = new Array<number>(chapterCount).fill(PANELS_PER_CHAPTER_MIN);
  let remaining = totalPanels - minTotal;

  let i = 0;
  while (remaining > 0) {
    if (counts[i] < PANELS_PER_CHAPTER_MAX) {
      counts[i] += 1;
      remaining -= 1;
    }
    i = (i + 1) % chapterCount;
  }

  return counts;
}

function episodeToStoryBibleEpisode(ep: StorylineBibleEpisode): {
  episode_number: number;
  title: string;
  time_period: string;
  logline: string;
  target_panel_count: number;
  chapters: StoryBibleChapter[];
} {
  const panelCounts = distributePanelsAcrossChapters(
    ep.panel_count_estimated,
    ep.story_beats.length
  );

  const chapters: StoryBibleChapter[] = ep.story_beats.map((beat, index) => ({
    chapter_number: index + 1,
    title: beat.length > 80 ? `${beat.slice(0, 77)}…` : beat,
    description: beat,
    panel_count: panelCounts[index],
  }));

  return {
    episode_number: ep.episode_number,
    title: ep.title,
    time_period: ep.time_period,
    logline: ep.narrative_arc,
    target_panel_count: ep.panel_count_estimated,
    chapters,
  };
}

export async function runStoryArchitect(seriesId: string): Promise<StoryBible> {
  const storylineBible = await loadStorylineBible(seriesId);

  console.log(
    `[storyArchitect] Building chapter structure from storyline bible (${storylineBible.total_episodes} episodes)…`
  );

  const bible: StoryBible = {
    series_title: storylineBible.series_title,
    logline: storylineBible.storyline_bible.slice(0, 300),
    episodes: storylineBible.episodes.map(episodeToStoryBibleEpisode),
  };

  for (const episode of bible.episodes) {
    const source = storylineBible.episodes.find(
      (e) => e.episode_number === episode.episode_number
    );

    const panelBreakdown = {
      type: "story_bible",
      episode_number: episode.episode_number,
      time_period: episode.time_period,
      logline: episode.logline,
      narrative_arc: source?.narrative_arc,
      ugc_hook: source?.ugc_hook,
      target_panel_count: episode.target_panel_count,
      panel_count: episode.target_panel_count,
      chapters: episode.chapters.map((ch) => ({
        chapter_number: ch.chapter_number,
        title: ch.title,
        description: ch.description,
        panel_count: ch.panel_count,
      })),
      panels: [],
    };

    await upsertEpisodeStructure({
      seriesId,
      episodeNumber: episode.episode_number,
      title: episode.title,
      panelBreakdown,
    });

    console.log(
      `[storyArchitect] Ep ${episode.episode_number}: "${episode.title}" — ${episode.chapters.length} chapters, ${episode.target_panel_count} panels`
    );
  }

  return bible;
}
