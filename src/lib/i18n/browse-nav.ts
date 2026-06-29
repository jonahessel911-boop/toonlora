import { BROWSE_CONTENT_CATEGORIES } from "@/lib/browseCategories";

type TranslateFn = (key: string) => string;

export function buildBrowseNav(tNav: TranslateFn, tCategories: TranslateFn) {
  return [
    { id: "home" as const, href: "/", label: tNav("home") },
    { id: "this-week" as const, href: "/#this-week", label: tNav("thisWeek") },
    ...BROWSE_CONTENT_CATEGORIES.map((category) => ({
      id: category.sectionId,
      href: `/#${category.sectionId}` as const,
      label: tCategories(`${category.slug}.label`),
    })),
  ];
}

export function getCategorySubtitle(
  sectionId: string,
  tCategories: TranslateFn
): string | undefined {
  const category = BROWSE_CONTENT_CATEGORIES.find((c) => c.sectionId === sectionId);
  if (!category) return undefined;
  return tCategories(`${category.slug}.subtitle`);
}

export function getCategoryLabelBySlug(
  slug: string | null | undefined,
  tCategories: TranslateFn,
  fallback = "Business"
): string {
  if (!slug?.trim()) return fallback;
  const key = slug.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const category = BROWSE_CONTENT_CATEGORIES.find((c) => c.slug === key);
  if (category) return tCategories(`${category.slug}.label`);
  return slug.replace(/_/g, " ");
}
