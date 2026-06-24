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
  section: "founders" | "companies" | "drops" | "playbooks";
  stories: MockCatalogStory[];
}

export interface MockPlaybook {
  id: string;
  title: string;
  subtitle: string;
  hook: string;
  chapters: number;
  readMinutes: number;
  sagaLabel: string;
  href: string;
}

export const WEEKLY_HERO: MockCatalogStory = {
  id: "elon-musk",
  title: "Elon Musk",
  subtitle: "The Man Who Refused to Lose",
  hook: "From near-bankruptcy to building Tesla, SpaceX, and one of the most controversial business empires in history.",
  chapters: 30,
  readMinutes: 8,
  sagaLabel: "Founder Saga",
  status: "live",
  badges: ["founder-saga", "trending"],
  weeklyDrop: true,
  featuredHero: true,
  trending: true,
};

export const MOCK_STORY_CATALOG: MockStoryCategory[] = [
  {
    id: "founder-sagas",
    label: "Founder Sagas",
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
        sagaLabel: "Founder Saga",
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
        sagaLabel: "Founder Saga",
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
        sagaLabel: "Founder Saga",
        status: "coming",
        badges: ["founder-saga", "new-drop"],
        weeklyDrop: true,
      },
      {
        id: "soros",
        title: "Soros",
        subtitle: "The Billion-Dollar Bet",
        hook: "How one trader challenged a central bank — and won.",
        chapters: 6,
        readMinutes: 6,
        sagaLabel: "Founder Saga",
        status: "coming",
        badges: ["billion-dollar", "new-drop"],
        weeklyDrop: true,
      },
      {
        id: "ray-kroc",
        title: "Ray Kroc",
        subtitle: "The Real McDonald's",
        hook: "A 52-year-old milkshake salesman scaled the world's biggest restaurant.",
        chapters: 8,
        readMinutes: 7,
        sagaLabel: "Founder Saga",
        status: "coming",
        badges: ["founder-saga"],
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
    id: "weekly-drops",
    label: "Weekly Drops",
    subtitle: "New illustrated chapters released this week.",
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
        sagaLabel: "Book Drop",
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

export const MOCK_PLAYBOOKS: MockPlaybook[] = [
  {
    id: "playbook-steve-jobs",
    title: "The Steve Jobs Product Playbook",
    subtitle: "Design, focus, and the art of saying no",
    hook: "How obsession with product created the most valuable company on Earth.",
    chapters: 5,
    readMinutes: 6,
    sagaLabel: "Playbook",
    href: "/story/steve-jobs",
  },
  {
    id: "playbook-ray-kroc",
    title: "The Ray Kroc Scaling Playbook",
    subtitle: "Systems beat talent every time",
    hook: "How to scale without owning everything — the franchise machine.",
    chapters: 5,
    readMinutes: 6,
    sagaLabel: "Playbook",
    href: "/story/ray-kroc",
  },
  {
    id: "playbook-ferrari",
    title: "The Ferrari Brand Playbook",
    subtitle: "Scarcity, status, and controlled obsession",
    hook: "Why saying no to growth built the world's most desirable brand.",
    chapters: 4,
    readMinutes: 5,
    sagaLabel: "Playbook",
    href: "/story/ferrari",
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

export function getCompanyCategory(): MockStoryCategory {
  return MOCK_STORY_CATALOG.find((c) => c.section === "companies")!;
}

export function findMockStory(id: string): MockCatalogStory | undefined {
  return allMockStories().find((s) => s.id === id);
}
