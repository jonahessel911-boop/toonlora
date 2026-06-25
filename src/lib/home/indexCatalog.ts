import type { CatalogSeries } from "@/types/catalog";

/** Map pipeline / DB category slug → browse section id */
export function catalogSectionId(story: CatalogSeries): string | null {
  const raw = (story.genre ?? "").toLowerCase().replace(/\s+/g, "_");

  if (raw === "founder_stories" || raw === "founder-stories") {
    return "founder-stories";
  }
  if (raw === "rise_and_fall" || raw === "rise-and-fall") {
    return "rise-and-fall";
  }
  if (raw === "empires") return "empires";
  if (raw === "heists" || raw === "heists_and_frauds" || raw === "heists-and-frauds") {
    return "heists-and-frauds";
  }
  if (raw === "business" || raw === "company" || raw === "company-breakdowns") {
    return "company-breakdowns";
  }
  if (raw === "history" || raw === "history-drop") {
    return "history-drop";
  }

  return null;
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
