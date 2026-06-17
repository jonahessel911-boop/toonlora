import type {
  CharacterGender,
  CreatorAnalytics,
  StudioBubble,
  StudioCharacter,
  StudioEpisode,
  StudioPanel,
  StudioStory,
} from "@/types/creator";
import {
  defaultAppearance,
  type CharacterAppearance,
} from "@/lib/creator/characterAppearance";

const NOW = new Date().toISOString();
const DAYS_AGO = (d: number) =>
  new Date(Date.now() - d * 86400000).toISOString();

export const MOCK_CREATOR_ID = "creator-local";
export const MOCK_CREATOR_NAME = "You";

function seedCharacter(
  gender: CharacterGender,
  appearance: Partial<CharacterAppearance> | undefined,
  base: Omit<StudioCharacter, "gender" | "appearance">
): StudioCharacter {
  return {
    ...base,
    gender,
    appearance: { ...defaultAppearance(gender), ...appearance },
  };
}

export function ensureCharacter(c: StudioCharacter): StudioCharacter {
  const gender = c.gender ?? "woman";
  return {
    ...c,
    gender,
    appearance: c.appearance ?? defaultAppearance(gender),
  };
}

const GRADIENTS = [
  "from-[#5340FF] via-[#7C3AED] to-[#FF4FA3]",
  "from-[#22D3EE] via-[#5340FF] to-[#2A114B]",
  "from-[#FF6847] via-[#FF4FA3] to-[#5340FF]",
  "from-[#FFE033] via-[#FF6847] to-[#FBBF24]",
  "from-[#2A114B] via-[#5340FF] to-[#22D3EE]",
];

function bubble(
  panelId: string,
  partial: Omit<StudioBubble, "id" | "panelId"> & { id?: string }
): StudioBubble {
  return {
    id: partial.id ?? `bubble-${panelId}-${Math.random().toString(36).slice(2, 7)}`,
    panelId,
    type: partial.type,
    characterId: partial.characterId,
    text: partial.text,
    x: partial.x,
    y: partial.y,
    width: partial.width,
    tail: partial.tail,
    style: partial.style,
  };
}

function makePanels(
  episodeId: string,
  storyCharacterIds: string[],
  withBubbles = false
): StudioPanel[] {
  const mc = storyCharacterIds[0];
  const li = storyCharacterIds[1];

  const configs: Array<{
    prompt: string;
    gradient: string;
    overlays: StudioBubble[];
  }> = [
    {
      prompt: "Night street, character walking under warm lamps",
      gradient: GRADIENTS[0],
      overlays: withBubbles
        ? [
            bubble(`p1`, {
              type: "narration",
              text: "The air felt charged, as if something stirred in the shadows.",
              x: 8,
              y: 6,
              width: 84,
              tail: "none",
              style: "default",
            }),
            bubble(`p1`, {
              type: "speech",
              characterId: mc,
              text: "Just another quiet evening...",
              x: 10,
              y: 72,
              width: 55,
              tail: "bottom-left",
              style: "default",
            }),
          ]
        : [],
    },
    {
      prompt: "Close-up — startled expression",
      gradient: GRADIENTS[1],
      overlays: withBubbles
        ? [
            bubble(`p2`, {
              type: "sfx",
              text: "WHISPER...",
              x: 68,
              y: 12,
              width: 24,
              tail: "none",
              style: "dramatic",
            }),
            bubble(`p2`, {
              type: "speech",
              characterId: mc,
              text: "What was that?",
              x: 12,
              y: 68,
              width: 50,
              tail: "bottom-left",
              style: "default",
            }),
          ]
        : [],
    },
    {
      prompt: "Wide shot — woods at the edge of town",
      gradient: GRADIENTS[2],
      overlays: withBubbles
        ? [
            bubble(`p3`, {
              type: "narration",
              text: "The woods beckon, whispering secrets of forgotten tales.",
              x: 8,
              y: 8,
              width: 84,
              tail: "none",
              style: "soft",
            }),
          ]
        : [],
    },
    {
      prompt: "Ghost girl appears among the trees",
      gradient: GRADIENTS[3],
      overlays: withBubbles
        ? [
            bubble(`p4`, {
              type: "speech",
              characterId: li,
              text: "Please... don't run away.",
              x: 14,
              y: 62,
              width: 58,
              tail: "bottom-right",
              style: "soft",
            }),
          ]
        : [],
    },
    {
      prompt: "Extreme close-up — eyes wide with shock",
      gradient: GRADIENTS[4],
      overlays: withBubbles
        ? [
            bubble(`p5`, {
              type: "sfx",
              text: "THUMP...",
              x: 70,
              y: 18,
              width: 22,
              tail: "none",
              style: "dramatic",
            }),
          ]
        : [],
    },
    {
      prompt: "Both characters face each other — magical glow",
      gradient: GRADIENTS[0],
      overlays: withBubbles
        ? [
            bubble(`p6`, {
              type: "speech",
              characterId: mc,
              text: "You... you're real?",
              x: 52,
              y: 58,
              width: 42,
              tail: "bottom-right",
              style: "default",
            }),
            bubble(`p6`, {
              type: "sfx",
              text: "GLIMMER...",
              x: 38,
              y: 28,
              width: 24,
              tail: "none",
              style: "dramatic",
            }),
          ]
        : [],
    },
  ];

  return configs.map((c, i) => ({
    id: `${episodeId}-panel-${i + 1}`,
    episodeId,
    gradient: c.gradient,
    prompt: c.prompt,
    characterIds: storyCharacterIds,
    overlays: c.overlays,
    order: i + 1,
    status: "ready" as const,
  }));
}

export const INITIAL_CHARACTERS: StudioCharacter[] = [
  seedCharacter("man", { topColor: "#667085", hairId: "messy", accessoryId: "backpack" }, {
    id: "char-jona",
    name: "Jona",
    creatorId: MOCK_CREATOR_ID,
    creatorName: MOCK_CREATOR_NAME,
    visibility: "private",
    role: "main character",
    personality: "Curious, brave, slightly awkward",
    visualDescription: "Messy brown hair, grey hoodie, backpack",
    outfit: "Grey hoodie, blue jeans, brown backpack",
    colorPalette: ["#5340FF", "#667085", "#101828"],
    styleTheme: "fantasy",
    consistencyPrompt: "Young man, messy brown hair, grey hoodie, expressive eyes",
    referenceImages: [],
    usedInStories: ["story-shadow-whisper"],
    allowOthersToUse: false,
    attributionRequired: true,
    shortDescription: "A curious dreamer who stumbles into the supernatural",
    ageRange: "18-22",
    portraitGradient: GRADIENTS[0],
  }),
  seedCharacter("woman", { topId: "dress", bottomId: "skirt", hairId: "long-wavy", topColor: "#2A114B", hairColor: "#5340FF", skinTone: "#E8E8FF" }, {
    id: "char-griezel",
    name: "Griezel",
    creatorId: MOCK_CREATOR_ID,
    creatorName: MOCK_CREATOR_NAME,
    visibility: "private",
    role: "love interest",
    personality: "Shy, ethereal, hopeful",
    visualDescription: "Pale blue skin, glowing eyes, starry dress",
    outfit: "Dark blue dress with white stars",
    colorPalette: ["#22D3EE", "#2A114B", "#5340FF"],
    styleTheme: "fantasy",
    consistencyPrompt: "Ghost girl, pale blue skin, glowing blue eyes, wavy dark blue hair, starry dress",
    referenceImages: [],
    usedInStories: ["story-shadow-whisper"],
    allowOthersToUse: false,
    attributionRequired: true,
    shortDescription: "A gentle spirit trapped between worlds",
    ageRange: "ageless",
    portraitGradient: GRADIENTS[1],
  }),
  seedCharacter("man", { accessoryId: "glasses", topColor: "#34D399", topId: "jacket" }, {
    id: "char-milo",
    name: "Milo",
    creatorId: MOCK_CREATOR_ID,
    creatorName: MOCK_CREATOR_NAME,
    visibility: "private",
    role: "friend",
    personality: "Loyal, witty, always hungry",
    visualDescription: "Round glasses, orange beanie, cheerful smile",
    outfit: "Orange beanie, green jacket",
    colorPalette: ["#FF6847", "#FFE033", "#34D399"],
    styleTheme: "comedy",
    consistencyPrompt: "Friendly guy with round glasses and orange beanie",
    referenceImages: [],
    usedInStories: ["story-cafe-chaos"],
    allowOthersToUse: false,
    attributionRequired: true,
    shortDescription: "The best friend who always has a snack",
    ageRange: "20-24",
    portraitGradient: GRADIENTS[2],
  }),
  seedCharacter("woman", { hairColor: "#5340FF", topId: "blazer", hairId: "bob" }, {
    id: "char-luna",
    name: "Luna",
    creatorId: MOCK_CREATOR_ID,
    creatorName: MOCK_CREATOR_NAME,
    visibility: "private",
    role: "main character",
    personality: "Determined, creative, night owl",
    visualDescription: "Purple hair streak, art smock, paint-stained hands",
    outfit: "Oversized art smock, fingerless gloves",
    colorPalette: ["#FF4FA3", "#5340FF", "#F3ECFF"],
    styleTheme: "romance",
    consistencyPrompt: "Young woman with purple hair streak and art smock",
    referenceImages: [],
    usedInStories: ["story-midnight-ink"],
    allowOthersToUse: false,
    attributionRequired: true,
    shortDescription: "An artist who paints her dreams into reality",
    ageRange: "22-26",
    portraitGradient: GRADIENTS[3],
  }),
  seedCharacter("man", { topId: "blazer", topColor: "#2A114B", accessoryId: "crown", faceId: "sharp" }, {
    id: "char-vex",
    name: "Vex",
    creatorId: MOCK_CREATOR_ID,
    creatorName: MOCK_CREATOR_NAME,
    visibility: "public",
    role: "villain",
    personality: "Charming, manipulative, theatrical",
    visualDescription: "Sharp suit, silver mask, crimson cape",
    outfit: "Black suit, silver half-mask, crimson cape",
    colorPalette: ["#2A114B", "#FF6847", "#101828"],
    styleTheme: "dark",
    consistencyPrompt: "Theatrical villain in silver half-mask and crimson cape",
    referenceImages: [],
    usedInStories: [],
    allowOthersToUse: true,
    attributionRequired: true,
    shortDescription: "A masked trickster who trades in secrets",
    ageRange: "30+",
    portraitGradient: GRADIENTS[4],
  }),
];

export const COMMUNITY_CHARACTERS: StudioCharacter[] = [
  seedCharacter("woman", { hairColor: "#FF4FA3", hairId: "ponytail", topColor: "#5340FF" }, {
    id: "comm-sakura",
    name: "Sakura",
    creatorId: "creator-yuki",
    creatorName: "YukiArt",
    visibility: "public",
    role: "main character",
    personality: "Optimistic, clumsy, heartfelt",
    visualDescription: "Pink twin-tails, school uniform, cherry blossom pin",
    outfit: "Navy school uniform with pink accents",
    colorPalette: ["#FF4FA3", "#F3ECFF", "#5340FF"],
    styleTheme: "anime",
    consistencyPrompt: "Anime girl, pink twin-tails, navy school uniform",
    referenceImages: [],
    usedInStories: ["ext-1", "ext-2", "ext-3"],
    allowOthersToUse: true,
    attributionRequired: true,
    shortDescription: "A cheerful student who sees magic in everyday life",
    ageRange: "16-18",
    portraitGradient: "from-[#FF4FA3] via-[#F472B6] to-[#FBCFE8]",
  }),
  seedCharacter("man", { hairColor: "#22D3EE", hairId: "spiky", topId: "jacket", topColor: "#101828" }, {
    id: "comm-kai",
    name: "Kai",
    creatorId: "creator-neon",
    creatorName: "NeonDrift",
    visibility: "public",
    role: "main character",
    personality: "Cool, reserved, loyal",
    visualDescription: "Neon blue hair, cyber jacket, glowing visor",
    outfit: "Black cyber jacket, neon trim visor",
    colorPalette: ["#22D3EE", "#5340FF", "#101828"],
    styleTheme: "anime",
    consistencyPrompt: "Cyberpunk boy, neon blue hair, glowing visor",
    referenceImages: [],
    usedInStories: ["ext-4", "ext-5"],
    allowOthersToUse: true,
    attributionRequired: true,
    shortDescription: "A street racer from the neon district",
    ageRange: "19-23",
    portraitGradient: "from-[#22D3EE] via-[#5340FF] to-[#2A114B]",
  }),
  seedCharacter("woman", { hairColor: "#FFE033", hairId: "long-wavy", topId: "dress", accessoryId: "crown" }, {
    id: "comm-elara",
    name: "Elara",
    creatorId: "creator-myth",
    creatorName: "MythWeaver",
    visibility: "public",
    role: "mentor",
    personality: "Wise, gentle, mysterious",
    visualDescription: "Silver hair, flowing robes, starlight eyes",
    outfit: "Flowing white and gold robes",
    colorPalette: ["#FFE033", "#F3ECFF", "#5340FF"],
    styleTheme: "fantasy",
    consistencyPrompt: "Elder mage, silver hair, starlight eyes, gold-trim robes",
    referenceImages: [],
    usedInStories: ["ext-6", "ext-7", "ext-8", "ext-9"],
    allowOthersToUse: true,
    attributionRequired: true,
    shortDescription: "An ancient mage who guides lost heroes",
    ageRange: "ageless",
    portraitGradient: "from-[#FFE033] via-[#E9D8FD] to-[#5340FF]",
  }),
  seedCharacter("woman", { topColor: "#FF6847", accessoryId: "scarf", faceId: "cute" }, {
    id: "comm-pip",
    name: "Pip",
    creatorId: "creator-toon",
    creatorName: "ToonBuddy",
    visibility: "public",
    role: "side character",
    personality: "Goofy, energetic, lovable",
    visualDescription: "Round orange creature, big eyes, tiny wings",
    outfit: "Red scarf",
    colorPalette: ["#FF6847", "#FFE033", "#FF4FA3"],
    styleTheme: "comedy",
    consistencyPrompt: "Round orange mascot creature with tiny wings and red scarf",
    referenceImages: [],
    usedInStories: ["ext-10"],
    allowOthersToUse: true,
    attributionRequired: true,
    shortDescription: "A tiny winged companion who never stops talking",
    ageRange: "n/a",
    portraitGradient: "from-[#FF6847] via-[#FFE033] to-[#FF4FA3]",
  }),
  seedCharacter("woman", { hairColor: "#5340FF", topId: "dress", hairId: "long-wavy" }, {
    id: "comm-nova",
    name: "Nova",
    creatorId: "creator-star",
    creatorName: "StarlitInk",
    visibility: "public",
    role: "love interest",
    personality: "Dreamy, poetic, shy",
    visualDescription: "Starry hair, soft glow, constellation dress",
    outfit: "Deep blue dress with constellation patterns",
    colorPalette: ["#5340FF", "#22D3EE", "#F3ECFF"],
    styleTheme: "romance",
    consistencyPrompt: "Dreamy girl with starry hair and constellation dress",
    referenceImages: [],
    usedInStories: ["ext-11", "ext-12"],
    allowOthersToUse: true,
    attributionRequired: true,
    shortDescription: "A girl who speaks in constellations",
    ageRange: "20-24",
    portraitGradient: "from-[#5340FF] via-[#7C3AED] to-[#22D3EE]",
  }),
  seedCharacter("man", { topId: "jacket", topColor: "#2A114B", accessoryId: "scarf", faceId: "sharp" }, {
    id: "comm-rex",
    name: "Rex",
    creatorId: "creator-action",
    creatorName: "ActionToon",
    visibility: "public",
    role: "main character",
    personality: "Bold, reckless, protective",
    visualDescription: "Scarred jaw, leather jacket, red bandana",
    outfit: "Leather jacket, red bandana, combat boots",
    colorPalette: ["#FF6847", "#2A114B", "#667085"],
    styleTheme: "drama",
    consistencyPrompt: "Rugged hero with scarred jaw, leather jacket, red bandana",
    referenceImages: [],
    usedInStories: ["ext-13", "ext-14", "ext-15"],
    allowOthersToUse: true,
    attributionRequired: true,
    shortDescription: "A rogue who fights for the underdog",
    ageRange: "25-30",
    portraitGradient: "from-[#FF6847] via-[#2A114B] to-[#101828]",
  }),
];

const activeEpisodeId = "ep-shadow-1";

export const INITIAL_STORIES: StudioStory[] = [
  {
    id: "story-shadow-whisper",
    title: "Shadow Whisper",
    description: "A quiet evening turns supernatural when Jona meets a spirit in the woods.",
    genre: "Fantasy",
    coverGradient: GRADIENTS[0],
    status: "draft",
    visibility: "private",
    audienceRating: "Teen",
    characterIds: ["char-jona", "char-griezel"],
    allowInspiredVersions: false,
    allowPublicCharacterUse: false,
    requireAttribution: true,
    allowComments: true,
    createdAt: DAYS_AGO(5),
    updatedAt: DAYS_AGO(0),
    reads: 0,
    likes: 0,
    episodes: [
      {
        id: activeEpisodeId,
        storyId: "story-shadow-whisper",
        title: "Episode 1 — The Whisper",
        status: "draft",
        panels: makePanels(activeEpisodeId, ["char-jona", "char-griezel"], true),
      },
    ],
  },
  {
    id: "story-cafe-chaos",
    title: "Café Chaos",
    description: "Milo's favorite café gets a magical makeover.",
    genre: "Comedy",
    coverGradient: GRADIENTS[2],
    status: "published",
    visibility: "public",
    audienceRating: "All ages",
    characterIds: ["char-milo"],
    allowInspiredVersions: false,
    allowPublicCharacterUse: false,
    requireAttribution: true,
    allowComments: true,
    createdAt: DAYS_AGO(14),
    updatedAt: DAYS_AGO(3),
    reads: 1240,
    likes: 89,
    episodes: [
      {
        id: "ep-cafe-1",
        storyId: "story-cafe-chaos",
        title: "Episode 1 — Spilled Latte",
        status: "published",
        panels: makePanels("ep-cafe-1", ["char-milo"], false),
      },
    ],
  },
  {
    id: "story-midnight-ink",
    title: "Midnight Ink",
    description: "Luna's paintings start moving when the clock strikes twelve.",
    genre: "Romance",
    coverGradient: GRADIENTS[3],
    status: "private",
    visibility: "private",
    audienceRating: "Teen",
    characterIds: ["char-luna"],
    allowInspiredVersions: false,
    allowPublicCharacterUse: false,
    requireAttribution: true,
    allowComments: false,
    createdAt: DAYS_AGO(8),
    updatedAt: DAYS_AGO(6),
    reads: 12,
    likes: 3,
    episodes: [
      {
        id: "ep-ink-1",
        storyId: "story-midnight-ink",
        title: "Episode 1 — Wet Canvas",
        status: "draft",
        panels: makePanels("ep-ink-1", ["char-luna"], false),
      },
    ],
  },
];

/** Built-in demo stories — excluded from the creator Stories list. */
export const SEED_STORY_IDS = new Set(
  INITIAL_STORIES.map((story) => story.id)
);

export function isSeedStory(storyId: string): boolean {
  return SEED_STORY_IDS.has(storyId);
}

export function storyHasGeneratedArt(story: StudioStory): boolean {
  if (story.coverUrl) return true;
  return story.episodes.some((episode) =>
    episode.panels.some((panel) => Boolean(panel.imageUrl))
  );
}

export function filterUserStories(stories: StudioStory[]): StudioStory[] {
  return stories.filter((story) => {
    if (isSeedStory(story.id)) return false;
    return storyHasGeneratedArt(story);
  });
}

export const MOCK_ANALYTICS: CreatorAnalytics = {
  reads: 2847,
  likes: 196,
  followers: 42,
  remixes: 7,
  completionRate: 68,
  comments: 34,
  inspiredVersions: 3,
  characterUses: 12,
};

export const ACTIVE_EDITOR_STORY_ID = "story-shadow-whisper";

export function createEmptyStory(
  partial: Pick<StudioStory, "title" | "description" | "genre" | "visibility" | "audienceRating" | "characterIds">
): StudioStory {
  const id = `story-${Date.now()}`;
  const episodeId = `ep-${Date.now()}`;
  return {
    id,
    title: partial.title,
    description: partial.description,
    genre: partial.genre,
    coverGradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
    status: "draft",
    visibility: partial.visibility,
    audienceRating: partial.audienceRating,
    characterIds: partial.characterIds,
    allowInspiredVersions: false,
    allowPublicCharacterUse: false,
    requireAttribution: true,
    allowComments: true,
    createdAt: NOW,
    updatedAt: NOW,
    reads: 0,
    likes: 0,
    episodes: [
      {
        id: episodeId,
        storyId: id,
        title: "Episode 1",
        status: "draft",
        panels: [],
      },
    ],
  };
}

export function generatePanelsForEpisode(
  episodeId: string,
  count: number,
  characterIds: string[],
  episodePrompt: string
): StudioPanel[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${episodeId}-panel-${Date.now()}-${i}`,
    episodeId,
    gradient: GRADIENTS[i % GRADIENTS.length],
    prompt: `${episodePrompt} — panel ${i + 1}`,
    characterIds,
    overlays: i === 0
      ? [
          bubble(`${episodeId}-p${i}`, {
            type: "narration",
            text: "A new chapter begins...",
            x: 10,
            y: 8,
            width: 80,
            tail: "none",
            style: "default",
          }),
        ]
      : [],
    order: i + 1,
    status: "generating" as const,
  }));
}
