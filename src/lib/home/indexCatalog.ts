import { catalogSectionFromSlug } from "@/lib/browseCategories";
import type { CatalogSeries } from "@/types/catalog";

/** Map pipeline / DB category slug → browse section id */
export function catalogSectionId(story: CatalogSeries): string | null {
  return catalogSectionFromSlug(story.genre);
}

export function mergeCatalogById(
  primary: CatalogSeries[],
  secondary: CatalogSeries[]
): CatalogSeries[] {
  const seen = new Set(primary.map((s) => s.id));
  const merged = [...primary];
  for (const story of secondary) {
    if (seen.has(story.id)) continue;
    seen.add(story.id);
    merged.push(story);
  }
  return merged;
}

export function groupCatalogBySection(
  stories: CatalogSeries[]
): Map<string, CatalogSeries[]> {
  const map = new Map<string, CatalogSeries[]>();
  for (const story of stories) {
    const sectionId = catalogSectionId(story);
    if (!sectionId) continue;
    const list = map.get(sectionId) ?? [];
    list.push(story);
    map.set(sectionId, list);
  }
  return map;
}
