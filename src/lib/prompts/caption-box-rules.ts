/** How to compose the illustration so the caption box has a clean home. */
export const SCENE_COMPOSITION_SAFE_ZONE = `SCENE COMPOSITION SAFE ZONE (mandatory — describe this in every SCENE section):
- TOP 0–58% of the portrait frame: main cinematic scene only (characters, vehicles, action, faces, key props).
- MIDDLE 58–82%: simpler, darker, low-detail background ONLY (shadow, floor, road, fog, gradient) — NO faces, NO vehicles, NO hero objects in this band.
- BOTTOM 82–100%: empty margin below the caption box (dark gradient or simple texture, nothing important).
- Frame the shot so the subject ends ABOVE the 55% line — never put the main subject where the caption box will sit.
- NEVER draw the caption box on top of faces, cars, or the focal point of the scene.`;

/** Verbatim block — included in prompt writing and appended at image generation time. */
export const CAPTION_BOX_RULES = `CAPTION BOX RULES (mandatory, non-negotiable):
- The caption box must be fully visible and never cropped or cut off
- Position: centered horizontally, vertically in the 58–72% height band (lower third — NOT mid-image, NOT on the subject, NOT flush to the bottom)
- Outer margins: minimum 102px from left and right edges (80% width on 1024px canvas), minimum 140px from the bottom edge of the frame
- Box size: LARGE and roomy — minimum width 820px, minimum height 180px (use 220px+ for 3–4 lines), generous internal padding minimum 32px on all four sides inside the border
- Width: exactly 80% of image width, centered horizontally — NEVER edge-to-edge, NEVER 100% width
- Background: cream/parchment #F5EDD8 rectangle, slightly transparent (85% opacity), aged paper texture
- Border: thin dark brown line, 2px
- Font: dark brown/black serif font, LARGE mobile-readable size (minimum 30pt equivalent), high contrast — never tiny text
- Text: never more than 4 lines; if the caption is long, make the box TALLER — never shrink font below readable size
- The box must be FULLY CONTAINED within the image frame with visible empty margin below it
- Never place the caption box flush to the bottom edge or side edges
- Always leave clear scene content in the top 50–58% above the caption box
- If dialogue is present, place it ABOVE the caption box (50–65% zone), as a separate white speech bubble near the speaking character — never inside the caption box

CRITICAL: Identical caption box style, size, margins, and position across ALL panels. Same cream color, same 80% width, same vertical band, same padding. Consistency is mandatory.`;

const LAYOUT_MARKER = "FINAL LAYOUT ENFORCEMENT v4";

/** Reinforcement appended right before gpt-image-1. */
export const CAPTION_BOX_LAYOUT_ENFORCEMENT = `${LAYOUT_MARKER} — OBEY BEFORE RENDERING:
1. Draw the illustration in the TOP 58% only. Bottom 42% = dark, simple filler reserved for the caption + safe margin.
2. Draw ONE large cream caption box: 80% frame width (NOT full width), centered, bottom edge at 68–74% of frame height — NEVER below 74%.
3. Box minimum size 820×180px with 32px internal padding — text must NOT touch the box border.
4. Leave at least 140px empty margin below the caption box before the image bottom edge (mobile readers need this).
5. Caption box must NOT overlap faces, cars, logos, or main action.
6. WRONG: caption box touching or near the bottom edge. WRONG: full-width text bar across the middle. WRONG: tiny cramped text. RIGHT: large centered box sitting clearly above the bottom with generous empty space underneath.`;

export function enforceCaptionBoxRules(prompt: string): string {
  let result = prompt.trim();

  if (!result.includes("CAPTION BOX RULES (mandatory")) {
    result = `${result}\n\n${CAPTION_BOX_RULES}`;
  }

  if (!result.includes("SCENE COMPOSITION SAFE ZONE")) {
    result = `${result}\n\n${SCENE_COMPOSITION_SAFE_ZONE}`;
  }

  if (result.includes(LAYOUT_MARKER)) {
    return result;
  }

  // Replace older enforcement blocks so regenerations pick up new rules.
  result = result.replace(
    /\n\n(?:LAYOUT ENFORCEMENT|FINAL LAYOUT ENFORCEMENT)[\s\S]*$/i,
    ""
  );

  return `${result}\n\n${CAPTION_BOX_LAYOUT_ENFORCEMENT}`;
}
