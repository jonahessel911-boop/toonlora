import type { EpisodeScript, StoryBible } from "@/types/pipeline";

export function buildImagePromptGeneratorPrompt(
  storyBible: StoryBible,
  episodeScript: EpisodeScript,
  artStyle: string,
  language: string
): string {
  return `You are an expert AI comic art director.

Convert the episode script into one high-quality image generation prompt for a vertical cartoon/webtoon comic page.

The output must describe the full page clearly: style, panel layout, characters, emotions, speech bubble placement, backgrounds, lighting, and visual hierarchy.

Important:
- Make the page original.
- Do not copy existing IP, characters, brands, logos, anime, comics, movies, or copyrighted scenes.
- Keep characters consistent with the Story Bible.
- Use 5 to 7 panels maximum.
- Use short readable text only.
- The page should feel like a professional vertical webtoon episode.
- Mobile-first vertical format.
- Strong emotional expressions.
- Clear panel borders.
- No watermarks.
- No fake logos.

STORY BIBLE:
${JSON.stringify(storyBible, null, 2)}

EPISODE SCRIPT:
${JSON.stringify(episodeScript, null, 2)}

ART STYLE:
${artStyle}

LANGUAGE:
${language}

OUTPUT:
Write one complete image generation prompt.`;
}

export function buildFinalImagePrompt(params: {
  episodeNumber: number;
  seriesTitle: string;
  characterBible: string;
  episodeSummary: string;
  panels: Array<{
    visual: string;
    emotion: string;
    text: string;
  }>;
  cliffhanger: string;
}): string {
  const panelBlocks = params.panels
    .map(
      (p, i) => `Panel ${i + 1}:
Visual: ${p.visual}
Emotion: ${p.emotion}
Dialogue/Narration: "${p.text}"`
    )
    .join("\n\n");

  return `Create one polished full-color vertical cartoon/webtoon comic page.

This is Episode ${params.episodeNumber} of the original series "${params.seriesTitle}".

STYLE:
Original modern cartoon/webtoon style. Clean bold outlines, expressive faces, colorful backgrounds, soft cinematic lighting, dynamic paneling, readable comic speech bubbles, and a mobile-first vertical scroll format.

The page should feel like a professional webtoon episode, with strong emotions, clear storytelling, and a visually engaging layout.

Do not copy existing characters, brands, logos, anime, comics, movies, or copyrighted scenes. Create a fully original comic.

IMPORTANT FOR IMAGE GENERATION:
Generate art ONLY — no text, no speech bubbles, no watermarks, no logos.
Text will be added separately by the app as HTML overlays.

FORMAT:
- One vertical comic page
- ${params.panels.length} panels
- Clear panel borders
- Large emotional close-ups
- Mix of wide shots, medium shots, and reaction shots
- Strong final cliffhanger or emotional ending

CHARACTER BIBLE:
${params.characterBible}

STORY CONTEXT:
${params.episodeSummary}

PANEL BREAKDOWN:

${panelBlocks}

ENDING:
End with ${params.cliffhanger}.

QUALITY RULES:
- Keep characters visually consistent.
- Do not change hair color, outfit, age, or facial identity.
- Do not add random main characters.
- Avoid cluttered panels.
- Avoid photorealism.
- Make the page polished, emotional, and shareable.
- NO TEXT IN THE IMAGE.`;
}
