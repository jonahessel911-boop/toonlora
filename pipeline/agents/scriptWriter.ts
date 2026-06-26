import { callAnthropicJson } from "../lib/anthropic.js";
import { parseJsonFromModel } from "../lib/json.js";
import { CAPTION_WRITING_RULES } from "../../src/lib/prompts/caption-writing-rules.js";
import {
  listEpisodes,
  upsertEpisodeStructure,
  upsertPanelRow,
} from "../lib/supabase.js";
import type {
  EpisodeRow,
  PanelScript,
  PanelType,
  StoryBibleChapter,
  StoryBibleEpisode,
  TextPlacement,
} from "../lib/types.js";
import { loadResearch } from "./researcher.js";

const CAMERA_ANGLES = [
  "wide",
  "close-up",
  "close up",
  "medium",
  "over-the-shoulder",
  "over the shoulder",
  "low angle",
  "high angle",
  "bird",
  "dutch",
  "aerial",
  "establishing",
  "profile",
  "pov",
  "point of view",
  "two-shot",
  "extreme close",
];

const SCRIPT_SYSTEM = `You are the Toonlora script writer. You write COMPLETE panel scripts for ONE chapter.

Toonlora format:
- Each panel = one full screen (1 image with caption/dialogue text baked into the image)
- Write EXACTLY the number of panels requested for this chapter

Return ONLY valid JSON:
{
  "chapter_number": number,
  "panels": [{
    "panel_number": number,
    "chapter_number": number,
    "chapter_title": string,
    "panel_type": "scene" | "title_card" | "stat_card" | "dialogue" | "transition",
    "visual_description": string,
    "character_details": string,
    "background_props": string,
    "caption_text": string,
    "dialogue_text": string | null,
    "text_placement": "top" | "bottom" | "split",
    "mood": string,
    "era_details": string
  }]
}

RULES:
- visual_description: exact scene — location, time, lighting, characters, action, camera angle (vary angles — never repeat the previous panel's angle)
- character_details: age, clothing, hair, expression, body language — extremely specific
- background_props: newspapers, screens, documents, charts with READABLE specific content
- caption_text: max 20 words, max 3 short lines, MUST include at least one specific fact, number, name, or date — dialogue goes in dialogue_text only, never in caption
- dialogue_text: exact spoken words for dialogue panels, null otherwise; max 10 words per bubble
${CAPTION_WRITING_RULES}
- mood: one word — tense / triumphant / dark / chaotic / hopeful / ominous
- era_details: year, world context, period clothing, tech visible
- stat_card: one shocking number full screen, minimal caption
- transition: wide establishing shot, new location or time jump
- Final panel of EVERY chapter (except the series finale): cliffhanger or revelation that raises stakes
- Final panel of a NON-FINAL episode: MUST be an UNRESOLVED cliffhanger — never a conclusion, finale, or "years later" wrap-up
- Final panel of the LAST episode in the series: may resolve the arc with revelation or emotional payoff
- If this is episode panel 1 / chapter 1 panel 1: panel_type MUST be title_card (series title + episode title + hook sentence in caption)`;

interface ChapterScriptResult {
  chapter_number: number;
  panels: PanelScript[];
}

function getStoryBibleEpisode(episode: EpisodeRow): StoryBibleEpisode & {
  narrative_arc?: string;
  ugc_hook?: string;
} {
  const breakdown = episode.panel_breakdown as {
    type?: string;
    time_period?: string;
    logline?: string;
    narrative_arc?: string;
    ugc_hook?: string;
    target_panel_count?: number;
    chapters?: StoryBibleChapter[];
  };

  if (breakdown.type !== "story_bible" || !breakdown.chapters?.length) {
    throw new Error(
      `Episode ${episode.episode_number} has no story bible — run story architect first`
    );
  }

  return {
    episode_number: episode.episode_number,
    title: episode.title,
    time_period: breakdown.time_period ?? "",
    logline: breakdown.logline ?? "",
    target_panel_count: breakdown.target_panel_count ?? 0,
    chapters: breakdown.chapters,
    narrative_arc: breakdown.narrative_arc,
    ugc_hook: breakdown.ugc_hook,
  };
}

function detectCameraAngle(text: string): string | null {
  const lower = text.toLowerCase();
  for (const angle of CAMERA_ANGLES) {
    if (lower.includes(angle)) return angle;
  }
  return null;
}

function normalizePanel(
  raw: Partial<PanelScript>,
  fallbackChapterTitle: string
): PanelScript {
  const panelType = (raw.panel_type ?? "scene") as PanelType;
  const placement = (raw.text_placement ?? "bottom") as TextPlacement;

  return {
    panel_number: raw.panel_number ?? 0,
    chapter_number: raw.chapter_number ?? 0,
    chapter_title: raw.chapter_title ?? fallbackChapterTitle,
    panel_type: panelType,
    visual_description: raw.visual_description?.trim() ?? "",
    character_details: raw.character_details?.trim() ?? "",
    background_props: raw.background_props?.trim() ?? "",
    caption_text: raw.caption_text?.trim() ?? "",
    dialogue_text: raw.dialogue_text?.trim() || null,
    text_placement: placement,
    mood: raw.mood?.trim() ?? "tense",
    era_details: raw.era_details?.trim() ?? "",
  };
}

function validateChapterPanels(
  panels: PanelScript[],
  chapter: StoryBibleChapter,
  episode: StoryBibleEpisode,
  seriesTitle: string,
  startingPanelNumber: number
): void {
  if (panels.length !== chapter.panel_count) {
    throw new Error(
      `Chapter ${chapter.chapter_number}: expected ${chapter.panel_count} panels, got ${panels.length}`
    );
  }

  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i];
    const expectedNumber = startingPanelNumber + i;
    if (panel.panel_number !== expectedNumber) {
      throw new Error(
        `Chapter ${chapter.chapter_number} panel ${i + 1}: expected panel_number ${expectedNumber}, got ${panel.panel_number}`
      );
    }
    if (!panel.visual_description) {
      throw new Error(`Panel ${panel.panel_number}: missing visual_description`);
    }
    if (!panel.caption_text && panel.panel_type !== "title_card") {
      throw new Error(`Panel ${panel.panel_number}: missing caption_text`);
    }

    if (panel.panel_number === 1 && episode.episode_number === 1) {
      if (panel.panel_type !== "title_card") {
        panel.panel_type = "title_card";
      }
      if (!panel.caption_text.toLowerCase().includes(seriesTitle.toLowerCase().slice(0, 8))) {
        panel.caption_text = `${seriesTitle} — ${episode.title}. ${panel.caption_text}`.slice(
          0,
          200
        );
      }
    }

    if (i > 0) {
      const prevAngle = detectCameraAngle(panels[i - 1].visual_description);
      const currAngle = detectCameraAngle(panel.visual_description);
      if (prevAngle && currAngle && prevAngle === currAngle) {
        panel.visual_description += ", alternate camera angle";
      }
    }
  }
}

async function writeChapterScript(params: {
  researchJson: string;
  seriesTitle: string;
  episode: StoryBibleEpisode;
  chapter: StoryBibleChapter;
  startingPanelNumber: number;
  previousChapterSummary: string | null;
  narrativeArc?: string;
  ugcHook?: string;
  totalEpisodes: number;
  nextEpisodeTitle?: string;
  isLastChapter: boolean;
}): Promise<PanelScript[]> {
  const { episode, chapter, startingPanelNumber, isLastChapter } = params;
  const isEpisodeOnePanelOne =
    episode.episode_number === 1 && chapter.chapter_number === 1 && startingPanelNumber === 1;
  const needsEpisodeCliffhanger =
    isLastChapter && episode.episode_number < params.totalEpisodes;

  const raw = await callAnthropicJson({
    system: SCRIPT_SYSTEM,
    user: `Series: "${params.seriesTitle}"
Episode ${episode.episode_number} of ${params.totalEpisodes}: "${episode.title}"
Time period: ${episode.time_period}
Episode logline: ${episode.logline}
${params.narrativeArc ? `Narrative arc: ${params.narrativeArc}` : ""}
${params.ugcHook ? `UGC hook: ${params.ugcHook}` : ""}

Chapter ${chapter.chapter_number}: "${chapter.title}"
Chapter description: ${chapter.description}
Panels to write: EXACTLY ${chapter.panel_count}
Global panel numbers: ${startingPanelNumber}–${startingPanelNumber + chapter.panel_count - 1}
${isEpisodeOnePanelOne ? "REQUIRED: panel_number 1 is TITLE CARD (series title + episode title + hook)." : ""}
${params.previousChapterSummary ? `Previous chapter ended with: ${params.previousChapterSummary}` : ""}
${
  needsEpisodeCliffhanger
    ? `CRITICAL — EPISODE CLIFFHANGER (mandatory):
This is the FINAL chapter of episode ${episode.episode_number}. Episode ${episode.episode_number + 1}${params.nextEpisodeTitle ? ` ("${params.nextEpisodeTitle}")` : ""} comes next.
The LAST panel MUST end on an UNRESOLVED cliffhanger — a crisis, betrayal, discovery, or decision mid-flight.
Do NOT conclude the story, show the finale, jump to "years later", anniversary celebrations, retirement, death, or moral wrap-up.
Leave readers desperate to tap "next episode".`
    : ""
}

Research:\n${params.researchJson}

Write all ${chapter.panel_count} panels for this chapter.`,
    maxTokens: 8000,
  });

  const result = parseJsonFromModel<ChapterScriptResult>(raw);
  const panels = (result.panels ?? []).map((p) =>
    normalizePanel(p, chapter.title)
  );

  validateChapterPanels(
    panels,
    chapter,
    episode,
    params.seriesTitle,
    startingPanelNumber
  );

  return panels;
}

async function savePanelScript(
  episodeId: string,
  panel: PanelScript
): Promise<void> {
  await upsertPanelRow({
    episode_id: episodeId,
    panel_number: panel.panel_number,
    chapter_number: panel.chapter_number,
    chapter_title: panel.chapter_title,
    panel_type: panel.panel_type,
    visual_description: panel.visual_description,
    character_details: panel.character_details,
    background_props: panel.background_props,
    caption: panel.caption_text || null,
    dialogue: panel.dialogue_text,
    text_placement: panel.text_placement,
    mood: panel.mood,
    era_details: panel.era_details,
    script_json: panel,
    image_prompt: null,
    image_url: null,
    status: "scripted",
  });
}

async function writeEpisodeScript(
  seriesId: string,
  episodeRow: EpisodeRow,
  researchJson: string,
  seriesTitle: string,
  totalEpisodes: number,
  allEpisodeRows: EpisodeRow[]
): Promise<PanelScript[]> {
  const episode = getStoryBibleEpisode(episodeRow);
  const allPanels: PanelScript[] = [];
  let panelOffset = 1;
  let previousSummary: string | null = null;
  const nextEpisode = allEpisodeRows.find(
    (row) => row.episode_number === episode.episode_number + 1
  );

  for (const chapter of episode.chapters) {
    const isLastChapter =
      chapter.chapter_number === episode.chapters[episode.chapters.length - 1].chapter_number;

    console.log(
      `[scriptWriter] Ep ${episode.episode_number} ch ${chapter.chapter_number}: "${chapter.title}" (${chapter.panel_count} panels)…`
    );

    const chapterPanels = await writeChapterScript({
      researchJson,
      seriesTitle,
      episode,
      chapter,
      startingPanelNumber: panelOffset,
      previousChapterSummary: previousSummary,
      narrativeArc: episode.narrative_arc,
      ugcHook: episode.ugc_hook,
      totalEpisodes,
      nextEpisodeTitle: nextEpisode?.title,
      isLastChapter,
    });

    for (const panel of chapterPanels) {
      await savePanelScript(episodeRow.id, panel);
    }

    allPanels.push(...chapterPanels);
    panelOffset += chapter.panel_count;
    previousSummary =
      chapterPanels[chapterPanels.length - 1]?.caption_text ??
      chapterPanels[chapterPanels.length - 1]?.visual_description ??
      null;
  }

  const panelBreakdown = {
    type: "full_script",
    episode_number: episode.episode_number,
    time_period: episode.time_period,
    logline: episode.logline,
    panel_count: allPanels.length,
    chapters: episode.chapters,
    panels: allPanels,
  };

  await upsertEpisodeStructure({
    seriesId,
    episodeNumber: episode.episode_number,
    title: episodeRow.title,
    panelBreakdown,
  });

  return allPanels;
}

export async function runScriptWriter(
  seriesId: string,
  options: { episodeNumbers?: number[] } = {}
): Promise<void> {
  const research = await loadResearch(seriesId);
  const episodes = await listEpisodes(seriesId);
  const researchStr = JSON.stringify(research, null, 2);
  const seriesTitle = research.topic;

  const targets = options.episodeNumbers?.length
    ? episodes.filter((ep) => options.episodeNumbers!.includes(ep.episode_number))
    : episodes;

  if (targets.length === 0) {
    throw new Error("No episodes found — run story architect first");
  }

  for (const episode of targets) {
    console.log(
      `[scriptWriter] Episode ${episode.episode_number}: "${episode.title}"…`
    );

    const panels = await writeEpisodeScript(
      seriesId,
      episode,
      researchStr,
      seriesTitle,
      episodes.length,
      episodes
    );

    console.log(
      `[scriptWriter] Saved ${panels.length} fully specified panels for episode ${episode.episode_number}`
    );
  }
}

export async function runScriptWriterForEpisode(
  seriesId: string,
  episodeNumber: number
): Promise<void> {
  await runScriptWriter(seriesId, { episodeNumbers: [episodeNumber] });
}
