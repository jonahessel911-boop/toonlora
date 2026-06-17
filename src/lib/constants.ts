import type { Category } from "@/types/story";

export const APP_NAME = "Toonlora";

export const GENRES = [
  "Fantasy Romance",
  "Romance",
  "Anime Romance",
  "Drama",
  "Dark Romance",
  "Office Romance",
  "School Romance",
  "Supernatural Romance",
] as const;

export const VISUAL_STYLES = [
  "Cartoon Webtoon",
  "Soft Anime",
  "Modern Manhwa",
  "Chibi Cute",
  "Cinematic Realistic Cartoon",
] as const;

export const TONE_OPTIONS = [
  "Cute and lighthearted",
  "Dramatic and emotional",
  "Spicy but non-explicit",
  "Emotional and heartfelt",
  "Cinematic and epic",
  "Dark and mysterious",
] as const;

export const TARGET_AUDIENCES = [
  "Teens / Young Adults",
  "Young Adults",
  "All Ages",
  "Mature Teens",
] as const;

export const LANGUAGES = ["English", "Dutch", "Spanish", "French", "German"] as const;

export const EPISODE_LENGTHS = ["Short", "Normal", "Long"] as const;

/** @deprecated use TONE_OPTIONS */
export const TONES = TONE_OPTIONS;

/** @deprecated use EPISODE_LENGTHS */
export const STORY_LENGTHS = EPISODE_LENGTHS;

export const CATEGORIES: Category[] = [
  "Romance",
  "Anime",
  "Fantasy",
  "Drama",
  "Spicy",
  "Slice of Life",
  "Comedy",
  "Adventure",
];

export const COVER_GRADIENTS = [
  "from-violet-500 via-purple-400 to-fuchsia-300",
  "from-[#7C3AED] via-[#8B5CF6] to-[#C4B5FD]",
  "from-[#FF4FA3] via-[#F472B6] to-[#FFD84D]",
  "from-[#22D3EE] via-[#60A5FA] to-[#A78BFA]",
  "from-[#FB7185] via-[#FF4FA3] to-[#E9D8FD]",
  "from-[#FFD84D] via-[#FBBF24] to-[#FF4FA3]",
  "from-indigo-500 via-violet-400 to-purple-300",
  "from-fuchsia-500 via-pink-400 to-rose-300",
];

export const IMAGE_GRADIENTS = [
  "from-pink-200 via-purple-100 to-violet-100",
  "from-violet-200 via-purple-100 to-fuchsia-100",
  "from-amber-100 via-yellow-100 to-purple-100",
  "from-cyan-200 via-sky-100 to-violet-100",
  "from-fuchsia-200 via-pink-100 to-indigo-100",
];

export const CREDIT_PACKAGES = [
  { credits: 10, price: "€9,99", popular: false },
  { credits: 25, price: "€19,99", popular: true },
  { credits: 60, price: "€39,99", popular: false },
  { credits: 150, price: "€89,99", popular: false },
];

export const STORAGE_KEYS = {
  stories: "toonlora-stories",
  credits: "toonlora-credits",
  freeUsed: "toonlora-free-used",
  readingHistory: "toonlora-reading-history",
} as const;
