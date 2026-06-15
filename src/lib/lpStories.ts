import type { Category } from "@/types/story";

export type LPCategory =
  | "Trending"
  | "Romance"
  | "Anime"
  | "Fantasy"
  | "Comedy"
  | "Drama"
  | "Adventure"
  | "Slice of Life";

export const LP_CATEGORIES: LPCategory[] = [
  "Trending",
  "Romance",
  "Anime",
  "Fantasy",
  "Comedy",
  "Drama",
  "Adventure",
  "Slice of Life",
];

export const LP_CATEGORY_META: Record<
  LPCategory,
  { emoji: string; gradient: string }
> = {
  Trending: { emoji: "🔥", gradient: "from-orange-400 via-amber-300 to-yellow-400" },
  Romance: { emoji: "💕", gradient: "from-rose-400 via-pink-300 to-red-400" },
  Anime: { emoji: "🌸", gradient: "from-fuchsia-500 via-pink-400 to-violet-600" },
  Fantasy: { emoji: "🧙", gradient: "from-violet-500 via-purple-400 to-indigo-600" },
  Comedy: { emoji: "😂", gradient: "from-amber-400 via-yellow-300 to-orange-400" },
  Drama: { emoji: "🎭", gradient: "from-slate-500 via-gray-400 to-zinc-600" },
  Adventure: { emoji: "⚔️", gradient: "from-[#22D3EE] via-[#38BDF8] to-[#60A5FA]" },
  "Slice of Life": {
    emoji: "☕",
    gradient: "from-[#FFD84D] via-[#FF4FA3] to-[#8B5CF6]",
  },
};

export function lpCategoryToGenre(category: LPCategory): string | undefined {
  if (category === "Trending") return undefined;
  return category as Category;
}
