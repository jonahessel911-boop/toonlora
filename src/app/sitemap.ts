import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";
import { listPublishedSeriesForSitemap } from "@/lib/services/catalog-repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const stories = await listPublishedSeriesForSitemap();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/home`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/subscribe`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const storyPages: MetadataRoute.Sitemap = stories.map((story) => ({
    url: `${baseUrl}/story/${story.id}`,
    lastModified: story.updatedAt ? new Date(story.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...storyPages];
}
