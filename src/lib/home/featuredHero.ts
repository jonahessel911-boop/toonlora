/** Curated hero spotlight on the browse index. */
export const FEATURED_HERO = {
  /** Fallback id when the series is not yet in the catalog. */
  storyId: "voc",
  storyMatch: /voc|east india|verenigde oost|oost-ind/i,
  eyebrow: "THIS WEEK'S DROP",
  /** Full title for list / SEO */
  title: "The Biggest Company That Ever Existed",
  /** Two-line hero headline — reads better than one giant uppercase block */
  headline: ["The Biggest Company", "That Ever Existed"] as const,
  subtitle: "The true story of the Dutch East India Company.",
  description:
    "Before Wall Street — one flag ruled the Indian Ocean. Spices worth more than gold. Shareholders who demanded blood for dividends.",
  sagaLabel: "Empire",
  chapters: 6,
  readMinutes: 8,
  weeklyDrop: true,
  keyArtUrl: "/images/heroes/voc-empire.png",
};
