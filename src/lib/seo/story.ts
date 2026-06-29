import { formatCatalogCategoryLabel } from "@/lib/catalogCategoryLabel";
import {
  formatFounderStoryTitle,
  isFounderStoryCategory,
  resolveFounderName,
} from "@/lib/founderStoryTitle";
import { parseSagaTitle } from "@/lib/mock/sagaMeta";
import type { CatalogSeries } from "@/types/catalog";
import {
  absoluteUrl,
  DEFAULT_SITE_DESCRIPTION,
  pageTitle,
  PLATFORM_NAME,
} from "@/lib/seo/site";

export function getStoryDisplayTitle(story: CatalogSeries): string {
  if (isFounderStoryCategory(story.genre)) {
    return formatFounderStoryTitle({
      storyId: story.id,
      title: story.title,
      mainCharacter: story.creatorDisplayName,
    });
  }
  return story.title;
}

function extractBusinessSubjects(story: CatalogSeries): string[] {
  const subjects = new Set<string>();
  const title = getStoryDisplayTitle(story);
  const parsed = parseSagaTitle(title);

  if (parsed.name?.trim()) subjects.add(parsed.name.trim());
  if (parsed.subtitle?.trim()) subjects.add(parsed.subtitle.trim());

  const founder = resolveFounderName({
    storyId: story.id,
    title: story.title,
    mainCharacter: story.creatorDisplayName,
  });
  if (founder) subjects.add(founder);

  return [...subjects];
}

export function buildStoryDescription(story: CatalogSeries): string {
  const category = formatCatalogCategoryLabel(story.genre);
  const title = getStoryDisplayTitle(story);
  const synopsis = story.synopsis?.trim();
  const subjects = extractBusinessSubjects(story);
  const subjectHint =
    subjects.length > 0
      ? ` Covers ${subjects.slice(0, 3).join(", ")}.`
      : "";

  if (synopsis) {
    return `${synopsis}${subjectHint} Read this ${category.toLowerCase()} illustrated story on ${PLATFORM_NAME}. Chapter 1 is free.`;
  }

  return `Read ${title} — a ${category.toLowerCase()} illustrated business story on ${PLATFORM_NAME}.${subjectHint} ${DEFAULT_SITE_DESCRIPTION}`;
}

export function buildStoryKeywords(story: CatalogSeries): string[] {
  const category = formatCatalogCategoryLabel(story.genre);
  const title = getStoryDisplayTitle(story);
  const subjects = extractBusinessSubjects(story);

  return [
    title,
    ...subjects,
    category,
    `${category} story`,
    "business story",
    "illustrated business story",
    "founder story",
    "business webtoon",
    PLATFORM_NAME,
  ].filter((value, index, list) => value.trim() && list.indexOf(value) === index);
}

export function storyCanonicalPath(storyId: string): string {
  return `/story/${storyId}`;
}

export function buildStoryOpenGraph(story: CatalogSeries) {
  const title = getStoryDisplayTitle(story);
  const description = buildStoryDescription(story);
  const url = absoluteUrl(storyCanonicalPath(story.id));

  return {
    title: pageTitle(title),
    description,
    url,
    type: "article" as const,
    siteName: PLATFORM_NAME,
    images: story.coverArtUrl
      ? [{ url: absoluteUrl(story.coverArtUrl), alt: title }]
      : undefined,
  };
}

export function buildStoryJsonLd(story: CatalogSeries) {
  const title = getStoryDisplayTitle(story);
  const description = buildStoryDescription(story);
  const url = absoluteUrl(storyCanonicalPath(story.id));
  const category = formatCatalogCategoryLabel(story.genre);
  const subjects = extractBusinessSubjects(story);

  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: title,
    description,
    url,
    genre: category,
    inLanguage: "en",
    bookFormat: "https://schema.org/EBook",
    author: {
      "@type": "Organization",
      name: story.creatorDisplayName || PLATFORM_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: PLATFORM_NAME,
      url: absoluteUrl("/"),
    },
    ...(story.coverArtUrl
      ? { image: absoluteUrl(story.coverArtUrl) }
      : {}),
    ...(story.publishedAt ? { datePublished: story.publishedAt } : {}),
    ...(subjects.length > 0
      ? {
          about: subjects.map((name) => ({
            "@type": "Thing",
            name,
          })),
        }
      : {}),
    isAccessibleForFree: true,
    numberOfPages: story.episodeCount,
  };
}
