import { ART_STYLES } from "@/lib/artStyles";

/** Visual direction per story genre/category for image + script prompts. */
export const GENRE_IMAGE_HINTS: Record<string, string> = {
  Romance:
    "Warm romantic mood, emotional close-ups, soft lighting, blush tones, intimate character moments.",
  Anime:
    "Anime-inspired stylization, expressive eyes, dynamic poses, vibrant hair and outfit details.",
  Fantasy:
    "Magical environments, ethereal glow, rich fantasy costumes, mystical atmosphere and world-building.",
  Comedy:
    "Playful expressions, bright colors, visual gags, exaggerated reactions, lighthearted energy.",
  Drama:
    "Moody lighting, tense body language, emotional weight, cinematic shadows and contrast.",
  Adventure:
    "Epic landscapes, motion and discovery, action-ready poses, sense of journey and scale.",
  "Slice of Life":
    "Cozy everyday settings, gentle palette, relatable domestic details, calm slice-of-life warmth.",
};

/** Creator wizard style labels → image prompt hints (admin uses ART_STYLES). */
const CREATOR_STYLE_HINTS: Record<string, string> = {
  Cartoon: "Bright cartoon style, clean bold outlines, expressive faces, colorful shading.",
  Webtoon:
    "Bright vertical webtoon style, clean outlines, expressive faces, colorful mobile-first shading.",
  Cute: "Soft cute illustration, pastel palette, rounded shapes, charming details.",
  Cinematic:
    "Cinematic framing within each panel strip, dramatic lighting, film-like composition.",
  Funny: "Exaggerated comedy expressions, playful colors, visual humor timing.",
  Dreamy: "Dreamy soft glow lighting, pastel gradients, ethereal romantic mood.",
};

export function getGenreImageHint(genre: string): string {
  return (
    GENRE_IMAGE_HINTS[genre] ??
    `${genre} genre — match visuals, mood, and setting to this category.`
  );
}

export function resolveArtStyleHint(style: string): string {
  const fromCatalog = ART_STYLES.find((s) => s.pipelineStyle === style);
  if (fromCatalog) return fromCatalog.imagePromptHint;
  return CREATOR_STYLE_HINTS[style] ?? `Art style: ${style}.`;
}

/** Shared vertical webtoon layout block for all generation prompts. */
export const VERTICAL_WEBTOON_LAYOUT_RULES = `VERTICAL WEBTOON LAYOUT (mandatory):
- ONE single column of full-width panel strips, stacked top-to-bottom for mobile scroll (Webtoon / Tapas style).
- Each panel is a horizontal strip spanning the full page width.
- NEVER use a grid, 2-column layout, side-by-side panels, manga page spreads, or comic book page grids.
- Panels read strictly top → bottom, one moment per strip.
- Clear horizontal borders between stacked strips.`;
