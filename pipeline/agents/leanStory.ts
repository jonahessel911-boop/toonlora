import { callAnthropicJson } from "../lib/anthropic.js";
import { parseJsonFromModel } from "../lib/json.js";
import { upsertEpisodeStructure, upsertPanelRow } from "../lib/supabase.js";
import { loadResearch } from "./researcher.js";

export const LEAN_PANEL_COUNT = 1;

interface LeanPanel {
  panel_number: number;
  beat: string;
  visual: string;
  caption: string;
  dialogue: string;
}

interface LeanStoryResult {
  episode_title: string;
  logline: string;
  panels: LeanPanel[];
}

const STORY_SYSTEM = `You are a graphic novel writer for Toonlora business comics.

Create exactly ${LEAN_PANEL_COUNT} panel for a preview episode:
- Panel 1: one powerful cinematic moment — hook, context, and emotional punch in a single frame

For the panel:
- beat: story beat in one sentence
- visual: what we see (lighting, composition, era, emotion)
- caption: max 20 words narration (empty string if none)
- dialogue: max 10 words, format Name: "line" or empty string

Return ONLY JSON:
{
  "episode_title": string,
  "logline": string,
  "panels": [{
    "panel_number": number,
    "beat": string,
    "visual": string,
    "caption": string,
    "dialogue": string
  }]
}`;

export async function runLeanStory(seriesId: string): Promise<void> {
  const research = await loadResearch(seriesId);
  console.log(`[leanStory] Writing ${LEAN_PANEL_COUNT} panels…`);

  const raw = await callAnthropicJson({
    system: STORY_SYSTEM,
    user: `Research:\n${JSON.stringify(
      {
        topic: research.topic,
        facts: research.facts.slice(0, 15),
        characters: research.characters,
        timeline: research.timeline.slice(0, 8),
        turning_points: research.turning_points,
        storyline: research.storyline,
        series_potential: research.series_potential
          ? {
              logline: research.storyline?.logline,
              opening_hook: research.storyline?.opening_hook,
              first_episode: research.series_potential.episode_outlines[0],
            }
          : undefined,
      },
      null,
      2
    )}\n\nWrite ${LEAN_PANEL_COUNT} preview panel for episode 1. Use the planned storyline and opening hook — make it the single most cinematic moment that sells the series.`,
    maxTokens: 3000,
  });

  const result = parseJsonFromModel<LeanStoryResult>(raw);
  const panels = (result.panels ?? []).slice(0, LEAN_PANEL_COUNT);

  if (panels.length < LEAN_PANEL_COUNT) {
    throw new Error(
      `Lean story returned ${panels.length} panels (expected ${LEAN_PANEL_COUNT})`
    );
  }

  const panelBreakdown = {
    episode_number: 1,
    panel_count: LEAN_PANEL_COUNT,
    chapters: [
      {
        chapter_number: 1,
        title: "Preview",
        summary: result.logline,
        panels: panels.map((p) => ({
          panel_number: p.panel_number,
          chapter_number: 1,
          beat: p.beat,
          visual_hint: p.visual,
        })),
      },
    ],
    panels: panels.map((p) => ({
      panel_number: p.panel_number,
      chapter_number: 1,
      beat: p.beat,
      visual: p.visual,
    })),
  };

  const episode = await upsertEpisodeStructure({
    seriesId,
    episodeNumber: 1,
    title: result.episode_title || "Episode 1",
    panelBreakdown,
  });

  for (const panel of panels) {
    await upsertPanelRow({
      episode_id: episode.id,
      panel_number: panel.panel_number,
      chapter_number: 1,
      visual_description: panel.visual,
      caption: panel.caption || null,
      dialogue: panel.dialogue || null,
      image_prompt: null,
      image_url: null,
      status: "scripted",
    });
  }

  console.log(`[leanStory] Saved episode 1 with ${panels.length} panels`);
}
