import type { MockCatalogStory } from "@/lib/mock/businessStoryCatalog";
import { NAVY_COVER_GRADIENT } from "@/lib/theme/navy";
import type { SeriesDetail, SeriesEpisodeListing } from "@/lib/seriesCatalog";
import { formatCatalogViews } from "@/types/catalog";

const SCHEDULE_BY_ID: Record<string, string> = {
  "elon-musk": "New chapter every Monday",
  "steve-jobs": "New chapter every Wednesday",
  ferrari: "New chapter every Friday",
  "ray-kroc": "New chapter every Tuesday",
  soros: "New chapter every Thursday",
};

const SIMILAR_BY_ID: Record<string, string[]> = {
  "elon-musk": ["steve-jobs", "ferrari", "ray-kroc", "soros"],
  "steve-jobs": ["elon-musk", "ferrari", "ray-kroc", "soros"],
  ferrari: ["elon-musk", "steve-jobs", "porsche", "ray-kroc"],
  "ray-kroc": ["elon-musk", "steve-jobs", "ferrari", "nike"],
  soros: ["elon-musk", "steve-jobs", "black-wednesday", "ferrari"],
};

const PUBLISHED_CHAPTERS: Record<string, number> = {
  "elon-musk": 2,
  "steve-jobs": 1,
  ferrari: 2,
  "ray-kroc": 1,
  soros: 1,
  nike: 2,
  porsche: 2,
};

const CHAPTER_TITLES: Record<string, string[]> = {
  "elon-musk": [
    "The Near-Death Moment",
    "The Impossible Bet",
    "Building the Machine",
    "SpaceX or Die",
    "The Twitter Gamble",
  ],
  "steve-jobs": [
    "Fired at 30",
    "NeXT & Pixar",
    "The Return",
    "Think Different",
  ],
  ferrari: [
    "Born From Rage",
    "The Enzo Doctrine",
    "Scarcity as Strategy",
  ],
  "ray-kroc": [
    "The Milkshake Salesman",
    "The Franchise Playbook",
    "McDonald's Machine",
  ],
  soros: [
    "The Billion-Dollar Bet",
    "Breaking the Bank",
    "Reflexivity",
  ],
};

export function getSagaScheduleLabel(seriesId: string): string {
  return SCHEDULE_BY_ID[seriesId] ?? "New chapter every week";
}

export function getSimilarStoryIds(seriesId: string): string[] {
  return (
    SIMILAR_BY_ID[seriesId] ?? [
      "steve-jobs",
      "ferrari",
      "ray-kroc",
      "soros",
    ]
  );
}

export function getPublishedChapterCount(
  seriesId: string,
  totalChapters: number
): number {
  return PUBLISHED_CHAPTERS[seriesId] ?? Math.min(2, totalChapters);
}

const GENERIC_CHAPTER_TITLE = /^(?:Episode|Chapter)\s+\d+$/i;

export function resolveChapterListTitle(
  seriesId: string,
  chapterNumber: number,
  rawTitle?: string
): string {
  const trimmed = rawTitle?.trim();
  if (!trimmed || GENERIC_CHAPTER_TITLE.test(trimmed)) {
    return getChapterDisplayTitle(seriesId, chapterNumber);
  }

  const stripped = trimmed
    .replace(/^(?:Episode|Chapter)\s+\d+\s*[—–-]\s*/i, "")
    .trim();
  return stripped || getChapterDisplayTitle(seriesId, chapterNumber);
}

export function formatChapterListLabel(
  seriesId: string,
  chapterNumber: number,
  rawTitle?: string
): string {
  const title = resolveChapterListTitle(seriesId, chapterNumber, rawTitle);
  if (GENERIC_CHAPTER_TITLE.test(title)) {
    return title;
  }
  return `Chapter ${chapterNumber} — ${title}`;
}

export function getChapterDisplayTitle(
  seriesId: string,
  chapterNumber: number
): string {
  const titles = CHAPTER_TITLES[seriesId];
  return titles?.[chapterNumber - 1] ?? `Chapter ${chapterNumber}`;
}

export function mockStoryToSeriesDetail(story: MockCatalogStory): SeriesDetail {
  const published = getPublishedChapterCount(story.id, story.chapters);
  const listCount = Math.max(3, Math.min(published + 1, story.chapters));

  const episodes: SeriesEpisodeListing[] = Array.from(
    { length: listCount },
    (_, i) => {
      const number = i + 1;
      return {
        number,
        title: getChapterDisplayTitle(story.id, number),
        date: "",
        likes: 0,
        coverGradient: NAVY_COVER_GRADIENT,
      };
    }
  );

  return {
    id: story.id,
    title: story.title,
    genre: story.sagaLabel,
    coverGradient: NAVY_COVER_GRADIENT,
    creators: ["Toonlora Original"],
    views: story.trending ? "12.4k" : "Soon",
    likes: story.trending ? "890" : "0",
    viewsCount: story.trending ? 12400 : 0,
    likesCount: story.trending ? 890 : 0,
    schedule: getSagaScheduleLabel(story.id),
    synopsis: story.hook,
    episodes,
    source: "admin",
    status: "published",
  };
}

export type ChapterAccessBadge = "free" | "achiever" | "coming";

export function getChapterAccessBadge(
  chapterNumber: number,
  publishedCount: number,
  hasPaidAccess: boolean
): ChapterAccessBadge | null {
  if (chapterNumber === 1) return "free";
  if (chapterNumber > publishedCount) return "coming";
  if (!hasPaidAccess) return "achiever";
  return null;
}

export function chapterBadgeLabel(badge: ChapterAccessBadge): string {
  switch (badge) {
    case "free":
      return "Free";
    case "achiever":
      return "Achiever";
    case "coming":
      return "Coming next week";
  }
}

export function mockStoryMeta(story: MockCatalogStory) {
  return {
    heroTitle: story.title,
    heroSubtitle: story.subtitle,
    sagaLabel: story.sagaLabel.toUpperCase(),
    readMinutes: story.readMinutes,
    totalChapters: story.chapters,
    publishedCount: getPublishedChapterCount(story.id, story.chapters),
    schedule: getSagaScheduleLabel(story.id),
  };
}
