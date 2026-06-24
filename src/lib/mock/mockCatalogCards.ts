import type { CatalogSeries } from "@/types/catalog";
import { NAVY_COVER_GRADIENT } from "@/lib/theme/navy";
import type {
  MockCatalogStory,
  MockStoryCategory,
} from "./businessStoryCatalog";

export function mockStoryToCatalogSeries(
  story: MockCatalogStory,
  category?: MockStoryCategory
): CatalogSeries {
  const displayTitle = story.title;

  return {
    id: story.id,
    title: displayTitle,
    genre: story.sagaLabel,
    coverGradient: NAVY_COVER_GRADIENT,
    source: "admin",
    status: "published",
    creatorDisplayName: "Toonlora Original",
    synopsis: story.hook,
    episodeCount: story.chapters,
    viewsCount: story.trending ? 12400 : 0,
    likesCount: 0,
    featuredRank: story.featuredHero ? 1 : null,
    publishedAt: null,
    createdAt: new Date().toISOString(),
    isNew: story.badges?.includes("new-drop") ?? false,
    href: `/story/${story.id}`,
    readers: story.status === "live" ? "12.4k" : story.status === "ep1_free" ? "Free ch. 1" : "Soon",
    likes: story.trending ? "890" : "0",
    episodes: story.chapters,
    creator: "Toonlora Original",
    sagaSubtitle: story.subtitle,
    sagaLabel: story.sagaLabel,
    readMinutes: story.readMinutes,
    sagaBadges: story.badges,
  };
}

export function mockCategoryToCatalogSeries(
  category: MockStoryCategory
): CatalogSeries[] {
  return category.stories.map((story) => mockStoryToCatalogSeries(story, category));
}
