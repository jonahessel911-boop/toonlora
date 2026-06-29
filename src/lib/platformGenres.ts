import {
  BROWSE_CONTENT_CATEGORIES,
  type PipelineCategorySlug,
} from "@/lib/browseCategories";

/** Business story categories for admin publishing and browse surfaces. */
export const PLATFORM_GENRE_GROUPS = [
  {
    label: "Business stories",
    genres: BROWSE_CONTENT_CATEGORIES.map((category) => category.slug),
  },
] as const;

export const PLATFORM_GENRES: string[] = BROWSE_CONTENT_CATEGORIES.map(
  (category) => category.slug
);

export const DEFAULT_PLATFORM_GENRE: PipelineCategorySlug = "rise_and_fall";
