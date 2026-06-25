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

const CHAPTER_DESCRIPTIONS: Record<string, string[]> = {
  "elon-musk": [
    "Christmas Eve 2008. Tesla is bleeding cash and SpaceX has failed three times. Musk faces personal bankruptcy.",
    "With one rocket left, Musk bets everything on a fourth launch that will either save SpaceX or end it forever.",
    "Tesla nearly dies again as production hell and investor pressure push the company to the edge.",
    "SpaceX must prove reusable rockets work — or the entire space industry writes them off.",
    "Musk buys Twitter in a move that shocks Wall Street and rewrites his public narrative overnight.",
  ],
  "steve-jobs": [
    "At 30, Jobs is ousted from the company he built. What he does next will define modern computing.",
    "NeXT struggles while Pixar quietly becomes the most important bet of Jobs' exile years.",
    "Apple is dying. The board turns to the founder they once fired.",
    "The iMac, iPod, and iPhone — how Jobs turned Apple into the most valuable company on earth.",
  ],
  ferrari: [
    "Enzo Ferrari's rage at Fiat births a racing empire built on obsession, not compromise.",
    "Ferrari limits production on purpose — scarcity becomes the product.",
    "How a small Italian marque became the ultimate luxury status symbol.",
  ],
  "ray-kroc": [
    "A 52-year-old milkshake machine salesman discovers a revolutionary restaurant in San Bernardino.",
    "Kroc doesn't invent McDonald's — he builds the franchise machine that conquers the world.",
    "Systems, consistency, and real estate: the playbook behind the golden arches.",
  ],
  soros: [
    "George Soros sizes the biggest macro bet of his career against the British pound.",
    "Black Wednesday: how one trader broke the Bank of England and made a billion dollars.",
    "Reflexivity — Soros's theory that market perception shapes the reality it observes.",
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

export function getChapterDescription(
  seriesId: string,
  chapterNumber: number,
  seriesTitle?: string
): string {
  const descriptions = CHAPTER_DESCRIPTIONS[seriesId];
  if (descriptions?.[chapterNumber - 1]) {
    return descriptions[chapterNumber - 1];
  }
  const title = getChapterDisplayTitle(seriesId, chapterNumber);
  const name = seriesTitle ?? "this saga";
  return `${title} — a pivotal chapter in the ${name} story.`;
}

export function buildFullEpisodeList(
  seriesId: string,
  totalChapters: number,
  existing: SeriesEpisodeListing[],
  coverArtUrl?: string,
  coverGradient?: string
): SeriesEpisodeListing[] {
  const byNumber = new Map(existing.map((ep) => [ep.number, ep]));
  return Array.from({ length: totalChapters }, (_, i) => {
    const number = i + 1;
    const found = byNumber.get(number);
    if (found) return found;
    return {
      number,
      title: getChapterDisplayTitle(seriesId, number),
      date: "",
      likes: 0,
      coverGradient: coverGradient ?? NAVY_COVER_GRADIENT,
      coverArtUrl,
    };
  });
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
        coverArtUrl: story.coverArtUrl,
      };
    }
  );

  return {
    id: story.id,
    title: story.title,
    genre: story.sagaLabel,
    coverGradient: NAVY_COVER_GRADIENT,
    coverArtUrl: story.coverArtUrl,
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
