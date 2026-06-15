/** Visual art styles for episode generation (admin + creator). */

export interface ArtStyleOption {
  id: string;
  label: string;
  /** Value sent to the story engine prompts */
  pipelineStyle: string;
  imagePromptHint: string;
  preview: string;
}

export const ART_STYLES: ArtStyleOption[] = [
  {
    id: "cartoon-webtoon",
    label: "Cartoon Webtoon",
    pipelineStyle: "Cartoon Webtoon",
    imagePromptHint:
      "Bright vertical webtoon style, clean outlines, expressive faces, colorful shading.",
    preview: "/images/art-styles/cartoon-webtoon.svg",
  },
  {
    id: "manga",
    label: "Manga",
    pipelineStyle: "Manga",
    imagePromptHint:
      "Japanese manga style, screentones, sharp linework, dramatic shading, monochrome accents.",
    preview: "/images/art-styles/manga.svg",
  },
  {
    id: "epic-fantasy",
    label: "Epic Fantasy",
    pipelineStyle: "Epic Fantasy Illustration",
    imagePromptHint:
      "Painterly epic fantasy, rich lighting, detailed costumes, magical atmosphere.",
    preview: "/images/art-styles/epic-fantasy.svg",
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    pipelineStyle: "Cyberpunk Anime",
    imagePromptHint:
      "Neon cyberpunk city, glowing accents, futuristic fashion, high contrast night scenes.",
    preview: "/images/art-styles/cyberpunk.svg",
  },
  {
    id: "soft-glow",
    label: "Soft Glow",
    pipelineStyle: "Soft Glow Illustration",
    imagePromptHint:
      "Dreamy soft glow lighting, pastel palette, gentle gradients, romantic mood.",
    preview: "/images/art-styles/soft-glow.svg",
  },
  {
    id: "3d-cartoon",
    label: "3D Cartoon",
    pipelineStyle: "3D Cartoon Animation",
    imagePromptHint:
      "3D animated film style, rounded forms, vibrant materials, cinematic depth.",
    preview: "/images/art-styles/3d-cartoon.svg",
  },
  {
    id: "line-art",
    label: "Line Art",
    pipelineStyle: "Clean Line Art Webtoon",
    imagePromptHint:
      "Clean line art, minimal color fills, crisp ink outlines, modern indie comic.",
    preview: "/images/art-styles/line-art.svg",
  },
  {
    id: "noir",
    label: "Noir",
    pipelineStyle: "Noir Graphic Novel",
    imagePromptHint:
      "Noir graphic novel, deep shadows, moody contrast, urban night aesthetic.",
    preview: "/images/art-styles/noir.svg",
  },
];

export function getArtStyleById(id: string): ArtStyleOption {
  return ART_STYLES.find((s) => s.id === id) ?? ART_STYLES[0];
}

export function getArtStylePipelineValue(id: string): string {
  return getArtStyleById(id).pipelineStyle;
}
