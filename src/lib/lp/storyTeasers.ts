import { allMockStories } from "@/lib/mock/businessStoryCatalog";
import { normalizeCoverTitleSlug } from "@/lib/lp3/coverTitleParam";

export interface LpStoryTeaser {
  category: string;
  hook: string;
  description: string;
}

/** Canonical story id → cinematic lander intro copy (LP/3, LP/5, etc.). */
export const LP_STORY_TEASERS: Record<string, LpStoryTeaser> = {
  "ray-kroc": {
    category: "Founder Story",
    hook: "He didn't build McDonald's. He took it.",
    description:
      "Read the story of Ray Kroc, the brothers he outplayed, and the deal that changed fast food forever.",
  },
  wework: {
    category: "Rise & Fall",
    hook: "The $47B dream that collapsed in public.",
    description:
      "Read how WeWork turned office space into a global fantasy — until the numbers stopped making sense.",
  },
  "toys-r-us": {
    category: "Rise & Fall",
    hook: "The toy empire that went bankrupt twice.",
    description:
      "Read how one of the world's most famous retail brands lost the future it helped create.",
  },
  nokia: {
    category: "Business Mistake",
    hook: "They chose Windows. The world chose iPhone.",
    description:
      "Read how Nokia went from mobile king to a warning story about missing the future.",
  },
  theranos: {
    category: "Fraud Story",
    hook: "One drop of blood. One billion-dollar lie.",
    description:
      "Read how Theranos sold Silicon Valley a medical revolution that never worked.",
  },
  "lehman-brothers": {
    category: "Collapse Story",
    hook: "The weekend Wall Street died.",
    description:
      "Read how one bank's collapse triggered panic across the global financial system.",
  },
  "bernie-madoff": {
    category: "Heist & Fraud",
    hook: "The most trusted man in finance was running the biggest lie.",
    description:
      "Read how Bernie Madoff fooled investors, regulators, and Wall Street for decades.",
  },
  "steve-jobs": {
    category: "Founder Story",
    hook: "Apple fired him. Then begged him to return.",
    description:
      "Read how Steve Jobs lost his company, rebuilt himself, and changed technology forever.",
  },
  voc: {
    category: "Empire Story",
    hook: "The company that conquered half the world.",
    description:
      "Read how the VOC became one of history's most powerful business empires.",
  },
  "de-voc": {
    category: "Empire Story",
    hook: "The company that conquered half the world.",
    description:
      "Read how the VOC became one of history's most powerful business empires.",
  },
  "amancio-ortega": {
    category: "Founder Story",
    hook: "The quiet billionaire who changed fashion forever.",
    description:
      "Read how Amancio Ortega built Zara into a global machine by moving faster than everyone else.",
  },
  zara: {
    category: "Founder Story",
    hook: "The quiet billionaire who changed fashion forever.",
    description:
      "Read how Amancio Ortega built Zara into a global machine by moving faster than everyone else.",
  },
  rockefeller: {
    category: "Empire Story",
    hook: "The man who built an empire too powerful to ignore.",
    description:
      "Read how Rockefeller turned oil into one of the most dominant monopolies in history.",
  },
  porsche: {
    category: "Founder Story",
    hook: "The engineer who sold his soul for speed.",
    description:
      "Read how Porsche's pursuit of perfection became tangled with power, war, and ambition.",
  },
  "elon-musk": {
    category: "Founder Story",
    hook: "He bet everything on rockets no one thought would fly.",
    description:
      "Read how Elon Musk turned near-bankruptcy into Tesla, SpaceX, and one of the most controversial empires alive.",
  },
  ferrari: {
    category: "Founder Story",
    hook: "He built an empire on rage, rivalry, and red paint.",
    description:
      "Read how Enzo Ferrari turned obsession into the most coveted car brand on earth.",
  },
  blockbuster: {
    category: "Rise & Fall",
    hook: "They laughed at Netflix. Then the stores went dark.",
    description:
      "Read how Blockbuster had the future in its hands — and chose the wrong door.",
  },
  enron: {
    category: "Fraud Story",
    hook: "America's most innovative company was a house of cards.",
    description:
      "Read how Enron dazzled Wall Street with growth that was never real.",
  },
  amazon: {
    category: "Empire Story",
    hook: "He started in a garage. He ended up owning the supply chain.",
    description:
      "Read how Jeff Bezos built Amazon by betting on speed, scale, and customer obsession.",
  },
  nike: {
    category: "Founder Story",
    hook: "They sold shoes out of a car trunk. Then they changed sport forever.",
    description:
      "Read how Nike was built on a waffle iron, a handshake, and ruthless ambition.",
  },
  "shoe-dog": {
    category: "Founder Story",
    hook: "They sold shoes out of a car trunk. Then they changed sport forever.",
    description:
      "Read how Phil Knight built Nike on risk, rejection, and one iconic swoosh.",
  },
  "red-bull": {
    category: "Founder Story",
    hook: "He didn't invent energy drinks. He invented a new category.",
    description:
      "Read how Red Bull turned a tired beverage into a global media and sports machine.",
  },
  soros: {
    category: "Heist & Fraud",
    hook: "One trade broke the Bank of England.",
    description:
      "Read how George Soros made a billion-dollar bet on the day Britain's currency cracked.",
  },
  "black-wednesday": {
    category: "Heist & Fraud",
    hook: "One trade broke the Bank of England.",
    description:
      "Read how a single macro bet shattered a nation's currency in a single afternoon.",
  },
  "tulip-mania": {
    category: "Collapse Story",
    hook: "The first bubble. The wildest crash.",
    description:
      "Read how tulip fever turned flowers into fortunes — and then into ruin.",
  },
};

const LP_STORY_TEASER_ALIASES: Record<string, string> = {
  raykroc: "ray-kroc",
  "ray-kroc": "ray-kroc",
  mcdonalds: "ray-kroc",
  mcdonald: "ray-kroc",
  wework: "wework",
  toysrus: "toys-r-us",
  "toys-r-us": "toys-r-us",
  lehman: "lehman-brothers",
  "lehman-brothers": "lehman-brothers",
  madoff: "bernie-madoff",
  "bernie-madoff": "bernie-madoff",
  jobs: "steve-jobs",
  "steve-jobs": "steve-jobs",
  apple: "steve-jobs",
  ortega: "amancio-ortega",
  "amancio-ortega": "amancio-ortega",
  zara: "zara",
  "elon-musk": "elon-musk",
  elon: "elon-musk",
  musk: "elon-musk",
  enzo: "ferrari",
  ferrari: "ferrari",
  theranos: "theranos",
  holmes: "theranos",
  nokia: "nokia",
  voc: "voc",
  "de-voc": "de-voc",
  rockefeller: "rockefeller",
  porsche: "porsche",
};

const MOCK_BY_ID = new Map(allMockStories().map((s) => [s.id, s]));

const GENERIC_FALLBACK: LpStoryTeaser = {
  category: "Business Story",
  hook: "The story the headlines never told.",
  description:
    "Read a cinematic deep-dive into the decisions, egos, and bets that built and broke an empire.",
};

function resolveTeaserId(storyId: string, coverTitle?: string | null): string {
  const fromStory = normalizeCoverTitleSlug(storyId);
  if (LP_STORY_TEASERS[fromStory]) return fromStory;

  if (coverTitle?.trim()) {
    const slug = normalizeCoverTitleSlug(coverTitle);
    if (LP_STORY_TEASER_ALIASES[slug]) return LP_STORY_TEASER_ALIASES[slug];
    if (LP_STORY_TEASERS[slug]) return slug;
    const compact = slug.replace(/-/g, "");
    if (LP_STORY_TEASER_ALIASES[compact]) return LP_STORY_TEASER_ALIASES[compact];
  }

  if (LP_STORY_TEASER_ALIASES[fromStory]) return LP_STORY_TEASER_ALIASES[fromStory];
  return fromStory;
}

function mockCatalogFallback(storyId: string): LpStoryTeaser | null {
  const story = MOCK_BY_ID.get(storyId);
  if (!story) return null;

  const hookBody = story.hook.charAt(0).toLowerCase() + story.hook.slice(1);
  const description = story.hook.match(/^(read|how|from|why|the)\b/i)
    ? `Read ${hookBody}`
    : `Read the story behind ${story.title} — ${hookBody}`;

  return {
    category: story.sagaLabel,
    hook: story.subtitle,
    description,
  };
}

export function resolveStoryIdFromCoverTitle(
  coverTitle: string | null | undefined
): string | undefined {
  if (!coverTitle?.trim()) return undefined;
  const teaserId = resolveTeaserId("", coverTitle);
  if (LP_STORY_TEASERS[teaserId] || MOCK_BY_ID.has(teaserId)) {
    return teaserId;
  }
  return undefined;
}

export function resolveStoryTeaser(
  storyId: string,
  coverTitle?: string | null
): LpStoryTeaser {
  const teaserId = resolveTeaserId(storyId, coverTitle);
  const explicit = LP_STORY_TEASERS[teaserId];
  if (explicit) return explicit;

  const fromCatalog =
    mockCatalogFallback(storyId) ?? mockCatalogFallback(teaserId);
  if (fromCatalog) return fromCatalog;

  return GENERIC_FALLBACK;
}
