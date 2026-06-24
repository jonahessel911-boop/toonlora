import type { SagaBadge } from "@/types/catalog";

export type MockStoryStatus = "live" | "coming" | "ep1_free";

export interface MockCatalogStory {
  id: string;
  title: string;
  subtitle: string;
  hook: string;
  chapters: number;
  readMinutes: number;
  sagaLabel: string;
  status: MockStoryStatus;
  badges?: SagaBadge[];
  weeklyDrop?: boolean;
  featuredHero?: boolean;
  trending?: boolean;
}

export interface MockStoryCategory {
  id: string;
  label: string;
  subtitle: string;
  section: "founders" | "companies" | "drops" | "rise-fall" | "empires" | "heists";
  stories: MockCatalogStory[];
}

export const WEEKLY_HERO: MockCatalogStory = {
  id: "elon-musk",
  title: "Elon Musk",
  subtitle: "The Man Who Refused to Lose",
  hook: "From near-bankruptcy to building Tesla, SpaceX, and one of the most controversial business empires in history.",
  chapters: 30,
  readMinutes: 8,
  sagaLabel: "Founder Story",
  status: "live",
  badges: ["founder-saga", "trending"],
  weeklyDrop: true,
  featuredHero: true,
  trending: true,
};

export const MOCK_STORY_CATALOG: MockStoryCategory[] = [
  {
    id: "founder-stories",
    label: "Founder Stories",
    subtitle:
      "The ambition, obsession, failures, and decisions behind the world's most famous entrepreneurs.",
    section: "founders",
    stories: [
      WEEKLY_HERO,
      {
        id: "ferrari",
        title: "Ferrari",
        subtitle: "Built on Rage",
        hook: "The obsession, betrayal, and speed behind an empire.",
        chapters: 10,
        readMinutes: 7,
        sagaLabel: "Founder Story",
        status: "live",
        badges: ["founder-saga", "trending"],
        trending: true,
      },
      {
        id: "porsche",
        title: "Ferdinand Porsche",
        subtitle: "The Man Who Invented Speed",
        hook: "No diploma, no money — built the world's most iconic car brand.",
        chapters: 10,
        readMinutes: 7,
        sagaLabel: "Founder Story",
        status: "live",
        badges: ["founder-saga"],
      },
      {
        id: "steve-jobs",
        title: "Steve Jobs",
        subtitle: "The Return",
        hook: "Fired from Apple, came back and built a trillion-dollar company.",
        chapters: 12,
        readMinutes: 8,
        sagaLabel: "Founder Story",
        status: "coming",
        badges: ["founder-saga", "new-drop"],
        weeklyDrop: true,
      },
      {
        id: "ray-kroc",
        title: "Ray Kroc",
        subtitle: "The Real McDonald's",
        hook: "A 52-year-old milkshake salesman scaled the world's biggest restaurant.",
        chapters: 8,
        readMinutes: 7,
        sagaLabel: "Founder Story",
        status: "coming",
        badges: ["founder-saga"],
      },
    ],
  },
  {
    id: "rise-and-fall",
    label: "Rise & Fall",
    subtitle: "The climb to the top — and the crash that followed.",
    section: "rise-fall",
    stories: [
      {
        id: "blockbuster",
        title: "Blockbuster",
        subtitle: "The $50M Mistake",
        hook: "They could have bought Netflix. They laughed instead.",
        chapters: 6,
        readMinutes: 6,
        sagaLabel: "Rise & Fall",
        status: "live",
        badges: ["company", "trending"],
        trending: true,
      },
      {
        id: "wework",
        title: "WeWork",
        subtitle: "The $47B Lie",
        hook: "Adam Neumann convinced the world a co-working space was worth billions.",
        chapters: 8,
        readMinutes: 7,
        sagaLabel: "Rise & Fall",
        status: "coming",
        badges: ["billion-dollar"],
      },
      {
        id: "enron",
        title: "Enron",
        subtitle: "The Smartest Guys in the Room",
        hook: "The biggest corporate fraud in American history.",
        chapters: 8,
        readMinutes: 7,
        sagaLabel: "Rise & Fall",
        status: "coming",
        badges: ["billion-dollar"],
      },
    ],
  },
  {
    id: "empires",
    label: "Empires",
    subtitle: "How the biggest brands on Earth were built — and kept.",
    section: "empires",
    stories: [
      {
        id: "amazon",
        title: "Amazon",
        subtitle: "The Everything Store",
        hook: "From garage bookshop to the most valuable company in history.",
        chapters: 12,
        readMinutes: 8,
        sagaLabel: "Empire",
        status: "coming",
        badges: ["company", "new-drop"],
      },
      {
        id: "nike",
        title: "Nike",
        subtitle: "Just Don't Quit",
        hook: "Three near-bankruptcies. Still became the biggest sports brand on Earth.",
        chapters: 8,
        readMinutes: 7,
        sagaLabel: "Empire",
        status: "live",
        badges: ["company", "trending"],
        trending: true,
      },
      {
        id: "red-bull",
        title: "Red Bull",
        subtitle: "Stolen Wings",
        hook: "A Thai truck driver invented it. An Austrian stole it and became a billionaire.",
        chapters: 6,
        readMinutes: 6,
        sagaLabel: "Empire",
        status: "coming",
        badges: ["company"],
      },
    ],
  },
  {
    id: "heists-and-frauds",
    label: "Heists & Frauds",
    subtitle: "Billion-dollar bets, scams, and the people who got away with it.",
    section: "heists",
    stories: [
      {
        id: "soros",
        title: "Soros",
        subtitle: "The Billion-Dollar Bet",
        hook: "How one trader challenged a central bank — and won.",
        chapters: 6,
        readMinutes: 6,
        sagaLabel: "Heist & Fraud",
        status: "coming",
        badges: ["billion-dollar", "new-drop"],
        weeklyDrop: true,
      },
      {
        id: "black-wednesday",
        title: "Black Wednesday",
        subtitle: "Soros vs Britain",
        hook: "One man made $1B in a single day by breaking the British pound.",
        chapters: 4,
        readMinutes: 5,
        sagaLabel: "Heist & Fraud",
        status: "coming",
        badges: ["new-drop", "billion-dollar"],
        weeklyDrop: true,
      },
      {
        id: "tulip-mania",
        title: "Tulip Mania",
        subtitle: "The First Bubble",
        hook: "In 1637, the Dutch paid a house price for one tulip bulb.",
        chapters: 4,
        readMinutes: 5,
        sagaLabel: "Heist & Fraud",
        status: "coming",
        badges: ["new-drop"],
        weeklyDrop: true,
      },
    ],
  },
  {
    id: "company-breakdowns",
    label: "Company Breakdowns",
    subtitle:
      "How legendary companies were built, scaled, and sometimes destroyed.",
    section: "companies",
    stories: [
      {
        id: "nike",
        title: "Nike",
        subtitle: "Just Don't Quit",
        hook: "Three near-bankruptcies. Still became the biggest sports brand on Earth.",
        chapters: 8,
        readMinutes: 7,
        sagaLabel: "Company Breakdown",
        status: "live",
        badges: ["company", "trending"],
        trending: true,
      },
      {
        id: "amazon",
        title: "Amazon",
        subtitle: "The Everything Store",
        hook: "From garage bookshop to the most valuable company in history.",
        chapters: 12,
        readMinutes: 8,
        sagaLabel: "Company Breakdown",
        status: "coming",
        badges: ["company", "new-drop"],
      },
      {
        id: "red-bull",
        title: "Red Bull",
        subtitle: "Stolen Wings",
        hook: "A Thai truck driver invented it. An Austrian stole it and became a billionaire.",
        chapters: 6,
        readMinutes: 6,
        sagaLabel: "Company Breakdown",
        status: "coming",
        badges: ["company"],
      },
      {
        id: "blockbuster",
        title: "Blockbuster",
        subtitle: "The $50M Mistake",
        hook: "They could have bought Netflix. They laughed instead.",
        chapters: 6,
        readMinutes: 6,
        sagaLabel: "Company Breakdown",
        status: "live",
        badges: ["company", "trending"],
        trending: true,
      },
      {
        id: "wework",
        title: "WeWork",
        subtitle: "The $47B Lie",
        hook: "Adam Neumann convinced the world a co-working space was worth billions.",
        chapters: 8,
        readMinutes: 7,
        sagaLabel: "Company Breakdown",
        status: "coming",
        badges: ["billion-dollar"],
      },
      {
        id: "enron",
        title: "Enron",
        subtitle: "The Smartest Guys in the Room",
        hook: "The biggest corporate fraud in American history.",
        chapters: 8,
        readMinutes: 7,
        sagaLabel: "Company Breakdown",
        status: "coming",
        badges: ["billion-dollar"],
      },
    ],
  },
  {
    id: "history-drop",
    label: "History Drop",
    subtitle: "Pivotal moments in business history — illustrated chapter by chapter.",
    section: "drops",
    stories: [
      {
        id: "black-wednesday",
        title: "Black Wednesday",
        subtitle: "Soros vs Britain",
        hook: "One man made $1B in a single day by breaking the British pound.",
        chapters: 4,
        readMinutes: 5,
        sagaLabel: "History Drop",
        status: "coming",
        badges: ["new-drop", "billion-dollar"],
        weeklyDrop: true,
      },
      {
        id: "shoe-dog",
        title: "Shoe Dog",
        subtitle: "Phil Knight's Memoir",
        hook: "The Nike founder's story. Raw, honest, and brutal.",
        chapters: 10,
        readMinutes: 8,
        sagaLabel: "History Drop",
        status: "ep1_free",
        badges: ["new-drop"],
        weeklyDrop: true,
      },
      {
        id: "tulip-mania",
        title: "Tulip Mania",
        subtitle: "The First Bubble",
        hook: "In 1637, the Dutch paid a house price for one tulip bulb.",
        chapters: 4,
        readMinutes: 5,
        sagaLabel: "History Drop",
        status: "coming",
        badges: ["new-drop"],
        weeklyDrop: true,
      },
    ],
  },
];

export function allMockStories(): MockCatalogStory[] {
  return MOCK_STORY_CATALOG.flatMap((c) => c.stories);
}

export function getTrendingMockStories(): MockCatalogStory[] {
  return allMockStories().filter((s) => s.trending);
}

export function getWeeklyDropStories(): MockCatalogStory[] {
  return allMockStories().filter((s) => s.weeklyDrop);
}

export function getFounderCategory(): MockStoryCategory {
  return MOCK_STORY_CATALOG.find((c) => c.section === "founders")!;
}

export function getRiseAndFallCategory(): MockStoryCategory {
  return MOCK_STORY_CATALOG.find((c) => c.id === "rise-and-fall")!;
}

export function getEmpiresCategory(): MockStoryCategory {
  return MOCK_STORY_CATALOG.find((c) => c.id === "empires")!;
}

export function getHeistsAndFraudsCategory(): MockStoryCategory {
  return MOCK_STORY_CATALOG.find((c) => c.id === "heists-and-frauds")!;
}

export function getCompanyCategory(): MockStoryCategory {
  return MOCK_STORY_CATALOG.find((c) => c.id === "company-breakdowns")!;
}

export function getHistoryDropCategory(): MockStoryCategory {
  return MOCK_STORY_CATALOG.find((c) => c.id === "history-drop")!;
}

export function getCategoryById(id: string): MockStoryCategory | undefined {
  return MOCK_STORY_CATALOG.find((c) => c.id === id);
}

export function findMockStory(id: string): MockCatalogStory | undefined {
  return allMockStories().find((s) => s.id === id);
}
