import { callAnthropicJson } from "../lib/anthropic.js";
import { parseJsonFromModel } from "../lib/json.js";
import { CAPTION_BOX_RULES, SCENE_COMPOSITION_SAFE_ZONE } from "../../src/lib/prompts/caption-box-rules.js";
import {
  listEpisodes,
  listPanelsForEpisode,
  updatePanel,
} from "../lib/supabase.js";
import { getSeries } from "../lib/supabase.js";
import type { PanelRow } from "../lib/types.js";
import { loadResearch } from "./researcher.js";

const CAMERA_ROTATION = [
  "close-up for raw emotion",
  "medium shot for action under environmental pressure",
  "wide shot for scale and power",
  "extreme wide for isolation",
  "over-the-shoulder for tension",
  "low angle power shot",
] as const;

const CAPTION_BOX_POSITION =
  "large box, 80% width centered, 68-82% height band, 32px inner padding, 80px+ bottom margin — never full width, never on subject";

const PROMPT_SYSTEM = `You are a senior comic art director for Toonlora, a premium documentary-style digital comic platform. Your job is to take a panel script and write a complete, detailed image generation prompt that produces a ready-to-publish cinematic comic panel.

Every prompt you write must follow this exact structure and quality bar:

---

OPENING — describe the story context in 2 sentences:
What story is this, what is the tone, what era/industry, what emotional register.

STYLE — include this verbatim every time:
"Ultra-realistic cinematic graphic novel style. Not cartoonish. Not anime. Not flat illustration. Realistic faces, realistic lighting, realistic clothing, realistic environments. Dark, gritty, high-end business thriller atmosphere. Detailed shadows, film lighting. Premium HBO / Netflix documentary drama feeling."

FORMAT — include this verbatim every time:
"Tall vertical portrait panel, mobile-first, single cinematic scene."

CHARACTER DESCRIPTION — derive from research and story context:
Describe the main character with extreme specificity: approximate age, hair style and color, face structure, clothing (exact colors, style, era-appropriate), emotional state, body language, what they are doing with their hands, where they are looking.
Keep this IDENTICAL across all panels in the same episode.

SCENE — describe exactly:
${SCENE_COMPOSITION_SAFE_ZONE}
- Location (specific: not just "office" but "late-night Tesla factory floor in Fremont California 2008, fluorescent overhead lights, half-assembled red roadster in background")
- Time of day and lighting: one dominant light source, mostly dark, high contrast
- Camera angle: choose one that fits the story beat
  (close-up for emotion / medium for action / wide for scale / extreme wide for isolation)
- Background props: specific branded elements, readable documents, era-appropriate technology, financial charts — describe what is readable on them
- Weather/atmosphere if exterior

TEXT — include the exact caption from the panel script. Include this block verbatim in every image prompt:

"${CAPTION_BOX_RULES}"

Then specify the panel caption: Text reads: '[EXACT CAPTION TEXT FROM SCRIPT]'

If dialogue exists, add the speech bubble per the CAPTION BOX RULES above: text reads: '[EXACT DIALOGUE]'

IMPORTANT RULES — include at end of every prompt:
"Every panel must feel cinematic and realistic. Avoid repeated poses from previous panels. Avoid flat cartoon styling. Avoid exaggerated facial expressions. Avoid fake-looking charts. Keep the panel premium, dark, serious, and emotionally intense. No watermarks. No borders around the full image. No logos except story-relevant branding."

---

When generating prompts, you receive:
- The series title and category
- Research facts about the real story
- The panel script: visual_description, character_details, background_props, caption_text, dialogue_text, mood, era_details, camera angle suggestion
- Per-panel assignments for camera angle and emotional beat within the chapter sequence

Use ALL of this to write one complete prompt per panel.
Each image_prompt must be 300–500 words — detailed enough that gpt-image-1 produces the panel with no retouching needed.

Write each image_prompt as a single flowing paragraph (or short labeled sections matching OPENING / STYLE / FORMAT / CHARACTER / SCENE / TEXT / IMPORTANT RULES) that can be sent directly to gpt-image-1 with zero post-processing.

Within a chapter: vary camera angle every panel. Caption box position and style are fixed per CAPTION BOX RULES. Progress emotion across the sequence. Never repeat poses.

Return ONLY valid JSON:
{
  "episode_number": number,
  "prompts": [{ "panel_number": number, "image_prompt": string }]
}`;

interface PromptResult {
  panel_number: number;
  image_prompt: string;
}

interface EpisodePromptsResult {
  episode_number: number;
  prompts: PromptResult[];
}

function groupPanelsByChapter(panels: PanelRow[]): Map<number, PanelRow[]> {
  const chapters = new Map<number, PanelRow[]>();
  for (const panel of panels) {
    const ch = panel.chapter_number ?? 1;
    const list = chapters.get(ch) ?? [];
    list.push(panel);
    chapters.set(ch, list);
  }
  for (const [, list] of chapters) {
    list.sort((a, b) => a.panel_number - b.panel_number);
  }
  return chapters;
}

function panelToScriptPayload(p: PanelRow) {
  const script = p.script_json as Record<string, unknown> | null;
  return {
    panel_number: p.panel_number,
    chapter_number: p.chapter_number,
    chapter_title: p.chapter_title,
    panel_type: p.panel_type,
    visual_description: p.visual_description,
    character_details: p.character_details,
    background_props: p.background_props,
    caption_text: p.caption,
    dialogue_text: p.dialogue,
    text_placement: p.text_placement,
    mood: p.mood,
    era_details: p.era_details,
    ...(script ? { script } : {}),
  };
}

function buildChapterSequenceDirectives(
  chapterPanels: PanelRow[]
): Array<{
  panel_number: number;
  camera_angle: string;
  caption_position: string;
  emotional_beat: string;
}> {
  const beats = [
    "hook — grab attention",
    "rising tension",
    "complication or reveal",
    "emotional peak",
    "cliffhanger or turn",
    "aftermath or setup",
  ];

  return chapterPanels.map((panel, index) => ({
    panel_number: panel.panel_number,
    camera_angle: CAMERA_ROTATION[index % CAMERA_ROTATION.length],
    caption_position: CAPTION_BOX_POSITION,
    emotional_beat: beats[Math.min(index, beats.length - 1)],
  }));
}

function episodeCharacterAnchor(panels: PanelRow[]): string | null {
  for (const panel of panels) {
    if (panel.character_details?.trim()) return panel.character_details.trim();
  }
  return null;
}

async function generateChapterPrompts(params: {
  seriesTitle: string;
  category: string | null;
  episodeNumber: number;
  chapterNumber: number;
  chapterTitle: string | null | undefined;
  panels: PanelRow[];
  allEpisodePanels: PanelRow[];
  researchFacts: string;
}): Promise<PromptResult[]> {
  const directives = buildChapterSequenceDirectives(params.panels);
  const scriptPanels = params.panels.map(panelToScriptPayload);
  const characterAnchor = episodeCharacterAnchor(params.allEpisodePanels);

  const raw = await callAnthropicJson({
    system: PROMPT_SYSTEM,
    user: `Series: "${params.seriesTitle}"
Category: ${params.category ?? "business"}
Episode ${params.episodeNumber}, Chapter ${params.chapterNumber}${params.chapterTitle ? `: "${params.chapterTitle}"` : ""}

Generate ${params.panels.length} complete image prompts (300–500 words each) following the master template exactly.

Episode character anchor (keep IDENTICAL in CHARACTER DESCRIPTION across all panels in this episode):
${characterAnchor ?? "Derive from panel character_details and research."}

Per-panel assignments for this chapter sequence (MUST follow):
${JSON.stringify(directives, null, 2)}

Panel scripts from database:
${JSON.stringify(scriptPanels, null, 2)}

Research facts:
${params.researchFacts}

For each panel write OPENING, STYLE (verbatim), FORMAT (verbatim), CHARACTER DESCRIPTION, SCENE (include composition safe zone — subject in top 62% only), TEXT (verbatim CAPTION BOX RULES + caption + dialogue), and IMPORTANT RULES (verbatim closing block).
Send-ready for gpt-image-1. Portrait 1024x1536. Caption box: large, 80% width, 32px padding, never full-width.`,
    maxTokens: Math.max(12000, params.panels.length * 2500),
  });

  const result = parseJsonFromModel<EpisodePromptsResult>(raw);
  return result.prompts ?? [];
}

export async function runPromptGenerator(
  seriesId: string,
  options: { episodeNumbers?: number[] } = {}
): Promise<void> {
  const research = await loadResearch(seriesId);
  const series = await getSeries(seriesId);
  const episodes = await listEpisodes(seriesId);
  const researchFacts = JSON.stringify(research.facts.slice(0, 20), null, 2);

  const targets = options.episodeNumbers?.length
    ? episodes.filter((ep) => options.episodeNumbers!.includes(ep.episode_number))
    : episodes;

  for (const episode of targets) {
    const panels = await listPanelsForEpisode(episode.id);
    if (panels.length === 0) {
      console.warn(
        `[promptGenerator] Skipping episode ${episode.episode_number} — no panels`
      );
      continue;
    }

    const chapters = groupPanelsByChapter(panels);
    let saved = 0;

    console.log(
      `[promptGenerator] Episode ${episode.episode_number}: ${panels.length} panels across ${chapters.size} chapters…`
    );

    for (const [chapterNumber, chapterPanels] of [...chapters.entries()].sort(
      (a, b) => a[0] - b[0]
    )) {
      console.log(
        `[promptGenerator]  Ch ${chapterNumber}: ${chapterPanels.length} panels…`
      );

      const prompts = await generateChapterPrompts({
        seriesTitle: series.title,
        category: series.category,
        episodeNumber: episode.episode_number,
        chapterNumber,
        chapterTitle: chapterPanels[0]?.chapter_title,
        panels: chapterPanels,
        allEpisodePanels: panels,
        researchFacts,
      });

      for (const item of prompts) {
        const panel = chapterPanels.find((p) => p.panel_number === item.panel_number);
        if (!panel) continue;
        await updatePanel(panel.id, {
          image_prompt: item.image_prompt,
          status: "prompt_ready",
        });
        saved += 1;
      }
    }

    console.log(
      `[promptGenerator] Saved ${saved} prompts for episode ${episode.episode_number}`
    );
  }
}
