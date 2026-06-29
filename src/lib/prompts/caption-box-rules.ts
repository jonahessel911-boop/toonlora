/** How to compose the illustration so the caption box has a clean home. */
export const SCENE_COMPOSITION_SAFE_ZONE = `SCENE COMPOSITION SAFE ZONE (mandatory — describe this in every SCENE section):
- TOP 0–50% of the portrait frame: main cinematic scene only (characters, vehicles, action, faces, key props).
- MIDDLE 50–62%: caption box zone ONLY — cream narration box sits here, centered.
- BOTTOM 62–100%: large empty safe margin (dark gradient, floor shadow, or simple texture) — NO text, NO faces, NO important objects.
- Frame the shot so the subject ends ABOVE the 48% line — never put the main subject where the caption box will sit.
- NEVER draw the caption box on top of faces, cars, logos, or the focal point of the scene.`;

/** Verbatim block — included in prompt writing and appended at image generation time. */
export const CAPTION_BOX_RULES = `CAPTION BOX RULES (CAPTION_RULES_v5, mandatory, non-negotiable):
- The caption box must be fully visible and never cropped or cut off by the image edge
- Position: centered horizontally, vertically in the 50–62% height band (middle-lower area — NOT the bottom edge, NOT on the subject)
- The BOTTOM edge of the caption box must sit at 58–62% of frame height at most — NEVER below 62%, NEVER in the bottom third of the image
- Outer margins: minimum 102px from left and right edges (80% width on 1024px canvas), minimum 38% of total frame height from the bottom edge of the frame to the bottom edge of the caption box
- Box size: LARGE and roomy — minimum width 820px, minimum height 180px (use 220px+ for 3–4 lines), generous internal padding minimum 32px on all four sides inside the border
- Width: exactly 80% of image width, centered horizontally — NEVER edge-to-edge, NEVER 100% width
- Background: cream/parchment #F5EDD8 rectangle, slightly transparent (85% opacity), aged paper texture
- Border: thin dark brown line, 2px
- Font: dark brown/black serif font, LARGE mobile-readable size (minimum 30pt equivalent), high contrast — never tiny text
- Text: never more than 4 lines; if the caption is long, make the box TALLER — never shrink font below readable size
- The box must be FULLY CONTAINED within the image frame with a large visible empty band below it (at least 38% of image height)
- Never place the caption box flush to the bottom edge or side edges — this is the most common failure mode
- Always leave clear scene content in the top 48–50% above the caption box
- If dialogue is present, place it ABOVE the caption box (42–52% zone), as a separate white speech bubble near the speaking character — never inside the caption box

CRITICAL: Identical caption box style, size, margins, and position across ALL panels. Same cream color, same 80% width, same vertical band, same padding. Consistency is mandatory.`;

const LAYOUT_MARKER = "FINAL LAYOUT ENFORCEMENT v5";

/** Reinforcement appended right before gpt-image-1. */
export const CAPTION_BOX_LAYOUT_ENFORCEMENT = `${LAYOUT_MARKER} — OBEY BEFORE RENDERING:
1. Draw the illustration in the TOP 50% only. The lower HALF of the frame is reserved for the caption box + large empty margin.
2. Draw ONE large cream caption box: 80% frame width (NOT full width), centered, with its BOTTOM edge at 58–62% of frame height — NEVER below 62%, NEVER in the bottom 35% of the image.
3. Box minimum size 820×180px with 32px internal padding — text must NOT touch the box border.
4. Leave at least 38% of total frame height (580px+ on a 1536px-tall image) as empty/simple margin BELOW the caption box before the image bottom edge.
5. Caption box must NOT overlap faces, cars, logos, or main action.
6. WRONG: caption box touching or near the bottom edge. WRONG: caption in the bottom quarter of the image. WRONG: text cut off. RIGHT: caption floating clearly in the middle-lower area with a huge empty band underneath.`;

function stripCaptionLayoutBlocks(prompt: string): string {
  return prompt
    .replace(
      /CAPTION BOX RULES \([^)]*\)[\s\S]*?(?=\n\n(?:SCENE COMPOSITION SAFE ZONE|FINAL LAYOUT ENFORCEMENT|LAYOUT ENFORCEMENT|$))/i,
      ""
    )
    .replace(
      /SCENE COMPOSITION SAFE ZONE \(mandatory[\s\S]*?(?=\n\n(?:CAPTION BOX RULES|FINAL LAYOUT ENFORCEMENT|LAYOUT ENFORCEMENT|$))/i,
      ""
    )
    .replace(/\n\n(?:FINAL LAYOUT ENFORCEMENT|LAYOUT ENFORCEMENT)[\s\S]*$/i, "")
    .trim();
}

export function enforceCaptionBoxRules(prompt: string): string {
  const base = stripCaptionLayoutBlocks(prompt.trim());

  return `${base}

${CAPTION_BOX_RULES}

${SCENE_COMPOSITION_SAFE_ZONE}

${CAPTION_BOX_LAYOUT_ENFORCEMENT}`.trim();
}
