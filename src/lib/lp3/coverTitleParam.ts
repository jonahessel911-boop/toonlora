import { COMPANY_NAME_BY_ID, FOUNDER_NAME_BY_ID } from "@/lib/mock/sagaMeta";
import { resolveStoryIdFromCoverTitle } from "@/lib/lp/storyTeasers";

function primaryCompanyLabel(company: string): string {
  return company.split(" · ")[0]?.trim() || company;
}

export function normalizeCoverTitleSlug(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s_]+/g, "-");
}

/** Display label for `cover_title` URL param (e.g. wework → WeWork). */
export function formatCoverTitleLabel(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  const resolvedId = resolveStoryIdFromCoverTitle(trimmed);
  if (resolvedId && COMPANY_NAME_BY_ID[resolvedId]) {
    return primaryCompanyLabel(COMPANY_NAME_BY_ID[resolvedId]);
  }

  const slug = normalizeCoverTitleSlug(trimmed);

  if (COMPANY_NAME_BY_ID[slug]) {
    return primaryCompanyLabel(COMPANY_NAME_BY_ID[slug]);
  }

  for (const [id, name] of Object.entries(COMPANY_NAME_BY_ID)) {
    const primary = primaryCompanyLabel(name);
    if (
      id === slug ||
      primary.toLowerCase() === trimmed.toLowerCase() ||
      name.toLowerCase() === trimmed.toLowerCase()
    ) {
      return primary;
    }
  }

  if (/[A-Z]/.test(trimmed.slice(1))) {
    return trimmed;
  }

  return trimmed
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function storyMatchesCoverTitle(
  story: { id: string; title: string; displayTitle: string },
  coverTitle: string
): boolean {
  const slug = normalizeCoverTitleSlug(coverTitle);
  const label = formatCoverTitleLabel(coverTitle).toLowerCase();
  const raw = coverTitle.trim().toLowerCase();

  return (
    normalizeCoverTitleSlug(story.id) === slug ||
    story.title.toLowerCase() === label ||
    story.title.toLowerCase() === raw ||
    story.displayTitle.toLowerCase().includes(label) ||
    normalizeCoverTitleSlug(story.title) === slug
  );
}

export function findStoryByCoverTitle<
  T extends { id: string; title: string; displayTitle: string },
>(stories: T[], coverTitle: string | null | undefined): T | undefined {
  if (!coverTitle?.trim()) return undefined;

  const aliasId = resolveStoryIdFromCoverTitle(coverTitle);
  if (aliasId) {
    const byAlias = stories.find(
      (s) => normalizeCoverTitleSlug(s.id) === normalizeCoverTitleSlug(aliasId)
    );
    if (byAlias) return byAlias;

    const founder = FOUNDER_NAME_BY_ID[aliasId]?.toLowerCase();
    const company = COMPANY_NAME_BY_ID[aliasId]?.split(" · ")[0]?.toLowerCase();
    if (founder || company) {
      const byName = stories.find((s) => {
        const haystack = `${s.title} ${s.displayTitle}`.toLowerCase();
        if (founder && haystack.includes(founder)) return true;
        if (company && company.length > 2 && haystack.includes(company)) {
          return true;
        }
        return false;
      });
      if (byName) return byName;
    }
  }

  return stories.find((s) => storyMatchesCoverTitle(s, coverTitle));
}

export function prioritizeStoriesByCoverTitle<
  T extends { id: string; title: string; displayTitle: string },
>(stories: T[], coverTitle: string | null | undefined): T[] {
  if (!coverTitle?.trim()) return stories;
  const match = stories.find((s) => storyMatchesCoverTitle(s, coverTitle));
  if (!match) return stories;
  return [match, ...stories.filter((s) => s.id !== match.id)];
}
