import type { Metadata } from "next";
import SeriesDetailClient from "@/components/story/SeriesDetailClient";
import StoryJsonLd from "@/components/story/StoryJsonLd";
import { getCatalogSeriesById } from "@/lib/services/catalog-repository";
import {
  buildStoryDescription,
  buildStoryKeywords,
  buildStoryOpenGraph,
  getStoryDisplayTitle,
  storyCanonicalPath,
} from "@/lib/seo/story";
import { absoluteUrl, pageTitle } from "@/lib/seo/site";

interface StoryPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: StoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const story = await getCatalogSeriesById(id);

  if (!story) {
    return {
      title: "Story not found",
      robots: { index: false, follow: false },
    };
  }

  const title = getStoryDisplayTitle(story);
  const description = buildStoryDescription(story);
  const canonical = absoluteUrl(storyCanonicalPath(id));
  const openGraph = buildStoryOpenGraph(story);
  const indexable = story.status === "published";

  return {
    title,
    description,
    keywords: buildStoryKeywords(story),
    alternates: { canonical },
    openGraph: {
      ...openGraph,
      title: pageTitle(title),
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle(title),
      description,
      images: openGraph.images,
    },
    robots: indexable
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
          },
        }
      : { index: false, follow: true },
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { id } = await params;
  const story = await getCatalogSeriesById(id);

  return (
    <>
      {story ? <StoryJsonLd story={story} /> : null}
      <SeriesDetailClient id={id} />
    </>
  );
}
