import {
  TRENDING_STORIES,
  COMMUNITY_STORIES,
  CATEGORY_STORIES,
  type SampleStory,
} from "@/lib/sampleStories";
import type { Story } from "@/types/story";

export interface SeriesEpisodeListing {
  number: number;
  title: string;
  date: string;
  likes: number;
  coverGradient: string;
  coverEmoji?: string;
}

export interface SeriesDetail {
  id: string;
  title: string;
  genre: string;
  coverGradient: string;
  coverEmoji?: string;
  creators: string[];
  views: string;
  likes: string;
  schedule: string;
  synopsis: string;
  episodes: SeriesEpisodeListing[];
}

const SYNOPSES: Record<string, string> = {
  default:
    "When an ordinary day turns into something magical, two unlikely friends must face a world they never knew existed. Every episode brings new surprises, heartfelt moments, and stunning cartoon art.",
};

const SCHEDULES = [
  "UP EVERY THURSDAY",
  "UP EVERY MONDAY",
  "UP EVERY FRIDAY",
  "NEW EPISODES WEEKLY",
];

function hashId(id: string): number {
  return id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
}

function buildEpisodes(story: SampleStory): SeriesEpisodeListing[] {
  const count = story.episodes ?? 8;
  const h = hashId(story.id);
  const episodes: SeriesEpisodeListing[] = [
    {
      number: 0,
      title: "Prologue",
      date: "May 28, 2026",
      likes: 1200 + (h % 500),
      coverGradient: story.coverGradient,
      coverEmoji: story.coverEmoji,
    },
  ];

  for (let i = 1; i <= Math.min(count, 12); i++) {
    episodes.push({
      number: i,
      title: i === 1 ? "Episode 1" : `Episode ${i}`,
      date: `Jun ${Math.max(1, (i + h) % 28)}, 2026`,
      likes: 800 + ((h + i * 17) % 2000),
      coverGradient: story.coverGradient,
      coverEmoji: story.coverEmoji,
    });
  }

  return episodes;
}

function fromSample(story: SampleStory): SeriesDetail {
  const h = hashId(story.id);
  return {
    id: story.id,
    title: story.title,
    genre: String(story.genre),
    coverGradient: story.coverGradient,
    coverEmoji: story.coverEmoji,
    creators: [story.creator ?? "Studio Toonlora", "Toonlora Originals"].slice(0, 2),
    views: story.readers ?? `${((h % 9) + 1).toFixed(1)}M`,
    likes: story.likes ?? `${((h % 40) + 10) * 1000}`,
    schedule: SCHEDULES[h % SCHEDULES.length],
    synopsis: SYNOPSES[story.id] ?? SYNOPSES.default,
    episodes: buildEpisodes(story),
  };
}

function allSamples(): SampleStory[] {
  const seen = new Set<string>();
  const out: SampleStory[] = [];

  const add = (s: SampleStory) => {
    if (!seen.has(s.id)) {
      seen.add(s.id);
      out.push(s);
    }
  };

  TRENDING_STORIES.forEach(add);
  COMMUNITY_STORIES.forEach(add);
  Object.values(CATEGORY_STORIES)
    .flat()
    .forEach(add);

  return out;
}

const CATALOG = new Map<string, SeriesDetail>(
  allSamples().map((s) => [s.id, fromSample(s)])
);

export function getCatalogSeries(id: string): SeriesDetail | undefined {
  return CATALOG.get(id);
}

export function storyToSeriesDetail(story: Story): SeriesDetail {
  const episodes: SeriesEpisodeListing[] =
    story.episodes?.map((ep) => ({
      number: ep.episodeNumber,
      title: ep.title,
      date: new Date(story.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      likes: 100,
      coverGradient: story.coverGradient,
    })) ?? [
      {
        number: 1,
        title: "Episode 1",
        date: new Date(story.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        likes: 100,
        coverGradient: story.coverGradient,
      },
    ];

  return {
    id: story.id,
    title: story.title,
    genre: String(story.genre),
    coverGradient: story.coverGradient,
    creators: [
      story.mainCharacter ?? "You",
      story.loveInterest,
    ].filter(Boolean) as string[],
    views: "1.2k",
    likes: "89",
    schedule: "YOUR SERIES",
    synopsis:
      story.storyBible?.logline ??
      story.prompt ??
      "Your cartoon story episode.",
    episodes,
  };
}
