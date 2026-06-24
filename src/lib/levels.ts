export type ReaderRankId =
  | "noob"
  | "beginner"
  | "reader"
  | "story_hunter"
  | "bookworm"
  | "lore_keeper"
  | "secret";

export interface ReaderRank {
  id: ReaderRankId;
  name: string;
  emoji: string;
  requirement: string;
  /** Tailwind text color class */
  colorClass: string;
  /** Tailwind background class for rank badge */
  bgClass: string;
  minEpisodes: number;
  minFullStories: number;
  secret?: boolean;
}

export const READER_RANKS: ReaderRank[] = [
  {
    id: "noob",
    name: "Noob",
    emoji: "👶",
    requirement: "Start",
    colorClass: "text-[#9CA3AF]",
    bgClass: "bg-[#374151]",
    minEpisodes: 0,
    minFullStories: 0,
  },
  {
    id: "beginner",
    name: "Beginner",
    emoji: "📖",
    requirement: "1 chapter",
    colorClass: "text-[#818CF8]",
    bgClass: "bg-[#4338CA]",
    minEpisodes: 1,
    minFullStories: 0,
  },
  {
    id: "reader",
    name: "Reader",
    emoji: "📚",
    requirement: "10 full stories",
    colorClass: "text-[#C4B5FD]",
    bgClass: "bg-[#7C3AED]",
    minEpisodes: 1,
    minFullStories: 10,
  },
  {
    id: "story_hunter",
    name: "Story Hunter",
    emoji: "🔍",
    requirement: "25 full stories",
    colorClass: "text-[#F9A8D4]",
    bgClass: "bg-[#DB2777]",
    minEpisodes: 1,
    minFullStories: 25,
  },
  {
    id: "bookworm",
    name: "Bookworm",
    emoji: "🐛",
    requirement: "50 full stories",
    colorClass: "text-[#FDBA74]",
    bgClass: "bg-[#EA580C]",
    minEpisodes: 1,
    minFullStories: 50,
  },
  {
    id: "lore_keeper",
    name: "Lore Keeper",
    emoji: "🏛️",
    requirement: "100 full stories",
    colorClass: "text-[#FCD34D]",
    bgClass: "bg-[#B45309]",
    minEpisodes: 1,
    minFullStories: 100,
  },
  {
    id: "secret",
    name: "Secret Rank",
    emoji: "👑",
    requirement: "200 full stories",
    colorClass: "text-[#FDE047]",
    bgClass: "bg-gradient-to-br from-[#F59E0B] to-[#EAB308]",
    minEpisodes: 1,
    minFullStories: 200,
    secret: true,
  },
];

export interface ReadingLevelStats {
  episodesCompleted: number;
  fullStoriesRead: number;
}

export function getRankFromStats(stats: ReadingLevelStats): ReaderRank {
  const { episodesCompleted, fullStoriesRead } = stats;

  if (fullStoriesRead >= 200) return READER_RANKS[6];
  if (fullStoriesRead >= 100) return READER_RANKS[5];
  if (fullStoriesRead >= 50) return READER_RANKS[4];
  if (fullStoriesRead >= 25) return READER_RANKS[3];
  if (fullStoriesRead >= 10) return READER_RANKS[2];
  if (episodesCompleted >= 1) return READER_RANKS[1];
  return READER_RANKS[0];
}

export function getNextRank(current: ReaderRank): ReaderRank | null {
  const index = READER_RANKS.findIndex((r) => r.id === current.id);
  if (index < 0 || index >= READER_RANKS.length - 1) return null;
  return READER_RANKS[index + 1];
}

export function getRankProgress(stats: ReadingLevelStats): {
  current: ReaderRank;
  next: ReaderRank | null;
  progress: number;
  label: string;
} {
  const current = getRankFromStats(stats);
  const next = getNextRank(current);

  if (!next) {
    return { current, next: null, progress: 1, label: "Max rank reached" };
  }

  if (next.minFullStories > 0) {
    const prevStories = current.minFullStories;
    const span = next.minFullStories - prevStories;
    const done = stats.fullStoriesRead - prevStories;
    return {
      current,
      next,
      progress: Math.min(1, Math.max(0, done / span)),
      label: `${stats.fullStoriesRead} / ${next.minFullStories} full stories`,
    };
  }

  return {
    current,
    next,
    progress: stats.episodesCompleted >= next.minEpisodes ? 1 : 0,
    label: `${stats.episodesCompleted} / ${next.minEpisodes} chapters`,
  };
}
