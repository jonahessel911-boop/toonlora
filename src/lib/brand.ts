import type { Category } from "@/types/story";

export const BRAND_TAGLINE =
  "Business stories, told like a cinematic series.";
export const BRAND_HEADLINE =
  "Business stories you actually want to binge.";
export const BRAND_SUBHEADLINE =
  "Weekly illustrated chapters about founders, companies, money, failure, and billion-dollar decisions.";
export const CREATOR_CTA =
  "Turn real business stories into illustrated chapters.";
export const CREDIT_COPY =
  "Chapter 1 is free. Creating stories uses credits.";
export const WEEKLY_HEADLINE =
  "New business chapters every week. Follow the sagas of founders, companies, and billion-dollar decisions.";
export const CHAPTER_LABEL = "chapter";
export const CHAPTERS_LABEL = "chapters";
export const SAGA_LABEL = "Saga";

export function formatChapterTitle(n: number): string {
  return `Chapter ${n}`;
}

export function formatChapterShort(n: number): string {
  return `Ch. ${n}`;
}

export const GENRE_COLORS: Record<
  Category | "Spicy" | "default",
  { bg: string; text: string; gradient: string }
> = {
  Romance: {
    bg: "bg-genre-romance",
    text: "text-white",
    gradient: "from-[#FF4FA3] via-[#FF6BB5] to-[#FF8CC8]",
  },
  Anime: {
    bg: "bg-genre-anime",
    text: "text-white",
    gradient: "from-[#8B5CF6] via-[#A78BFA] to-[#C4B5FD]",
  },
  Fantasy: {
    bg: "bg-genre-fantasy",
    text: "text-white",
    gradient: "from-[#5340FF] via-[#6D5BFF] to-[#8B7CFF]",
  },
  Adventure: {
    bg: "bg-genre-adventure",
    text: "text-primary-dark",
    gradient: "from-[#22D3EE] via-[#38BDF8] to-[#60A5FA]",
  },
  Comedy: {
    bg: "bg-genre-comedy",
    text: "text-primary-dark",
    gradient: "from-[#FFD84D] via-[#FBBF24] to-[#FDE68A]",
  },
  Drama: {
    bg: "bg-genre-drama",
    text: "text-white",
    gradient: "from-[#FB7185] via-[#F472B6] to-[#EC4899]",
  },
  "Slice of Life": {
    bg: "bg-genre-slice-of-life",
    text: "text-white",
    gradient: "from-[#34D399] via-[#4ADE80] to-[#86EFAC]",
  },
  Spicy: {
    bg: "bg-accent-pink",
    text: "text-white",
    gradient: "from-[#FF4FA3] via-[#F43F5E] to-[#FB7185]",
  },
  default: {
    bg: "bg-accent",
    text: "text-white",
    gradient: "from-[#0A1628] via-[#1e3a5f] to-[#3B9EFF]",
  },
};

export function getGenreColors(genre: string) {
  return GENRE_COLORS[genre as Category] ?? GENRE_COLORS.default;
}
