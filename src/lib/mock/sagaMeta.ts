import {
  allMockStories,
  type MockCatalogStory,
} from "@/lib/mock/businessStoryCatalog";
import { formatCatalogCategoryLabel } from "@/lib/catalogCategoryLabel";
import { resolveCompanyName, resolveFounderName } from "@/lib/founderStoryTitle";

export interface BusinessCaseFile {
  founder: string;
  company: string;
  industry: string;
  sagaLabel: string;
  subtitle: string;
  lessons: string[];
  chapterCount: number;
  readMinutes: number;
}

const LESSONS_BY_ID: Record<string, string[]> = {
  "elon-musk": [
    "Why extreme risk creates extreme upside",
    "How narrative attracts capital",
    "Why speed beats perfection",
  ],
  "ray-kroc": [
    "How to scale without owning everything",
    "Why systems beat talent",
    "How franchising created a global machine",
  ],
  ferrari: [
    "Scarcity builds desire",
    "Brand obsession beats short-term growth",
    "Rage can fuel a legacy empire",
  ],
  soros: [
    "Conviction sizing wins macro bets",
    "Central banks have structural weaknesses",
    "Timing matters as much as thesis",
  ],
};

export const FOUNDER_NAME_BY_ID: Record<string, string> = {
  "elon-musk": "Elon Musk",
  ferrari: "Enzo Ferrari",
  porsche: "Ferdinand Porsche",
  "steve-jobs": "Steve Jobs",
  soros: "George Soros",
  "ray-kroc": "Ray Kroc",
  nike: "Phil Knight & Bill Bowerman",
  amazon: "Jeff Bezos",
  "red-bull": "Dietrich Mateschitz",
  blockbuster: "John Antioco",
  wework: "Adam Neumann",
  enron: "Ken Lay & Jeffrey Skilling",
  "bernie-madoff": "Bernie Madoff",
  "amancio-ortega": "Amancio Ortega",
  "phil-knight": "Phil Knight",
};

export const COMPANY_NAME_BY_ID: Record<string, string> = {
  "elon-musk": "Tesla · SpaceX · X",
  ferrari: "Ferrari",
  porsche: "Porsche",
  "steve-jobs": "Apple · NeXT · Pixar",
  soros: "Quantum Fund",
  "ray-kroc": "McDonald's",
  nike: "Nike",
  amazon: "Amazon",
  "red-bull": "Red Bull",
  blockbuster: "Blockbuster",
  wework: "WeWork",
  enron: "Enron",
  voc: "VOC",
  "de-voc": "VOC",
  nokia: "Nokia",
  "toys-r-us": "Toys 'R' Us",
  "lehman-brothers": "Lehman Brothers",
  "bernie-madoff": "Madoff Securities",
  "amancio-ortega": "Zara",
  "phil-knight": "Nike",
  "shoe-dog": "Nike",
};

const INDUSTRY_MAP: Record<string, string> = {
  "elon-musk": "Automotive · Aerospace · Media",
  ferrari: "Luxury Automotive",
  porsche: "Automotive",
  "steve-jobs": "Consumer Technology",
  soros: "Finance · Macro Trading",
  "ray-kroc": "Quick Service Restaurants",
  nike: "Sportswear",
  amazon: "E-commerce · Cloud",
  "red-bull": "Consumer Beverages",
  blockbuster: "Video Rental",
  wework: "Commercial Real Estate",
  enron: "Energy Trading",
};

function mockToCaseFile(story: MockCatalogStory): BusinessCaseFile {
  return {
    founder: FOUNDER_NAME_BY_ID[story.id] ?? story.title,
    company: COMPANY_NAME_BY_ID[story.id] ?? story.title,
    industry: INDUSTRY_MAP[story.id] ?? "Business",
    sagaLabel: story.sagaLabel,
    subtitle: story.subtitle,
    lessons:
      LESSONS_BY_ID[story.id] ?? [
        "Strategy beats hype in the long run",
        "Founder decisions shape company destiny",
        "Every empire has a turning point",
      ],
    chapterCount: story.chapters,
    readMinutes: story.readMinutes,
  };
}

const MOCK_LOOKUP = new Map(
  allMockStories().map((s) => [s.id, mockToCaseFile(s)])
);

export function parseSagaTitle(title: string): { name: string; subtitle: string } {
  const dash = title.match(/^(.+?)\s*[—–-]\s*(.+)$/);
  if (dash) return { name: dash[1].trim(), subtitle: dash[2].trim() };
  const colon = title.match(/^(.+?):\s*(.+)$/);
  if (colon) return { name: colon[1].trim(), subtitle: colon[2].trim() };
  return { name: title, subtitle: "" };
}

export function getBusinessCaseFile(
  seriesId: string,
  fallback: {
    title: string;
    genre: string;
    synopsis: string;
    chapterCount: number;
    topic?: string;
    slug?: string;
    category?: string;
    mainCharacter?: string | null;
    researchTopic?: string;
    researchCharacters?: Array<{ name: string; role: string }>;
  }
): BusinessCaseFile {
  const mock = MOCK_LOOKUP.get(seriesId);
  if (mock) return mock;

  const { subtitle } = parseSagaTitle(fallback.title);
  const founder =
    resolveFounderName({
      storyId: seriesId,
      title: fallback.title,
      mainCharacter: fallback.mainCharacter,
      researchCharacters: fallback.researchCharacters,
    }) ?? parseSagaTitle(fallback.title).name;

  const company = resolveCompanyName({
    storyId: seriesId,
    title: fallback.title,
    topic: fallback.topic,
    slug: fallback.slug,
    category: fallback.category ?? fallback.genre,
    mainCharacter: fallback.mainCharacter,
    researchTopic: fallback.researchTopic,
    researchCharacters: fallback.researchCharacters,
  });

  return {
    founder,
    company,
    industry: fallback.genre,
    sagaLabel: formatCatalogCategoryLabel(fallback.category ?? fallback.genre),
    subtitle: subtitle || fallback.synopsis.slice(0, 80),
    lessons: [
      "Strategy beats hype in the long run",
      "Founder decisions shape company destiny",
      "Every empire has a turning point",
    ],
    chapterCount: fallback.chapterCount,
    readMinutes: 8,
  };
}
