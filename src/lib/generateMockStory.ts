import {
  COVER_GRADIENTS,
  IMAGE_GRADIENTS,
} from "@/lib/constants";
import type {
  CreateStoryInput,
  Story,
  StoryChapter,
  StoryPage,
} from "@/types/story";

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(): string {
  return `story-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const PAGE_COUNT: Record<CreateStoryInput["length"], number> = {
  Short: 10,
  Normal: 12,
  Long: 14,
};

function buildTitle(input: CreateStoryInput): string {
  if (input.title?.trim()) return input.title.trim();
  const templates = [
    `${input.mainCharacter} & ${input.loveInterest}: A ${input.genre} Tale`,
    `When ${input.mainCharacter} Met ${input.loveInterest}`,
    `Hearts of ${input.mainCharacter}`,
    `${input.loveInterest}'s Secret`,
    `A Story for ${input.mainCharacter}`,
  ];
  return pickRandom(templates);
}

function buildParagraphs(input: CreateStoryInput): string[] {
  const { mainCharacter: mc, loveInterest: li, prompt, tone, genre } = input;

  const toneWords: Record<string, string[]> = {
    Cute: ["warm", "playful", "soft", "bright", "gentle"],
    Dramatic: ["intense", "raw", "unforgettable", "heavy", "electric"],
    "Spicy but non-explicit": [
      "charged",
      "magnetic",
      "close",
      "breathless",
      "tender",
    ],
    Emotional: ["deep", "honest", "fragile", "moving", "sincere"],
    Cinematic: ["sweeping", "golden", "dramatic", "wide", "timeless"],
  };

  const mood = pickRandom(toneWords[tone] ?? toneWords.Cute);

  const genreSettings: Record<string, string> = {
    Romance: "a sunlit city where every corner feels like fate",
    "Anime Romance": "a vibrant school town painted in cherry blossoms and neon",
    "Fantasy Romance": "a kingdom where magic hums beneath ancient trees",
    Drama: "a world of quiet apartments and loud, unspoken feelings",
    "Dark Romance": "shadowed halls where desire and danger share the same breath",
    "Office Romance": "a glass tower where ambition and longing collide after hours",
  };

  const setting = genreSettings[genre] ?? genreSettings.Romance;

  return [
    `In ${setting}, ${mc} had always believed love was something that happened to other people — until the day ${prompt.toLowerCase().startsWith("what") ? prompt : prompt}.`,

    `The air felt ${mood} that morning. ${mc} caught sight of ${li} across the room, and for a heartbeat, the entire world narrowed to a single, impossible point of light.`,

    `"I didn't expect to see you here," ${li} said, voice steady but eyes betraying something softer. ${mc} smiled — the kind of smile that changes the shape of a day.`,

    `They walked together through streets that seemed to bend around them. Every shared glance carried the weight of a thousand unspoken words, each one ${mood} and alive.`,

    `${mc} thought about the prompt that had started it all: "${prompt}". Somehow, life had answered with ${li} standing close enough to feel like home.`,

    `Rain began to fall — not harsh, but gentle, like the universe approving their closeness. ${li} offered a shared umbrella, and ${mc} accepted without hesitation.`,

    `"Tell me something true," ${li} whispered. ${mc} looked up, heart racing. "I think I've been waiting for you longer than I knew."`,

    `The ${genre.toLowerCase()} world around them faded into background noise. What remained was the ${mood} pull between two souls learning to trust the fall.`,

    `They found a quiet place — a bench, a rooftop, a hidden garden — where time slowed. ${li}'s hand brushed ${mc}'s, and neither pulled away.`,

    `"This feels like the beginning of something," ${mc} said. ${li} nodded, eyes shining. "Or maybe it's the moment we finally noticed what was already there."`,

    `Days blended into evenings filled with laughter, near-misses, and conversations that stretched until the stars appeared. Every chapter of their story felt ${mood} and real.`,

    `There were challenges — misunderstandings, distance, the fear of wanting too much. But ${mc} and ${li} kept choosing each other, again and again.`,

    `On a ${mood} evening, beneath a sky washed in green and gold, ${li} turned to ${mc} with quiet certainty. "Stay with me. Not just tonight — all of it."`,

    `${mc} breathed in, steady and sure. "Always." And in that answer, their ${genre.toLowerCase()} story found its perfect, ${tone.toLowerCase()} ending — open enough for tomorrow, complete enough for today.`,
  ];
}

export function generateMockStory(input: CreateStoryInput): Story {
  const id = generateId();
  const title = buildTitle(input);
  const pageCount = PAGE_COUNT[input.length];
  const paragraphs = buildParagraphs(input);
  const coverGradient = pickRandom(COVER_GRADIENTS);

  const pages: StoryPage[] = [];
  for (let i = 0; i < pageCount; i++) {
    const pageNumber = i + 1;
    const isImagePage = pageNumber % 3 === 0;

    pages.push({
      id: `${id}-page-${pageNumber}`,
      pageNumber,
      text: paragraphs[i % paragraphs.length],
      ...(isImagePage && {
        imageGradient: pickRandom(IMAGE_GRADIENTS),
        imageCaption: `Scene ${Math.ceil(pageNumber / 3)}: ${input.mainCharacter} and ${input.loveInterest} — a ${input.tone.toLowerCase()} moment`,
      }),
    });
  }

  const chapterSize = Math.ceil(pageCount / 3);
  const chapters: StoryChapter[] = [
    {
      id: `${id}-ch-1`,
      title: "First Spark",
      pageStart: 1,
    },
    {
      id: `${id}-ch-2`,
      title: "Hearts Align",
      pageStart: chapterSize + 1,
    },
    {
      id: `${id}-ch-3`,
      title: "Forever Begins",
      pageStart: chapterSize * 2 + 1,
    },
  ];

  return {
    id,
    title,
    genre: input.genre,
    coverGradient,
    chapters,
    pages,
    createdAt: new Date().toISOString(),
    mainCharacter: input.mainCharacter,
    loveInterest: input.loveInterest,
    prompt: input.prompt,
  };
}
