/**
 * Content categories — single source for nav sections, pipeline slugs, and catalog grouping.
 * Every HOME_BROWSE_NAV category (except Home / This Week) must appear here.
 */
export const BROWSE_CONTENT_CATEGORIES = [
  {
    sectionId: "founder-stories",
    slug: "founder_stories",
    label: "Founder Stories",
    subtitle:
      "The ambition, obsession, failures, and decisions behind the world's most famous entrepreneurs.",
  },
  {
    sectionId: "rise-and-fall",
    slug: "rise_and_fall",
    label: "Rise & Fall",
    subtitle: "The climb to the top — and the crash that followed.",
  },
  {
    sectionId: "empires",
    slug: "empires",
    label: "Empires",
    subtitle: "How the biggest brands on Earth were built — and kept.",
  },
  {
    sectionId: "heists-and-frauds",
    slug: "heists_and_frauds",
    label: "Heists & Frauds",
    subtitle: "Billion-dollar bets, scams, and the people who got away with it.",
  },
  {
    sectionId: "company-breakdowns",
    slug: "company_breakdowns",
    label: "Company Breakdowns",
    subtitle: "How legendary companies were built, scaled, and sometimes destroyed.",
  },
  {
    sectionId: "history-drop",
    slug: "history_drop",
    label: "History Drop",
    subtitle: "Pivotal moments in business history — illustrated chapter by chapter.",
  },
] as const;

export type BrowseSectionId =
  (typeof BROWSE_CONTENT_CATEGORIES)[number]["sectionId"];

export type PipelineCategorySlug =
  (typeof BROWSE_CONTENT_CATEGORIES)[number]["slug"];

const SECTION_IDS = new Set<string>(
  BROWSE_CONTENT_CATEGORIES.map((c) => c.sectionId)
);

/** Normalize any DB / pipeline slug → browse section id. */
const SLUG_ALIASES: Record<string, BrowseSectionId> = {
  founder_stories: "founder-stories",
  rise_and_fall: "rise-and-fall",
  empires: "empires",
  heists: "heists-and-frauds",
  heists_and_frauds: "heists-and-frauds",
  company_breakdowns: "company-breakdowns",
  business: "company-breakdowns",
  company: "company-breakdowns",
  history: "history-drop",
  history_drop: "history-drop",
};

function normalizeSlugKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

export function catalogSectionFromSlug(
  raw: string | null | undefined
): BrowseSectionId | null {
  if (!raw?.trim()) return null;

  const trimmed = raw.trim();
  if (SECTION_IDS.has(trimmed)) {
    return trimmed as BrowseSectionId;
  }

  const key = normalizeSlugKey(trimmed);
  return SLUG_ALIASES[key] ?? null;
}

export function pipelineSlugForSection(
  sectionId: BrowseSectionId
): PipelineCategorySlug {
  const match = BROWSE_CONTENT_CATEGORIES.find((c) => c.sectionId === sectionId);
  return match?.slug ?? "rise_and_fall";
}

export function labelForPipelineSlug(slug: string | null | undefined): string {
  const sectionId = catalogSectionFromSlug(slug);
  if (!sectionId) {
    return slug?.trim() ? slug.replace(/_/g, " ") : "Business";
  }
  return (
    BROWSE_CONTENT_CATEGORIES.find((c) => c.sectionId === sectionId)?.label ??
    sectionId
  );
}

export const PIPELINE_CATEGORY_OPTIONS = BROWSE_CONTENT_CATEGORIES.map(
  (category) => ({
    value: category.slug,
    label: category.label,
  })
);

export function isPipelineCategorySlug(
  value: string
): value is PipelineCategorySlug {
  return BROWSE_CONTENT_CATEGORIES.some((category) => category.slug === value);
}

/** Map any stored genre/category value → canonical pipeline slug for forms. */
export function resolvePipelineSlug(
  raw: string | null | undefined
): PipelineCategorySlug {
  const sectionId = catalogSectionFromSlug(raw);
  if (sectionId) return pipelineSlugForSection(sectionId);

  const key = normalizeSlugKey(raw ?? "");
  const direct = BROWSE_CONTENT_CATEGORIES.find(
    (category) => category.slug === key
  );
  if (direct) return direct.slug;

  return "company_breakdowns";
}
