import {
  ACHIEVER_PLAN,
  formatEur,
} from "@/lib/payments/subscription-plans";
import type { MockCatalogStory } from "@/lib/mock/businessStoryCatalog";
import {
  allMockStories,
  getRiseAndFallCategory,
} from "@/lib/mock/businessStoryCatalog";

export const NETFLIX_HOME_FAQ = [
  {
    question: "What can I read on Toonlora?",
    answer:
      "Illustrated business stories about founders, empires, rise-and-fall scandals, heists, and billion-dollar decisions — told like a cinematic cartoon series. New chapters drop every week.",
  },
  {
    question: "What is Toonlora?",
    answer:
      "Toonlora is a weekly reading platform for in-depth business history in comic format. Chapter 1 is free on every story. Create an account for one extra chapter per week, or subscribe for unlimited reading.",
  },
  {
    question: "How much does Toonlora cost?",
    answer: `Chapter 1 is free. Free accounts get 1 extra chapter per week. Achiever is ${formatEur(ACHIEVER_PLAN.amountCents)}/month for unlimited chapters on the public schedule. Cancel anytime.`,
  },
  {
    question: "Where can I read?",
    answer:
      "Read in your browser on phone, tablet, or desktop. Your library and reading progress sync when you're signed in.",
  },
  {
    question: "How do I cancel?",
    answer:
      "Cancel your subscription anytime from your profile. No cancellation fees — your access continues until the end of your billing period.",
  },
  {
    question: "Is chapter 1 really free?",
    answer:
      "Yes. Every story opens with a free chapter preview — no account required. Sign up to unlock one additional chapter per week across the catalog.",
  },
] as const;

export const NETFLIX_HOME_FEATURES = [
  {
    title: "Read on any screen",
    description:
      "Phone, tablet, or desktop — binge business stories wherever you are.",
    icon: "tv",
  },
  {
    title: "A new chapter every week",
    description:
      "Founder sagas, empire breakdowns, and rise-and-fall stories on a weekly release schedule.",
    icon: "calendar",
  },
  {
    title: "Pick up where you left off",
    description:
      "Your library and reading progress follow you across devices when you're signed in.",
    icon: "devices",
  },
  {
    title: "Start free, upgrade anytime",
    description:
      "Chapter 1 is free on every story. One extra chapter per week after signup, or go unlimited with Achiever.",
    icon: "spark",
  },
] as const;

/** Stories for the hero mosaic — prefer covers, fill with catalog titles. */
export function getHeroPosterTiles(): MockCatalogStory[] {
  const riseFall = getRiseAndFallCategory().stories;
  const rest = allMockStories().filter(
    (s) => !riseFall.some((r) => r.id === s.id)
  );
  const merged = [...riseFall, ...rest];
  const tiles: MockCatalogStory[] = [];
  while (tiles.length < 36) {
    tiles.push(...merged);
  }
  return tiles.slice(0, 36);
}

/** Trending rail — covers first, then other trending titles. */
export function getTrendingLandingStories(): MockCatalogStory[] {
  const riseFall = getRiseAndFallCategory().stories;
  const trending = allMockStories().filter((s) => s.trending);
  const withCover = [...riseFall, ...trending.filter((s) => s.coverArtUrl)];
  const seen = new Set<string>();
  const ordered: MockCatalogStory[] = [];
  for (const story of [...withCover, ...trending, ...allMockStories()]) {
    if (seen.has(story.id)) continue;
    seen.add(story.id);
    ordered.push(story);
    if (ordered.length >= 10) break;
  }
  return ordered;
}
