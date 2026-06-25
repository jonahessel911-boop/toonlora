import { WEEKLY_HERO } from "@/lib/mock/businessStoryCatalog";

/** Featured hero story — cinematic spotlight on the browse index. */
export const FEATURED_HERO = {
  storyId: WEEKLY_HERO.id,
  eyebrow: "TOONLORA ORIGINAL",
  title: "Against All Odds",
  subtitle: "The year Elon Musk nearly lost Tesla, SpaceX, and everything else.",
  description:
    "A cinematic illustrated series about collapse, obsession, rockets, money, and the final bet that changed everything.",
  sagaLabel: WEEKLY_HERO.sagaLabel,
  chapters: WEEKLY_HERO.chapters,
  readMinutes: WEEKLY_HERO.readMinutes,
  weeklyDrop: true,
  keyArtUrl: "/images/heroes/elon-musk-against-all-odds.png",
};
