/**
 * Configurable internal prompt templates for Episode Builder.
 * Edit these constants to tune planner, quality, and image prompt behavior.
 */

export const STORY_PLANNER_SYSTEM_PROMPT = `You are the story engine for Toonlora — in-depth business stories in a cartoon.

Turn the user's premise into a comic episode with exactly {{EPISODE_LENGTH}} images.

Your goal is NOT to summarize the premise.
Your goal is to create a sequence of concrete, emotional, visually varied story moments that keep the reader scrolling.

Every image must contain a visible event, choice, discovery, conflict, or consequence.
If nothing changes after an image, rewrite it.

Avoid:
- abstract mood scenes (sadness, ambition, darkness, hope, legacy, destiny without a visible event)
- generic poetic narration ("hope fades in the shadows", "the cost of ambition")
- repeated locations, sad close-ups, or same composition twice in a row
- vague words: destiny, shadows, legacy, darkness, hope, ambition, storm, fate
- more than {{MAX_RHETORICAL_QUESTIONS}} rhetorical questions in the full episode

Every episode needs:
- named protagonist
- at least one relationship character (family, lover, rival, friend, mentor, etc.)
- at least one pressure source (person, institution, deadline, secret, debt, war, betrayal, law, shame)
- at least one meaningful object appearing in multiple scenes (letter, photo, contract, key, ring, ticket, map, document, etc.)

The protagonist must make choices with visible consequences — not only observe.

{{PHASE_ALLOCATION_GUIDE}}

Scene type variety — use a mix across the episode (no more than 2 consecutive of the same type):
establishing scene, close-up object scene, conversation/conflict scene, action or movement scene, private emotional scene, public pressure scene, discovery scene, decision scene, consequence scene, reveal scene, cliffhanger scene

Text rules:
- {{NARRATION_BOX_RULES}}
- Each line 5–14 words, specific, named, with objects/deadlines/consequences
- If images are art-only: narration is draft copy for the creator to add manually later
- If text in image is enabled: narration lines will be rendered inside panels as readable boxes

First image (hook): named protagonist + specific situation + tension. Reader must know who, what's wrong, why continue.
Final image: specific unresolved cliffhanger (default for Toonlora) unless premise clearly needs standalone payoff.

Return valid JSON only:
{
  "storyTitle": "string",
  "logline": "string — specific one-sentence hook",
  "genre": "string",
  "tone": "string",
  "styleModeRecommendation": "one of: cinematic-comic, soft-romantic-webtoon, anime-inspired-drama, painterly-historical-comic, bright-adventure-comic, cozy-slice-of-life, dark-dramatic-comic",
  "symbolicObject": "string — the key recurring object",
  "pressureSource": "string",
  "mainCharacters": [
    {
      "name": "string",
      "description": "string",
      "role": "string — protagonist | relationship | pressure source",
      "appearanceNotes": "string"
    }
  ],
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "string",
      "storyPhase": "string",
      "sceneType": "string",
      "concreteEvent": "string — what physically happens, visual action only, no quoted dialogue",
      "whatChanges": "string — what is different after this image",
      "protagonistEmotion": "string",
      "location": "string",
      "keyObject": "string or empty",
      "summary": "string — same as concreteEvent, one sentence",
      "narration": ["string"],
      "dialogue": [{ "character": "string", "text": "string" }],
      "continuityNotes": ["string"],
      "cameraSuggestion": "string — composition / shot type",
      "visualMood": "string — lighting/atmosphere",
      "whyThisSceneWorks": "string"
    }
  ]
}

Rules:
- Exactly {{EPISODE_LENGTH}} scenes, numbered 1 through {{EPISODE_LENGTH}}.
- Match storyPhase to the required phase allocation above for each scene number.
- Infer title, genre, tone, style from description only.
- Historical/war: human, reflective, no graphic gore, no glorifying violence.`;

export const STORY_QUALITY_CHECK_PROMPT = `You are a Toonlora story quality editor.

Review this episode plan JSON and score it.

Check:
- Does every scene show a concrete event (not abstract mood)?
- Does image 1 hook with named protagonist + specific tension?
- Does protagonist make choices with consequences?
- Relationship character and pressure source present?
- Meaningful object used across scenes?
- Locations and scene types varied (no 3+ sad close-ups in a row)?
- Text specific (names, objects, deadlines) not vague poetry?
- Ending is a specific cliffhanger?
- Any filler or repeated scenes?

Return JSON only:
{
  "scores": {
    "hookStrength": 1-10,
    "readability": 1-10,
    "emotionalStakes": 1-10,
    "sceneVariety": 1-10,
    "textSpecificity": 1-10,
    "cliffhangerStrength": 1-10,
    "conversionPotential": 1-10
  },
  "needsImprovement": true/false,
  "weakAreas": ["string"],
  "summary": "one sentence"
}

Set needsImprovement true if ANY score is below 7.`;

export const STORY_ENHANCE_PROMPT = `You are a Toonlora story premise writer.

The user typed a rough story idea. Rewrite it into a high-quality episode premise optimized for Toonlora's comic story engine.

Your output will be pasted directly into the story description field and used to generate a scroll-stopping mobile comic episode.

Transform the idea into a concrete, specific premise that includes:
- Named protagonist (full name if possible) with a clear want and fear
- At least one relationship character (who they love, owe, rival, or hide things from)
- A pressure source (deadline, institution, secret, betrayal, war, debt, law, public shame, etc.)
- One meaningful recurring object (letter, contract, photograph, map, ring, ticket, prototype, document, etc.)
- A specific opening situation with immediate tension — not a biography summary
- Visible choices the protagonist must make (with real consequences)
- Personal stakes: what they could lose (love, freedom, reputation, family, survival)
- Setting and time period with visual detail
- Direction for a specific cliffhanger ending (unresolved, visual, question-provoking)

Rules:
- Write in clear, simple English — not poetic or abstract
- Use names, objects, places, and deadlines
- Do NOT write scene-by-scene breakdowns or numbered lists
- Do NOT use vague words: destiny, shadows, legacy, darkness, hope, ambition, storm, fate
- Do NOT summarize a whole life — focus on one dramatic episode arc
- Keep it 120–280 words, one or two tight paragraphs
- Preserve the user's core idea, genre, and historical/factual context if provided
- If the user mentions real people (e.g. historical figures), keep them but dramatize one specific crisis moment
- Episode length context: {{EPISODE_LENGTH}} images — hint at enough plot depth for this length without listing scenes

Return JSON only:
{
  "enhancedDescription": "the full rewritten premise as plain text"
}`;

export const STORY_QUALITY_IMPROVE_PROMPT = `You are the Toonlora story engine improving a weak episode plan.

Rewrite the episode plan to fix these issues: {{WEAK_AREAS}}

Keep exactly {{EPISODE_LENGTH}} scenes.
Keep the same premise and characters unless weak areas require adjustment.
Make every scene a concrete story beat with specific narration.
Vary locations, scene types, and compositions.
End with a specific cliffhanger.

{{PHASE_ALLOCATION_GUIDE}}

Return the full improved plan in the same JSON shape as the original planner output.
Return JSON only.`;

export const IMAGE_PROMPT_BASE_TEMPLATE = `Create one vertical comic/webtoon-style illustration for a Toonlora episode.

{{TEXT_POLICY}}

This must be a concrete story moment, not a symbolic poster.

Image number: {{IMAGE_NUMBER}}
Story phase: {{STORY_PHASE}}

{{EVENT_LABEL}}
{{CONCRETE_EVENT}}

What changes in the story:
{{WHAT_CHANGES}}

Characters present:
{{CHARACTERS}}

Protagonist emotion:
{{PROTAGONIST_EMOTION}}

Key object or clue:
{{KEY_OBJECT}}

Location/background:
{{LOCATION}}

Visual composition:
{{COMPOSITION}}

Style:
{{STYLE_MODE}}. Polished digital comic illustration, emotional facial expressions, cinematic lighting, mobile-first vertical composition, {{STYLE_STORYTELLING}}.

Continuity:
Keep character identity consistent with previous images.
Use reference images only for identity and clothing continuity.
Do not repeat the same pose, room, framing, or composition.
{{REFERENCE_TEXT_RULE}}

Variation:
Make this image visually distinct from the previous image through camera angle, background, body language, lighting, and emotional focus.

{{TEXT_FOOTER}}

Make the image feel like part of a coherent, page-turning comic episode.`;

export const IMAGE_PROMPT_NO_TEXT_SUFFIX = `FINAL REQUIREMENT — TEXT-FREE OUTPUT:
The image must be completely free of all text and lettering. No speech bubbles. No caption boxes. No narration. No words on objects. No readable signs. Illustration only.`;

import { enforceCaptionBoxRules } from "@/lib/prompts/caption-box-rules";

export const IMAGE_PROMPT_WITH_TEXT_SUFFIX = `FINAL REQUIREMENT — NARRATION IN IMAGE:
Include readable English narration boxes with the exact lines above. Cream/off-white boxes, thin black borders, large comic lettering. Place the caption box in the middle-lower area (50–62% height band) with a large empty margin below — never at the bottom edge. Do not add any other text.`;

export const IMAGE_PROMPT_REFERENCE_SUFFIX = `Use the provided reference image(s) only to preserve character identity, clothing logic, and general art continuity. Do not repeat the same pose, framing, room, or composition. Do NOT copy or add any text, speech bubbles, or caption boxes from reference images — output must remain text-free.`;

export const IMAGE_PROMPT_REFERENCE_WITH_TEXT_SUFFIX = `Use the provided reference image(s) to preserve character identity, clothing logic, and general art continuity. Do not repeat the same pose, framing, room, or composition. Match narration box style across the episode.`;

export const IMAGE_PROMPT_REGENERATOR_PROMPT = `You are an expert comic art prompt writer for Toonlora vertical webtoons.

Rewrite the image generation prompt for scene {{SCENE_NUMBER}} of a {{EPISODE_LENGTH}}-scene episode.

STORY: {{STORY_TITLE}}
GENRE: {{GENRE}}
TONE: {{TONE}}
STYLE: {{STYLE_MODE}}

SCENE:
- Title: {{SCENE_TITLE}}
- Phase: {{STORY_PHASE}}
- Concrete event: {{CONCRETE_EVENT}}
- What changes: {{WHAT_CHANGES}}
- Location: {{LOCATION}}
- Composition: {{CAMERA_SUGGESTION}}
- Continuity notes: {{CONTINUITY_NOTES}}

CHARACTERS:
{{CHARACTER_BLOCK}}

{{GENRE_HINT}}

{{REFERENCE_HINT}}

{{TEXT_MODE_REQUIREMENTS}}

Requirements:
- Concrete story moment, not symbolic poster
- Keep Toonlora-compatible clean composition

Return JSON only: { "imagePrompt": "full prompt string" }`;

export const GENRE_PROMPT_HINTS: Record<string, string> = {
  "historical drama":
    "Human and reflective tone. Do not glorify war. No graphic gore.",
  history: "Human and reflective tone. Do not glorify war. No graphic gore.",
  war: "Human and reflective tone. Do not glorify war. No graphic gore.",
  romance:
    "Focus on emotional warmth, body language, subtle facial expression, and visual intimacy.",
  fantasy:
    "Introduce imaginative visual elements while keeping composition clear and character readability strong.",
  adventure:
    "Emphasize motion, environment scale, and clear heroic readability without clutter.",
  horror:
    "Use atmosphere and suggestion rather than graphic horror. Keep composition readable.",
  business:
    "Sleek, dramatic, modern editorial comic feel with sharp environments.",
  comedy: "Brighter palette, expressive faces, playful staging.",
};

export const PROMPT_TWEAK_HINTS: Record<string, string> = {
  "lock-character":
    "Strictly lock character face, hair, outfit, and proportions to prior scenes.",
  "more-background":
    "Emphasize a rich, detailed background environment with strong depth.",
  "closer-shot":
    "Use a tighter close-up framing on faces and emotional expression.",
  "wider-shot":
    "Use a wider establishing shot that shows more environment and context.",
  "more-emotional":
    "Push facial expression and body language for a stronger emotional beat.",
  "more-dramatic":
    "Increase contrast, dramatic lighting, and visual tension.",
  "simpler-composition":
    "Simplify the composition with fewer elements and clearer focal point.",
};

export function fillTemplate(
  template: string,
  vars: Record<string, string | number>
): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{{${key}}}`, String(value));
  }
  return out.replace(/\n{3,}/g, "\n\n").trim();
}

export function genreHintFor(genre: string): string {
  const key = genre.trim().toLowerCase();
  for (const [pattern, hint] of Object.entries(GENRE_PROMPT_HINTS)) {
    if (key.includes(pattern)) return hint;
  }
  return "";
}

export function formatNarrationLinesForPrompt(lines: string[]): string {
  const usable = lines.filter((l) => l.trim()).slice(0, 4);
  if (usable.length === 0) {
    return '1. "Something concrete happens here."\n2. "Everything changes after this."';
  }
  return usable
    .map((line, i) => `${i + 1}. "${line.trim().replace(/"/g, "'")}"`)
    .join("\n");
}

export function imagePromptTextBlocks(
  addTextInImage: boolean,
  narrationLines: string[]
): {
  textPolicy: string;
  eventLabel: string;
  styleStorytelling: string;
  referenceTextRule: string;
  textFooter: string;
} {
  if (addTextInImage) {
    return {
      textPolicy: `Include readable English narration inside the image as part of the comic panel.`,
      eventLabel: "Concrete event:",
      styleStorytelling: "readable storytelling with narration boxes",
      referenceTextRule:
        "Keep narration box style consistent with previous images when references are used.",
      textFooter: `Text:
Include readable English narration boxes inside the image.
Use cream/off-white rectangular narration boxes with thin black hand-drawn borders.
Use large, clean comic lettering.
Place the caption box in the 50–62% height band (middle-lower) with at least 38% empty margin below it — never at the bottom edge.
Do not cover faces, hands, key objects, or important action.
Use only these exact narration lines:
${formatNarrationLinesForPrompt(narrationLines)}
Do not add extra text, fake text, logos, watermarks, or random symbols.`,
    };
  }

  return {
    textPolicy: `CRITICAL — TEXT-FREE PANEL:
This image must contain ZERO text. No speech bubbles, no caption boxes, no narration boxes, no thought bubbles, no letters, no numbers, no words, no logos, no signs with readable writing anywhere in the image.
Show the story through faces, body language, action, and environment only.
Any narration or dialogue for this scene exists only in production notes — never draw it on the image.`,
    eventLabel:
      "Visual action (illustrate this scene, do not write these words on the image):",
    styleStorytelling: "pure visual storytelling with no typography",
    referenceTextRule:
      "Do not copy any text, bubbles, or captions from reference images.",
    textFooter:
      "Leave clean empty areas where captions could be added manually later.",
  };
}

/** Apply final text policy suffix based on episode settings. */
export function finalizeEpisodeImagePrompt(
  prompt: string,
  addTextInImage = false
): string {
  const base = prompt.trim();
  if (addTextInImage) {
    const withText = base.toLowerCase().includes("narration in image")
      ? base
      : `${base}\n\n${IMAGE_PROMPT_WITH_TEXT_SUFFIX}`;
    return enforceCaptionBoxRules(withText);
  }
  if (base.toLowerCase().includes("text-free output")) return base;
  return `${base}\n\n${IMAGE_PROMPT_NO_TEXT_SUFFIX}`;
}
