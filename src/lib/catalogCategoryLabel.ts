import {
  BROWSE_CONTENT_CATEGORIES,
  catalogSectionFromSlug,
} from "@/lib/browseCategories";

/** Map DB / pipeline category slugs → browse display labels. */
const CATEGORY_LABELS: Record<string, string> = {
  founder_stories: "Founder Stories",
  "founder-stories": "Founder Stories",
  founder_story: "Founder Story",
  rise_and_fall: "Rise & Fall",
  "rise-and-fall": "Rise & Fall",
  empires: "Empires",
  heists: "Heists & Frauds",
  heists_and_frauds: "Heists & Frauds",
  "heists-and-frauds": "Heists & Frauds",
  business: "Company Breakdowns",
  company: "Company Breakdowns",
  company_breakdowns: "Company Breakdowns",
  "company-breakdowns": "Company Breakdowns",
  history: "History Drop",
  history_drop: "History Drop",
  "history-drop": "History Drop",
};

function normalizeCategoryKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function formatCatalogCategoryLabel(raw: string | undefined | null): string {
  if (!raw?.trim()) return "Business";

  const sectionId = catalogSectionFromSlug(raw);
  if (sectionId) {
    const fromBrowse = BROWSE_CONTENT_CATEGORIES.find(
      (category) => category.sectionId === sectionId
    );
    if (fromBrowse) return fromBrowse.label;
  }

  const trimmed = raw.trim();
  const normalized = normalizeCategoryKey(trimmed);

  if (CATEGORY_LABELS[normalized]) {
    return CATEGORY_LABELS[normalized];
  }

  if (CATEGORY_LABELS[trimmed.toLowerCase()]) {
    return CATEGORY_LABELS[trimmed.toLowerCase()];
  }

  // Already a human label (mock cards: "Rise & Fall", "Founder Story")
  if (!trimmed.includes("_")) {
    return trimmed;
  }

  return trimmed
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
