import { callAnthropicJson } from "../lib/anthropic.js";
import { delay, parseJsonFromModel } from "../lib/json.js";
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
  "large box, 80% width centered, 50-62% height band, bottom edge at 58-62% max, 38%+ empty margin below box — never bottom edge, never below 62%";

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

const PROMPT_PARSE_RETRIES = 3;
const PROMPT_RETRY_DELAY_MS = 1500;

function panelNeedsPrompt(panel: PanelRow): boolean {
  return !panel.image_prompt?.trim();
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

function buildChapterSequenceDirectivesForPanel(
  panel: PanelRow,
  indexInChapter: number
): {
  panel_number: number;
  camera_angle: string;
  caption_position: string;
  emotional_beat: string;
} {
  const beats = [
    "hook — grab attention",
    "rising tension",
    "complication or reveal",
    "emotional peak",
    "cliffhanger or turn",
    "aftermath or setup",
  ];

  return {
    panel_number: panel.panel_number,
    camera_angle: CAMERA_ROTATION[indexInChapter % CAMERA_ROTATION.length],
    caption_position: CAPTION_BOX_POSITION,
    emotional_beat: beats[Math.min(indexInChapter, beats.length - 1)],
  };
}

function episodeCharacterAnchor(panels: PanelRow[]): string | null {
  for (const panel of panels) {
    if (panel.character_details?.trim()) return panel.character_details.trim();
  }
  return null;
}

async function parsePromptsFromModel(
  raw: string,
  expectedPanelNumbers: number[]
): Promise<PromptResult[]> {
  const extracted = extractPromptsFromRaw(raw, expectedPanelNumbers);
  if (extracted.length === expectedPanelNumbers.length) {
    return validatePromptResults(extracted, expectedPanelNumbers);
  }

  try {
    const result = parseJsonFromModel<EpisodePromptsResult>(raw);
    const prompts = result.prompts ?? [];
    if (prompts.length > 0) {
      return validatePromptResults(prompts, expectedPanelNumbers);
    }
  } catch {
    /* fall through */
  }

  if (extracted.length > 0) {
    return validatePromptResults(extracted, expectedPanelNumbers);
  }

  throw new Error(
    `Could not parse image prompts for panels: ${expectedPanelNumbers.join(", ")}`
  );
}

function validatePromptResults(
  prompts: PromptResult[],
  expectedPanelNumbers: number[]
): PromptResult[] {
  for (const panelNumber of expectedPanelNumbers) {
    const match = prompts.find((item) => item.panel_number === panelNumber);
    if (!match?.image_prompt?.trim()) {
      throw new Error(`Missing prompt for panel ${panelNumber}`);
    }
  }
  return prompts.filter((item) =>
    expectedPanelNumbers.includes(item.panel_number)
  );
}

function readJsonStringValue(raw: string, start: number): string | null {
  let value = "";

  for (let i = start; i < raw.length; i++) {
    const char = raw[i];

    if (char === "\\" && i + 1 < raw.length) {
      const next = raw[i + 1]!;
      if (next === "n") value += "\n";
      else if (next === "r") value += "\r";
      else if (next === "t") value += "\t";
      else if (next === '"') value += '"';
      else if (next === "\\") value += "\\";
      else value += next;
      i += 1;
      continue;
    }

    if (char === '"') {
      const rest = raw.slice(i + 1).trimStart();
      if (
        rest.startsWith(",") ||
        rest.startsWith("}") ||
        rest.startsWith("]") ||
        rest.length === 0
      ) {
        return value.trim() || null;
      }
      value += '"';
      continue;
    }

    value += char;
  }

  return value.trim() || null;
}

function extractAllImagePrompts(
  raw: string
): Array<{ panelNumber: number | null; prompt: string }> {
  const results: Array<{ panelNumber: number | null; prompt: string }> = [];
  const marker = /"image_prompt"\s*:\s*"/gi;
  let match: RegExpExecArray | null;

  while ((match = marker.exec(raw)) !== null) {
    const prompt = readJsonStringValue(raw, match.index + match[0].length);
    if (!prompt) continue;

    const windowStart = Math.max(0, match.index - 400);
    const windowEnd = Math.min(
      raw.length,
      match.index + match[0].length + prompt.length + 400
    );
    const window = raw.slice(windowStart, windowEnd);
    const panelMatch = window.match(/"panel_number"\s*:\s*(\d+)/);
    results.push({
      panelNumber: panelMatch ? Number(panelMatch[1]) : null,
      prompt,
    });
  }

  return results;
}

function extractImagePromptForPanel(
  raw: string,
  panelNumber: number
): string | null {
  const forwardMarker = new RegExp(
    `"panel_number"\\s*:\\s*${panelNumber}\\b[\\s\\S]*?"image_prompt"\\s*:\\s*"`,
    "i"
  );
  const forwardMatch = raw.match(forwardMarker);
  if (forwardMatch && forwardMatch.index != null) {
    const prompt = readJsonStringValue(
      raw,
      forwardMatch.index + forwardMatch[0].length
    );
    if (prompt) return prompt;
  }

  const panelMarker = new RegExp(`"panel_number"\\s*:\\s*${panelNumber}\\b`);
  const panelMatch = raw.match(panelMarker);
  if (panelMatch && panelMatch.index != null) {
    const before = raw.slice(0, panelMatch.index);
    const reverseMarker = /"image_prompt"\s*:\s*"/gi;
    let last: RegExpExecArray | null = null;
    let reverse: RegExpExecArray | null;
    while ((reverse = reverseMarker.exec(before)) !== null) {
      last = reverse;
    }
    if (last) {
      const prompt = readJsonStringValue(raw, last.index + last[0].length);
      if (prompt) return prompt;
    }
  }

  const fromScan = extractAllImagePrompts(raw).find(
    (item) => item.panelNumber === panelNumber
  );
  return fromScan?.prompt ?? null;
}

function extractPromptsFromRaw(
  raw: string,
  expectedPanelNumbers: number[]
): PromptResult[] {
  const results: PromptResult[] = [];

  for (const panelNumber of expectedPanelNumbers) {
    const prompt = extractImagePromptForPanel(raw, panelNumber);
    if (prompt) {
      results.push({ panel_number: panelNumber, image_prompt: prompt });
    }
  }

  if (
    results.length === 0 &&
    expectedPanelNumbers.length === 1 &&
    extractAllImagePrompts(raw).length === 1
  ) {
    const only = extractAllImagePrompts(raw)[0]!;
    return [
      {
        panel_number: expectedPanelNumbers[0]!,
        image_prompt: only.prompt,
      },
    ];
  }

  return results;
}

async function callAnthropicForPrompts(
  user: string,
  maxTokens: number
): Promise<string> {
  return callAnthropicJson({
    system: PROMPT_SYSTEM,
    user,
    maxTokens,
  });
}

async function generatePanelPrompt(params: {
  seriesTitle: string;
  category: string | null;
  episodeNumber: number;
  chapterNumber: number;
  chapterTitle: string | null | undefined;
  panel: PanelRow;
  chapterPanels: PanelRow[];
  allEpisodePanels: PanelRow[];
  researchFacts: string;
}): Promise<PromptResult> {
  const indexInChapter = params.chapterPanels.findIndex(
    (row) => row.panel_number === params.panel.panel_number
  );
  const directive = buildChapterSequenceDirectivesForPanel(
    params.panel,
    Math.max(0, indexInChapter)
  );
  const scriptPanel = panelToScriptPayload(params.panel);
  const characterAnchor = episodeCharacterAnchor(params.allEpisodePanels);

  const user = `Series: "${params.seriesTitle}"
Category: ${params.category ?? "business"}
Episode ${params.episodeNumber}, Chapter ${params.chapterNumber}${params.chapterTitle ? `: "${params.chapterTitle}"` : ""}

Generate 1 complete image prompt (300–500 words) following the master template exactly.

Episode character anchor (keep IDENTICAL in CHARACTER DESCRIPTION across all panels in this episode):
${characterAnchor ?? "Derive from panel character_details and research."}

Per-panel assignment (MUST follow):
${JSON.stringify(directive, null, 2)}

Panel script from database:
${JSON.stringify(scriptPanel, null, 2)}

Research facts:
${params.researchFacts}

Write OPENING, STYLE (verbatim), FORMAT (verbatim), CHARACTER DESCRIPTION, SCENE (include composition safe zone — subject in top 50% only), TEXT (verbatim CAPTION BOX RULES + caption + dialogue), and IMPORTANT RULES (verbatim closing block).
Send-ready for gpt-image-1. Portrait 1024x1536. Caption box: large, 80% width, 32px padding, never full-width.

Return ONLY valid JSON. The image_prompt string MUST use \\" for any double quotes inside the text and \\n for line breaks — no raw unescaped quotes or newlines inside JSON strings.

{
  "episode_number": ${params.episodeNumber},
  "prompts": [{ "panel_number": ${params.panel.panel_number}, "image_prompt": "..." }]
}`;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= PROMPT_PARSE_RETRIES; attempt++) {
    try {
      const raw = await callAnthropicForPrompts(user, 6000);
      const prompts = await parsePromptsFromModel(raw, [params.panel.panel_number]);
      const match = prompts.find((item) => item.panel_number === params.panel.panel_number);
      if (!match?.image_prompt?.trim()) {
        throw new Error(`Empty image_prompt for panel ${params.panel.panel_number}`);
      }
      return match;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < PROMPT_PARSE_RETRIES) {
        console.warn(
          `[promptGenerator]    Panel ${params.panel.panel_number} JSON parse failed (attempt ${attempt}/${PROMPT_PARSE_RETRIES}), retrying…`
        );
        await delay(PROMPT_RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError ?? new Error(`Failed to generate prompt for panel ${params.panel.panel_number}`);
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
  const pendingPanels = params.panels.filter(panelNeedsPrompt);
  if (pendingPanels.length === 0) {
    return [];
  }

  const results: PromptResult[] = [];

  for (let index = 0; index < pendingPanels.length; index++) {
    const panel = pendingPanels[index];
    console.log(
      `[promptGenerator]    Panel ${panel.panel_number} (${index + 1}/${pendingPanels.length})…`
    );
    const prompt = await generatePanelPrompt({
      ...params,
      panel,
      chapterPanels: params.panels,
    });
    results.push(prompt);
  }

  return results;
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
      const pendingInChapter = chapterPanels.filter(panelNeedsPrompt);
      if (pendingInChapter.length === 0) {
        console.log(
          `[promptGenerator]  Ch ${chapterNumber}: ${chapterPanels.length} panels — already have prompts, skipping`
        );
        saved += chapterPanels.length;
        continue;
      }

      console.log(
        `[promptGenerator]  Ch ${chapterNumber}: ${pendingInChapter.length}/${chapterPanels.length} panels need prompts…`
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

    const panelsAfter = await listPanelsForEpisode(episode.id);
    const missingPrompts = panelsAfter.filter(panelNeedsPrompt).length;
    if (missingPrompts > 0) {
      throw new Error(
        `Episode ${episode.episode_number} still missing ${missingPrompts} image prompts`
      );
    }

    console.log(
      `[promptGenerator] Saved ${saved} prompts for episode ${episode.episode_number}`
    );
  }
}
