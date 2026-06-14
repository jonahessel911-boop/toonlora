import type { Category } from "@/types/story";

export interface SampleStory {
  id: string;
  title: string;
  genre: Category | string;
  coverGradient: string;
  coverEmoji?: string;
  rank?: number;
  episodes?: number;
  readers?: string;
  likes?: string;
  creator?: string;
  isNew?: boolean;
  href?: string;
}

function hashId(id: string): number {
  return id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

function enrich(
  story: Omit<SampleStory, "episodes" | "readers" | "likes" | "creator"> &
    Partial<SampleStory>
): SampleStory {
  const h = hashId(story.id);
  const emojis: Record<string, string> = {
    Anime: "🌸",
    Romance: "💕",
    Fantasy: "🧙",
    Drama: "🎭",
    Spicy: "🔥",
    "Slice of Life": "☕",
    Comedy: "😂",
    Adventure: "⚔️",
  };
  const creators = ["Mira", "Kai", "Luna", "Studio Toonlora", "Nova"];
  return {
    episodes: story.episodes ?? (h % 8) + 3,
    readers: story.readers ?? `${((h % 40) + 5).toFixed(1)}k`,
    likes: story.likes ?? `${(h % 900) + 100}`,
    creator: story.creator ?? creators[h % creators.length],
    coverEmoji: story.coverEmoji ?? emojis[String(story.genre)] ?? "✨",
    ...story,
  };
}

export const TRENDING_STORIES: SampleStory[] = [
  enrich({
    id: "sample-1",
    title: "Moonlit Cherry Blossoms",
    genre: "Anime",
    coverGradient: "from-fuchsia-500 via-pink-400 to-violet-600",
    coverEmoji: "🌸",
    rank: 1,
    episodes: 12,
    readers: "42.3k",
    likes: "2.1k",
    creator: "Mira",
    isNew: true,
  }),
  enrich({
    id: "sample-2",
    title: "The Guardian's Awakening",
    genre: "Fantasy",
    coverGradient: "from-violet-500 via-purple-400 to-indigo-600",
    coverEmoji: "⚔️",
    rank: 2,
    episodes: 12,
    readers: "38.1k",
    creator: "Studio Toonlora",
  }),
  enrich({
    id: "sample-3",
    title: "Skybound Adventures",
    genre: "Adventure",
    coverGradient: "from-[#22D3EE] via-[#38BDF8] to-[#60A5FA]",
    coverEmoji: "🐱",
    rank: 3,
    episodes: 8,
    readers: "29.4k",
    creator: "Kai",
  }),
  enrich({
    id: "sample-4",
    title: "Whispers of Sakura",
    genre: "Romance",
    coverGradient: "from-rose-400 via-pink-300 to-red-400",
    coverEmoji: "💕",
    rank: 4,
    episodes: 10,
    readers: "24.7k",
    creator: "Luna",
  }),
  enrich({
    id: "sample-5",
    title: "Dream Chasers",
    genre: "Drama",
    coverGradient: "from-amber-400 via-orange-300 to-yellow-400",
    coverEmoji: "🎭",
    rank: 5,
    episodes: 6,
    readers: "18.2k",
    creator: "Nova",
  }),
];

export const COMMUNITY_STORIES: SampleStory[] = [
  enrich({
    id: "comm-1",
    title: "Pico in Outer Space",
    genre: "Comedy",
    coverGradient: "from-lime-400 via-green-300 to-teal-400",
    coverEmoji: "🚀",
    creator: "@greenpico",
    episodes: 5,
  }),
  enrich({
    id: "comm-2",
    title: "Bear's Cozy Journey",
    genre: "Slice of Life",
    coverGradient: "from-amber-300 via-orange-200 to-yellow-300",
    coverEmoji: "🐻",
    creator: "@cozybear",
    episodes: 4,
  }),
  enrich({
    id: "comm-3",
    title: "Midnight Academy",
    genre: "Anime",
    coverGradient: "from-indigo-500 via-blue-400 to-violet-500",
    coverEmoji: "🌙",
    creator: "@nightowl",
    episodes: 7,
  }),
  enrich({
    id: "comm-4",
    title: "Forest Festival",
    genre: "Fantasy",
    coverGradient: "from-[#34D399] via-[#4ADE80] to-[#86EFAC]",
    coverEmoji: "🌿",
    creator: "@foresttales",
    episodes: 3,
  }),
];

export const CONTINUE_READING: SampleStory[] = TRENDING_STORIES.slice(0, 3).map(
  (s, i) => ({ ...s, id: `continue-${i}`, href: "/create" })
);

export const CATEGORY_STORIES: Record<Category, SampleStory[]> = {
  Romance: TRENDING_STORIES.filter((s) => s.genre === "Romance").concat([
    enrich({
      id: "cat-rom-1",
      title: "Coffee Shop Destiny",
      genre: "Romance",
      coverGradient: "from-rose-300 via-pink-200 to-red-300",
      coverEmoji: "☕",
    }),
    enrich({
      id: "cat-rom-2",
      title: "Two Tickets to Paris",
      genre: "Romance",
      coverGradient: "from-sky-400 via-cyan-300 to-blue-400",
      coverEmoji: "✈️",
    }),
  ]),
  Anime: [
    enrich({
      id: "cat-ani-1",
      title: "Transfer Student Spark",
      genre: "Anime",
      coverGradient: "from-fuchsia-400 via-pink-300 to-rose-400",
      coverEmoji: "⚡",
    }),
    enrich({
      id: "cat-ani-2",
      title: "School Rooftop Promise",
      genre: "Anime",
      coverGradient: "from-orange-400 via-amber-300 to-yellow-400",
      coverEmoji: "🏫",
    }),
    enrich({
      id: "cat-ani-3",
      title: "Festival Fireworks",
      genre: "Anime",
      coverGradient: "from-indigo-400 via-violet-300 to-purple-400",
      coverEmoji: "🎆",
    }),
    enrich({
      id: "cat-ani-4",
      title: "Rainy Day Umbrella",
      genre: "Anime",
      coverGradient: "from-blue-400 via-sky-300 to-cyan-400",
      coverEmoji: "☔",
    }),
  ],
  Fantasy: [
    enrich({
      id: "cat-fan-1",
      title: "Dragon's Gentle Heart",
      genre: "Fantasy",
      coverGradient: "from-purple-500 via-violet-400 to-fuchsia-500",
      coverEmoji: "🐉",
    }),
    enrich({
      id: "cat-fan-2",
      title: "Starlight Kingdom",
      genre: "Fantasy",
      coverGradient: "from-indigo-500 via-blue-400 to-purple-500",
      coverEmoji: "⭐",
    }),
    enrich({
      id: "cat-fan-3",
      title: "Crystal Lake Vows",
      genre: "Fantasy",
      coverGradient: "from-[#22D3EE] via-[#A78BFA] to-[#7C3AED]",
      coverEmoji: "💎",
    }),
    enrich({
      id: "cat-fan-4",
      title: "Whispers of the Forest",
      genre: "Fantasy",
      coverGradient: "from-[#34D399] via-[#4ADE80] to-[#86EFAC]",
      coverEmoji: "🌲",
    }),
  ],
  Drama: [
    enrich({
      id: "cat-dra-1",
      title: "Broken Promises, New Dawn",
      genre: "Drama",
      coverGradient: "from-slate-500 via-gray-400 to-zinc-500",
      coverEmoji: "🌅",
    }),
    enrich({
      id: "cat-dra-2",
      title: "The Last Train Home",
      genre: "Drama",
      coverGradient: "from-stone-400 via-neutral-300 to-gray-400",
      coverEmoji: "🚂",
    }),
    enrich({
      id: "cat-dra-3",
      title: "Second Chance Summer",
      genre: "Drama",
      coverGradient: "from-amber-400 via-yellow-300 to-orange-300",
      coverEmoji: "🌻",
    }),
    enrich({
      id: "cat-dra-4",
      title: "Family Secrets",
      genre: "Drama",
      coverGradient: "from-zinc-400 via-stone-300 to-neutral-400",
      coverEmoji: "🏠",
    }),
  ],
  Spicy: [
    enrich({
      id: "cat-spi-1",
      title: "Midnight Tension",
      genre: "Spicy",
      coverGradient: "from-red-500 via-rose-400 to-pink-500",
      coverEmoji: "🌙",
    }),
    enrich({
      id: "cat-spi-2",
      title: "Velvet Nights",
      genre: "Spicy",
      coverGradient: "from-fuchsia-500 via-pink-400 to-rose-500",
      coverEmoji: "✨",
    }),
    enrich({
      id: "cat-spi-3",
      title: "Close Quarters",
      genre: "Spicy",
      coverGradient: "from-orange-500 via-red-400 to-rose-500",
      coverEmoji: "💫",
    }),
    enrich({
      id: "cat-spi-4",
      title: "Dangerous Attraction",
      genre: "Spicy",
      coverGradient: "from-rose-500 via-red-400 to-orange-400",
      coverEmoji: "🔥",
    }),
  ],
  "Slice of Life": [
    enrich({
      id: "cat-sol-1",
      title: "Sunday Morning Pancakes",
      genre: "Slice of Life",
      coverGradient: "from-yellow-300 via-amber-200 to-orange-200",
      coverEmoji: "🥞",
    }),
    enrich({
      id: "cat-sol-2",
      title: "Neighborhood Book Club",
      genre: "Slice of Life",
      coverGradient: "from-[#7C3AED] via-[#C4B5FD] to-[#E9D8FD]",
      coverEmoji: "📚",
    }),
    enrich({
      id: "cat-sol-3",
      title: "Bike Ride to the Lake",
      genre: "Slice of Life",
      coverGradient: "from-sky-300 via-blue-200 to-cyan-200",
      coverEmoji: "🚲",
    }),
    enrich({
      id: "cat-sol-4",
      title: "Small Town Summer",
      genre: "Slice of Life",
      coverGradient: "from-[#FFD84D] via-[#FBBF24] to-[#FF4FA3]",
      coverEmoji: "🏡",
    }),
  ],
  Comedy: [
    enrich({
      id: "cat-com-1",
      title: "Roommate Roulette",
      genre: "Comedy",
      coverGradient: "from-amber-400 via-yellow-300 to-orange-400",
      coverEmoji: "😂",
    }),
    enrich({
      id: "cat-com-2",
      title: "Cat CEO Chronicles",
      genre: "Comedy",
      coverGradient: "from-[#FFD84D] via-[#FF4FA3] to-[#8B5CF6]",
      coverEmoji: "🐱",
    }),
    enrich({
      id: "cat-com-3",
      title: "Accidental Influencer",
      genre: "Comedy",
      coverGradient: "from-pink-400 via-rose-300 to-fuchsia-400",
      coverEmoji: "📱",
    }),
    enrich({
      id: "cat-com-4",
      title: "The Great Bake Off Fail",
      genre: "Comedy",
      coverGradient: "from-orange-400 via-amber-300 to-yellow-400",
      coverEmoji: "🧁",
    }),
  ],
  Adventure: [
    enrich({
      id: "cat-adv-1",
      title: "Skybound Quest",
      genre: "Adventure",
      coverGradient: "from-[#22D3EE] via-[#38BDF8] to-[#60A5FA]",
      coverEmoji: "⚔️",
    }),
    enrich({
      id: "cat-adv-2",
      title: "Lost City of Jade",
      genre: "Adventure",
      coverGradient: "from-[#34D399] via-[#4ADE80] to-[#86EFAC]",
      coverEmoji: "🗺️",
    }),
    enrich({
      id: "cat-adv-3",
      title: "Pirate Moon Rising",
      genre: "Adventure",
      coverGradient: "from-indigo-500 via-blue-400 to-cyan-400",
      coverEmoji: "🏴‍☠️",
    }),
    enrich({
      id: "cat-adv-4",
      title: "Trail of Starlight",
      genre: "Adventure",
      coverGradient: "from-violet-500 via-purple-400 to-fuchsia-400",
      coverEmoji: "✨",
    }),
  ],
};
