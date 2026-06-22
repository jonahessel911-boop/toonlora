import type {
  CharacterGender,
  CreatorAnalytics,
  StudioBubble,
  StudioCharacter,
  StudioPanel,
  StudioStory,
} from "@/types/creator";
import {
  defaultAppearance,
  type CharacterAppearance,
} from "@/lib/creator/characterAppearance";

const NOW = new Date().toISOString();

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
    usedInStories: [],
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
    usedInStories: [],
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
    usedInStories: [],
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
    usedInStories: [],
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
    usedInStories: [],
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
    usedInStories: [],
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
    usedInStories: [],
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
    usedInStories: [],
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
    usedInStories: [],
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
    usedInStories: [],
    allowOthersToUse: true,
    attributionRequired: true,
    shortDescription: "A rogue who fights for the underdog",
    ageRange: "25-30",
    portraitGradient: "from-[#FF6847] via-[#2A114B] to-[#101828]",
  }),
];

export const INITIAL_STORIES: StudioStory[] = [];

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
